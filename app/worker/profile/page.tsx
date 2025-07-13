"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Mail, QrCode, AlertTriangle, Calendar, Award } from "lucide-react"
import Link from "next/link"
import { useEffect,useState } from "react"
import {useSession} from 'next-auth/react'
import { BASE_BACKEND_URL } from "@/app/constants"


type WorkerDataType= {
  id: string;
  full_name: string;
  email: string;
  total_beg_scanned: number;
  total_fault_scan: number;
  totalShifts: number;
};

const workerData: WorkerDataType = {
  id: "1",
  full_name: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  total_beg_scanned: 1520,
  total_fault_scan: 12,
  totalShifts: 45,
}

export default function WorkerProfilePage() {
  const {data , status} = useSession()
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
        console.log(user)
        setworker((prev)=>({
          ...prev,
          id : user.id,
          name : user.fullname,
          email : user.email,
          total_beg_scanned : user.total_beg_scanned,
          total_fault_scan : user.total_fault_scan
        }))
      }
      fetchProfile()
    }, [status])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/worker/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Page</h1>
            <p className="text-gray-600">Manage your worker account and view statistics</p>
          </div>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-male-company-employee-avatar-icon-wearing-a-necktie-png-image_6133877.png" />
                <AvatarFallback className="text-2xl">
                  {worker.full_name}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Welcome, {worker.full_name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Worker ID: {worker.id}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
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
                <label className="text-sm font-medium text-gray-600">Full Name of Worker</label>
                <p className="text-lg font-semibold">{worker.full_name}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Worker ID</label>
                <p className="text-lg font-semibold">{worker.id}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">User Email</label>
                <p className="text-lg flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {worker.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Scanning Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{worker.total_beg_scanned}</div>
                  <p className="text-sm text-blue-700">Number of Bags Scanned</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{worker.total_fault_scan}</div>
                  <p className="text-sm text-red-700">Number of Fault Scans</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.round(((worker.total_beg_scanned - worker.total_fault_scan) / worker.total_beg_scanned) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Work Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">{worker.totalShifts}</div>
                <p className="text-sm text-purple-700">Total Shifts Worked</p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <QrCode className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{worker.total_beg_scanned}</div>
                <p className="text-sm text-green-700">Total Bags Scanned</p>
              </div>

              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-600">
                  {Math.round(((worker.total_beg_scanned - worker.total_fault_scan) / worker.total_beg_scanned) * 100)}%
                </div>
                <p className="text-sm text-yellow-700">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/worker/scan">
            <Button size="lg">
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </Button>
          </Link>
          <Link href="/worker/check-bag">
            <Button variant="outline" size="lg">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Check Bag History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
