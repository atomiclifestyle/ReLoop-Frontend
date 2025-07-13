"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Coins } from "lucide-react"
import Link from "next/link"
import { useSession } from 'next-auth/react'
import { BASE_BACKEND_URL } from "../constants"


type EarningTransaction = {
  id: string;
  bagId: string;
  returnDate: string; // Use `Date` if you plan to parse it
  coinsEarned: number;
};

type SpendingTransaction = {
  id: string;
  transactionDate: string; // Use `Date` if you plan to parse it
  coinsSpent: number;
};

type TransactionsType = {
  earningTransactions: EarningTransaction[],
  spendingTransactions: SpendingTransaction[]
}


// Mock transaction data
const defaulttransaction = {
  earningTransactions: [
    { id: "TXN001", bagId: "BAG001", returnDate: "2024-01-15", coinsEarned: 30 },
    { id: "TXN002", bagId: "BAG002", returnDate: "2024-01-14", coinsEarned: 20 },
    { id: "TXN003", bagId: "BAG003", returnDate: "2024-01-13", coinsEarned: 50 },
    { id: "TXN004", bagId: "BAG004", returnDate: "2024-01-12", coinsEarned: 40 },
    { id: "TXN005", bagId: "BAG005", returnDate: "2024-01-11", coinsEarned: 25 },
  ],
  spendingTransactions: [
    { id: "TXN101", transactionDate: "2024-01-10", coinsSpent: 100 },
    { id: "TXN102", transactionDate: "2024-01-08", coinsSpent: 75 },
    { id: "TXN103", transactionDate: "2024-01-05", coinsSpent: 150 },
    { id: "TXN104", transactionDate: "2024-01-03", coinsSpent: 50 },
  ]

}

export default function TransactionsPage() {
  const {status , data} = useSession();
  const [transaction, settransaction] = useState<TransactionsType>(defaulttransaction)

  useEffect(()=>{
    if(status !== 'authenticated' || !data?.access_token) return;
    const fetchTransaction = async() =>{
      const res = await fetch(`${BASE_BACKEND_URL}/dashboard/user/coin_transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${data.access_token}`,
        },
      })
      const response = await res.json();
      console.log(response)
    }
    //fetchTransaction()
  },[status , data])

  const [activeTab, setActiveTab] = useState("earn")

  const totalEarned = transaction.earningTransactions.reduce((sum, tx) => sum + tx.coinsEarned, 0)
  const totalSpent = transaction.spendingTransactions.reduce((sum, tx) => sum + tx.coinsSpent, 0)
  const netBalance = Math.max(totalEarned - totalSpent, 0) // Ensure non-negative

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coin Earning/Redeem Detail Page</h1>
            <p className="text-gray-600">View your complete transaction history</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{totalEarned}</div>
              <p className="text-xs text-muted-foreground">From {transaction.earningTransactions.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-{totalSpent}</div>
              <p className="text-xs text-muted-foreground">From {transaction.spendingTransactions.length} redemptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <Coins className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{netBalance}</div>
              <p className="text-xs text-muted-foreground">Available coins</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <p className="text-sm text-gray-600">Toggle between Earn and Redeem transactions</p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="earn" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Earn ({transaction.earningTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="redeem" className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Redeem ({transaction.spendingTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="earn" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Bag ID</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead className="text-right">Coins Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaction.earningTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>{transaction.bagId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {transaction.returnDate}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              +{transaction.coinsEarned}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="redeem" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Transaction Date</TableHead>
                        <TableHead className="text-right">Coins Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaction.spendingTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {transaction.transactionDate}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              -{transaction.coinsSpent}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/redeem">
            <Button size="lg">
              <Coins className="w-5 h-5 mr-2" />
              Redeem More Coins
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
