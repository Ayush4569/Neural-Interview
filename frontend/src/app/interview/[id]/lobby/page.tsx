import PreJoinPanel from "@/components/interview/PreJoinPanel";

interface PreJoinPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreJoinPage({ params }: PreJoinPageProps) {
  const id = (await params).id;
  return <PreJoinPanel interviewId={id as string} />;
}
