"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthModalType = "signin" | "signup" | null;

interface AuthModalContextType {
    modalType: AuthModalType;
    openLogIn: () => void;
    openSignUp: () => void;
    closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [modalType, setModalType] = useState<AuthModalType>(null);

    const openLogIn = () => setModalType("signin");
    const openSignUp = () => setModalType("signup");
    const closeModal = () => setModalType(null);

    return (
        <AuthModalContext.Provider value={{ modalType, openLogIn, openSignUp, closeModal }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error("useAuthModal must be used within AuthModalProvider");
    }
    return context;
}
