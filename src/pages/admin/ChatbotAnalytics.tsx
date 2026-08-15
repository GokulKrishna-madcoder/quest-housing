import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { MessageSquare, UserPlus, Calendar, Search, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatbotAnalytics() {
  const [leads, setLeads] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    
    // Fetch leads
    const { data: leadsData } = await supabase
      .from('chatbot_leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (leadsData) setLeads(leadsData);

    // Fetch conversations
    const { data: convData } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (convData) setConversations(convData);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-2">ANALYTICS</p>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tighter text-navy">
            Chatbot Insights
          </h1>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/10 rounded-lg text-xs font-bold uppercase tracking-widest text-navy hover:bg-navy/5 transition-colors"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white rounded-2xl border border-navy/10 shadow-sm flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-navy/50 font-bold mb-1">AI Captured Leads</p>
            <p className="text-4xl font-display font-medium text-navy">{leads.length}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white rounded-2xl border border-navy/10 shadow-sm flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center text-navy">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-navy/50 font-bold mb-1">Total AI Interactions</p>
            <p className="text-4xl font-display font-medium text-navy">{conversations.length}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Captured Leads Table */}
        <div className="bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-navy/10 bg-light/50">
            <h2 className="text-lg font-display font-medium text-navy">Captured Leads</h2>
            <p className="text-xs text-navy/50">Users who provided contact details to the AI</p>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            {leads.length === 0 && !loading ? (
              <div className="p-8 text-center text-navy/50 text-sm">No leads captured yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-navy/5 sticky top-0 backdrop-blur-xl border-b border-navy/10 z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-navy/60 font-bold">User</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-navy/60 font-bold">Requirement</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-navy/60 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5 text-sm">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-navy/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-navy">{lead.name}</div>
                        <div className="text-navy/50 text-xs mt-1">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-navy/70 text-xs max-w-[200px] truncate" title={lead.requirement}>
                        {lead.requirement}
                      </td>
                      <td className="px-6 py-4 text-navy/50 text-xs">
                        {format(new Date(lead.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Conversation Logs */}
        <div className="bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-navy/10 bg-light/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-display font-medium text-navy">Recent Chat Logs</h2>
              <p className="text-xs text-navy/50">Raw interactions with the Concierge AI</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {conversations.length === 0 && !loading ? (
              <div className="text-center text-navy/50 text-sm">No conversations logged yet.</div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id} className="border border-navy/10 rounded-xl p-4 bg-light/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-navy/40 bg-navy/5 px-2 py-1 rounded">
                      Session: {conv.session_id.substring(0, 8)}...
                    </span>
                    <span className="text-[10px] text-navy/40 flex items-center gap-1">
                      <Calendar size={10} />
                      {format(new Date(conv.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-navy/5 shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-navy/40 mb-1">User Said:</p>
                      <p className="text-sm text-navy">{conv.user_message}</p>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-primary/60 mb-1">AI Replied:</p>
                      <p className="text-sm text-navy/80 leading-relaxed line-clamp-3" title={conv.bot_response}>
                        {conv.bot_response}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
