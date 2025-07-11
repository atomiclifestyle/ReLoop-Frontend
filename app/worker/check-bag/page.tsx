"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, QrCode, Camera, Calendar, User, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Mock bag history data
const mockBagHistory = {
  bagId: "BAG123",
  status: "Active",
  totalScans: 8,
  faultCount: 1,
  transactions: [
    {
      id: "TXN001",
      date: "2024-01-15",
      time: "14:30",
      action: "Checkout",
      workerId: "WRK001",
      workerName: "Sarah Johnson",
      status: "Success",
    },
    {
      id: "TXN002",
      date: "2024-01-15",
      time: "16:45",
      action: "Recycle",
      workerId: "WRK002",
      workerName: "Mike Chen",
      status: "Success",
    },
    {
      id: "TXN003",
      date: "2024-01-14",
      time: "10:20",
      action: "Checkout",
      workerId: "WRK001",
      workerName: "Sarah Johnson",
      status: "Success",
    },
    {
      id: "TXN004",
      date: "2024-01-14",
      time: "15:30",
      action: "Recycle",
      workerId: "WRK003",
      workerName: "Emma Davis",
      status: "Fault",
    },
    {
      id: "TXN005",
      date: "2024-01-13",
      time: "09:15",
      action: "Checkout",
      workerId: "WRK002",
      workerName: "Mike Chen",
      status: "Success",
    },
  ],
}

export default function CheckBagPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [bagHistory, setBagHistory] = useState<typeof mockBagHistory | null>(null)
  const [showScanner, setShowScanner] = useState(true)

  const handleScan = async () => {
    setIsScanning(true)

    // Simulate QR code scanning
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setBagHistory(mockBagHistory)
    setIsScanning(false)
    setShowScanner(false)
  }

  const resetScan = () => {
    setBagHistory(null)
    setShowScanner(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/worker/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Check Bag</h1>
            <p className="text-gray-600">Scan a bag to view its complete transaction history</p>
          </div>
        </div>

        {showScanner && (
          <>
            {/* QR Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scan Bag QR Code
                </CardTitle>
                <p className="text-sm text-gray-600">Scan the QR code on the bag to view its complete history</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mock QR Scanner Display */}
                <div className="aspect-square max-w-sm mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Scanning QR Code...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Position bag QR code in the frame</p>
                    </div>
                  )}
                </div>

                <Button onClick={handleScan} disabled={isScanning} className="w-full" size="lg">
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2" />
                      Scan Bag
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Alert>
              <AlertDescription>
                <strong>Use this feature to:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check how faulty bags came to the counter</li>
                  <li>Understand a bag's complete usage history</li>
                  <li>Investigate any issues with specific bags</li>
                  <li>View all workers who have handled the bag</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}

        {bagHistory && (
          <>
            {/* Complete Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Complete Bag Transaction History
                </CardTitle>
                <p className="text-sm text-gray-600">The whole bag transaction history is shown below</p>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bagHistory.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {transaction.date} {transaction.time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.action === "Checkout" ? "default" : "secondary"}
                              className={
                                transaction.action === "Checkout"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {transaction.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">{transaction.workerName}</p>
                                <p className="text-xs text-gray-500">{transaction.workerId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.status === "Success" ? "secondary" : "destructive"}
                              className={
                                transaction.status === "Success"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {transaction.status === "Success" ? (
                                <QrCode className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 mr-1" />
                              )}
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button onClick={resetScan} variant="outline" size="lg">
                <QrCode className="w-5 h-5 mr-2" />
                Scan Another Bag
              </Button>
              <Link href="/worker/dashboard">
                <Button size="lg">Return to Dashboard</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
