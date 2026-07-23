'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchMyBids, updateTradeJobStatus } from '@/lib/api';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { urgencyBadgeTone, urgencyLabel } from '@/components/trade-pilot/tones';
import { Briefcase, CalendarDays, Clock, Lock, MapPin, Star, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTradeLabel } from '@/lib/jobCategories';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const BidCardContent = ({ bid, isDragging = false }: { bid: any; isDragging?: boolean }) => {
  const isRated = bid.rating !== null && bid.rating !== undefined;
  const isCompleted = bid.job_status === 'completed';
  const locationStr = [bid.job_location, bid.job_postcode].filter(Boolean).join(' · ');

  const dateLine = bid.job_completed_at
    ? {
        label: `Completed ${new Date(bid.job_completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
        cls: 'text-green-600',
      }
    : bid.job_started_at
      ? {
          label: `Started ${new Date(bid.job_started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
          cls: 'text-blue-600',
        }
      : bid.job_todo_at
        ? {
            label: `Booked ${new Date(bid.job_todo_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
            cls: 'text-muted-foreground',
          }
        : null;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card shadow-xs',
        isRated ? 'border-amber-500/30' : isDragging ? 'border-gray-300 shadow-xl' : ''
      )}
    >
      {isRated && (
        <div className="flex items-center gap-1.5 border-b border-amber-500/25 bg-amber-50 px-3 py-1.5">
          <Lock className="h-3 w-3 shrink-0 text-amber-600" />
          <span className="text-[10px] font-semibold text-amber-600">Owner rated · locked</span>
        </div>
      )}

      <div className="space-y-2.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-snug text-foreground">{bid.job_title}</h4>
          {isRated ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              <span className="font-mono text-xs font-semibold tabular-nums">{bid.rating}</span>
            </span>
          ) : (
            bid.job_urgency && (
              <Badge tone={urgencyBadgeTone(bid.job_urgency)} size="sm" className="shrink-0">
                {urgencyLabel(bid.job_urgency)}
              </Badge>
            )
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{getTradeLabel(bid.job_trade)}</span>
          {bid.job_category && (
            <>
              <span className="text-gray-300">·</span>
              <span>{bid.job_category}</span>
            </>
          )}
        </div>

        {locationStr && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {locationStr}
          </span>
        )}

        {isRated && bid.rating_comment && (
          <p className="line-clamp-2 text-xs italic text-muted-foreground">“{bid.rating_comment}”</p>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
          <span className="flex min-w-0 items-center gap-1.5">
            {bid.homeowner ? (
              <>
                <UserAvatar
                  name={`${bid.homeowner.first_name} ${bid.homeowner.last_name}`}
                  size="xs"
                  tone={isCompleted ? 'brand' : 'navy'}
                />
                <span className="truncate text-xs font-medium text-gray-700">
                  {bid.homeowner.first_name} {bid.homeowner.last_name}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Homeowner</span>
            )}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 font-mono text-[13px] font-semibold tabular-nums',
              isCompleted ? 'text-green-600' : 'text-foreground'
            )}
          >
            <Wallet className="h-3 w-3" />£{parseFloat(bid.amount).toFixed(0)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400">
          {dateLine ? (
            <span className={cn('inline-flex items-center gap-1 font-medium', dateLine.cls)}>
              <CalendarDays className="h-3 w-3 shrink-0" />
              {dateLine.label}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {bid.created_at ? timeAgo(bid.created_at) : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

const SortableBidCard = React.memo(({ bid }: { bid: any }) => {
  const isRated = bid.rating !== null && bid.rating !== undefined;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bid.id,
    disabled: isRated,
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
    transition,
    willChange: 'transform',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isRated ? {} : listeners)}
      className={
        isRated
          ? 'cursor-not-allowed'
          : isDragging
            ? 'cursor-grabbing opacity-40'
            : 'cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing'
      }
      title={isRated ? "Owner have already rated this Job — can't move" : undefined}
    >
      <BidCardContent bid={bid} isDragging={isDragging} />
    </div>
  );
});

const COLUMN_DOT: Record<string, string> = {
  todo: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

const DroppableColumn = React.memo(({ column, visibleCount, onLoadMore, children, isDraggingOver }: any) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const isEmpty = !column.items || column.items.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[150px] rounded-xl border border-gray-100 bg-gray-50 p-3 transition-colors',
        isDraggingOver && 'border-dashed border-primary/50 bg-teal-50/40'
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <span className={cn('h-2 w-2 rounded-full', COLUMN_DOT[column.status] ?? 'bg-gray-400')} />
          {column.name}
        </span>
        <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-gray-500 shadow-xs">
          {column.items?.length || 0}
        </span>
      </div>
      <div className="space-y-2.5">
        {children}
        {isEmpty && (
          <div className="select-none rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            Drop jobs here
          </div>
        )}
        {visibleCount < (column.items?.length || 0) && (
          <button
            onClick={() => onLoadMore(column.id)}
            className="flex w-full items-center justify-center py-2 text-xs font-medium text-gray-500 transition-colors hover:text-foreground"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
});

const COLUMNS = [
  { id: 'To Do', name: 'To Do', status: 'todo' },
  { id: 'In Progress', name: 'In Progress', status: 'in_progress' },
  { id: 'Completed', name: 'Completed', status: 'completed' },
];

const EMPTY_BIDS: any[] = [];

export default function TradeJobs() {
  const queryClient = useQueryClient();

  const { data: bidsData = EMPTY_BIDS, isLoading } = useQuery({
    queryKey: ['myBids'],
    queryFn: fetchMyBids,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateTradeJobStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myBids'] }),
    onError: () => toast.error('Failed to update job status'),
  });

  const [tasks, setTasks] = useState<any[]>([]);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [activeID, setActiveID] = useState<string | null>(null);
  const [overID, setOverID] = useState<string | null>(null);

  useEffect(() => {
    const acceptedBids = (bidsData as any[]).filter(b => b.status === 'accepted');
    const colData = COLUMNS.map(col => ({
      ...col,
      items: acceptedBids.filter(b => b.job_status === col.status),
    }));
    setTasks(colData);
    const counts: Record<string, number> = {};
    colData.forEach(col => (counts[col.id] = 10));
    setVisibleCounts(counts);
  }, [bidsData]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleLoadMore = (colId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [colId]: Math.min((prev[colId] || 10) + 10, tasks.find(t => t.id === colId)?.items.length || 0),
    }));
  };

  const handleDragStart = (event: DragStartEvent) => setActiveID(event.active.id as string);
  const handleDragOver = (event: DragOverEvent) => setOverID((event.over?.id as string) || null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveID(null);
    setOverID(null);
    if (!over) return;

    const sourceCol = tasks.find(col => col.items.some((item: any) => item.id === active.id));
    const destCol = tasks.find(col => col.id === over.id || col.items.some((item: any) => item.id === over.id));
    if (!sourceCol || !destCol || sourceCol.id === destCol.id) return;

    const activeIndex = sourceCol.items.findIndex((item: any) => item.id === active.id);
    const movedBid = sourceCol.items[activeIndex];

    // Block: homeowner has already rated this job
    const isRated = movedBid.rating !== null && movedBid.rating !== undefined;
    if (isRated) {
      toast.error("Owner have already rated this Job — can't move", {
        description: 'Rated jobs are locked to their completed state.',
        duration: 4000,
      });
      return;
    }

    // Warn: moving back from completed
    const movingFromCompleted = sourceCol.status === 'completed' && destCol.status !== 'completed';

    sourceCol.items.splice(activeIndex, 1);
    destCol.items.push({ ...movedBid, job_status: destCol.status });
    setTasks([...tasks]);

    updateStatusMutation.mutate({ jobId: movedBid.job, status: destCol.status });

    if (movingFromCompleted) {
      toast.warning(`Moved back to ${destCol.name}`, {
        description: 'This job was marked as completed — make sure this is intentional.',
        duration: 5000,
      });
    } else {
      toast.success(`Moved to ${destCol.name}`);
    }
  };

  const activeItem = activeID ? tasks.flatMap(col => col.items).find((item: any) => item.id === activeID) : null;
  const hasJobs = tasks.some(col => col.items.length > 0);

  const pipelineValue = tasks
    .flatMap(col => col.items)
    .reduce((sum: number, bid: any) => sum + (parseFloat(bid.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <PageTitle
        title="My Jobs"
        subtitle="Drag jobs between stages to keep your pipeline up to date."
      >
        <span className="inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-[13px] font-semibold text-foreground shadow-xs">
          Pipeline value{' '}
          <span className="font-mono tabular-nums text-teal-600">
            £{pipelineValue.toLocaleString('en-GB')}
          </span>
        </span>
        {isLoading && <span className="text-sm text-muted-foreground">Loading…</span>}
      </PageTitle>

      {!isLoading && !hasJobs && (
        <div className="rounded-xl border border-dashed bg-card">
          <EmptyState
            icon={Briefcase}
            title="No accepted jobs yet"
            description="Accept bids from the Job Market to see jobs here."
          />
        </div>
      )}

      {hasJobs && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tasks.map(col => (
              <DroppableColumn
                key={col.id}
                column={col}
                visibleCount={visibleCounts[col.id] || 10}
                onLoadMore={handleLoadMore}
                isDraggingOver={overID === col.id}
              >
                <SortableContext items={col.items.map((item: any) => item.id)} strategy={verticalListSortingStrategy}>
                  {col.items.slice(0, visibleCounts[col.id] || 10).map((bid: any) => (
                    <SortableBidCard key={bid.id} bid={bid} />
                  ))}
                </SortableContext>
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem && (
              <div className="rotate-1 scale-105 cursor-grabbing shadow-2xl">
                <BidCardContent bid={activeItem} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
