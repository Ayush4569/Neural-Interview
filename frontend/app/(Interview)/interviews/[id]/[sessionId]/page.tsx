import InterviewScreen from '@/app/(Interview)/_components/InterviewScreen'
import React from 'react'

const InterviewScreenPage = (
  { params }: { params: { sessionId: string } }
) => {
  const { sessionId } = params
  return (
    <InterviewScreen sessionId={sessionId as string} />
  )
}

export default InterviewScreenPage
