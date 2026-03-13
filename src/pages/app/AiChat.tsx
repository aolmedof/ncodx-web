import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Plus, Bot, User, MessageSquare, Trash2, X } from 'lucide-react';
import { mockConversations, mockProjects } from '@/lib/mock-data';
import type { ChatConversation, ChatMessage } from '@/types';

const MOCK_RESPONSES = [
  "Based on your project context, I'd recommend focusing on a microservices architecture with proper service mesh configuration. This will give you the scalability you need.",
  "From a DevOps perspective, implementing GitOps with Flux or ArgoCD would significantly improve your deployment reliability. Combined with Prometheus + Grafana for observability.",
  "For cloud cost optimization, consider Reserved Instances for predictable workloads and Spot Instances for batch jobs. Right-sizing EC2 instances alone can save 20-30% on compute costs.",
  "Security-wise: IAM least-privilege policies, enable CloudTrail and GuardDuty, and ensure all S3 buckets have public access blocked. These are quick wins with high impact.",
  "The key to a successful migration is starting small — pick the least-critical service first, validate the pipeline, then gradually migrate the rest using the Strangler Fig pattern.",
];

export function AiChat() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId?: string }>();
  const project = mockProjects.find((p) => p.id === projectId);
  const filtered = mockConversations.filter((c) => !projectId || c.projectId === projectId || !c.projectId);
  const [conversations, setConversations] = useState<ChatConversation[]>(
    filtered.length ? filtered : mockConversations.slice(0, 1)
  );
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id || null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isThinking]);

  const handleNewConversation = () => {
    const conv: ChatConversation = {
      id: `conv-${Date.now()}`,
      title: t('ai.newConversation', 'Nueva conversación'),
      projectId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const userInput = input.trim();
    setInput('');
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length === 0 ? userInput.slice(0, 40) : c.title, updatedAt: new Date().toISOString() }
          : c
      )
    );
    setIsThinking(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: project
        ? `[${project.name}] ${MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]}`
        : MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
      timestamp: new Date().toISOString(),
    };
    setIsThinking(false);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const handleDeleteConv = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(conversations.find((c) => c.id !== id)?.id || null);
  };

  return (
    <div className="flex h-full bg-signal-bg font-mono">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 bg-signal-surface border-r border-signal-border flex flex-col">
        <div className="p-3 border-b border-signal-border">
          <div className="text-xs text-signal-text-muted tracking-widest mb-2">// AI CHAT</div>
          {project && (
            <div className="text-xs text-signal-text-dim mb-2 truncate">@ {project.name}</div>
          )}
          <button onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 bg-signal-card hover:bg-signal-green/10 border border-signal-border hover:border-signal-green text-signal-text-dim hover:text-signal-green text-xs rounded transition-colors">
            <Plus size={13} />
            {t('ai.newChat', 'Nueva conversación')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {conversations.map((conv) => (
            <div key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                activeId === conv.id ? 'bg-signal-card text-signal-text border-r-2 border-signal-green' : 'text-signal-text-dim hover:bg-signal-card hover:text-signal-text'
              }`}
              onClick={() => setActiveId(conv.id)}>
              <MessageSquare size={12} className="flex-shrink-0" />
              <span className="flex-1 text-xs truncate">{conv.title}</span>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-signal-text-muted hover:text-red-400 transition-all flex-shrink-0">
                <X size={11} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="px-3 py-4 text-xs text-signal-text-muted text-center">{t('ai.noConversations', 'Sin conversaciones')}</div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-signal-border px-6 flex items-center gap-2 flex-shrink-0">
          <Bot size={16} className="text-signal-green" />
          <span className="text-sm font-semibold text-signal-text">
            {activeConv?.title || t('ai.selectConversation', 'Selecciona una conversación')}
          </span>
          {project && (
            <span className="ml-2 text-xs text-signal-text-muted bg-signal-card border border-signal-border px-2 py-0.5 rounded">
              @ {project.name}
            </span>
          )}
          {activeConv && (
            <button onClick={() => handleDeleteConv(activeConv.id)}
              className="ml-auto text-signal-text-muted hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!activeConv ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-signal-text-muted">
              <Bot size={40} className="text-signal-text-muted/30" />
              <div className="text-sm">{t('ai.selectOrNew', 'Selecciona o crea una conversación')}</div>
            </div>
          ) : activeConv.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-signal-text-muted">
              <Bot size={40} className="text-signal-green/30" />
              <div className="text-sm">{t('ai.startChatHint', '¿En qué puedo ayudarte?')}</div>
              {project && (
                <div className="text-xs text-signal-text-muted bg-signal-card border border-signal-border px-3 py-1.5 rounded">
                  Contexto: {project.name} — {project.description}
                </div>
              )}
            </div>
          ) : (
            activeConv.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded bg-signal-green/20 border border-signal-green/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} className="text-signal-green" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded text-sm ${
                  msg.role === 'user'
                    ? 'bg-signal-green/15 border border-signal-green/30 text-signal-text'
                    : 'bg-signal-card border border-signal-border text-signal-text'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <div className="text-xs text-signal-text-muted mt-1.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded bg-signal-card border border-signal-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={13} className="text-signal-text-dim" />
                  </div>
                )}
              </div>
            ))
          )}
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded bg-signal-green/20 border border-signal-green/30 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-signal-green" />
              </div>
              <div className="bg-signal-card border border-signal-border px-4 py-3 rounded flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-signal-green animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-xs text-signal-text-muted">{t('ai.thinking', 'Pensando...')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-signal-border p-4">
          <div className="flex gap-2 bg-signal-card border border-signal-border rounded focus-within:border-signal-green transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={project ? `${t('ai.askAbout', 'Pregunta sobre')} ${project.name}...` : t('ai.typeMessage', 'Escribe un mensaje...')}
              disabled={!activeId || isThinking}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none disabled:opacity-50"
            />
            <button onClick={handleSend} disabled={!input.trim() || !activeId || isThinking}
              className="px-4 text-signal-green hover:text-signal-text disabled:opacity-30 transition-colors flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
          <div className="mt-1.5 text-xs text-signal-text-muted text-center">
            {t('ai.disclaimer', 'AI responses are simulated. Connect Claude API for real responses.')}
          </div>
        </div>
      </div>
    </div>
  );
}
