"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { LogOut, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function ProfilePage({ session }: { session: any }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    const { data: userVideos } = api.video.getInfinite.useInfiniteQuery(
        { limit: 20 },
        {
            getNextPageParam: (lastPage: any) => lastPage.nextCursor,
            enabled: !!session
        }
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const videos = userVideos?.pages.flatMap((page: any) => page.items) ?? [];
    const myVideos = videos.filter((v: any) => v.userId === session?.user?.id);

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Profile
                    </h1>
                    <p className="text-gray-400 mb-8">View your videos and stats</p>
                    <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                        <p className="text-white mb-6">You need to be logged in to view your profile.</p>
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
        <div className="min-h-screen bg-black text-white pb-24 md:pb-8">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                            {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{session.user?.name || "User"}</h1>
                            <p className="text-gray-400">{session.user?.email || "No email"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSignOutModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-900 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-pink-500">{myVideos.length}</p>
                        <p className="text-sm text-gray-400">Videos</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-500">
                            {myVideos.reduce((acc: number, v: any) => acc + v._count.likes, 0)}
                        </p>
                        <p className="text-sm text-gray-400">Total Likes</p>
                    </div>
                </div>

                {/* Videos Grid */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        My Videos
                    </h2>
                    {myVideos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900 rounded-lg">
                            <Video className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400">No videos yet</p>
                            <button
                                onClick={() => router.push("/upload")}
                                className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition"
                            >
                                Upload Your First Video
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {myVideos.map((video: any) => (
                                <div
                                    key={video.id}
                                    className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
                                    onClick={() => router.push("/")}
                                >
                                    <video
                                        src={video.url}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-sm font-medium truncate">{video.title}</p>
                                            <p className="text-xs text-gray-300">❤️ {video._count.likes} likes</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sign Out Modal */}
            {showSignOutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4 text-white">Sign Out</h2>
                        <p className="text-gray-400 mb-6">Are you sure you want to sign out?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSignOutModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="flex-1 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition text-white"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
