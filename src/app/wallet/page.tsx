"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/lib/auth-client"
import { IndianRupee, History, RefreshCw } from "lucide-react"
import AuthenticatedLayout from "@/app/components/AuthenticatedLayout"

interface Transaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  status: 'pending' | 'completed' | 'failed'
  description: string
  created_at: string
  order_id?: string
}

export default function WalletPage() {
  const { data: session } = useSession()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Use refs to prevent infinite loops and race conditions
  const isFetchingRef = useRef(false)
  const sessionUserIdRef = useRef<string | null>(null)

  // Memoize fetchWalletData to prevent recreation on every render
  const fetchWalletData = useCallback(async () => {
    if (!session?.user?.id || isFetchingRef.current) return

    // Check if we're already fetching for this user
    if (sessionUserIdRef.current === session.user.id && isFetchingRef.current) return

    isFetchingRef.current = true
    sessionUserIdRef.current = session.user.id

    setLoading(true)
    try {
      // Fetch balance and transactions in parallel
      const [balanceResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/wallet/balance`),
        fetch(`/api/wallet/transactions`)
      ])

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        setBalance(balanceData.balance || 0)
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [session?.user?.id])

  // Only fetch when user ID actually changes, not on every session object change
  useEffect(() => {
    const userId = session?.user?.id
    if (userId && userId !== sessionUserIdRef.current) {
      fetchWalletData()
    }
  }, [session?.user?.id, fetchWalletData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isFetchingRef.current = false
    }
  }, [])

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    if (!amount || amount < 10) {
      alert('Minimum recharge amount is ₹10')
      return
    }

    setPaymentLoading(true)
    try {
      const response = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.payment_url) {
          // Redirect to payment page
          window.location.href = data.payment_url
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Failed to initiate payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-100">
        {/* Header Section */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300">
            <h2 className="text-base font-semibold text-gray-800">Wallet Management</h2>
          </div>
          <div className="bg-white p-4">
            <p className="text-sm text-gray-600">Manage your wallet balance and view transaction history</p>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="mb-6">
          <div className="bg-gray-200 px-4 py-2 border border-gray-300 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-800">Current Balance</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWalletData}
              disabled={loading}
              className="bg-white border-gray-400 h-8"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="bg-white p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                <IndianRupee className="w-8 h-8 inline-block mr-2" />
                {balance.toFixed(2)}
              </div>
              <p className="text-gray-600 text-sm">Available Balance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Money Section */}
          <div>
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Add Money</h2>
            </div>
            <div className="bg-white p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Enter Amount (₹) <span className="text-red-600 font-bold text-base">✱</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount (min. ₹10)"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    min="10"
                    step="1"
                    className="bg-white border-gray-400 h-8"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="bg-white border-gray-400 h-8 text-sm"
                      onClick={() => setRechargeAmount(amount.toString())}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>

                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm"
                  onClick={handleRecharge}
                  disabled={paymentLoading || !rechargeAmount || parseFloat(rechargeAmount) < 10}
                >
                  {paymentLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Money'
                  )}
                </Button>

                <div className="flex justify-center">
                  <img
                    src="/sbi.png"
                    alt="Kukupay Pro Logo"
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="bg-gray-200 px-4 py-2 border border-gray-300">
              <h2 className="text-base font-semibold text-gray-800">Transaction History</h2>
            </div>
            <div className="bg-white p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-gray-300" />
                  <p className="text-sm">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <IndianRupee className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description || (transaction.type === 'credit' ? 'Money Added' : 'Money Deducted')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                          </span>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}