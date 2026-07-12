export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }
 
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
            content: `Упрости следующий текст для читателя с дислексией. Правила: короткие предложения (до 15-20 слов), простые повседневные слова вместо канцелярита и сложных терминов, сохрани весь исходный смысл и факты. Разбивай текст на короткие абзацы — максимум 2-3 предложения в каждом. Используй списки где уместно. Не используй курсив и КАПС для выделения — если что-то нужно выделить, оформи жирным. Не добавляй ничего от себя и не давай комментариев — выведи только упрощённый текст.\n\nТекст:\n${text}`,
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
