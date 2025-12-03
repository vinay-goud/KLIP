import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import UploadForm from "../_components/UploadForm";

export default async function UploadPage() {
    const session = await auth();

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Upload Video
                    </h1>
                    <p className="text-gray-400 mb-8">Share your creativity with the world</p>
                    <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                        <p className="text-white mb-6">You need to be logged in to upload videos.</p>
                        <div className="flex gap-4 justify-center">
                            <a
                                href="/auth/signin"
                                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
                            >
                                Log In
                            </a>
                            <a
                                href="/auth/signup"
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                            >
                                Sign Up
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
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
