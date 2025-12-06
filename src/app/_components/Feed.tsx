"use client";

import { api } from "~/trpc/react";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useAuthModal } from "./AuthModalContext";
import { useSearchParams } from "next/navigation";

export default function Feed({ session }: { session: any }) {
    const searchParams = useSearchParams();
    const videoId = searchParams.get("videoId");
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);

    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = api.video.getInfinite.useInfiniteQuery(
        { limit: 10 },
        { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
    );

    const videos = data?.pages.flatMap((page: any) => page.items) ?? [];

    // Handle any user interaction to unmute globally
    const handleInteraction = useCallback(() => {
        if (isGlobalMuted) {
            setIsGlobalMuted(false);
        }
    }, [isGlobalMuted]);

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

    // Automatic infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <div
            className="w-full max-w-2xl mx-auto h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-20 md:pb-0"
            onScroll={handleInteraction}
            onKeyDownCapture={handleInteraction}
        >
            {videos.map((video: any) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    session={session}
                    isGlobalMuted={isGlobalMuted}
                    setIsGlobalMuted={setIsGlobalMuted}
                />
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

            {/* Infinite scroll trigger */}
            {hasNextPage && (
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center snap-start">
                    {isFetchingNextPage && (
                        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                </div>
            )}
        </div>
    );
}

function VideoCard({ video, session, isGlobalMuted, setIsGlobalMuted }: { video: any; session: any; isGlobalMuted: boolean; setIsGlobalMuted: (muted: boolean) => void }) {
    const utils = api.useUtils();
    const { openLogIn, openSignUp } = useAuthModal();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false); // Track manual pause
    const [showResumeAnimation, setShowResumeAnimation] = useState(false);
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

        // Check both global state AND actual video state.
        // If global state is unmuted (e.g. from scroll) but video is locally muted (due to browser autoplay policy fallback),
        // we still want to treat this click as an "unmute" action, not a "pause" action.
        const currentlyMuted = isGlobalMuted || (videoRef.current?.muted ?? false);

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
                        if (currentlyMuted) {
                            // If currently muted, UNMUTE ONLY.
                            // 1. Update global state
                            setIsGlobalMuted(false);
                            // 2. Force local update immediately for responsiveness
                            videoElement.muted = false;
                            // 3. Ensure playing (do not pause)
                            videoElement.play().catch(console.error);
                            setIsPlaying(true);
                            setIsManuallyPaused(false);
                        } else {
                            // If NOT muted, perform normal toggle
                            if (videoElement.paused) {
                                videoElement.play().catch(console.error);
                                setIsPlaying(true);
                                setIsManuallyPaused(false); // User manually resumed
                                // Show resume animation (II icon)
                                setShowResumeAnimation(true);
                                setTimeout(() => setShowResumeAnimation(false), 600);
                            } else {
                                videoElement.pause();
                                setIsPlaying(false);
                                setIsManuallyPaused(true); // User manually paused
                            }
                        }
                    }
                }
            }, 300); // Wait 300ms to see if it's a double tap
        }
    };

    const [isLoading, setIsLoading] = useState(true);
    const [isLocalMuted, setIsLocalMuted] = useState(true);

    // Handle video errors, loading state, and mute state
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

        // Sync local mute state with actual video element
        const handleVolumeChange = () => {
            setIsLocalMuted(videoElement.muted);
        };

        videoElement.addEventListener('error', handleError);
        videoElement.addEventListener('loadeddata', handleLoadedData);
        videoElement.addEventListener('waiting', handleWaiting);
        videoElement.addEventListener('playing', handlePlaying);
        videoElement.addEventListener('volumechange', handleVolumeChange);

        // Initial check
        setIsLocalMuted(videoElement.muted);

        return () => {
            videoElement.removeEventListener('error', handleError);
            videoElement.removeEventListener('loadeddata', handleLoadedData);
            videoElement.removeEventListener('waiting', handleWaiting);
            videoElement.removeEventListener('playing', handlePlaying);
            videoElement.removeEventListener('volumechange', handleVolumeChange);
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

                    // Attempt to play
                    const playPromise = currentVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((error) => {
                            // If autoplay fails (likely due to unmuted autoplay policy),
                            // fallback to muted autoplay
                            if (error.name === 'NotAllowedError') {
                                console.log("Unmuted autoplay failed, falling back to muted");
                                currentVideo.muted = true;
                                currentVideo.play().catch(e => console.error("Muted autoplay failed:", e));
                            } else if (error.name !== 'AbortError') {
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
                    muted={isGlobalMuted}
                    onClick={handleVideoClick}
                />
            )}

            {/* Tap to Unmute Indicator */}
            {isLocalMuted && isPlaying && !videoError && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none animate-fade-in z-20">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                    <span className="text-white text-xs font-medium">Tap to unmute</span>
                </div>
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

            {/* Resume Animation (II Icon) */}
            {showResumeAnimation && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-6 animate-[ping_0.6s_ease-out]">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
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
