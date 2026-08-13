export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { type, locality, furnishing, amenities, price, bhk } = req.body || {};

  if (!locality) return res.status(400).json({ error: 'Locality is required' });

  const prompt = `You are an expert Real Estate SEO Strategist for rental properties in Bangalore, India. Generate an SEO-optimized title and description for this property listing.

Property details:
- Type: ${type || 'Apartment'}
- BHK: ${bhk || ''}
- Locality: ${locality}
- Furnishing: ${furnishing || 'Unfurnished'}
- Amenities: ${amenities || 'None specified'}
- Monthly Rent: ₹${price || 'Not specified'}

STRICT RULES:
1. Title: 50-60 characters max. Include property type + key differentiator + locality. High CTR. No generic words like "beautiful" or "nice".
2. Description: 150-160 characters max. Natural, persuasive tone. Mention location, top 2 amenities, and end with a CTA like "Schedule a visit today!"
3. Use power words: Premium, Spacious, Modern, Gated Community, Near Metro, etc.
4. Target keyword pattern: "[BHK] [Type] for rent in [Locality]"

Respond ONLY with valid JSON, no markdown, no explanation:
{"title": "your title here", "description": "your description here"}`;

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) throw new Error(`NVIDIA API error: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed' });
  }
}
