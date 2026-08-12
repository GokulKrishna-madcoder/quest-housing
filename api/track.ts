export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { event_type, path, property_id, session_id } = req.body || {};
  
  try {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/user_events`, {
      method: 'POST',
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY as string,
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id,
        event_name: event_type,
        event_data: { 
          path, 
          property_id: property_id || null,
          country: req.headers['x-vercel-ip-country'] || null, 
          city: req.headers['x-vercel-ip-city'] || null 
        }
      })
    });
    
    if (!response.ok) throw new Error('Supabase insert failed');
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
}
