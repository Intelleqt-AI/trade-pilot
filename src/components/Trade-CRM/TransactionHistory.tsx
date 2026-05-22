import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, History, Clock, CheckCircle2, XCircle, Coins, Trophy, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  package_name: string;
  amount_total: string;
  currency: string;
  credits_added: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  last4: string;
  receipt_url: string;
  created_at: string;
}

interface BidCredit {
  id: string;
  job: string;
  job_title: string;
  job_category: string;
  job_trade: string;
  credits_spent: number;
  amount: string;
  outcome: 'won' | 'lost' | 'pending';
  created_at: string;
}

const outcomeConfig = {
  won: { label: 'Won', className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Trophy },
  lost: { label: 'Lost', className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
};

const TransactionHistory = () => {
  const [tab, setTab] = useState<'purchases' | 'bids'>('purchases');

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transaction-history'],
    queryFn: () => fetchData('/api/v1/payments/history/'),
  });

  const { data: bidCredits, isLoading: bidsLoading } = useQuery<BidCredit[]>({
    queryKey: ['credit-history'],
    queryFn: () => fetchData('/api/v1/tradepilot/jobs/credit-history/').then((res: any) => res?.data ?? res),
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSpent = bidCredits?.reduce((sum, b) => sum + b.credits_spent, 0) ?? 0;
  const won = bidCredits?.filter(b => b.outcome === 'won').length ?? 0;
  const lost = bidCredits?.filter(b => b.outcome === 'lost').length ?? 0;
  const pending = bidCredits?.filter(b => b.outcome === 'pending').length ?? 0;

  return (
    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Credit History</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Track your credit purchases and bid spending.</p>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mt-3">
          <button
            onClick={() => setTab('purchases')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === 'purchases' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Purchases
            </span>
          </button>
          <button
            onClick={() => setTab('bids')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === 'bids' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              Bid Spending
              {(bidCredits?.length ?? 0) > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {bidCredits!.length}
                </span>
              )}
            </span>
          </button>
        </div>
      </CardHeader>

      {tab === 'purchases' && (
        <CardContent className="p-0">
          {txLoading ? (
            <div className="h-[200px] bg-slate-50/50 animate-pulse" />
          ) : !transactions || transactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <CreditCard className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No purchases yet</p>
              <p className="text-xs text-slate-400 mt-1">Credit top-ups will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Date</TableHead>
                    <TableHead className="font-bold text-slate-700">Package</TableHead>
                    <TableHead className="font-bold text-slate-700">Amount</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Payment</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                        {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                        <div className="text-[10px] text-slate-400 font-normal">{format(new Date(tx.created_at), 'HH:mm')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{tx.package_name || `${tx.credits_added} Credits`}</span>
                          <span className="text-xs text-slate-400">{tx.credits_added} credits added</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {tx.currency.toUpperCase()} {parseFloat(tx.amount_total).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        {tx.payment_method ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600 capitalize">
                              {tx.payment_method} •••• {tx.last4}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.receipt_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/5 font-bold"
                            onClick={() => window.open(tx.receipt_url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="opacity-50">
                            <Download className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}

      {tab === 'bids' && (
        <CardContent className="p-0">
          {bidsLoading ? (
            <div className="h-[200px] bg-slate-50/50 animate-pulse" />
          ) : !bidCredits || bidCredits.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Briefcase className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No bids placed yet</p>
              <p className="text-xs text-slate-400 mt-1">Your bid credit usage will appear here.</p>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
                {[
                  { label: 'Total Spent', value: `${totalSpent} credits`, color: 'text-slate-900' },
                  { label: 'Won', value: won, color: 'text-emerald-600' },
                  { label: 'Lost', value: lost, color: 'text-red-500' },
                  { label: 'Pending', value: pending, color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white px-5 py-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Date</TableHead>
                      <TableHead className="font-bold text-slate-700">Job</TableHead>
                      <TableHead className="font-bold text-slate-700">Credits</TableHead>
                      <TableHead className="font-bold text-slate-700">Bid Amount</TableHead>
                      <TableHead className="font-bold text-slate-700">Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bidCredits.map(b => {
                      const cfg = outcomeConfig[b.outcome];
                      const Icon = cfg.icon;
                      return (
                        <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                            {format(new Date(b.created_at), 'MMM dd, yyyy')}
                            <div className="text-[10px] text-slate-400 font-normal">{format(new Date(b.created_at), 'HH:mm')}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 line-clamp-1">{b.job_title || '—'}</span>
                              <span className="text-xs text-slate-400 capitalize">{b.job_category || b.job_trade || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 font-bold text-slate-900">
                              <Coins className="h-3.5 w-3.5 text-amber-500" />
                              {b.credits_spent}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800">
                            £{parseFloat(b.amount).toFixed(0)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${cfg.className} hover:${cfg.className} flex items-center gap-1 w-fit`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default TransactionHistory;
