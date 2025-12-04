


"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function UploadForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [isSuccess, setIsSuccess] = useState(false);
    const utils = api.useUtils();

    const createVideo = api.video.create.useMutation({
        onSuccess: () => {
            setIsSuccess(true);
            // Invalidate video cache to show new video immediately
            utils.video.getInfinite.invalidate();
            // Delay redirect to show success message
            setTimeout(() => {
                router.push("/profile");
                router.refresh();
            }, 1500);
        },
        onError: (err: any) => {
            setError(err.message || "Failed to create video record");
            setUploading(false);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('video/')) {
            setError('Please select a valid video file');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 100MB');
            return;
        }

        setError(null);
        setVideoFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !videoFile) {
            setError('Please fill in all required fields');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Generate unique filename
            const fileExt = videoFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('videos')
                .upload(fileName, videoFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                console.error("Supabase upload error:", uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL - Supabase format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[filename]
            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);

            setUploadProgress(100);

            // Create video record in database
            createVideo.mutate({
                title,
                url: publicUrl,
                description: description || undefined,
            });
        } catch (err) {
            console.error("Upload process error:", err);
            setError(err instanceof Error ? err.message : 'Upload failed. Please check your connection and try again.');
            setUploading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Video Uploaded!</h3>
                <p className="text-gray-400">Redirecting to your profile...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Title *
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500 transition"
                    placeholder="Give your video a catchy title"
                    required
                    disabled={uploading}
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500 transition resize-none"
                    placeholder="Add a description..."
                    rows={3}
                    disabled={uploading}
                />
            </div>

            <div>
                <label htmlFor="videoFile" className="block text-sm font-medium mb-2">
                    Video File *
                </label>
                <input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 file:cursor-pointer"
                    required
                    disabled={uploading}
                />
                <p className="text-xs text-gray-400 mt-2">
                    Supported formats: MP4, WebM, MOV (Max 100MB)
                </p>
                {videoFile && (
                    <p className="text-sm text-green-400 mt-2">
                        Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                )}
            </div>

            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-pink-600 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={uploading || !videoFile}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-lg font-bold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {uploading ? "Uploading..." : "Upload Video"}
            </button>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-500 text-sm text-center">
                        {error}
                    </p>
                </div>
            )}
        </form>
    );
}
