"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Send } from "lucide-react"
import { QRCode } from "react-qrcode-logo"

const QRCodeWithLogo = ({ value, size = 200 }: { value: string; size?: number }) => {
  return (
    <QRCode
      value={value}
      size={size}
      logoImage="https://static.wixstatic.com/media/babd9b_ba57d40fd60d4d3bbc5a606f6fea1666~mv2.png/v1/fill/w_209,h_56,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ac.png"
      logoWidth={size * 0.25}
      logoHeight={size * 0.15}
      removeQrCodeBehindLogo={true}
      logoPadding={2}
      logoPaddingStyle="square"
      eyeRadius={5}
      qrStyle="squares"
    />
  )
}

export default function QRGenerator() {
  const [formData, setFormData] = useState({
    qrValue: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const qrRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (value: string) => {
    setFormData({ qrValue: value })
    setError("")
    setSuccess("")
  }

  const generateQR = async () => {
    if (!formData.qrValue.trim()) {
      setError("Please enter a URL or value for the QR code")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // Simulate QR generation delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQrGenerated(true)
      setSuccess("QR code generated successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate QR code")
    } finally {
      setIsGenerating(false)
    }
  }

  const postToAPI = async () => {
    if (!qrGenerated) {
      setError("Please generate a QR code first")
      return
    }

    setIsPosting(true)
    setError("")
    setSuccess("")

    try {
      // Simulate API call
      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrValue: formData.qrValue,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      setSuccess("QR code posted to API successfully!")
      console.log("API Response:", result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post to API")
    } finally {
      setIsPosting(false)
    }
  }

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `qr-code-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const resetForm = () => {
    setFormData({ qrValue: "" })
    setQrGenerated(false)
    setError("")
    setSuccess("")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator with Logo</CardTitle>
          <CardDescription>Create QR codes with custom logos and post them to your API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Form Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrValue">QR Code Value/URL *</Label>
                <Textarea
                  id="qrValue"
                  placeholder="Enter URL or text for QR code..."
                  value={formData.qrValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={generateQR} disabled={isGenerating || !formData.qrValue.trim()} className="flex-1">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate QR Code"
                  )}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={isGenerating || isPosting}>
                  Reset
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>QR Code Preview</Label>
                <div ref={qrRef} className="flex justify-center">
                  {qrGenerated ? (
                    <QRCodeWithLogo value={formData.qrValue} size={200} />
                  ) : (
                    <div className="w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-sm">No QR code generated</div>
                        <div className="text-xs mt-1">Fill the form and click generate</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {qrGenerated && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadQR} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={postToAPI} disabled={isPosting} className="flex-1">
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post to API
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {/* Generated Data Preview */}
          {qrGenerated && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated QR Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                  {JSON.stringify(
                    {
                      qrValue: formData.qrValue,
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2,
                  )}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
