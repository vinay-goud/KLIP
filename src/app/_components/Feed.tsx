"use client";

import { api } from "~/trpc/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthModal } from "./AuthModalContext";

export default function Feed({ session }: { session: any }) {
    const { data, fetchNextPage, hasNextPage, isLoading } = api.video.getInfinite.useInfiniteQuery(
        { limit: 10 },
        { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
    );

    const videos = data?.pages.flatMap((page: any) => page.items) ?? [];

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
    const { openLogIn } = useAuthModal();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true); // Start as true to hide pause icon initially
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const lastTapRef = useRef<number>(0);

    const toggleLike = api.video.toggleLike.useMutation({
        onSuccess: () => {
            utils.video.getInfinite.invalidate();
        }
    });

    const handleLike = () => {
        if (!session) {
            openLogIn();
            return;
        }

        // Show heart animation immediately
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);

        // Trigger mutation
        toggleLike.mutate({ videoId: video.id });
    };

    const handleVideoClick = (e: React.MouseEvent) => {
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - lastTapRef.current;

        // Double tap detection (within 300ms)
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            // Double tap - like the video
            handleLike();
            lastTapRef.current = 0; // Reset
        } else {
            // Single tap - toggle play/pause
            if (videoRef.current) {
                if (isPlaying) {
                    videoRef.current.pause();
                } else {
                    videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
            }
            lastTapRef.current = currentTime;
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
                    // Set playing state immediately
                    setIsPlaying(true);
                    const playPromise = currentVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            console.error("Auto-play prevented:", error);
                            setIsPlaying(false);
                        });
                    }
                } else {
                    currentVideo.pause();
                    setIsPlaying(false);
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
        <div className="h-[100dvh] w-full snap-start relative bg-black flex items-center justify-center">
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
                    muted
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

            {/* Play/Pause Overlay Icon - Only show if NOT playing AND NOT loading */}
            {!isPlaying && !isLoading && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="bg-black/50 p-4 rounded-full">
                        <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
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
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {video.user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <h3 className="font-bold text-white text-shadow">@{video.user.name ?? "User"}</h3>
                        </div>
                        <p className="text-sm text-white mb-1">{video.title}</p>
                        {video.description && <p className="text-xs text-gray-300 line-clamp-2">{video.description}</p>}
                    </div>

                    <div className="flex flex-col items-center gap-6 absolute right-2 bottom-24 md:bottom-8">
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
