import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, Database, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CanvasJSReact from '@canvasjs/react-charts';
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  charts?: any[];
  tables?: any[];
}

export default function AIAnalyst() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I am your Quest Housing AI Analyst. I have real-time access to your database analytics. Ask me about your leads, property inventory, or recent trends.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Fetch fresh analytics snapshot
      const [ownersRes, funnelRes, propsRes, chatsRes] = await Promise.all([
        supabase.from('owner_leads').select('status, created_at, property_type, location'),
        supabase.from('instagram_leads').select('status, created_at, budget_type, preferred_location, utm_source'),
        supabase.from('properties').select('type, admin_status, price, locality'),
        supabase.from('chatbot_conversations').select('user_message, bot_response, created_at').limit(50).order('created_at', { ascending: false })
      ]);

      const analyticsContext = JSON.stringify({
        ownerLeads: ownersRes.data,
        funnelLeads: funnelRes.data,
        properties: propsRes.data,
        recentTenantChatLogs: chatsRes.data
      });

      const { data, error } = await supabase.functions.invoke('chat-admin', {
        body: { messages: newMessages, analyticsContext }
      });

      if (error) throw error;

      let rawContent = data.content || '';
      
      const extractBlocks = (text: string, tag: string) => {
        const blocks: any[] = [];
        let cleanText = text;
        const prefix = `[${tag}:`;
        let startIndex = 0;
        
        while ((startIndex = cleanText.indexOf(prefix)) !== -1) {
          let bracketCount = 0;
          let jsonStart = -1;
          let jsonEnd = -1;
          
          for (let i = startIndex + prefix.length; i < cleanText.length; i++) {
            if (cleanText[i] === '{') {
              if (bracketCount === 0) jsonStart = i;
              bracketCount++;
            } else if (cleanText[i] === '}') {
              bracketCount--;
              if (bracketCount === 0 && jsonStart !== -1) {
                jsonEnd = i + 1;
                break;
              }
            }
          }
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            let closingBracketIdx = cleanText.indexOf(']', jsonEnd);
            if (closingBracketIdx !== -1) {
              try {
                const jsonStr = cleanText.substring(jsonStart, jsonEnd);
                blocks.push(JSON.parse(jsonStr));
                cleanText = cleanText.substring(0, startIndex) + cleanText.substring(closingBracketIdx + 1);
                continue; // Process next block starting from 0 again
              } catch (e) {
                console.error(`Failed to parse ${tag} JSON`, e);
              }
            }
          }
          // If we reach here, it was malformed. Break the loop to avoid infinite loop.
          break;
        }
        return { blocks, cleanText: cleanText.trim() };
      };

      const chartExt = extractBlocks(rawContent, 'CHART');
      const tableExt = extractBlocks(chartExt.cleanText, 'TABLE');
      
      const charts = chartExt.blocks;
      const tables = tableExt.blocks;
      const cleanContent = tableExt.cleanText;

      setMessages([...newMessages, { role: 'assistant', content: cleanContent, charts, tables }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = err.context ? await err.context.text() : err.message || 'Unknown error';
      setMessages([...newMessages, { role: 'assistant', content: `**Error:** ${errorMsg}\n\nPlease check your Edge Function deployment and ensure NVIDIA_API_KEY is set.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2 flex items-center gap-3">
            <Sparkles className="text-primary" /> AI Analyst
          </h2>
          <p className="text-navy/50 text-sm">Ask natural language questions about your business data.</p>
        </div>
        <div className="flex items-center gap-2 bg-navy/5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-navy/50">
          <Database size={14} /> Live DB Connection Active
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-navy/5 shadow-sm flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-4xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-navy/5 text-navy' : 'bg-primary text-navy shadow-md'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-navy/5 text-navy rounded-tr-sm' : 'bg-white border border-navy/10 text-navy/80 rounded-tl-sm shadow-sm prose prose-sm prose-navy max-w-none'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                )}
                
                {msg.charts && msg.charts.length > 0 && (
                  <div className="mt-6 space-y-6">
                    {msg.charts.map((chart, cIdx) => (
                      <div key={cIdx} className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col w-full">
                        <div className="bg-navy/5 border-stitch-b px-4 py-3 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                          <BarChart2 size={16} className="text-primary" />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-navy/80">{chart.title}</h4>
                        </div>
                        <div className="p-4 md:p-5 flex-1">
                          <div className="h-[250px] md:h-[300px] w-full">
                            <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                              animationEnabled: true,
                              toolTip: { shared: true },
                              axisX: { gridThickness: 0, tickLength: 0, lineThickness: 0, labelFontColor: "#64748b" },
                              axisY: { gridThickness: 1, gridColor: "#e2e8f0", tickLength: 0, lineThickness: 0, labelFontColor: "#64748b" },
                              data: [{
                                type: chart.type === 'line' ? 'line' : 'column',
                                color: "#f7d112",
                                markerSize: chart.type === 'line' ? 8 : 0,
                                dataPoints: chart.data.map((d: any) => ({ label: d[chart.xKey], y: Number(d[chart.yKey]) }))
                              }]
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.tables && msg.tables.length > 0 && (
                  <div className="mt-6 space-y-6">
                    {msg.tables.map((table, tIdx) => (
                      <div key={tIdx} className="bg-white border border-navy/10 rounded-xl overflow-hidden shadow-sm w-full">
                        <div className="bg-navy/5 px-4 py-3 border-b border-navy/10">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-navy">{table.title}</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-navy/80">
                            <thead className="bg-light text-[10px] uppercase tracking-widest font-bold text-navy/50">
                              <tr>
                                {table.columns.map((col: string, i: number) => (
                                  <th key={i} className="px-4 py-3 border-b border-navy/5">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows.map((row: any[], rIdx: number) => (
                                <tr key={rIdx} className="border-b border-navy/5 last:border-0 hover:bg-navy/[0.02]">
                                  {row.map((cell: any, cIdx: number) => (
                                    <td key={cIdx} className="px-4 py-3">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-primary text-navy flex items-center justify-center shrink-0 shadow-md">
                <Bot size={20} />
              </div>
              <div className="p-5 rounded-2xl bg-white border border-navy/10 rounded-tl-sm shadow-sm">
                <Loader2 size={20} className="animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-6 bg-navy/5 border-t border-navy/10">
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., What are the top 3 requested locations from the funnel leads this week?"
              className="w-full bg-white border border-navy/10 rounded-xl py-4 pl-6 pr-16 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-navy rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-navy transition-all shadow-sm"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
