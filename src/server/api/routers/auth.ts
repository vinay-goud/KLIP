import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const authRouter = createTRPCRouter({
    signup: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                email: z.string().email("Invalid email address"),
                password: z.string().min(6, "Password must be at least 6 characters"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { name, email, password } = input;

            // Check if user already exists
            const existingUser = await ctx.db.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User with this email already exists",
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await ctx.db.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });

            return {
                id: user.id,
                name: user.name,
                email: user.email,
            };
        }),
});
