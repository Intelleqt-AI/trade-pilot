import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, ExternalLink, History, Clock, CheckCircle2, XCircle } from 'lucide-react';
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

const TransactionHistory = () => {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transaction-history'],
    queryFn: () => fetchData('/api/v1/payments/history/'),
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

  if (isLoading) {
    return (
      <Card className="border-slate-100 shadow-sm animate-pulse">
        <div className="h-[300px] bg-slate-50/50 rounded-xl" />
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="border-slate-100 shadow-sm bg-white/50 border-dashed">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No transaction history</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">
            Your credit purchases will appear here once you complete a transaction.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Purchase History</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Manage your previous credit top-ups and receipts.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
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
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                    {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {format(new Date(tx.created_at), 'HH:mm')}
                    </div>
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
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
