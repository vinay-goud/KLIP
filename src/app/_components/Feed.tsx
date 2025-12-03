"use client";

import { api } from "~/trpc/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Feed({ session }: { session: any }) {
    const { data, fetchNextPage, hasNextPage } = api.video.getInfinite.useInfiniteQuery(
        { limit: 5 },
        { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
    );

    const videos = data?.pages.flatMap((page: any) => page.items) ?? [];

    return (
        <div className="w-full max-w-2xl mx-auto h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            {videos.map((video: any) => (
                <VideoCard key={video.id} video={video} />
            ))}

            {videos.length === 0 && (
                <div className="h-screen flex items-center justify-center snap-start">
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

function VideoCard({ video }: { video: any }) {
    const utils = api.useUtils();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleLike = api.video.toggleLike.useMutation({
        onSuccess: () => {
            utils.video.getInfinite.invalidate();
        }
    });

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleLike.mutate({ videoId: video.id });
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Auto-play when in view using Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => {
                            // Handle auto-play restrictions
                            setIsPlaying(false);
                        });
                        setIsPlaying(true);
                    } else {
                        videoRef.current?.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.6 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <div className="h-[calc(100vh-4rem)] md:h-screen w-full snap-start relative bg-black flex items-center justify-center">
            <video
                ref={videoRef}
                src={video.url}
                className="h-full w-full object-contain md:object-cover cursor-pointer"
                loop
                playsInline
                onClick={togglePlay}
            />

            {/* Play/Pause Overlay Icon */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 p-4 rounded-full">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
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

                    <div className="flex flex-col items-center gap-6 absolute right-2 bottom-20 md:bottom-8">
                        <button onClick={handleLike} className="flex flex-col items-center group">
                            <div className={`p-3 rounded-full bg-gray-800/60 backdrop-blur-sm transition-transform group-active:scale-90 ${video.isLiked ? 'text-red-500' : 'text-white'}`}>
                                <svg className={`w-8 h-8 ${video.isLiked ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold mt-1 text-white text-shadow">{video._count.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
