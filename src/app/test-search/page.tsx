"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export default function TestSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Test the search by calling database directly through API
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search users');
      }

      setSearchResults(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test with sample data
  const testUsers: User[] = [
    {
      id: 'WkmXDnlhFKrWL4zk0TlS27AsD533icax',
      name: 'Mia',
      email: 'gfxprem91@gmail.com',
      phone: '8434118525',
      balance: 0,
      role: 'operator',
      status: 'active',
      kycStatus: 'not_started'
    },
    {
      id: 'pUrCOcjTe6LnmAzcoHdkenjugGjXVlX9',
      name: 'Mia',
      email: 'mejewod773@infornma.com',
      phone: '8434118525',
      balance: 0,
      role: 'operator',
      status: 'active',
      kycStatus: 'not_started'
    },
    {
      id: 'test-user-123',
      name: 'WINMATCH',
      email: 'cobefek775@dotxan.com',
      phone: '4556124512',
      balance: 0,
      role: 'operator',
      status: 'active',
      kycStatus: 'not_started'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Search Test</h1>
        <Badge variant="outline">Debug Mode</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Test the user search functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name, email, phone, or Aadhaar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Search Results</CardTitle>
            <CardDescription>Results from the actual API call</CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <Badge variant="outline">₹{user.balance.toFixed(2)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {loading ? 'Searching...' : 'No results found'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Users</CardTitle>
            <CardDescription>Known users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testUsers.map((user) => (
                <div key={user.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                    <Badge variant="outline">₹{user.balance.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
          <CardDescription>System status and test data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Admin User Created:</strong> ✅</p>
          <p><strong>Admin Email:</strong> admin@ucl.admin</p>
          <p><strong>Admin Password:</strong> admin123</p>
          <p><strong>Operator UID:</strong> ADMIN001</p>
          <p><strong>Operator Name:</strong> System Administrator</p>
          <p><strong>Total Users:</strong> 6 (2 admin, 4 operator)</p>
          <p><strong>Search Query Fixed:</strong> ✅ Column names corrected</p>
          <p><strong>Balance API Fixed:</strong> ✅ Column names corrected</p>
        </CardContent>
      </Card>
    </div>
  );
}