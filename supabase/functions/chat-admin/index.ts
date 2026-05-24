import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, analyticsContext } = await req.json();

    const apiKey = Deno.env.get('NVIDIA_API_KEY') || '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';
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const systemPrompt = `You are the Quest Housing Admin AI Analyst. 
You are a senior real estate data analyst and business strategist.
You have access to the following raw database context covering Owner Leads, Tenant Funnel Leads, and Property Inventory:
<RAW_DATA>
${analyticsContext || 'No data provided.'}
</RAW_DATA>

Analyze this data thoroughly when answering the admin's questions.

CRITICAL INSTRUCTION 1 (VISUALIZATIONS):
When you want to visualize data to support your analysis, you MUST output a chart block in exactly this JSON format. Only use "bar" or "line" for the chart type.
Example:
[CHART: {"type": "bar", "title": "Lead Budgets", "data": [{"name": "Under 15k", "value": 10}, {"name": "15k-25k", "value": 20}], "xKey": "name", "yKey": "value"}]
Ensure the JSON is strictly valid. You can output multiple charts if needed.

CRITICAL INSTRUCTION 2 (ACTIONABLE INSIGHTS):
You MUST always end your response with a dedicated section titled exactly:
"### What should be implemented based on this data:"
Under this heading, provide concrete, actionable business strategies or marketing implementations based on the trends you found in the data.

Tone: Professional, highly analytical, concise, and structured.`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages
      ],
      max_tokens: 1500,
    });

    const text = response.choices[0].message.content || "I couldn't generate a response.";

    return new Response(JSON.stringify({ content: text, role: 'assistant' }), {
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
