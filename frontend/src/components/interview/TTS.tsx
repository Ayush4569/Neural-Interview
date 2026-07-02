
'use client'
import api from '@/lib/api';
import { useState } from 'react'

function TTS() {
    const [text, setText] = useState<string>("");

    const handleSpeak = async() => {
        try {
            const response = await api.post("/voice/synthesize", { text },{responseType:"blob"});
            const audioUrl = URL.createObjectURL(response.data);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.log("Error speaking text", error); 
        }
    }

    return (
        <div className='min-h-screen flex flex-col gap-y-2 items-center justify-center'>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to speak"
                className='border border-gray-300 rounded px-4 py-2 w-80'
            />
            <button
                onClick={handleSpeak}
                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
            >
                Speak
            </button>
        </div>
    )
}

export default TTS;