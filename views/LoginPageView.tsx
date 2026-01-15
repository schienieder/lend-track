'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/app/components/auth/LoginForm';
import RegisterForm from '@/app/components/auth/RegisterForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const LoginPageView = () => {
    const queryParams = useSearchParams();
    const [isLoginView, setIsLoginView] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const view = queryParams?.get('form-state');
        if (view && view === 'register') {
            setIsLoginView(false);
        } else {
            setIsLoginView(true);
        }
    }, [queryParams])

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    return (
        <div className="relative min-h-screen w-full bg-background font-sans overflow-hidden">
            <Link href="/" className="top-6 left-6 absolute flex items-center gap-2">
                <Image
                    src="/images/lend-track-logo.png"
                    alt="LendTrack Logo"
                    width={32}
                    height={32}
                />
                <span className="text-xl font-bold text-foreground">LendTrack</span>
            </Link>
            <div className="flex items-center justify-center min-h-screen px-4">
                {isLoginView ? (
                    <LoginForm
                        onLoginSuccess={() => {
                            router.push('/dashboard');
                        }}
                        onSwitchToRegister={() => setIsLoginView(false)}
                    />
                ) : (
                    <RegisterForm
                        onRegisterSuccess={() => {
                            setIsLoginView(true);
                        }}
                        onSwitchToLogin={() => setIsLoginView(true)}
                    />
                )}
            </div>
        </div>
    );
}

export default LoginPageView
