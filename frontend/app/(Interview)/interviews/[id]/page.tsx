'use client'
import { useState } from 'react';
import PrejoinPanel from '../../_components/PreJoinPanel';
import InterviewScreen from '../../_components/InterviewScreen';
import { useParams } from 'next/navigation';

export default  function InterviewPage() {
  const [stage, setStage] = useState<'prejoin' | 'live' | 'ended'>('prejoin');
  const [endedReason, setEndedReason] = useState<string | undefined>();
  const {id} = useParams()
  return (
    <div>
      {stage === 'prejoin' && (
        <PrejoinPanel
         id={id as string}
          onJoined={() => setStage('live')}
          onEnded={(reason:string) => { setEndedReason(reason); setStage('ended') }}
        />
      )}
      {stage === 'live' && (
        <InterviewScreen interviewId={id as string}/>
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
