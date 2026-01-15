'use client';
import { useAuth } from "@/app/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, Wallet, Check, Clock, UserCheck } from "lucide-react";

const DashboardPageView = () => {
    const { user } = useAuth();

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                        Welcome to Your Dashboard
                    </h1>
                    <p className="mt-3 text-lg text-muted-foreground">
                        You are logged in as {user?.email}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-semibold text-foreground">24</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-blue-500/10 p-3">
                                    <ClipboardList className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Items</p>
                                    <p className="text-2xl font-semibold text-foreground">142</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-purple-500/10 p-3">
                                    <Wallet className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Loans</p>
                                    <p className="text-2xl font-semibold text-foreground">12</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-1.5">
                                    <Check className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">John Doe</span> returned a book
                                </p>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-500/10 p-1.5">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Jane Smith</span> borrowed a tool
                                </p>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-500/10 p-1.5">
                                    <UserCheck className="h-4 w-4 text-purple-500" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Bob Johnson</span> updated their profile
                                </p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardPageView
