'use client'
import React, { useEffect, useRef, useState } from 'react'
import Vapi from "@vapi-ai/web"
const InterviewScreen = (
  { sessionId }: { sessionId: string }
) => {

  const vapiRef = useRef<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<Array<{ role: string, text: string }>>([]);

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
    vapiRef.current = vapiInstance

    vapiInstance.on('call-start', () => {
      console.log('call connected');

    })
    return () => {
      vapiInstance.stop()
    }
  }, [])

  return (
    <div></div>
  )
}

export default InterviewScreen
