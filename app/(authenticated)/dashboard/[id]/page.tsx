import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
    params: { id: string };
};

// Generates dynamic metadata on the server
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // You can fetch data here based on the params
    const pageParams = await params
    console.log("these are the pageParams:", pageParams);
    const dashboardId = pageParams.id
    if (!dashboardId) return notFound();

    const pageTitle = `Dashboard ${dashboardId}`;

    return {
        title: pageTitle,
    };
}

export default async function DashboardPageID({ params }: Props) {
    const { id } = await params;
    return (
        <div>
            This is the dashboard id: {id}
        </div>
    )
}
