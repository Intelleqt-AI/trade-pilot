import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { toneChip } from '@/components/trade-pilot/tones';
import { MOCK_TICKETS, SUPPORT_CHANNELS, SUPPORT_FAQS } from '@/lib/designMockData';
import {
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Ticket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHANNEL_ICONS = { chat: MessageCircle, phone: Phone, email: Mail } as const;

const TICKET_STATUS: Record<string, { label: string; tone: 'warning' | 'success' }> = {
  in_progress: { label: 'In progress', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
};

const TOPICS = ['Getting started', 'Credits', 'Bidding', 'Payouts', 'Verification'];

const TradeSupport = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUPPORT_FAQS.filter(f => {
      if (topic && f.topic !== topic) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [query, topic]);

  return (
    <div className="space-y-4">
      <PageTitle title="Help Centre" subtitle="Guides, answers and ways to reach the team.">
        <Button onClick={() => toast('Support tickets are coming soon')}>
          <Plus className="h-4 w-4" />
          New ticket
        </Button>
      </PageTitle>

      {/* Search hero */}
      <SectionCard bodyClassName="px-6 py-10">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <h2 className="mb-4 text-display font-semibold text-foreground">
            How can we help{user?.first_name ? `, ${user.first_name}` : ''}?
          </h2>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-[46px] pl-10 text-base"
              placeholder="Search help articles…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {TOPICS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(topic === t ? null : t)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
                  topic === t
                    ? 'border-primary bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Contact channels */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUPPORT_CHANNELS.map(channel => {
          const Icon = CHANNEL_ICONS[channel.key as keyof typeof CHANNEL_ICONS] ?? LifeBuoy;
          return (
            <div
              key={channel.key}
              className="flex flex-col rounded-xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={cn(
                  'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg',
                  toneChip[channel.tone]
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="text-sm font-semibold text-foreground">{channel.title}</div>
              <p className="mt-1 flex-1 text-[13px] text-muted-foreground">{channel.description}</p>
              <div className="mt-2 text-xs font-medium text-muted-foreground">{channel.meta}</div>
              {channel.href ? (
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <a href={channel.href}>{channel.cta}</a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => toast('Live chat is coming soon')}
                >
                  {channel.cta}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tickets + FAQs */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <SectionCard
          title="Your tickets"
          subtitle="Recent support requests"
          icon={Ticket}
          bodyClassName="p-0"
        >
          {/* TODO(backend): wire to a real ticket system */}
          {MOCK_TICKETS.length === 0 ? (
            <EmptyState icon={Ticket} title="No tickets yet" description="Open a ticket and it will appear here." />
          ) : (
            <div className="divide-y divide-border">
              {MOCK_TICKETS.map(ticket => {
                const status = TICKET_STATUS[ticket.status];
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => toast('Support tickets are coming soon')}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-foreground">
                        {ticket.subject}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">{ticket.id}</span> · updated {ticket.updated}
                      </div>
                    </div>
                    <Badge tone={status.tone} size="sm" dot>
                      {status.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Popular questions"
          subtitle={topic ? `Filtered by ${topic}` : 'Answers to common questions'}
          icon={HelpCircle}
          bodyClassName="px-5 py-1"
        >
          {filteredFaqs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching articles"
              description="Try a different search term or topic."
            />
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="py-3.5 text-left text-[13px] font-semibold hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default TradeSupport;
