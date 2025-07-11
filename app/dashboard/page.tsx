"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coins, ShoppingBag, User, History, ArrowRight } from "lucide-react"
import Link from "next/link"

// Remove the unnecessary mock data fields and keep only what's in the diagram
const userData = {
  id: "USR001",
  name: "John Doe",
  email: "john.doe@example.com",
  bagsReturned: 45,
  bagsCollected: 38,
  totalCoins: 450,
  recentPurchases: [
    { id: "PUR001", billNumber: "WM-2024-001", date: "2024-01-15", bagsUsed: 3 },
    { id: "PUR002", billNumber: "WM-2024-002", date: "2024-01-14", bagsUsed: 2 },
    { id: "PUR003", billNumber: "WM-2024-003", date: "2024-01-13", bagsUsed: 5 },
  ],
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Coins className="w-5 h-5 mr-2" />
              {userData.totalCoins} Coins
            </Badge>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
              <Coins className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.totalCoins}</div>
              <p className="text-xs text-muted-foreground">Available for redemption</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bags Returned</CardTitle>
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.bagsReturned}</div>
              <p className="text-xs text-muted-foreground">Eco-friendly returns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bags Collected</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.bagsCollected}</div>
              <p className="text-xs text-muted-foreground">From purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User ID</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.id}</div>
              <p className="text-xs text-muted-foreground">Your unique identifier</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Purchases */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Bill Number: {purchase.billNumber}</p>
                      <p className="text-sm text-gray-600">Purchase Date: {purchase.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{purchase.bagsUsed} bags used</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/transactions">
                  <Button variant="outline" className="w-full bg-transparent">
                    <History className="w-4 h-4 mr-2" />
                    View All Transactions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/redeem" className="block">
                <Button className="w-full" size="lg">
                  <Coins className="w-5 h-5 mr-2" />
                  Redeem Coins
                </Button>
              </Link>

              <Link href="/transactions" className="block">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <History className="w-5 h-5 mr-2" />
                  Transaction History
                </Button>
              </Link>

              <Link href="/profile" className="block">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <User className="w-5 h-5 mr-2" />
                  View Profile
                </Button>
              </Link>

              {/* User Profile Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userData.name}</p>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
