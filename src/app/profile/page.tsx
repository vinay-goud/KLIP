import { auth } from "~/server/auth";
import ProfilePage from "../_components/ProfilePage";

export default async function Profile() {
    const session = await auth();

    return <ProfilePage session={session} />;
}
