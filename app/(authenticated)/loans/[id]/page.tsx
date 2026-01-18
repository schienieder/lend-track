import LoanDetailPageView from "@/views/LoanDetailPageView";

interface LoanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;
  return <LoanDetailPageView loanId={id} />;
}
