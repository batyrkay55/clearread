export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, lang } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }
  const outputLang = lang === 'en' ? 'English' : 'Russian';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Simplify the following text for a reader with dyslexia, and write your response in ${outputLang} (translate if the source text is in a different language). Rules: short sentences (max 15-20 words), plain everyday words instead of jargon or complex terminology, preserve all original meaning and facts. Break the text into short paragraphs — max 2-3 sentences each. Use lists where helpful. Do not use italics or ALL CAPS for emphasis — use bold instead. Do not add any commentary of your own — output only the simplified text.\n\nText:\n${text}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const textBlock = data.content.find((c) => c.type === 'text');
    const simplified = textBlock ? textBlock.text : '';

    return res.status(200).json({ simplified });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
