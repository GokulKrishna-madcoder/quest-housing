import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
        supabase.from('properties').select('type, availability_status, rent_amount, location'),
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
      const charts: any[] = [];
      const tables: any[] = [];
      
      const chartRegex = /\[CHART:\s*({[\s\S]*?})\]/g;
      let matchChart;
      while ((matchChart = chartRegex.exec(rawContent)) !== null) {
        try {
          charts.push(JSON.parse(matchChart[1]));
        } catch (e) {
          console.error("Failed to parse chart JSON", e);
        }
      }

      const tableRegex = /\[TABLE:\s*({[\s\S]*?})\]/g;
      let matchTable;
      while ((matchTable = tableRegex.exec(rawContent)) !== null) {
        try {
          tables.push(JSON.parse(matchTable[1]));
        } catch (e) {
          console.error("Failed to parse table JSON", e);
        }
      }
      
      let cleanContent = rawContent.replace(/\[CHART:\s*({[\s\S]*?})\]/g, '').trim();
      cleanContent = cleanContent.replace(/\[TABLE:\s*({[\s\S]*?})\]/g, '').trim();

      setMessages([...newMessages, { role: 'assistant', content: cleanContent, charts, tables }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = err.context ? await err.context.text() : err.message || 'Unknown error';
      setMessages([...newMessages, { role: 'assistant', content: `**Error:** ${errorMsg}\n\nPlease check your Edge Function deployment and ensure GEMINI_API_KEY is set.` }]);
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
                      <div key={cIdx} className="bg-white border border-navy/10 rounded-xl p-4 shadow-sm w-full">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-navy/60 mb-4">{chart.title}</h4>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            {chart.type === 'line' ? (
                              <LineChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                                <Line type="monotone" dataKey={chart.yKey} stroke="#f7d112" strokeWidth={3} dot={{ fill: '#0a192f', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#f7d112' }} />
                              </LineChart>
                            ) : (
                              <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey={chart.xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey={chart.yKey} fill="#f7d112" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
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
