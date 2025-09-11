import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const InterviewDashboardSkeleton = () => (
    <div className=" mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-y-2">
            <Skeleton className="h-6 w-32 mb-2 bg-[#3A3A3A]" />
            <Skeleton className="h-10 w-64 mb-3 bg-[#3A3A3A]" />
            <Skeleton className="h-8 w-96 bg-[#3A3A3A]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            {[1,2,3].map(i => (
                <Card key={i} className="border-0 w-[450px] h-[150px] rounded-md p-0">
                    <CardContent className="p-0 w-full h-full">
                        <Skeleton className="h-full w-full bg-[#3A3A3A]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

export default InterviewDashboardSkeleton