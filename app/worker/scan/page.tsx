"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, QrCode, ShoppingCart, Recycle, CheckCircle, Camera, User } from "lucide-react";
import Link from "next/link";
import jsQR from "jsqr";
import { useSession } from "next-auth/react";

export default function ScanPage() {
  const [scanMode, setScanMode] = useState<"Checkout" | "Recycle">("Checkout");
  const [userId, setUserId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      // Convert canvas to Blob and then to File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "qr_code.png", { type: "image/png" });
          if (code) {
            sendQRToBackend(file, code.data);
          } else {
            setError("No QR code found in the image. Please try again.");
          }
        }
      }, "image/png", 1.0);
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
            sendQRToBackend(file, code.data); // Pass the original file
          } else {
            setError("No QR code found in the uploaded image.");
          }
          URL.revokeObjectURL(img.src);
        }
      };
    }
  };

  const sendQRToBackend = async (imageFile: File, qrData?: string) => {
    if (!userId.trim()) {
      setError("Please enter User ID before scanning");
      return;
    }

    setIsScanning(true);
    setError("");
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("uploaded_qr", imageFile);
      formData.append("user_id", userId);
      formData.append("scan_mode", scanMode);
      // formData.append("worker_id", "1");

      const response = await fetch("https://reloop.onrender.com/dashboard/worker/scan_qr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process QR code: ${response.statusText}`);
      }

      const result = await response.json();
      setScanResult(qrData || result.bagId || `BAG${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`);
      setShowSuccess(true);
      stopCamera();

      setTimeout(() => {
        setShowSuccess(false);
        setScanResult(null);
        setUserId("");
      }, 3000);
    } catch (err) {
      setError("Failed to process QR code. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/worker/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scan Webpage</h1>
            <p className="text-gray-600">Scan bags for checkout or recycling</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter customer's User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="text-lg"
                required
              />
              <p className="text-sm text-gray-600">This will be sent to backend along with the QR scan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Scan Mode</CardTitle>
            <p className="text-sm text-gray-600">Choose the appropriate mode based on the bag's current status</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={scanMode === "Checkout" ? "default" : "outline"}
                onClick={() => setScanMode("Checkout")}
                className="h-20 flex flex-col gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Checkout Mode</span>
                <span className="text-xs opacity-75">Customer using bag</span>
              </Button>
              <Button
                variant={scanMode === "Recycle" ? "default" : "outline"}
                onClick={() => setScanMode("Recycle")}
                className="h-20 flex flex-col gap-2"
              >
                <Recycle className="w-6 h-6" />
                <span>Recycle Mode</span>
                <span className="text-xs opacity-75">Customer returning bag</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <strong>Current Mode:</strong>{" "}
            <Badge variant={scanMode === "Checkout" ? "default" : "secondary"}>
              {scanMode === "Checkout" ? "Checkout" : "Recycle"}
            </Badge>
            <br />
            {scanMode === "Checkout"
              ? "Scan when a customer is taking a bag to carry their items."
              : "Scan when a customer is returning a bag for recycling."}
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {showCamera && (
              <div className="space-y-4">
                <div className="relative aspect-square max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-white border-dashed m-8 rounded-lg"></div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={capturePhoto} disabled={isScanning || !userId.trim()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture QR Code
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showSuccess && scanResult && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <p className="text-green-800 font-semibold text-lg">Scan Successful!</p>
                  <p className="text-gray-600">Bag ID: {scanResult}</p>
                  <p className="text-gray-600">User ID: {userId}</p>
                  <p className="text-gray-600">Mode: {scanMode}</p>
                </div>
              </div>
            )}

            {!showCamera && !showSuccess && (
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
                      <p className="text-gray-600">Ready to scan QR code</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={startCamera} disabled={isScanning || !userId.trim()} className="w-full" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera
                  </Button>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning || !userId.trim()}
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

            {scanResult && showSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Bag {scanResult} has been scanned in{" "}
                  <Badge variant={scanMode === "Checkout" ? "default" : "secondary"}>{scanMode}</Badge> mode for User
                  ID: {userId}. The transaction has been sent to the backend.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scanning Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Before Scanning:</h4>
              <p className="text-sm text-gray-600">
                1. Enter the customer's User ID in the field above
                <br />
                2. Select the appropriate scan mode (Checkout or Recycle)
                <br />
                3. Use camera or upload image to scan the QR code
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Checkout Mode
              </h4>
              <p className="text-sm text-gray-600">
                Use this mode when a customer is taking a bag to carry their purchased items. This will track the bag as
                "in use" by the customer.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Recycle className="w-4 h-4" />
                Recycle Mode
              </h4>
              <p className="text-sm text-gray-600">
                Use this mode when a customer is returning a bag for recycling. This will award coins to the customer
                and mark the bag as returned.
              </p>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> The QR image, User ID, scan mode, and worker ID will be sent to the backend for
                processing. Make sure the QR code is clearly visible in the image.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}