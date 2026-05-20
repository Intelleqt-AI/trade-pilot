import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Briefcase, Calendar, ChevronRight, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addBids, modifyBids, postJobs } from '@/lib/api';
import AddLeadsForm from '@/components/Trade-CRM/AddLeadsForm';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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

const CustomerDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [currentItem, setCurrentItem] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);

const leadsData = []
  // normalize leads for rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads = (leadsData || []) as any[];


  // modify bids mutation
  const modifyBidsMutation = useMutation({
    mutationFn: modifyBids,
    onSuccess: () => {
      // toast.success('Bid a successfully');
    },
    onError: () => {
      toast.error('Failed to modify bid');
    },
  });

  const postMutation = useMutation({
    mutationFn: postJobs,
    onSuccess: () => {
      setCurrentItem(null);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAccept = (lead, bid?: any) => {
    setCurrentItem(lead);
    setCurrentBid(bid);
    modifyBidsMutation.mutate({ id: bid?.id, status: 'approved' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back, {profile?.first_name || 'there'}!</h1>
          <p className="text-muted-foreground">Manage your jobs and find trusted tradespeople for your projects.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            onClick={() => setOpen(true)}
            className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Post a New Job</CardTitle>
              <CardDescription>Tell us what you need and get matched with qualified tradespeople</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full" size="lg">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">View My Jobs</CardTitle>
              <CardDescription>Check the status of your current and past projects</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full" size="lg">
                View Jobs
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-none px-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest job postings and updates</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {/* <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No jobs yet</h3>
              <p className="text-muted-foreground mb-6">Post your first job to get started with finding trusted tradespeople.</p>
              <Button onClick={() => setOpen(true)}>
                Post Your First Job
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </div> */}

            <div className="grid gap-4">
              {leadsData &&
                leadsData.length !== 0 &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                leads.map((lead: any) => {
                  return (
                    <Card key={lead.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <h3 className="text-lg capitalize font-semibold">
                                {lead.service} - {lead.location}
                              </h3>
                              <Badge className={getStatusColor(lead.priority)}>{lead?.priority}</Badge>
                            </div>
                            <p className="text-sm my-2">
                              Original Ask : <span className="text-primary font-semibold">£{lead?.value}</span>
                            </p>

                            {lead?.bids?.length === 0 && <h3 className="text-sm mb-2">No Proposal Yet.</h3>}
                            {lead?.bids &&
                              lead?.bids.length > 0 &&
                              lead?.bids.map((bid, index) => (
                                <div
                                  key={index}
                                  className="border mt-6 p-4 rounded-md mb-2 flex flex-col md:flex-row md:items-center md:justify-between"
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm">
                                      <span className="">
                                        {bid.bidder.first_name} {bid.bidder.last_name}
                                      </span>
                                    </p>
                                    <p className="text-sm">
                                      <span className="">{bid.bidder.email}</span>
                                    </p>
                                    <p className="text-sm capitalize font-semibold">
                                      <span className="font-normal">
                                        From {bid.Available == 'week' && 'this'} {bid.Available}
                                      </span>
                                    </p>
                                    <p className="text-sm">
                                      Proposed Value: <span className="text-primary font-semibold">£{bid.proposedValue}</span>
                                    </p>
                                  </div>
                                  <div className="mt-2 md:mt-0 flex items-center  flex-col">
                                    <h4 className="text-3xl text-primary font-semibold mb-2">£{bid?.proposedValue}</h4>
                                    {lead.isApproved && bid.status === 'approved' && (
                                      <Button
                                        size="sm"
                                        className={`${bid.status === 'approved' ? 'bg-green-500 text-white' : ''}`}
                                        onClick={() => handleAccept(lead, bid)}
                                        disabled={bid.status === 'approved' || bid.status === 'rejected'}
                                      >
                                        {bid.status === 'approved' ? 'Proposal Accepted' : 'Accept Proposal'}
                                      </Button>
                                    )}

                                    {!lead.isApproved && (
                                      <Button
                                        size="sm"
                                        className={`${bid.status === 'approved' ? 'bg-green-500 text-white' : ''}`}
                                        onClick={() => handleAccept(lead, bid)}
                                        disabled={bid.status === 'approved' || bid.status === 'rejected'}
                                      >
                                        {bid.status === 'approved' ? 'Accepted' : 'Accept Proposal'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <AddLeadsForm open={open} setOpen={setOpen} leads={leads as any} />

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
