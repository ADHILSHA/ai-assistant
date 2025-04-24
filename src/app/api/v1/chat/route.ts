// app/api/chat/route.ts

import OpenAI from 'openai';
import { SYSTEM_PROMPT, Message } from '@/app/lib/prompts'; // Adjust path if needed
import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
// Optional: Set the runtime to edge for potentially lower latency
// export const runtime = 'edge';

// API Key of Open AI
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    throw new Error("Missing environment variable OPENAI_API_KEY");
}

const openaiProvider = createOpenAI({
  apiKey: openaiApiKey
});

export async function POST(req: Request) {
    try {
        // Extract messages from the request body
        const body = await req.json();
        const incomingMessages: Message[] = body.messages || [];

        // Validate messages format (basic check)
        if (!Array.isArray(incomingMessages)) {
            return NextResponse.json(
                { error: 'Invalid messages format. Expected an array.' },
                { status: 400 }
            );
        }

        // Prepare messages for OpenAI API
        //    - Add the system prompt
        //    - Ensure roles are correct ('user' or 'assistant')
        const messagesForAPI = incomingMessages.filter(msg => msg.role === 'user' || msg.role === 'assistant');

        // Request the OpenAI API for the response stream and convert to stream response
        const result = streamText({
            model: openaiProvider('gpt-3.5-turbo'),
            system: SYSTEM_PROMPT,
            messages: messagesForAPI,
            temperature: 0.7, // Adjust creativity (0=deterministic, 1=more creative)
            maxTokens: 1000, // Adjust max response length if needed
        });

        // 5. Return the stream response
        return result.toDataStreamResponse();

    } catch (error: any) {
        console.error("[API_CHAT_ERROR]", error); // Log the error for debugging

        // Handle specific OpenAI errors if needed (e.g., rate limits, auth)
        if (error.response) {
             console.error("OpenAI Error Status:", error.response.status);
             console.error("OpenAI Error Data:", error.response.data);
        }

        // Return a generic internal server error response
        return NextResponse.json(
            { error: 'An internal server error occurred.', details: error.message },
            { status: 500 }
        );
    }
}