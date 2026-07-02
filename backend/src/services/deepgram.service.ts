import { DeepgramError } from "@deepgram/sdk";
import { DeepgramClient } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const deepgramClient =  new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY })
export class DeepgramService {

    async getAudioBuffer(stream: ReadableStream<Uint8Array> | null) {
        try {
            if (!stream) throw new Error("No audio stream received from Deepgram.");
            const reader = stream.getReader();
            const chunks = [];
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
            const buffers = chunks.map(chunk => Buffer.from(chunk));
            return Buffer.concat(buffers);
        } catch (error) {
            console.log("Error converting stream to buffer", error);
            throw new Error("An error occurred while processing the audio stream.");
        }
    }
    async getAudio(text:string): Promise<{ buffer: Buffer | null, error: boolean, message: string }> {
        try {
            const response = await deepgramClient.speak.v1.audio.generate({
                text,
                model: process.env.DEEPGRAM_VOICE_MODEL as string || 'aura-1',
                encoding: "linear16",
                container: "wav",
            })

            const streams = response.stream();
            const buffer = await this.getAudioBuffer(streams)
            return { buffer, error: false, message: "" };
        } catch (error: any) {
            console.log("Error converting TTS", error);
            let message = "";
            if (error instanceof DeepgramError) {
                message = error.message;
            }
            else message = "An unexpected error occurred while converting text to speech."
            return { error: true, message, buffer: null };
        }
    }

}