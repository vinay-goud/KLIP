"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Upload, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAuthModal } from "./AuthModalContext";
import { useState } from "react";

export default function Sidebar({ session }: { session: any }) {
    const pathname = usePathname();
    const { openLogIn } = useAuthModal();
    const [showLogOutModal, setShowLogOutModal] = useState(false);

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/upload", label: "Upload", icon: Upload },
        { href: "/profile", label: "Profile", icon: User },
    ];

    return (
        <>
            <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900 border-r border-gray-800">
                <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-6 mb-8 gap-3">
                        <Image
                            src="/logo.png"
                            alt="KLIP Logo"
                            width={40}
                            height={40}
                            className="h-10 w-auto"
                        />
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            KLIP
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? "bg-pink-600 text-white"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="flex-shrink-0 p-4 border-t border-gray-800">
                        {session ? (
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-white truncate">
                                        {session.user?.name || "User"}
                                    </p>
                                    <button
                                        onClick={() => setShowLogOutModal(true)}
                                        className="text-xs text-gray-400 hover:text-white transition"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={openLogIn}
                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition"
                            >
                                Log In
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Log Out Confirmation Modal */}
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
        </>
    );
}
