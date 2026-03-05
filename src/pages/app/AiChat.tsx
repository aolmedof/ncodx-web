import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Send, Plus, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { mockConversations } from '@/lib/mock-data';
import type { ChatConversation, ChatMessage } from '@/types';

const MOCK_RESPONSES = [
  "That's a great question! Based on your context, I'd recommend focusing on a microservices architecture with proper service mesh configuration. This will give you the scalability you need.",
  "From a DevOps perspective, implementing GitOps with Flux or ArgoCD would significantly improve your deployment reliability. Combined with proper observability (Prometheus + Grafana), you'll have full visibility.",
  "For cloud cost optimization, consider Reserved Instances for predictable workloads and Spot Instances for batch jobs. Right-sizing EC2 instances alone can save 20-30% on compute costs.",
  "Security-wise, I'd start with IAM least-privilege policies, enable CloudTrail and GuardDuty, and ensure all S3 buckets have public access blocked by default. These are quick wins with high impact.",
  "The key to a successful AI integration is starting with a well-defined use case and good training data. RAG (Retrieval-Augmented Generation) is particularly powerful for enterprise knowledge bases.",
];

export function AiChat() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(mockConversations[0]?.id || null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isThinking]);

  const handleNewConversation = () => {
    const newConv: ChatConversation = {
      id: `c${Date.now()}`,
      title: 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeId || isThinking) return;
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              title: c.messages.length === 0 ? input.trim().slice(0, 40) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    setInput('');
    setIsThinking(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const aiMsg: ChatMessage = {
      id: `m${Date.now() + 1}`,
      role: 'assistant',
      content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date().toISOString() }
          : c
      )
    );
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Conversations sidebar */}
      <div className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> {t('ai.newChat')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-slate-500 text-xs uppercase tracking-widest px-2 py-1">{t('ai.conversations')}</p>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                activeId === conv.id
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={13} className="flex-shrink-0" />
                <span className="truncate">{conv.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConv.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <Bot size={28} className="text-primary-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">NCODX AI Assistant</h3>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Ask me anything about cloud architecture, DevOps, security, or software development.
                  </p>
                </div>
              )}

              {activeConv.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant' ? 'bg-primary-600' : 'bg-slate-600'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot size={15} className="text-white" />
                    ) : (
                      <User size={15} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Thinking indicator */}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <Bot size={15} className="text-white" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-primary-400" />
                      <span className="text-slate-400 text-sm">{t('ai.thinking')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai.placeholder')}
                  rows={1}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm resize-none max-h-32"
                  style={{ minHeight: '48px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="w-11 h-11 flex items-center justify-center bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl transition-colors flex-shrink-0"
                >
                  <Send size={17} />
                </button>
              </div>
              <p className="text-slate-600 text-xs mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            {t('ai.noConversation')}
          </div>
        )}
      </div>
    </div>
  );
}
