import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Cost-conscious defaults for development
const AI_CONFIG = {
  // Use cheaper model for development/testing
  model: import.meta.env.PROD ? 'gpt-4o' : 'gpt-4o-mini',

  // Token limits to control costs
  max_tokens: 4000, // Reasonable limit for structured responses

  // Temperature for consistent, structured output
  temperature: 0.3,

  // Pricing info for tracking
  pricing: {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }, // per 1K tokens
    'gpt-4o': { input: 0.005, output: 0.015 } // per 1K tokens
  }
};

// Usage tracking for cost awareness
let sessionUsage = {
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCost: 0
};

// Helper function to estimate cost
const estimateCost = (inputTokens, outputTokens, model) => {
  const rates = AI_CONFIG.pricing[model];
  if (!rates) return 0;

  return (inputTokens / 1000 * rates.input) + (outputTokens / 1000 * rates.output);
};

// Main AI generation function with cost tracking
export const generateAIResponse = async (prompt, options = {}) => {
  const startTime = Date.now();
  const model = options.model || AI_CONFIG.model;

  console.log('🤖 AI Request Started:', {
    model,
    promptLength: prompt.length,
    estimatedInputTokens: Math.ceil(prompt.length / 4), // Rough estimate: 4 chars = 1 token
    sessionCalls: sessionUsage.calls + 1
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful fitness and nutrition AI assistant. Always respond with valid JSON in the exact structure requested. Be specific, practical, and health-conscious in your recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.max_tokens || AI_CONFIG.max_tokens,
      temperature: options.temperature || AI_CONFIG.temperature,
      response_format: { type: 'json_object' } // Ensure JSON response
    });

    // Track usage and costs
    const usage = response.usage;
    const cost = estimateCost(usage.prompt_tokens, usage.completion_tokens, model);

    sessionUsage.calls++;
    sessionUsage.inputTokens += usage.prompt_tokens;
    sessionUsage.outputTokens += usage.completion_tokens;
    sessionUsage.estimatedCost += cost;

    const duration = Date.now() - startTime;

    console.log('✅ AI Response Success:', {
      model,
      duration: `${duration}ms`,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      cost: `$${cost.toFixed(4)}`,
      sessionTotal: `$${sessionUsage.estimatedCost.toFixed(4)}`,
      sessionCalls: sessionUsage.calls
    });

    // Parse JSON response with error recovery
    let parsedData;
    const rawContent = response.choices[0].message.content;

    try {
      parsedData = JSON.parse(rawContent);
    } catch (jsonError) {
      console.warn('⚠️ Initial JSON parse failed, attempting recovery:', jsonError.message);

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
          console.error('❌ JSON recovery failed:', recoveryError.message);
          console.log('Raw content length:', rawContent.length);
          console.log('First 500 chars:', rawContent.substring(0, 500));
          console.log('Last 500 chars:', rawContent.substring(rawContent.length - 500));

          throw new Error(`Invalid JSON response from AI: ${jsonError.message}`);
        }
      } else {
        throw new Error(`Malformed JSON response: No valid JSON object found`);
      }
    }

    return {
      success: true,
      data: parsedData,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        cost,
        model
      },
      duration
    };

  } catch (error) {
    console.error('❌ AI Request Failed:', {
      error: error.message,
      duration: `${Date.now() - startTime}ms`,
      model,
      sessionCalls: sessionUsage.calls
    });

    // Handle different types of errors
    if (error.status === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait and try again.',
        code: 'RATE_LIMIT'
      };
    }

    if (error.status === 401) {
      return {
        success: false,
        error: 'Invalid API key. Please check your OpenAI configuration.',
        code: 'AUTH_ERROR'
      };
    }

    if (error.status === 400) {
      return {
        success: false,
        error: 'Invalid request. Please check your prompt format.',
        code: 'BAD_REQUEST'
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR'
    };
  }
};

// Function to get current session usage stats
export const getSessionUsage = () => ({
  ...sessionUsage,
  model: AI_CONFIG.model,
  avgCostPerCall: sessionUsage.calls > 0 ? sessionUsage.estimatedCost / sessionUsage.calls : 0
});

// Function to reset session usage (useful for testing)
export const resetSessionUsage = () => {
  sessionUsage = {
    calls: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0
  };
  console.log('🔄 Session usage reset');
};

// Quick cost estimator for planning
export const estimatePromptCost = (promptText, estimatedResponseTokens = 2000) => {
  const model = AI_CONFIG.model;
  const inputTokens = Math.ceil(promptText.length / 4); // Rough estimate
  const outputTokens = estimatedResponseTokens;

  return {
    model,
    inputTokens,
    outputTokens,
    estimatedCost: estimateCost(inputTokens, outputTokens, model)
  };
};

export default openai;