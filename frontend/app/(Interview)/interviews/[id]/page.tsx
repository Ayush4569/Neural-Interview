'use client'
import { useState } from 'react';
import PrejoinPanel from '../../_components/PreJoinPanel';
import InterviewScreen from '../../_components/InterviewScreen';

export default function InterviewPage({params}:{params:{id:string}}) {
  const [stage, setStage] = useState<'prejoin' | 'live' | 'ended'>('prejoin');
  const [endedReason, setEndedReason] = useState<string | undefined>();
  return (
    <div>
      {stage === 'prejoin' && (
        <PrejoinPanel
         id={params.id as string}
          onJoined={() => setStage('live')}
          onEnded={(reason:string) => { setEndedReason(reason); setStage('ended') }}
        />
      )}
      {stage === 'live' && (
        <InterviewScreen interviewId={params.id as string}/>
      )}
      {stage === 'ended' && (
        <section>
          <h2>Interview ended</h2>
          <p>Reason: {endedReason ?? 'Completed'}</p>
        </section>
      )}
    </div>
  );
}
