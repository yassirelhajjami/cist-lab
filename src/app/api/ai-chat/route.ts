type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are Jocker, the friendly CodeQuest coding companion for school students aged 8-16.
Help students understand programming, computer science, robotics, AI, Scratch, Blockly, Python, JavaScript, HTML, and CSS.
Be playful, encouraging, concise, and age-appropriate. Explain with small examples and hints before full solutions.
Never request personal information. Do not produce sexual, violent, hateful, self-harm, illegal, or dangerous instructions.
If a request is unsafe or unrelated to learning, gently redirect the student to a safe educational topic.
Do not claim to be a teacher or human. Keep most answers below 180 words.`;

function extractOutputText(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const response = data as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  return response.output
    ?.flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text)
    .join('\n')
    .trim() || '';
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'AI chat is not configured.' }, { status: 503 });
  }

  try {
    const body = await request.json() as { messages?: ChatMessage[] };
    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter((message) =>
            (message?.role === 'user' || message?.role === 'assistant') &&
            typeof message.content === 'string' &&
            message.content.trim().length > 0
          )
          .slice(-12)
          .map((message) => ({
            role: message.role,
            content: message.content.trim().slice(0, 2000)
          }))
      : [];

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return Response.json({ error: 'A student message is required.' }, { status: 400 });
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-5.6-luna',
        instructions: SYSTEM_PROMPT,
        input: messages,
        reasoning: { effort: 'low' },
        text: { verbosity: 'low' },
        max_output_tokens: 500
      }),
      cache: 'no-store'
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI chat request failed:', openAIResponse.status);
      return Response.json({ error: 'The AI tutor is temporarily unavailable.' }, { status: 502 });
    }

    const data: unknown = await openAIResponse.json();
    const reply = extractOutputText(data);
    if (!reply) {
      return Response.json({ error: 'The AI tutor returned an empty response.' }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (error) {
    console.error('AI chat route error:', error instanceof Error ? error.message : 'Unknown error');
    return Response.json({ error: 'Unable to process the chat request.' }, { status: 500 });
  }
}
