"use client";

import TopNav from '@/app/components/TopNav'
import { MoveRight } from 'lucide-react'

const LandingPageView = () => {
    return (
        <div className="relative min-h-screen w-full bg-white dark:bg-slate-800 font-sans overflow-hidden">
            <TopNav />

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen w-full pt-16 px-4 sm:px-6 gap-12 max-w-7xl mx-auto">
                {/* Left side: Heading, description, and CTAs */}
                <div className="flex flex-col items-start justify-center w-full md:w-1/2 text-left animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
                        Build better financial workflows with LendTrack
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                        LendTrack helps you manage personal and business loans with automated reminders, interest calculations, and comprehensive reporting.
                        Securely track your financial relationships in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        <a
                            className="flex h-12 w-44 items-center justify-center rounded-md bg-linear-to-r from-green-500 to-emerald-600 text-white font-medium transition-all hover:from-green-600 hover:to-emerald-700 hover:scale-105"
                            href="/login"
                        >
                            Get started <MoveRight className="ml-2" />
                        </a>
                    </div>

                    {/* Feature highlights */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">Automated payment reminders</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">Secure financial tracking</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">Comprehensive reporting</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Illustrations with subtle animations - Hidden on mobile */}
                <div className="relative w-full md:w-1/2 hidden md:flex justify-center items-center">
                    <div className="relative w-full max-w-lg h-96">
                        {/* Main illustration container */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center animate-float">
                                <div className="text-6xl">💰</div>
                            </div>
                        </div>

                        {/* Floating elements with enhanced animations */}
                        <div
                            className="absolute top-10 left-10 w-20 h-20 rounded-xl bg-linear-to-br from-green-400/30 to-emerald-500/30 dark:from-green-500/30 dark:to-emerald-600/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center animate-float animation-delay-1000"
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                        >
                            <div className="text-2xl">📊</div>
                        </div>

                        <div
                            className="absolute bottom-10 right-10 w-24 h-24 rounded-xl bg-linear-to-br from-amber-400/30 to-orange-500/30 dark:from-amber-500/30 dark:to-orange-600/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center animate-float animation-delay-2000"
                            style={{ animation: 'float 8s ease-in-out infinite 1s' }}
                        >
                            <div className="text-3xl">🔔</div>
                        </div>

                        <div
                            className="absolute top-1/2 right-0 w-16 h-16 rounded-lg bg-linear-to-br from-cyan-400/30 to-teal-500/30 dark:from-cyan-500/30 dark:to-teal-600/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center animate-float animation-delay-500"
                            style={{ animation: 'float 7s ease-in-out infinite 0.5s' }}
                        >
                            <div className="text-xl">🔒</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPageView
