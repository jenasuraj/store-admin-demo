// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useNavigate } from 'react-router-dom';

// export default function LedgerDashboard() {
//   const navigate = useNavigate();

//   return (
//     <main className="min-h-screen bg-background p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="mb-12">
//           <h1 className="text-4xl font-bold text-foreground mb-2">Ledger Management System</h1>
//           <p className="text-muted-foreground">Manage price lists, customers, and financial entries with ease</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <CardTitle>Price Lists & Customers</CardTitle>
//               <CardDescription>Create and manage your price lists and customer data</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 onClick={() => navigate('/manage')}
//                 className="w-full"
//               >
//                 Go to Management
//               </Button>
//             </CardContent>
//           </Card>

//           <Card className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <CardTitle>Create Entry</CardTitle>
//               <CardDescription>Create new ledger entries for customers</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 onClick={() => navigate('/entries')}
//                 className="w-full"
//               >
//                 Go to Entries
//               </Button>
//             </CardContent>
//           </Card>

//           <Card className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <CardTitle>View Ledger</CardTitle>
//               <CardDescription>View all your ledger entries and transactions</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 onClick={() => navigate('/ledger')}
//                 className="w-full"
//               >
//                 View Ledger
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </main>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLedgerEntries, getCustomers, initializeDemoData } from '@/lib/storage';
import type { LedgerEntry, Customer } from '@/lib/storage';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDemoData();
    setEntries(getLedgerEntries());
    setCustomers(getCustomers());
    setIsLoading(false);
  }, []);

  // Calculate statistics
  const totalEntries = entries.length;
  const totalAmount = entries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  
  // Assuming payment status - we can add this to the LedgerEntry type later
  // For now, treating all as pending
  const pendingAmount = totalAmount;
  const paidAmount = 0;

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-neutral-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Ledger Dashboard</h1>
            <p className="text-neutral-600 text-sm mt-1">Manage your sales and payments</p>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              <Link to="/ledger-sheet">View Full Ledger</Link>
            </Button>
            <Button
              asChild
              className=" text-white"
            >
              <Link to="/ledger/product-list">Create Entry</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Entries Card */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-neutral-900">{totalEntries}</div>
              <p className="text-xs text-neutral-500 mt-2">entries created</p>
            </CardContent>
          </Card>

          {/* Total Amount Card */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-neutral-500 mt-2">sum of all entries</p>
            </CardContent>
          </Card>

          {/* Pending Amount Card */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-neutral-500 mt-2">awaiting payment</p>
            </CardContent>
          </Card>

          {/* Paid Amount Card */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-600">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
              <p className="text-xs text-neutral-500 mt-2">completed payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Ledger List */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-neutral-900">Recent Entries</CardTitle>
                <CardDescription className="text-neutral-600">Last {entries.length} ledger entries</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-neutral-600 text-sm mb-4">No entries yet</p>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link to="/">Create Your First Entry</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Items</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wide">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-neutral-900">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900 font-medium">{getCustomerName(entry.customerId)}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{entry.items.length} item{entry.items.length !== 1 ? 's' : ''}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-blue-600">{formatCurrency(entry.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
