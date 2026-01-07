'use client';
import { useAuth } from "@/app/contexts/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchLoans } from "@/connections/loan.api";
import { Loan } from "@/schemas/loan";
import { Plus, ArrowRight, DollarSign, Clock, AlertTriangle } from "lucide-react";

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const DashboardPageView = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalAmount: 0,
    });

    useEffect(() => {
        const loadLoans = async () => {
            try {
                const response = await fetchLoans({ limit: 5 });
                setLoans(response.loans);

                // Fetch all loans for stats
                const allLoansResponse = await fetchLoans({ limit: 100 });
                const allLoans = allLoansResponse.loans;

                setStats({
                    totalLoans: allLoansResponse.pagination.total,
                    activeLoans: allLoans.filter(l => l.status === 'active').length,
                    overdueLoans: allLoans.filter(l => l.status === 'overdue').length,
                    totalAmount: allLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0),
                });
            } catch (error) {
                console.error('Failed to load loans:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLoans();
    }, []);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back{user?.name ? `, ${user.name}` : ''}!
                        </h1>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-300">
                            Here&apos;s an overview of your lending activities
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            href="/loans/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Loan
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="shrink-0 bg-green-500 rounded-md p-3">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Total Lent</dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {loading ? '...' : formatCurrency(stats.totalAmount)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="shrink-0 bg-blue-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Total Loans</dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {loading ? '...' : stats.totalLoans}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="shrink-0 bg-purple-500 rounded-md p-3">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Active Loans</dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {loading ? '...' : stats.activeLoans}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                                <div className="shrink-0 bg-red-500 rounded-md p-3">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">Overdue</dt>
                                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                            {loading ? '...' : stats.overdueLoans}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Loans */}
                <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Loans</h2>
                        <Link
                            href="/loans"
                            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                        >
                            View all
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    <div className="px-6 py-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                            </div>
                        ) : loans.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No loans yet</p>
                                <Link
                                    href="/loans/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create your first loan
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loans.map((loan) => (
                                    <li key={loan.id} className="py-3">
                                        <Link href={`/loans/${loan.id}`} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 py-1 rounded">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-3 ${
                                                    loan.status === 'active' ? 'bg-green-500' :
                                                    loan.status === 'overdue' ? 'bg-red-500' :
                                                    loan.status === 'paid' ? 'bg-blue-500' :
                                                    'bg-gray-500'
                                                }`} />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {loan.borrower_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Due: {new Date(loan.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(loan.principal_amount)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {loan.interest_rate}% interest
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link
                        href="/loans/new"
                        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow flex items-center"
                    >
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                            <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Loan</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Create a new loan record</p>
                        </div>
                    </Link>

                    <Link
                        href="/loans"
                        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow flex items-center"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">View All Loans</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your loans</p>
                        </div>
                    </Link>

                    <Link
                        href="/profile"
                        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow flex items-center"
                    >
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profile</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">View your profile</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default DashboardPageView
