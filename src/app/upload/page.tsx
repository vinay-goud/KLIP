import { auth } from "~/server/auth";
import UploadPageClient from "~/app/upload/UploadPageClient";

export default async function UploadPage() {
    const session = await auth();
    return <UploadPageClient session={session} />;
}
