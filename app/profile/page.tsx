"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Mail, ShoppingBag, Coins } from "lucide-react"
import Link from "next/link"

// Mock user data
const userData = {
  id: "USR001",
  name: "John Doe",
  email: "john.doe@example.com",
  bagsReturned: 45,
  bagsCollected: 38,
  totalCoinsEarned: 1250,
  totalCoinsSpent: 800,
  currentBalance: 450,
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Page</h1>
            <p className="text-gray-600">Manage your account information and view statistics</p>
          </div>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="text-2xl">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Welcome, {userData.name}</h2>
                <div className="flex items-center gap-2"></div>
                <p className="text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User ID: {userData.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg font-semibold">{userData.name}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">User Email</label>
                <p className="text-lg flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {userData.email}
                </p>
              </div>

              <Separator />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Bag Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userData.bagsReturned}</div>
                  <p className="text-sm text-green-700">Number of Bags Returned</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userData.bagsCollected}</div>
                  <p className="text-sm text-blue-700">Number of Bags Collected</p>
                </div>
              </div>

              <Separator />
            </CardContent>
          </Card>
        </div>

        {/* Coin Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              Coin Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-600">{userData.totalCoinsEarned}</div>
                <p className="text-sm text-yellow-700">Total Coins Earned</p>
              </div>

              <div className="text-center p-6 bg-red-50 rounded-lg">
                <Coins className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-600">{userData.totalCoinsSpent}</div>
                <p className="text-sm text-red-700">Total Coins Spent</p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Coins className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{userData.currentBalance}</div>
                <p className="text-sm text-green-700">Current Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/transactions">
            <Button variant="outline" size="lg">
              View Transaction History
            </Button>
          </Link>
          <Link href="/redeem">
            <Button size="lg">
              <Coins className="w-5 h-5 mr-2" />
              Redeem Coins
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
