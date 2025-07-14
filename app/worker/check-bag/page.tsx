"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, QrCode, Camera, CheckCircle } from "lucide-react";
import Link from "next/link";
import jsQR from "jsqr";
import { useSession } from "next-auth/react";

// Interface for bag history data (updated to match new response format)
interface BagHistory {
  user_id: number;
  number_of_time_used: number;
  worker_id: number;
  last_scan_date: string;
  id: number;
  last_scan_type: "Checkout" | "Recycle";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      // Convert canvas to Blob and then to File
      if (code) {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "qr_code.png", { type: "image/png" });
            handleScan(file, code.data);
          }
        }, "image/png", 1.0);
      } else {
        setError("No QR code found in the image. Please try again.");
        setIsScanning(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleScan(file, code.data); // Pass the original file
          } else {
            setError("No QR code found in the uploaded image.");
          }
          URL.revokeObjectURL(img.src);
        }
      };
    }
  };

  const handleScan = async (imageFile: File, qrData?: string) => {
    setIsScanning(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("uploaded_qr", imageFile); // Send the image as a File

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
            <p className="text-gray-600">Scan a bag to view its details</p>
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
                <p className="text-sm text-gray-600">Scan or upload the QR code on the bag to view its details</p>
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
                          <p className="text-gray-600">Processing QR Code...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Position bag QR code in the frame or upload an image</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <Button onClick={startCamera} disabled={isScanning} className="w-full" size="lg">
                        <Camera className="w-5 h-5 mr-2" />
                        Open Camera
                      </Button>
                      <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isScanning}
                          className="w-full"
                          size="lg"
                        >
                          <QrCode className="w-5 h-5 mr-2" />
                          Upload QR Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
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
                  <li>View the user associated with the bag</li>
                  <li>Check how many times the bag has been used</li>
                  <li>Identify the last worker who handled the bag</li>
                  <li>Review the last scan date and type</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}

        {bagHistory && (
          <>
            {/* Bag Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Bag Details
                </CardTitle>
                <p className="text-sm text-gray-600">Details for Bag ID: {bagHistory.id}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Bag ID</p>
                    <p className="text-lg">{bagHistory.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">User ID</p>
                    <p className="text-lg">{bagHistory.user_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Number of Times Used</p>
                    <p className="text-lg">{bagHistory.number_of_time_used}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Worker ID</p>
                    <p className="text-lg">{bagHistory.worker_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Last Scan Date</p>
                    <p className="text-lg">{bagHistory.last_scan_date}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Last Scan Type</p>
                    <Badge
                      variant={bagHistory.last_scan_type === "Checkout" ? "default" : "secondary"}
                      className={
                        bagHistory.last_scan_type === "Checkout"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {bagHistory.last_scan_type}
                    </Badge>
                  </div>
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