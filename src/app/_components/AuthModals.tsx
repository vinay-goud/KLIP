"use client";

import LogInModal from "./LogInModal";
import SignUpModal from "./SignUpModal";
import { useAuthModal } from "./AuthModalContext";

export default function AuthModals() {
    const { modalType, openLogIn, openSignUp, closeModal } = useAuthModal();

    return (
        <>
            <LogInModal
                isOpen={modalType === "signin"}
                onClose={closeModal}
                onSwitchToSignUp={() => {
                    closeModal();
                    setTimeout(openSignUp, 100);
                }}
            />
            <SignUpModal
                isOpen={modalType === "signup"}
                onClose={closeModal}
                onSwitchToLogIn={() => {
                    closeModal();
                    setTimeout(openLogIn, 100);
                }}
            />
        </>
    );
}
