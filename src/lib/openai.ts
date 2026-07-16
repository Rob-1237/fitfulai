import OpenAI from 'openai';
import type { AiUsage } from '../shared/schemas';

// ⚠️ TEMPORARY: client-side OpenAI usage is a known flaw being removed in the
// rework (Day 4 — generation moves behind Vercel serverless functions and the
// key leaves the browser bundle entirely). Do not add new callers.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

type ModelName = 'gpt-4o' | 'gpt-4o-mini';

interface AIConfig {
  model: ModelName;
  max_tokens: number;
  temperature: number;
  pricing: Record<ModelName, { input: number; output: number }>;
}

// Cost-conscious defaults for development
const AI_CONFIG: AIConfig = {
  // Use cheaper model for development/testing
  model: import.meta.env.PROD ? 'gpt-4o' : 'gpt-4o-mini',

  // Token limits to control costs
  max_tokens: 4000, // Reasonable limit for structured responses

  // Temperature for consistent, structured output
  temperature: 0.3,

  // Pricing info for tracking (per 1K tokens)
  pricing: {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.005, output: 0.015 },
  },
};

interface SessionUsage {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

// Usage tracking for cost awareness
let sessionUsage: SessionUsage = {
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCost: 0,
};

// Helper function to estimate cost
const estimateCost = (inputTokens: number, outputTokens: number, model: string): number => {
  const rates = AI_CONFIG.pricing[model as ModelName];
  if (!rates) return 0;

  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
};

export interface GenerateOptions {
  model?: ModelName;
  max_tokens?: number;
  temperature?: number;
}

export type AIResponse =
  | { success: true; data: unknown; usage: AiUsage; duration: number }
  | { success: false; error: string; code: string };

// Main AI generation function with cost tracking
export const generateAIResponse = async (
  prompt: string,
  options: GenerateOptions = {}
): Promise<AIResponse> => {
  const startTime = Date.now();
  const model = options.model || AI_CONFIG.model;

  console.log('🤖 AI Request Started:', {
    model,
    promptLength: prompt.length,
    estimatedInputTokens: Math.ceil(prompt.length / 4), // Rough estimate: 4 chars = 1 token
    sessionCalls: sessionUsage.calls + 1,
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful nutrition AI assistant. Always respond with valid JSON in the exact structure requested. Be specific, practical, and health-conscious in your recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options.max_tokens || AI_CONFIG.max_tokens,
      temperature: options.temperature ?? AI_CONFIG.temperature,
      response_format: { type: 'json_object' }, // Ensure JSON response
    });

    // Track usage and costs
    const usage = response.usage;
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const totalTokens = usage?.total_tokens ?? 0;
    const cost = estimateCost(promptTokens, completionTokens, model);

    sessionUsage.calls++;
    sessionUsage.inputTokens += promptTokens;
    sessionUsage.outputTokens += completionTokens;
    sessionUsage.estimatedCost += cost;

    const duration = Date.now() - startTime;

    console.log('✅ AI Response Success:', {
      model,
      duration: `${duration}ms`,
      usage: { promptTokens, completionTokens, totalTokens },
      cost: `$${cost.toFixed(4)}`,
      sessionTotal: `$${sessionUsage.estimatedCost.toFixed(4)}`,
      sessionCalls: sessionUsage.calls,
    });

    // Parse JSON response with error recovery.
    // NOTE: this hand-rolled repair logic disappears on Day 4 when structured
    // outputs guarantee schema-conformant JSON from the API.
    let parsedData: unknown;
    const rawContent = response.choices[0].message.content ?? '';

    try {
      parsedData = JSON.parse(rawContent);
    } catch (jsonError) {
      const jsonMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
      console.warn('⚠️ Initial JSON parse failed, attempting recovery:', jsonMessage);

      // Try to clean and fix common JSON issues
      let cleanedContent = rawContent;

      // Remove trailing commas before closing braces/brackets
      cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');

      // Remove any text before the first { or after the last }
      const firstBrace = cleanedContent.indexOf('{');
      const lastBrace = cleanedContent.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);

        try {
          parsedData = JSON.parse(cleanedContent);
          console.log('✅ JSON recovery successful');
        } catch (recoveryError) {
          console.error(
            '❌ JSON recovery failed:',
            recoveryError instanceof Error ? recoveryError.message : recoveryError
          );
          throw new Error(`Invalid JSON response from AI: ${jsonMessage}`);
        }
      } else {
        throw new Error('Malformed JSON response: No valid JSON object found');
      }
    }

    return {
      success: true,
      data: parsedData,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        model,
      },
      duration,
    };
  } catch (error) {
    const status = (error as { status?: number }).status;
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';

    console.error('❌ AI Request Failed:', {
      error: message,
      duration: `${Date.now() - startTime}ms`,
      model,
      sessionCalls: sessionUsage.calls,
    });

    // Handle different types of errors
    if (status === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait and try again.',
        code: 'RATE_LIMIT',
      };
    }

    if (status === 401) {
      return {
        success: false,
        error: 'Invalid API key. Please check your OpenAI configuration.',
        code: 'AUTH_ERROR',
      };
    }

    if (status === 400) {
      return {
        success: false,
        error: 'Invalid request. Please check your prompt format.',
        code: 'BAD_REQUEST',
      };
    }

    return {
      success: false,
      error: message,
      code: 'UNKNOWN_ERROR',
    };
  }
};

// Function to get current session usage stats
export const getSessionUsage = () => ({
  ...sessionUsage,
  model: AI_CONFIG.model,
  avgCostPerCall: sessionUsage.calls > 0 ? sessionUsage.estimatedCost / sessionUsage.calls : 0,
});

// Function to reset session usage (useful for testing)
export const resetSessionUsage = (): void => {
  sessionUsage = {
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
  };
  console.log('🔄 Session usage reset');
};

export default openai;
