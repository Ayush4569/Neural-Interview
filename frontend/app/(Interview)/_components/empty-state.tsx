import Link from 'next/link';
import { Calendar,ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
const EmptyState = ({ type, title, description }: { type: 'past' | 'upcoming'; title: string; description: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full p-4 mb-4 bg-indigo-500/8">
        {type === 'past' ? (
          <FileText className="h-8 w-8 text-[color:var(--indigo)]" />
        ) : (
          <Calendar className="h-8 w-8 text-[color:var(--indigo)]" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--text)] mb-2">{title}</h3>
      <p className="text-sm text-[color:var(--text-dim)] text-center max-w-md mb-6">{description}</p>
      <Button asChild>
        <Link href="/interviews" 
          style={{ background: 'linear-gradient(135deg, var(--indigo), var(--coral))', color: '#0E1116' }}
        >
          {type === 'past' ? 'Start Your First Interview' : 'Schedule Interview'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
  
export default EmptyState;