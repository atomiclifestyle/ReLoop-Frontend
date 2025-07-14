"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Coins, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BASE_BACKEND_URL } from "../constants"
import { useSession } from 'next-auth/react'

export default function RedeemPage() {
   type SessionData = {
    access_token?: string;
  };

  const { status, data } = useSession() as { status: string; data: SessionData | null };
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const [availableCoins, setavailableCoins] = useState(0)
  const maxRedeemAmount = Math.floor(availableCoins / 10) * 10 // Round down to nearest 10

  const handleRedeem = async () => {
    const redeemAmount = Number.parseInt(amount)

    if (!redeemAmount || redeemAmount <= 0) {
      return
    }

    if (redeemAmount > availableCoins) {
      return
    }

    setIsProcessing(true)

    const res = await fetch(`${BASE_BACKEND_URL}/dashboard/user/redeem/${amount}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })

    const response = await res.json();
    console.log(response)

    setIsProcessing(false)
    setShowSuccess(true)

    // Redirect to dashboard after success
    setTimeout(() => {
      router.push("/dashboard")
    }, 3000)
  }

  useEffect(() => {
    if (status === 'authenticated' || availableCoins === null) {
      return; // Or show a loading skeleton/spinner
    }
    const fetchCoins = async () => {
      const res = await fetch(`${BASE_BACKEND_URL}/dashboard/user/coin_info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${data?.access_token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch coins:", res.statusText);
        return;
      }
      const response = await res.json();
      setavailableCoins(response)
    }
    fetchCoins()
  }, [])

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-green-800">Redemption Successful!</h2>
            <p className="text-gray-600">
              {amount} coins have been transferred to your Walmart account. The amount will be automatically applied to
              your next purchase.
            </p>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button className="w-full">Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Redeem Coins</h1>
            <p className="text-gray-600">Transfer your coins to your Walmart account</p>
          </div>
        </div>

        {/* Available Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{availableCoins} Coins</div>
            <p className="text-sm text-gray-600 mt-1">
              Maximum redeemable: {maxRedeemAmount} coins (${(maxRedeemAmount / 100).toFixed(2)} value)
            </p>
          </CardContent>
        </Card>

        {/* Redemption Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Redeem Webpage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Enter the amount (in coins)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to redeem"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max={availableCoins}
                className="text-lg"
              />
              <p className="text-sm text-gray-600">Minimum: 1 coin • Maximum: {availableCoins} coins</p>
            </div>

            {amount && Number.parseInt(amount) > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <h3 className="font-semibold text-blue-900">Redemption Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Coins to redeem:</span>
                  <span className="font-medium">{amount} coins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Equivalent value:</span>
                  <span className="font-medium">${(Number.parseInt(amount) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining balance:</span>
                  <span className="font-medium">{availableCoins - Number.parseInt(amount)} coins</span>
                </div>
              </div>
            )}

            {Number.parseInt(amount) > availableCoins && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Insufficient coins. You can redeem up to {availableCoins} coins.</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleRedeem}
              disabled={
                !amount || Number.parseInt(amount) <= 0 || Number.parseInt(amount) > availableCoins || isProcessing
              }
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Transfer...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Transfer to Walmart Account
                </>
              )}
            </Button>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Redeemed coins will be automatically applied to your next Walmart purchase. The
                transfer process may take a few minutes to complete.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Quick Redeem Options */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Redeem Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[50, 100, 200, 300].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > availableCoins}
                  className="text-sm"
                >
                  {quickAmount} coins
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
