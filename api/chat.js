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
        system: `You are a helpful assistant for OC Garage Cleanout, a local garage cleanout service in Orange County, California. Keep responses short, friendly and conversational — this is a chat widget not an email. Always push toward booking by calling or texting (949) 414-6589.

Key facts:
- Flat $599 for a standard garage cleanout, $799 for oversized or extremely full garages
- Saturday bookings only
- We haul everything out and broom sweep the garage clean
- Price confirmed and signed off before work begins
- You don't pay until the job is done and you're satisfied
- We serve all of Orange County
- We do NOT take: hazardous materials, paint or chemicals, electronics/e-waste, construction debris, appliances containing Freon, attic items
- Usable items donated to Habitat for Humanity and Goodwill
- Payment via Cash, Zelle or Venmo
- 24 hour cancellation policy, $100 fee for late cancellations
- To book: call or text (949) 414-6589

If someone asks about price, availability, what you take, service area, or how to book — answer clearly and end with a nudge to call or text to reserve their Saturday spot.`,
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
