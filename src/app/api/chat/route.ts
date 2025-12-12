import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const PRICE_PER_MILLION_INPUT: Record<string, number> = {
  'haiku-4.5': 1,
  'sonnet-4.5': 3,
  'sonnet-4': 3,
  'opus-4.5': 15,
  'opus-4.1': 15,
};

const PRICE_PER_MILLION_OUTPUT: Record<string, number> = {
  'haiku-4.5': 5,
  'sonnet-4.5': 15,
  'sonnet-4': 15,
  'opus-4.5': 75,
  'opus-4.1': 75,
};

const MODEL_MAP: Record<string, string> = {
  'haiku-4.5': 'claude-haiku-4-5-20251001',
  'sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'sonnet-4': 'claude-sonnet-4-20250514',
  'opus-4.5': 'claude-opus-4-5-20251122',
  'opus-4.1': 'claude-opus-4-1-20250805',
};

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { messages, settings, files } = await req.json();
    
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return new Response('API key not configured', { status: 401 });
    }

    const anthropic = new Anthropic({ apiKey });
    
    // Convert to Anthropic format
    const anthropicMessages = messages.map((msg: any) => {
      const content: any[] = [{ type: 'text', text: msg.content }];
      
      // Add files if present
      if (msg.files && msg.files.length > 0) {
        msg.files.forEach((file: any) => {
          if (file.type.startsWith('image/')) {
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type,
                data: file.base64.split(',')[1]
              }
            });
          } else if (file.type === 'application/pdf') {
            content.push({
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: file.base64.split(',')[1]
              }
            });
          }
        });
      }
      
      return {
        role: msg.role,
        content
      };
    });

    const model = MODEL_MAP[settings.model] || MODEL_MAP['sonnet-4.5'];
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await anthropic.messages.create({
            model,
            max_tokens: 8000,
            messages: anthropicMessages,
            stream: true,
            ...(settings.enableExtendedThinking && {
              thinking: {
                type: 'enabled',
                budget_tokens: 10000
              }
            })
          } as any);

          let fullText = '';
          let thinkingText = '';
          let usage: any = null;

          for await (const event of messageStream as any) {
            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'thinking') {
                thinkingText = '';
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta.type === 'thinking_delta') {
                thinkingText += event.delta.thinking;
              } else if (event.delta.type === 'text_delta') {
                fullText += event.delta.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'content', delta: event.delta.text })}\n\n`)
                );
              }
            } else if (event.type === 'message_delta') {
              usage = event.usage;
            }
          }

          // Calculate cost
          if (usage) {
            const inputCost = (usage.input_tokens / 1_000_000) * (PRICE_PER_MILLION_INPUT[settings.model] || 3);
            const outputCost = (usage.output_tokens / 1_000_000) * (PRICE_PER_MILLION_OUTPUT[settings.model] || 15);
            const totalCost = inputCost + outputCost;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'cost',
                cost: totalCost,
                tokensUsed: {
                  input: usage.input_tokens,
                  output: usage.output_tokens,
                  cacheRead: usage.cache_read_input_tokens || 0,
                  cacheWrite: usage.cache_creation_input_tokens || 0
                }
              })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
