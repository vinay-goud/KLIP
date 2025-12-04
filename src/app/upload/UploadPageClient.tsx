"use client";

import { useEffect, useState } from "react";
import UploadForm from "../_components/UploadForm";
import { useAuthModal } from "../_components/AuthModalContext";

export default function UploadPageClient({ session }: { session: any }) {
    const [isMounted, setIsMounted] = useState(false);
    const { openLogIn, openSignUp } = useAuthModal();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="min-h-[100dvh] bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Upload Video
                    </h1>
                    <p className="text-gray-400 mb-8">Share your creativity with the world</p>
                    <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                        <p className="text-white mb-6">You need to be logged in to upload videos.</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={openLogIn}
                                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
                            >
                                Log In
                            </button>
                            <button
                                onClick={openSignUp}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center p-4 pb-24 md:pb-4">
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
