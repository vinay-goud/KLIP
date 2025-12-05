import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import ProfilePage from "~/app/_components/ProfilePage";
import { db } from "~/server/db";

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const session = await auth();
    const { userId } = await params; // Await params in Next.js 15

    // Fetch the user data
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    });

    if (!user) {
        redirect("/");
    }

    // Check if viewing own profile
    const isOwnProfile = session?.user?.id === userId;

    return <ProfilePage session={session} userId={userId} isOwnProfile={isOwnProfile} />;
}
