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
      setIsConnected(true)
    })
    vapiInstance.on('call-end', () => {
      console.log('call ended');
      setIsConnected(false)
    })
    vapiInstance.on('speech-start', () => {
      console.log('user started speaking');
      setIsSpeaking(true)
    })
    vapiInstance.on('speech-end', () => {
      console.log('user stopped speaking');
      setIsSpeaking(false)
    })
    vapiInstance.on('message', (data: { role: string, text: string }) => {
      console.log('transcript received', data);
      setTranscript((prev) => [...prev, data])
    })
    vapiInstance.on('error', (error: any) => {
      console.error('error occurred', error);
    })

    vapiInstance.start({
      
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
