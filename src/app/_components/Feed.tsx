"use client";

import { api } from "~/trpc/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useAuthModal } from "./AuthModalContext";
import { useSearchParams } from "next/navigation";

export default function Feed({ session }: { session: any }) {
    const searchParams = useSearchParams();
    const videoId = searchParams.get("videoId");

    const { data, fetchNextPage, hasNextPage, isLoading } = api.video.getInfinite.useInfiniteQuery(
        { limit: 10 },
        { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
    );

    const videos = data?.pages.flatMap((page: any) => page.items) ?? [];

    // Scroll to specific video if videoId is in URL
    useEffect(() => {
        if (videoId && videos.length > 0) {
            // Use setTimeout to ensure DOM is fully rendered
            setTimeout(() => {
                const videoElement = document.getElementById(`video-${videoId}`);
                if (videoElement) {
                    // Use instant scroll to avoid triggering play/pause on intermediate videos
                    videoElement.scrollIntoView({ behavior: "instant", block: "start" });
                }
            }, 100);
        }
    }, [videoId, videos.length]);

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading videos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-20 md:pb-0">
            {videos.map((video: any) => (
                <VideoCard key={video.id} video={video} session={session} />
            ))}

            {videos.length === 0 && (
                <div className="h-[100dvh] flex items-center justify-center snap-start">
                    <div className="text-center">
                        <p className="text-gray-400 mb-4">No videos yet. Be the first!</p>
                        {session && (
                            <Link
                                href="/upload"
                                className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition"
                            >
                                Upload a Video
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {hasNextPage && (
                <div className="h-20 flex items-center justify-center snap-start">
                    <button onClick={() => fetchNextPage()} className="text-sm text-gray-400 hover:text-white transition">
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}

function VideoCard({ video, session }: { video: any; session: any }) {
    const utils = api.useUtils();
    const { openLogIn, openSignUp } = useAuthModal();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false); // Track manual pause
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const lastTapRef = useRef<number>(0);

    const toggleLike = api.video.toggleLike.useMutation({
        onSuccess: () => {
            utils.video.getInfinite.invalidate();
        }
    });

    const handleLike = () => {
        if (!session) {
            // Show friendly login prompt instead of immediately opening modal
            setShowLoginPrompt(true);
            // Auto-hide after 3 seconds
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }

        // Show heart animation immediately
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);

        // Trigger mutation
        toggleLike.mutate({ videoId: video.id });
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            // Double tap - like
            handleLike();
            lastTapRef.current = 0; // Reset for next tap sequence
        } else {
            // Single tap - potential play/pause
            lastTapRef.current = now;
            setTimeout(() => {
                // Check if it's still a single tap (no second tap within 300ms)
                if (lastTapRef.current === now) {
                    const videoElement = videoRef.current;
                    if (videoElement) {
                        if (videoElement.paused) {
                            videoElement.play();
                            setIsPlaying(true);
                            setIsManuallyPaused(false); // User manually resumed
                        } else {
                            videoElement.pause();
                            setIsPlaying(false);
                            setIsManuallyPaused(true); // User manually paused
                        }
                    }
                }
            }, 300); // Wait 300ms to see if it's a double tap
        }
    };

    const [isLoading, setIsLoading] = useState(true);

    // Handle video errors and loading state
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const handleError = (e: Event) => {
            setVideoError(true);
            setIsPlaying(false);
            setIsLoading(false);
        };

        const handleLoadedData = () => {
            setVideoError(false);
            setIsLoading(false);
        };

        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);

        videoElement.addEventListener('error', handleError);
        videoElement.addEventListener('loadeddata', handleLoadedData);
        videoElement.addEventListener('waiting', handleWaiting);
        videoElement.addEventListener('playing', handlePlaying);

        return () => {
            videoElement.removeEventListener('error', handleError);
            videoElement.removeEventListener('loadeddata', handleLoadedData);
            videoElement.removeEventListener('waiting', handleWaiting);
            videoElement.removeEventListener('playing', handlePlaying);
        };
    }, [video.url]);

    // Auto-play when in view using Intersection Observer
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                // Always use videoRef.current to get the latest video element
                const currentVideo = videoRef.current;
                if (!currentVideo) return;

                if (entry.isIntersecting) {
                    // Auto-play when scrolling into view (not manual)
                    setIsPlaying(true);
                    setIsManuallyPaused(false); // Reset manual pause state
                    const playPromise = currentVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            // Suppress AbortError as it's expected when scrolling
                            if (error.name !== 'AbortError') {
                                console.error("Auto-play prevented:", error);
                            }
                            // Don't set isPlaying to false for AbortError to prevent icon flicker
                        });
                    }
                } else {
                    // Auto-pause when scrolling out of view (not manual)
                    currentVideo.pause();
                    setIsPlaying(false);
                    setIsManuallyPaused(false); // Reset manual pause state
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        observer.observe(videoElement);

        return () => {
            observer.disconnect();
        };
    }, [video.url]); // Re-create observer when video URL changes

    return (
        <div id={`video-${video.id}`} className="h-[100dvh] w-full snap-start relative bg-black flex items-center justify-center">
            {videoError ? (
                <div className="text-center p-4">
                    <p className="text-red-500 mb-2">Failed to load video</p>
                    <p className="text-gray-400 text-sm">Format not supported</p>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    src={video.url}
                    className="h-full w-full object-cover cursor-pointer"
                    loop
                    playsInline
                    preload="auto"
                    onClick={handleVideoClick}
                />
            )}

            {/* Heart Animation */}
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                        <svg
                            className="w-24 h-24 text-red-500 animate-[ping_0.8s_ease-out]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <svg
                            className="w-24 h-24 text-pink-400 absolute inset-0 animate-[ping_0.8s_ease-out_0.1s]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Play/Pause Icon - Only show when manually paused */}
            {isManuallyPaused && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-6">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Loading Spinner */}
            {isLoading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-4 pb-24 md:pb-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
                <div className="flex justify-between items-end">
                    <div className="flex-1 mr-12">
                        {/* Clickable Profile */}
                        <Link
                            href={`/profile/${video.user.id}?from=video&videoId=${video.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 mb-2 w-fit hover:opacity-80 transition"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {video.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <h3 className="font-bold text-white text-shadow">{video.user.name ?? "User"}</h3>
                        </Link>

                        {/* Title */}
                        <p className="text-sm text-white mb-1 font-semibold">{video.title}</p>

                        {/* Expandable Description */}
                        {video.description && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDescriptionExpanded(!isDescriptionExpanded);
                                }}
                                className="cursor-pointer"
                            >
                                <p className={`text-xs text-gray-300 transition-all duration-300 ${isDescriptionExpanded ? 'line-clamp-none max-h-[60vh] overflow-y-auto' : 'line-clamp-2'
                                    }`}>
                                    {video.description}
                                </p>
                                {!isDescriptionExpanded && video.description.length > 100 && (
                                    <span className="text-xs text-gray-400">... more</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-6 absolute right-2 bottom-24 md:bottom-8">
                        {/* Login Prompt Popup */}
                        {showLoginPrompt && (
                            <div className="absolute bottom-20 right-0 bg-gray-900 border-2 border-pink-500 rounded-2xl p-4 shadow-2xl animate-[slideUp_0.3s_ease-out] min-w-[200px]">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <NextImage
                                                src="/logo.png"
                                                alt="KLIP"
                                                width={32}
                                                height={32}
                                                className="w-6 h-6 object-contain"
                                            />
                                        </div>
                                        <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                            KLIP
                                        </span>
                                    </div>
                                    <p className="text-white text-sm font-medium text-center">Log in to like videos</p>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowLoginPrompt(false);
                                                openLogIn();
                                            }}
                                            className="flex-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-xs font-medium transition text-white"
                                        >
                                            Log In
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowLoginPrompt(false);
                                                openSignUp();
                                            }}
                                            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium transition text-white"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLike();
                            }}
                            className="flex flex-col items-center group"
                        >
                            <div className={`transition-transform group-active:scale-90 ${video.isLiked ? 'text-red-500' : 'text-white'}`}>
                                <svg className={`w-10 h-10 drop-shadow-lg ${video.isLiked ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold mt-1 text-white drop-shadow-lg">{video._count.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
