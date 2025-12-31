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
    }, [])

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user]);

    return (
        <div className="relative min-h-screen w-full bg-slate-100 dark:bg-slate-900 font-sans overflow-hidden">
            <Link href="/" className="top-5 left-5 absolute flex items-center justify-center">
                <Image
                    src="/images/lend-track-logo.png"
                    alt="LendTrack Logo"
                    width={32}
                    height={32}
                />
                <h4 className="text-xl text-gray-700 dark:text-white font-bold ml-2">LendTrack</h4>
            </Link>
            <div className="flex items-center justify-center min-h-screen">
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
                            // After successful registration, switch to login view
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
