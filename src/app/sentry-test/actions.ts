'use server';

// This import is here to ensure it's only loaded on the server
const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');

export async function generateJokeAction() {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: 'Tell me a joke',
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    return text;
  } catch (error) {
    console.error('Error generating joke:', error);
    return 'Sorry, I could not think of a joke right now.';
  }
}
