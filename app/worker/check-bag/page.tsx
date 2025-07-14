"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, QrCode, Camera, Calendar, User, AlertTriangle } from "lucide-react";
import Link from "next/link";
import jsQR from "jsqr";
import { useSession } from "next-auth/react";

// Interface for bag history data (replacing mock structure)
interface Transaction {
  id: string;
  date: string;
  time: string;
  action: "Checkout" | "Recycle";
  workerId: string;
  workerName: string;
  status: "Success" | "Fault";
}

interface BagHistory {
  bagId: string;
  status: string;
  totalScans: number;
  faultCount: number;
  transactions: Transaction[];
}

export default function CheckBagPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [bagHistory, setBagHistory] = useState<BagHistory | null>(null);
  const [showScanner, setShowScanner] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: session } = useSession();

  // Assign stream to video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setShowCamera(true);
      setError("");
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Decode QR code using jsQR
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        // Send decoded QR data to backend
        await handleScan(code.data);
      } else {
        setError("No QR code found in the image. Please try again.");
        setIsScanning(false);
      }
    }
  };

const handleScan = async (bagId: string) => {
  setIsScanning(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append("uploaded_qr", bagId); // Send the decoded QR code data as a string

    const response = await fetch("https://reloop.onrender.com/dashboard/worker/about_bag", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bag history: ${response.statusText}`);
    }

    const result: BagHistory = await response.json();
    setBagHistory(result);
    setShowScanner(false);
    setShowCamera(false);
    stopCamera();
  } catch (err) {
    setError("Failed to fetch bag history. Please try again.");
  } finally {
    setIsScanning(false);
  }
};

  const resetScan = () => {
    setBagHistory(null);
    setShowScanner(true);
    setError("");
    stopCamera();
  };

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
                {showCamera ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 border-2 border-white border-dashed m-8 rounded-lg"></div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={capturePhoto} disabled={isScanning}>
                        <Camera className="w-4 h-4 mr-2" />
                        Capture QR Code
                      </Button>
                      <Button variant="outline" onClick={stopCamera} disabled={isScanning}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                    <Button onClick={startCamera} disabled={isScanning} className="w-full" size="lg">
                      <Camera className="w-5 h-5 mr-2" />
                      Open Camera
                    </Button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                <p className="text-sm text-gray-600">
                  Bag ID: {bagHistory.bagId} | Status: {bagHistory.status} | Total Scans: {bagHistory.totalScans} | Faults: {bagHistory.faultCount}
                </p>
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
  );
}