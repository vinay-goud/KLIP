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

    const createVideo = api.video.create.useMutation({
        onSuccess: () => {
            router.push("/");
        },
        onError: (err: any) => {
            setError(err.message);
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
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get public URL
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
            setError(err instanceof Error ? err.message : 'Upload failed');
            setUploading(false);
        }
    };

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

            {uploading && uploadProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={uploading || !videoFile}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-lg font-bold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? `Uploading... ${uploadProgress}%` : "Upload Video"}
            </button>

            {error && (
                <p className="text-red-500 text-sm text-center">
                    {error}
                </p>
            )}
        </form>
    );
}
