import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import UploadForm from "../_components/UploadForm";

export default async function UploadPage() {
    const session = await auth();

    if (!session) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 pb-20 md:pb-4">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Upload Video
                </h1>
                <p className="text-gray-400 text-center mb-8">Share your creativity with the world</p>
                <UploadForm />
            </div>
        </div>
    );
}
