import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, sessionId = 'unknown-session' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch properties
    const { data: properties } = await supabase
      .from('properties')
      .select('id, title, type, location, rent_amount, furnishing_status, image_urls')
      .eq('availability_status', 'Available')
      .limit(10);
      
    const propertiesContext = properties && properties.length > 0
      ? JSON.stringify(properties.map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          location: p.location,
          rent: p.rent_amount,
          furnishing: p.furnishing_status
        })))
      : "No properties available at the moment.";

    const apiKey = Deno.env.get('NVIDIA_API_KEY') || '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';
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const WEBSITE_KNOWLEDGE_BASE = `
# Quest Housing - Official Knowledge Base
**Brand Ethos**: Quest Housing redefines real estate in Bengaluru by offering a cinematic, seamless, and deeply trustworthy experience. We bridge the gap between discerning property owners and high-quality tenants. All our properties are 100% verified to avoid scams and noise.

**Transparent Fee for Services**: 
- We operate on a radically transparent model. We do not use the term "Brokerage". 
- We charge a flat "Fee for Services" equal to exactly 22 Days of Rent. 
- **Zero Upfront Costs**: We do not charge a single rupee upfront. The fee is only paid once the customer has successfully secured the property. 

**NRI Services (Global Reach, Local Expertise)**:
- We provide specialized, end-to-end services tailored for NRI owners and customers.
- We handle everything from high-quality virtual viewings and digital agreements to completely hands-off property management.
- We act as a trusted proxy on the ground in Bengaluru, letting NRIs sleep soundly across time zones.

**Services for Owners**:
- Free Property Listings: List properties at no cost and reach a curated, high-net-worth network of verified professionals and expats.
- Secure & Private: Property details remain confidential until we verify the right match.
- End-to-End Management: From legal paperwork to key handover, our concierge handles it all.

**Services for Tenants**:
- Access to the top 1% of homes in Bengaluru.
- Cinematic detail with immersive, high-fidelity visual tours.
- Dedicated support and personalized assistance from initial discovery to final agreement signing.
`;

    const systemPrompt = `You are the Quest Housing Concierge AI. Your goal is to help users find properties in Bangalore, answer their FAQs, and collect their contact info (Name and WhatsApp number). 
Be extremely concise, polite, and use a premium tone. 

Use the following Official Knowledge Base to accurately answer any questions about our services, pricing, or policies. Do NOT invent policies or fees outside of this knowledge base.

<KNOWLEDGE_BASE>
${WEBSITE_KNOWLEDGE_BASE}
</KNOWLEDGE_BASE>

Here are the currently available properties:
${propertiesContext}

If they ask for properties, recommend 1-2 from the list above that match their criteria.
CRITICAL INSTRUCTION 1: Whenever you recommend a property to the user, you MUST include the exact string [PROPERTY_ID: <id>] in your response (replace <id> with the actual ID from the property list). Do this for EVERY property you recommend.

CRITICAL INSTRUCTION 2: If the user wants to list a property, share personal contact info, or submit a detailed requirement, DO NOT try to collect it manually in the chat. Instead, ask them: "Are you looking to list a property as an owner, or find a home as a tenant?". 
If they indicate they are an Owner, you MUST include the exact string [ACTION: OPEN_OWNER_FORM] in your response.
If they indicate they are a Tenant, you MUST include the exact string [ACTION: OPEN_TENANT_FORM] in your response.`;

    // Filter out previous system messages just in case, though the frontend sends user/assistant
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    let response = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages
      ],
      max_tokens: 500,
    });

    let message = response.choices[0].message;
    let finalContent = message.content;

    if (!finalContent) {
      finalContent = "Thank you. Your request has been recorded.";
    }

    // Extract property IDs and prepare structured data
    const propertyIds = new Set<string>();
    const propertyRegex = /\[PROPERTY_ID:\s*([a-zA-Z0-9-]+)\]/g;
    let match;
    while ((match = propertyRegex.exec(finalContent)) !== null) {
      propertyIds.add(match[1]);
    }

    // Strip the tags from the final text
    const cleanContent = finalContent.replace(/\[PROPERTY_ID:\s*[a-zA-Z0-9-]+\]/g, '').trim();

    // Find the full property objects
    const recommended_properties = properties 
      ? properties.filter(p => propertyIds.has(p.id))
      : [];

    const latestMessage = messages[messages.length - 1].content;
    
    // Log the conversation asynchronously
    supabase.from('chatbot_conversations').insert({
      session_id: sessionId,
      user_message: latestMessage,
      bot_response: cleanContent
    }).then(() => console.log("Logged conversation"));

    return new Response(JSON.stringify({ content: cleanContent, role: 'assistant', recommended_properties }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
