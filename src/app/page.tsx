import { HydrateClient } from "~/trpc/server";
import Feed from "./_components/Feed";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <Feed session={session} />
    </HydrateClient>
  );
}
