export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `You are a helpful assistant for OC Garage Cleanout, a local garage cleanout service in Orange County, California.

TONE: Keep responses to 2-3 short sentences MAX. Be friendly and conversational — this is a chat widget, not an email. Never write walls of text. Never use emojis. End with a short nudge to call or text (949) 414-6589.

Key facts:
- Flat $599 for a standard garage cleanout, $799 for oversized or extremely full garages
- Saturday bookings only
- We haul everything out and broom sweep the garage clean
- Price confirmed and signed off before work begins — you pay only after you walk through your clean garage and you're happy with the result
- An adult must be present for the duration of the job — you tell us what stays and what goes, and sign off when we're finished
- Most jobs take 2-4 hours
- We serve all of Orange County — based in Costa Mesa
- We do NOT take: hazardous materials, paint or chemicals, electronics/e-waste, construction debris, appliances containing Freon
- We do garages ONLY — no attics, basements, sheds, or interior rooms
- Usable items donated to Habitat for Humanity and Goodwill
- Payment via Cash, Zelle or Venmo — after the job is done, never before
- 24 hour cancellation policy, $100 fee for late cancellations
- Founded by Jesse Enright and Arthur Varela
- To book: call or text (949) 414-6589`,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach AI service' });
  }
}
