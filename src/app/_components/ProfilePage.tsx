"use client";

import { api } from "~/trpc/react";
import { LogOut, Video, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useAuthModal } from "./AuthModalContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProfilePage({
    session,
    userId,
    isOwnProfile = true
}: {
    session: any;
    userId?: string;
    isOwnProfile?: boolean;
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [showLogOutModal, setShowLogOutModal] = useState(false);
    const { openLogIn, openSignUp } = useAuthModal();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromVideo = searchParams.get("from") === "video";
    const videoId = searchParams.get("videoId");

    // Use provided userId or session user id
    const profileUserId = userId || session?.user?.id;

    const { data: userVideos } = api.video.getInfinite.useInfiniteQuery(
        { limit: 100 }, // Get more videos for profile
        {
            getNextPageParam: (lastPage: any) => lastPage.nextCursor,
            enabled: !!profileUserId,
        }
    );

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter videos by the profile user
    const videos = userVideos?.pages
        .flatMap((page: any) => page.items)
        .filter((video: any) => video.userId === profileUserId) ?? [];

    if (!isMounted) {
        return (
            <div className="min-h-[100dvh] bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session && !isOwnProfile) {
        // Allow viewing other profiles without login
    } else if (!session && isOwnProfile) {
        return (
            <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
                <div className="max-w-md mx-auto px-4 text-center">
                    <div className="mb-8">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4 p-3">
                            <Image
                                src="/logo.png"
                                alt="KLIP Logo"
                                width={64}
                                height={64}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome to KLIP</h2>
                        <p className="text-white mb-6">You need to be logged in to view your profile.</p>
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

    // Get user data for the profile
    const profileUser = videos[0]?.user || session?.user;

    const handleBack = () => {
        if (fromVideo && videoId) {
            router.push(`/?videoId=${videoId}`);
        } else {
            router.back();
        }
    };

    return (
        <div className="min-h-[100dvh] bg-black text-white pb-24 md:pb-8">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                {!isOwnProfile && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                )}

                {/* Profile Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                            {profileUser?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{profileUser?.name || "User"}</h1>
                            <p className="text-gray-400">{profileUser?.email}</p>
                        </div>
                    </div>

                    {/* Only show logout button for own profile */}
                    {isOwnProfile && session && (
                        <button
                            onClick={() => setShowLogOutModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Log Out</span>
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-900 rounded-lg">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-pink-500">{videos.length}</p>
                        <p className="text-sm text-gray-400">Videos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-pink-500">
                            {videos.reduce((acc: number, v: any) => acc + v._count.likes, 0)}
                        </p>
                        <p className="text-sm text-gray-400">Likes</p>
                    </div>
                </div>
                {/* Videos Grid */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        My Videos
                    </h2>
                    {videos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900 rounded-lg">
                            <Video className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400">No videos yet</p>
                            {isOwnProfile && (
                                <Link
                                    href="/upload"
                                    className="inline-block mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
                                >
                                    Upload Your First Video
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {videos.map((video: any) => (
                                <Link
                                    key={video.id}
                                    href={`/?videoId=${video.id}`}
                                    className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden group hover:ring-2 hover:ring-pink-500 transition"
                                >
                                    <video
                                        src={video.url}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-sm font-medium truncate">{video.title}</p>
                                            <p className="text-xs text-gray-300">{video._count.likes} likes</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sign Out Modal */}
            {showLogOutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4 text-white">Log Out</h2>
                        <p className="text-gray-400 mb-6">Are you sure you want to log out?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogOutModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="flex-1 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition text-white"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
