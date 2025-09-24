'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Plus, Minus, History, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  role: string;
  status: string;
  kycStatus: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
  description: string;
  createdAt: string;
}

interface BalanceHistory {
  user: {
    id: string;
    name: string;
    email: string;
    balance: number;
    role: string;
  };
  transactions: Transaction[];
}

export default function BalanceManagement() {
  const { user: adminUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [adjustmentForm, setAdjustmentForm] = useState({
    amount: '',
    type: 'credit' as 'credit' | 'debit',
    description: '',
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery('');

    await fetchBalanceHistory(user.id);
  };

  const fetchBalanceHistory = async (userId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/balance?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance history');
      }

      const data = await response.json();
      setBalanceHistory(data);
    } catch (err) {
      setError('Failed to fetch balance history');
      console.error('Balance history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(adjustmentForm.amount),
          type: adjustmentForm.type,
          description: adjustmentForm.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust balance');
      }

      setSuccess(data.message);

      if (balanceHistory) {
        setSelectedUser(prev => prev ? { ...prev, balance: data.newBalance } : null);
        setBalanceHistory(prev => prev ? {
          ...prev,
          user: { ...prev.user, balance: data.newBalance },
          transactions: [
            {
              id: Date.now().toString(),
              amount: parseFloat(adjustmentForm.amount),
              type: adjustmentForm.type,
              status: 'completed',
              description: `Admin ${adjustmentForm.type}: ${adjustmentForm.description}`,
              createdAt: new Date().toISOString(),
            },
            ...(prev?.transactions || []),
          ],
        } : null);
      }

      setAdjustmentForm({ amount: '', type: 'credit', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust balance');
      console.error('Balance adjustment error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (adminUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Balance Management</h1>
        <Badge variant="secondary">Admin Only</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Users
              </CardTitle>
              <CardDescription>Search by name, email, phone, or Aadhaar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <Badge variant="outline">₹{user.balance.toFixed(2)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>Adjust Balance</CardTitle>
                <CardDescription>Credit or debit user balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm font-medium text-green-600">
                    Current Balance: ₹{selectedUser.balance.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={adjustmentForm.amount}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={adjustmentForm.type}
                      onValueChange={(value: 'credit' | 'debit') =>
                        setAdjustmentForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Credit (Add Balance)
                          </div>
                        </SelectItem>
                        <SelectItem value="debit">
                          <div className="flex items-center gap-2">
                            <Minus className="h-4 w-4" />
                            Debit (Remove Balance)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Reason for adjustment"
                      value={adjustmentForm.description}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={handleBalanceAdjustment}
                    disabled={!adjustmentForm.amount || !adjustmentForm.description || loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : `Adjust Balance`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {balanceHistory ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Balance History
                </CardTitle>
                <CardDescription>
                  Transaction history for {balanceHistory.user.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{balanceHistory.user.name}</p>
                      <p className="text-sm text-gray-600">{balanceHistory.user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-lg font-medium">
                      ₹{balanceHistory.user.balance.toFixed(2)}
                    </Badge>
                  </div>
                </div>

                {balanceHistory.transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No transactions found</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {balanceHistory.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'credit'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <Plus className="h-4 w-4" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                          </p>
                          <Badge
                            variant={
                              transaction.status === 'completed' ? 'default' :
                              transaction.status === 'pending' ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a user to view their balance history</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}