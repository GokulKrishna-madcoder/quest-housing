import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Loader2, MapPin, ChevronRight, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ResponsiveImage from '../ResponsiveImage';
import OwnerFunnelLayout from '../owner-funnel/OwnerFunnelLayout';
import FunnelLayout from '../lead-funnel/FunnelLayout';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommended_properties?: any[];
}

export function TenantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am the Quest Housing AI Concierge. How can I help you find your next home in Bangalore?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-tenant', {
        body: { messages: newMessages, sessionId }
      });

      if (error) throw error;

      let responseText = data.content || '';
      let shouldOpenOwnerForm = false;
      let shouldOpenTenantForm = false;

      if (responseText.includes('[ACTION: OPEN_OWNER_FORM]')) {
        shouldOpenOwnerForm = true;
        responseText = responseText.replace(/\[ACTION:\s*OPEN_OWNER_FORM\]/g, '').trim();
      }

      if (responseText.includes('[ACTION: OPEN_TENANT_FORM]')) {
        shouldOpenTenantForm = true;
        responseText = responseText.replace(/\[ACTION:\s*OPEN_TENANT_FORM\]/g, '').trim();
      }

      setMessages([...newMessages, { role: 'assistant', content: responseText, recommended_properties: data.recommended_properties }]);

      if (shouldOpenOwnerForm) {
        setTimeout(() => {
          setIsOpen(false);
          setShowOwnerForm(true);
        }, 1500);
      } else if (shouldOpenTenantForm) {
        setTimeout(() => {
          setIsOpen(false);
          setShowTenantForm(true);
        }, 1500);
      }

    } catch (err: any) {
      console.error('Chat error:', err);
      let errorMsg = err.message || 'Unknown error';
      try {
        if (err.context && typeof err.context.text === 'function') {
           const text = await err.context.text();
           if (text) errorMsg = text;
        }
      } catch (e) {
        // Body might be already read, fallback to err.message
      }
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${errorMsg}. Please check your Edge Function logs.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-navy text-white rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-navy shadow-[0_0_15px_rgba(247,209,18,0.5)]">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-display font-medium text-lg leading-none text-white">Quest AI</h3>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Concierge</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 stitch-grid-dark scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col gap-2`}>
                  <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-primary text-navy'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-white/10 border border-white/10 rounded-tr-sm' : 'bg-navy-dark border border-primary/20 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                  
                  {msg.recommended_properties && msg.recommended_properties.length > 0 && (
                    <div className={`flex overflow-x-auto gap-3 pb-2 pt-1 scrollbar-hide ${msg.role === 'user' ? 'justify-end pr-11' : 'pl-11'}`}>
                      {msg.recommended_properties.map((prop, pIdx) => (
                        <Link 
                          key={pIdx}
                          to={`/properties/${prop.id}`}
                          className="flex-shrink-0 w-64 bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl overflow-hidden group transition-all"
                        >
                          <div className="h-24 w-full bg-navy overflow-hidden relative">
                            {prop.images && prop.images[0] ? (
                              <ResponsiveImage src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-navy-dark text-white/20"><Bot size={24} /></div>
                            )}
                            <div className="absolute top-2 left-2 bg-navy/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] uppercase tracking-widest text-primary font-bold">
                              {prop.type}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-display font-medium text-sm truncate mb-1 text-primary">{prop.title}</h4>
                            <div className="flex items-center text-[10px] text-white/50 mb-2">
                              <MapPin size={10} className="mr-1 shrink-0" />
                              <span className="truncate">{prop.locality}</span>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                              <div className="flex items-center text-primary font-bold text-sm">
                                <IndianRupee size={12} />
                                {prop.price ? prop.price.toLocaleString() : 'Price on request'}
                              </div>
                              <div className="flex items-center text-[10px] uppercase tracking-wider text-white/70 group-hover:text-primary transition-colors">
                                View <ChevronRight size={12} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-primary text-navy flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="p-4 rounded-2xl bg-navy-dark border border-primary/20 rounded-tl-sm">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-white/10 border border-white/20 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-navy disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <Send size={14} className="ml-1" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-navy shadow-[0_0_20px_rgba(247,209,18,0.4)] border-2 border-navy hover:bg-white transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      <AnimatePresence>
        {showOwnerForm && (
          <OwnerFunnelLayout onClose={() => setShowOwnerForm(false)} />
        )}
        {showTenantForm && (
          <div className="fixed inset-0 z-50 bg-navy overflow-y-auto">
            <div className="flex items-center justify-end p-6 absolute top-0 right-0 z-[60]">
              <button 
                onClick={() => setShowTenantForm(false)}
                className="p-2 text-white/50 hover:text-white transition-colors bg-navy/50 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <FunnelLayout />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
