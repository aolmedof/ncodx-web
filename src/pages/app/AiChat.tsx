import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Plus, Send, User as UserIcon } from 'lucide-react';
import {
  Button, Card, EmptyState, ErrorState, PageHeader, PageShell, Skeleton, cn,
} from '@/components/ui';
import { useConversations, useCreateConversation, useSendMessage } from '@/hooks/queries';
import { formatRelative } from '@/lib/format';

export function AiChat() {
  const { data, isPending, isError, error, refetch } = useConversations();
  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [data],
  );
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !active) return;
    setDraft('');
    await sendMessage.mutateAsync({ id: active.id, content });
  }

  async function handleNew() {
    const created = await createConversation.mutateAsync('New conversation');
    if (created?.id) setActiveId(created.id);
  }

  return (
    <PageShell className="h-full">
      <PageHeader
        title="Assistant"
        description="Ask about your projects, rates and delivery plans."
        actions={
          <Button variant="primary" onClick={handleNew} loading={createConversation.isPending}>
            <Plus size={15} />New chat
          </Button>
        }
      />

      {isPending ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-[260px_1fr]">
          <Skeleton className="h-96" /><Skeleton className="h-96" />
        </div>
      ) : isError ? (
        <Card className="mt-5">
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        </Card>
      ) : conversations.length === 0 ? (
        <Card className="mt-5">
          <EmptyState
            icon={Bot}
            title="No conversations"
            description="Start a chat to get help planning work or pricing an engagement."
            action={<Button size="sm" variant="primary" onClick={handleNew}><Plus size={14} />New chat</Button>}
          />
        </Card>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit overflow-hidden">
            <ul className="divide-y divide-line">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    onClick={() => setActiveId(conversation.id)}
                    className={cn(
                      'w-full px-3 py-2.5 text-left transition-colors',
                      conversation.id === active?.id ? 'bg-brand-soft' : 'hover:bg-raised',
                    )}
                  >
                    <p className={cn(
                      'truncate text-[13px]',
                      conversation.id === active?.id ? 'font-medium text-brand' : 'text-ink',
                    )}>
                      {conversation.title}
                    </p>
                    <p className="text-[12px] text-ink-faint">{formatRelative(conversation.updatedAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex min-h-[28rem] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {(active?.messages ?? []).length === 0 ? (
                <EmptyState icon={Bot} title="No messages yet" description="Send the first message below." />
              ) : (
                (active?.messages ?? []).map((message) => {
                  const isUser = message.role === 'user';
                  return (
                    <div key={message.id} className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}>
                      <span className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        isUser ? 'bg-raised text-ink-dim' : 'bg-brand-soft text-brand',
                      )}>
                        {isUser ? <UserIcon size={13} /> : <Bot size={13} />}
                      </span>
                      <div className={cn(
                        'max-w-[75%] rounded-lg px-3 py-2 text-[13px] leading-relaxed',
                        isUser ? 'bg-raised text-ink' : 'border border-line bg-canvas text-ink-dim',
                      )}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask something…"
                className={
                  'h-9 flex-1 rounded-md border border-line bg-canvas px-3 text-sm text-ink ' +
                  'placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25'
                }
              />
              <Button variant="primary" type="submit" iconOnly loading={sendMessage.isPending}
                disabled={!draft.trim()} aria-label="Send message">
                {!sendMessage.isPending && <Send size={15} />}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
