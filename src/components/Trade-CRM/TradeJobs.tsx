'use client';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Briefcase, Coins, Clock, Lock, MapPin, Star, User, CalendarDays, AlertTriangle } from 'lucide-react';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const URGENCY_COLOR: Record<string, string> = {
  emergency: 'bg-red-50 text-red-700',
  urgent: 'bg-orange-50 text-orange-700',
  normal: 'bg-blue-50 text-blue-700',
  flexible: 'bg-gray-100 text-gray-600',
};

const BidCardContent = ({ bid, isDragging = false }: { bid: any; isDragging?: boolean }) => {
  const isRated = bid.rating !== null && bid.rating !== undefined;
  const locationStr = [bid.job_location, bid.job_postcode].filter(Boolean).join(' · ');
  return (
    <div
      className={`rounded-xl border bg-white overflow-hidden ${
        isRated
          ? 'border-amber-200'
          : isDragging
            ? 'shadow-xl border-gray-300'
            : 'border-gray-200'
      }`}
    >
      {isRated && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-amber-600 shrink-0" />
          <span className="text-[10px] font-semibold text-amber-700">Owner rated · locked</span>
        </div>
      )}

      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-snug text-gray-900">{bid.job_title}</h4>
          <span className="shrink-0 text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            HomePlus
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs capitalize text-muted-foreground font-medium">{bid.job_trade}</span>
          {bid.job_category && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-muted-foreground">{bid.job_category}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {locationStr && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {locationStr}
            </span>
          )}
          {bid.job_urgency && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${URGENCY_COLOR[bid.job_urgency] ?? 'bg-gray-100 text-gray-600'}`}>
              {bid.job_urgency}
            </span>
          )}
        </div>

        {bid.job_completed_at && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg px-2 py-1">
            <CalendarDays className="h-3 w-3 shrink-0" />
            Completed {new Date(bid.job_completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            <span className="text-green-500 font-normal ml-0.5">
              {new Date(bid.job_completed_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        {!bid.job_completed_at && bid.job_started_at && (
          <div className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg px-2 py-1">
            <CalendarDays className="h-3 w-3 shrink-0" />
            Started {new Date(bid.job_started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
        {!bid.job_completed_at && !bid.job_started_at && bid.job_todo_at && (
          <div className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg px-2 py-1">
            <CalendarDays className="h-3 w-3 shrink-0" />
            Booked {new Date(bid.job_todo_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}

        {bid.homeowner && (
          <div className="flex items-center gap-1.5 text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
            <User className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="font-medium text-gray-700">
              {bid.homeowner.first_name} {bid.homeowner.last_name}
            </span>
            {bid.homeowner.phone && (
              <span className="text-gray-400 ml-auto">{bid.homeowner.phone}</span>
            )}
          </div>
        )}

        {isRated && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} className={`h-3.5 w-3.5 ${n <= bid.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
            ))}
            {bid.rating_comment && (
              <span className="text-[10px] text-muted-foreground ml-1 truncate max-w-[100px]">{bid.rating_comment}</span>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Coins className="h-3 w-3" />
            £{parseFloat(bid.amount).toFixed(0)}
          </span>
          <span className="flex items-center gap-1">
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
      className={isRated ? 'cursor-not-allowed' : isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab hover:shadow-md transition-shadow'}
      title={isRated ? "Owner have already rated this Job — can't move" : undefined}
    >
      <BidCardContent bid={bid} isDragging={isDragging} />
    </div>
  );
});

const DroppableColumn = React.memo(({ column, visibleCount, onLoadMore, children, isDraggingOver }: any) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const isEmpty = !column.items || column.items.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border rounded-xl p-4 shadow-sm ${isDraggingOver ? '!border-gray-500 border-dashed !bg-[#f9f8f6]' : ''}`}
      style={{ minHeight: '150px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-gray-900">{column.name}</span>
        <Badge className="bg-black">{column.items?.length || 0}</Badge>
      </div>
      <div className="space-y-3">
        {children}
        {isEmpty && <div className="py-10 text-center text-gray-400 text-sm select-none">Drop jobs here</div>}
        {visibleCount < (column.items?.length || 0) && (
          <button
            onClick={() => onLoadMore(column.id)}
            className="w-full text-xs text-gray-500 hover:text-black py-2 flex justify-center items-center"
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

export default function TradeJobs() {
  const queryClient = useQueryClient();

  const { data: bidsData = [], isLoading } = useQuery({
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

  const activeItem = activeID
    ? tasks.flatMap(col => col.items).find((item: any) => item.id === activeID)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Job Management</h2>
        {isLoading && <span className="text-sm text-muted-foreground">Loading…</span>}
      </div>

      {!isLoading && tasks.every(col => col.items.length === 0) && (
        <div className="py-16 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No accepted jobs yet</p>
          <p className="text-sm mt-1">Accept bids from the Job Market to see jobs here</p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="rotate-1 scale-105 shadow-2xl cursor-grabbing">
              <BidCardContent bid={activeItem} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
