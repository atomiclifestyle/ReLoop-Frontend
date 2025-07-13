"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QrCode, Search, User, Calendar, AlertTriangle, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
import { BASE_BACKEND_URL } from '@/app/constants'


type ScanRecord = {
  id: string;
  bagId: string;
  scanMode: "Checkout" | "Recycle";
  scanDate: string;
};

type WorkerDataType = {
  id: string;
  full_name: string;
  email: string;
  total_beg_scanned: number;
  total_fault_scan: number;
  recentScans: ScanRecord[];
};

const workerData: WorkerDataType = {
  id: "WRK001",
  full_name: "Sarah Johnson",
  email: "sarah.johnson@store.com",
  total_beg_scanned: 234,
  total_fault_scan: 3,
  recentScans: [
    { id: "SCN001", bagId: "BAG001", scanMode: "Checkout", scanDate: "2024-01-15" },
    { id: "SCN002", bagId: "BAG002", scanMode: "Recycle", scanDate: "2024-01-15" },
    { id: "SCN003", bagId: "BAG003", scanMode: "Checkout", scanDate: "2024-01-15" },
    { id: "SCN004", bagId: "BAG004", scanMode: "Recycle", scanDate: "2024-01-15" },
    { id: "SCN005", bagId: "BAG005", scanMode: "Checkout", scanDate: "2024-01-15" },
  ],
}

export default function WorkerDashboard() {
  const router = useRouter()
  const { status, data } = useSession()
  const [worker, setworker] = useState<WorkerDataType>(workerData)

  useEffect(() => {
    if (status == 'unauthenticated') return;
    const fetchProfile = async () => {
      const res = await fetch(`${BASE_BACKEND_URL}/dashboard/worker/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${data?.access_token}`
        }
      })
      const user = await res.json();
      setworker((prev) => ({
        ...prev,
        id: user.id,
        name: user.fullname,
        email: user.email,
        total_beg_scanned: user.total_beg_scanned,
        total_fault_scan: user.total_fault_scan
      }))
    }
    fetchProfile()
  }, [status])


  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("isAuthenticated")
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="text-gray-600">Welcome back, {worker.full_name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/worker/profile">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <QrCode className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{worker.total_beg_scanned}</div>
              <p className="text-xs text-muted-foreground">Bags scanned today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fault Scans</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{worker.total_fault_scan}</div>
              <p className="text-xs text-muted-foreground">Issues detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Worker ID</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{worker.id}</div>
              <p className="text-xs text-muted-foreground">Your identifier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((worker.total_beg_scanned - worker.total_fault_scan) / worker.total_beg_scanned) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Successful scans</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Recent Scans Table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Recent Bag Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bag ID</TableHead>
                      <TableHead>Scan Mode</TableHead>
                      <TableHead>Scan ID</TableHead>
                      <TableHead>Scan Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worker.recentScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">{scan.bagId}</TableCell>
                        <TableCell>
                          <Badge
                            variant={scan.scanMode === "Checkout" ? "default" : "secondary"}
                            className={
                              scan.scanMode === "Checkout" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }
                          >
                            {scan.scanMode}
                          </Badge>
                        </TableCell>
                        <TableCell>{scan.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {scan.scanDate}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/worker/scan" className="block">
                <Button className="w-full" size="lg">
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>
              </Link>

              <Link href="/worker/check-bag" className="block">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  Check Bag History
                </Button>
              </Link>

              <Link href="/worker/profile" className="block">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <User className="w-5 h-5 mr-2" />
                  View Profile
                </Button>
              </Link>

              {/* Worker Profile Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-male-company-employee-avatar-icon-wearing-a-necktie-png-image_6133877.png" />
                    <AvatarFallback>
                      {worker.full_name}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{worker.full_name}</p>
                    <p className="text-sm text-gray-600">{worker.email}</p>
                    <p className="text-xs text-gray-500">ID: {worker.id}</p>
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
