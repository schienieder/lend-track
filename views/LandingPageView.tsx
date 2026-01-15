"use client";

import TopNav from '@/app/components/TopNav'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

const LandingPageView = () => {
    return (
        <div className="relative min-h-screen w-full bg-background font-sans overflow-hidden">
            <TopNav />

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen w-full pt-16 px-4 sm:px-6 gap-16 max-w-6xl mx-auto">
                {/* Left side: Heading, description, and CTAs */}
                <div className="flex flex-col items-start justify-center w-full md:w-1/2 text-left">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
                        Simplify your
                        <span className="text-primary"> lending </span>
                        workflow
                    </h1>

                    <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                        Track loans, automate reminders, and manage your financial relationships with ease. All in one secure platform.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mb-12">
                        <Button size="lg" asChild>
                            <Link href="/login">
                                Get started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/login?form-state=register">
                                Create account
                            </Link>
                        </Button>
                    </div>

                    {/* Feature highlights */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Automated payment reminders</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Secure financial tracking</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Comprehensive reporting</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Minimal abstract illustration */}
                <div className="relative w-full md:w-1/2 hidden md:flex justify-center items-center">
                    <div className="relative w-full max-w-sm h-80">
                        {/* Main card */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border flex items-center justify-center shadow-sm">
                                <div className="w-40 h-40 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center justify-center gap-3">
                                    <div className="w-20 h-2 bg-muted rounded-full" />
                                    <div className="w-16 h-2 bg-muted rounded-full" />
                                    <div className="w-12 h-6 bg-primary/20 rounded-md mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Floating accent elements */}
                        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-primary/10 border border-border flex items-center justify-center animate-pulse">
                            <div className="w-6 h-6 rounded-md bg-primary/20" />
                        </div>

                        <div className="absolute bottom-8 right-4 w-14 h-14 rounded-xl bg-muted border border-border flex items-center justify-center">
                            <div className="w-8 h-1.5 bg-primary/30 rounded-full" />
                        </div>

                        <div className="absolute top-1/3 right-0 w-10 h-10 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-primary/30" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPageView
