import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addBids, fetchLeads } from '@/lib/api';
import AddLeadsForm from './AddLeadsForm';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'high':
      return 'bg-red-100 capitalize text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'medium':
      return 'bg-orange-100 capitalize text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'low':
      return 'bg-blue-100 capitalize text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 capitalize text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const TradeLeads = () => {
  const [open, setOpen] = useState(false);
  const [openQuote, setOpenQuote] = useState(false);
  const [openViewLead, setOpenViewLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [viewedLead, setViewedLead] = useState<any>(null);
  const [proposedValue, setProposedValue] = useState('');
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState('today');
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);

  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsErros,
    refetch,
  } = useQuery({
    queryKey: ['fetchLeads'],
    queryFn: fetchLeads,
  });
  
  console.log(leadsData);

  useEffect(() => {
    if (leadsLoading) return;
    const userLeads = profile?.leads || [];
    const filterByLocation = leadsData.filter(item => item.location == profile?.postcode);
    setFilteredLeads(filterByLocation.filter(lead => userLeads.includes(lead.id)));
  }, [leadsLoading, leadsData, profile]);

  const quoteMutation = useMutation({
    mutationFn: addBids,
    onSuccess: () => {
      refetch();
      toast.success('Quote submitted successfully');
      setOpenQuote(false);
      setProposedValue('');
      setSchedule('today');
    },
    onError: () => {
      toast.error('Failed to submit quote');
    },
  });

  const handleQuoteOpen = (lead: any) => {
    setSelectedLead(lead);
    setOpenQuote(true);
  };

  const handleViewLead = (lead: any) => {
    setViewedLead(lead);
    setOpenViewLead(true);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedValue || isNaN(Number(proposedValue))) {
      toast.error('Please enter a valid number');
      return;
    }
    quoteMutation.mutate({
      updates: { leads_id: selectedLead.id, proposedValue: Number(proposedValue), bid_by: profile?.id, Available: schedule },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold">Lead Management</h2>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">Add New Lead</Button>
        <AddLeadsForm open={open} setOpen={setOpen} />
      </div>

      <div className="grid gap-4">
        {!leadsLoading &&
          filteredLeads.length !== 0 &&
          filteredLeads.map(lead => {
            const userBid = lead.bids?.find((bid: any) => bid.bid_by === profile?.id);
            return (
              <Card key={lead.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg capitalize font-semibold">{lead.name}</h3>
                        <Badge className={getStatusColor(lead.priority)}>{lead?.priority}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-2 text-sm sm:text-base">
                        {lead.service} - {lead.location}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                        <span className="hidden sm:inline">Last contact: 2 hours ago</span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-primary">£{lead?.value ? lead?.value : '0'}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewLead(lead)}>
                          View Lead
                        </Button>
                        <Button disabled={userBid} size="sm" onClick={() => handleQuoteOpen(lead)}>
                          {userBid ? 'Quoted' : 'Quote'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center gap-2">
                    {userBid && (
                      <span className="flex items-center gap-2">
                        {userBid.status === 'approved' && (
                          <span title="Approved" className="text-green-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 inline"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        {userBid.status === 'rejected' && (
                          <span title="Rejected" className="text-red-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 inline"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        )}
                        {userBid.status === 'pending' && (
                          <span title="Pending" className="text-yellow-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 inline"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                              />
                            </svg>
                          </span>
                        )}
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                          {userBid.status === 'pending' && 'Pending'}
                          {userBid.status === 'approved' && 'Approved'}
                          {userBid.status === 'rejected' && 'Rejected'}
                        </Badge>
                      </span>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center gap-4 sm:gap-6">
                    <h4 className="text-sm sm:text-md font-semibold">Proposed Quote</h4>
                    <p className="text-muted-foreground">£{userBid?.proposedValue ? userBid?.proposedValue : '0'}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Quote Dialog */}
      <Dialog open={openQuote} onOpenChange={setOpenQuote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Quote</DialogTitle>
            <DialogDescription>
              Propose your bid for <strong>{selectedLead?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuoteSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Propose Value (£)</label>
              <Input type="number" value={proposedValue} onChange={e => setProposedValue(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Availablity</label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenQuote(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={quoteMutation.isLoading}>
                {quoteMutation.isLoading ? 'Submitting...' : 'Submit Quote'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Lead Dialog */}
      <Dialog open={openViewLead} onOpenChange={setOpenViewLead}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Complete information about this lead
            </DialogDescription>
          </DialogHeader>
          
          {viewedLead && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                    <p className="text-base capitalize">{viewedLead.service || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-base capitalize">{viewedLead.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <Badge className={getStatusColor(viewedLead.priority)}>{viewedLead.priority || 'N/A'}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-base">{viewedLead.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
                    <p className="text-base font-semibold text-primary">£{viewedLead.value || '0'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="text-base">{viewedLead.duration || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base">{viewedLead.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-base">{viewedLead.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-base">{viewedLead.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Answers */}
              {viewedLead.answers && Object.keys(viewedLead.answers).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Additional Details</h3>
                  <div className="space-y-3">
                    {Object.entries(viewedLead.answers).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <p className="text-base bg-muted/30 px-3 py-2 rounded-md">
                          {typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Timeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="text-base">{viewedLead.created_at ? new Date(viewedLead.created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-base">{viewedLead.updated_at ? new Date(viewedLead.updated_at).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenViewLead(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradeLeads;
