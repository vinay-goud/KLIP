import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ title: z.string(), url: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.video.create({
        data: {
          title: input.title,
          url: input.url,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
    }),

  getInfinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(), // Video ID
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await ctx.db.video.findMany({
        take: limit + 1, // get an extra item at the end to know if there is a next page
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          _count: { select: { likes: true } },
          likes: ctx.session?.user ? { where: { userId: ctx.session.user.id } } : false,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: items.map((item) => ({
          ...item,
          isLiked: item.likes?.length > 0,
        })),
        nextCursor,
      };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.like.findUnique({
        where: {
          userId_videoId: {
            userId: ctx.session.user.id,
            videoId: input.videoId,
          },
        },
      });

      if (existingLike) {
        await ctx.db.like.delete({
          where: { id: existingLike.id },
        });
        return { isLiked: false };
      } else {
        await ctx.db.like.create({
          data: {
            userId: ctx.session.user.id,
            videoId: input.videoId,
          },
        });
        return { isLiked: true };
      }
    }),
});
