import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Map, MapPin, Phone, Coins } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addBids, addPurchase, fetchLeads } from '@/lib/api';
import AddLeadsForm from './AddLeadsForm';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CREDIT_COST = 30;

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

const LeadPurchase = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
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

  const mutation = useMutation({
    mutationFn: addPurchase,
    onSuccess: () => {
      toast.success('Lead accepted successfully! 30 credits deducted.');
      refetch();
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error! Try again');
    },
  });

  useEffect(() => {
    if (leadsLoading) return;
    setFilteredLeads(leadsData.filter(item => item.location == profile?.postcode));
  }, [leadsLoading, leadsData, profile]);

  const handlePurchase = id => {
    mutation.mutate({ lead: id, userID: profile?.id });
  };

  const hasInsufficientCredit = (profile?.credit || 0) < CREDIT_COST;
  const hasAlreadyAccepted = (leadId: number) => profile?.leads?.includes(leadId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold">Leads to purchase</h2>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {CREDIT_COST} per lead
          </Badge>
          <Badge
            variant={hasInsufficientCredit ? "destructive" : "secondary"}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1"
          >
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Credit: {profile?.credit || 0}
          </Badge>
        </div>
      </div>

      {hasInsufficientCredit && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Insufficient credits! You need at least {CREDIT_COST} credits to accept a lead. Please top up your account.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {!leadsLoading &&
          filteredLeads.length !== 0 &&
          filteredLeads.map(lead => {
            const userBid = lead.bids?.find((bid: any) => bid.bid_by === profile?.id);
            const alreadyAccepted = hasAlreadyAccepted(lead.id);
            const cannotAccept = hasInsufficientCredit || alreadyAccepted;

            return (
              <Card key={lead.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg capitalize font-semibold">{lead.service}</h3>
                        <Badge className={getStatusColor(lead.priority)}>{lead?.priority}</Badge>
                      </div>
                      <p className="flex text-sm items-center gap-2 text-muted-foreground">
                        <MapPin size={16} className="shrink-0" /> {lead?.location}
                      </p>
                    </div>
                    <div className="flex items-center sm:flex-col gap-2 sm:items-end sm:shrink-0">
                      <Badge variant="outline" className="text-xs">
                        <Coins className="h-3 w-3 mr-1" />
                        {CREDIT_COST} credits
                      </Badge>
                      <Button
                        disabled={cannotAccept || mutation.isPending}
                        size="sm"
                        onClick={() => handlePurchase(lead.id)}
                        className="whitespace-nowrap"
                      >
                        { alreadyAccepted ? 'Purchased' : hasInsufficientCredit ? 'No Credits' : 'Purchase'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default LeadPurchase;
