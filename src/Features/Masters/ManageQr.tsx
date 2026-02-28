

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Send } from "lucide-react"
import QRCode from "qrcode"
import React from "react"
import axios from "axios"

import { BASE_URL } from "@/lib/constants"
interface QRCodeWithLogoProps {
  value: string
  logoImage: string
  size?: number
  logoWidth?: number
  logoHeight?: number
  logoBackground?: boolean
}

const QRCodeWithLogo = ({
  value,
  logoImage,
  size = 200,
  logoWidth = size * 0.2,
  logoHeight = size * 0.2,
  logoBackground = true,
}: QRCodeWithLogoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  const generateQRWithLogo = useCallback(async () => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      // Generate QR code
      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      // Add logo if provided
      if (logoImage) {
        const logo = new Image()
        logo.crossOrigin = "anonymous"
        logo.onload = () => {
          const x = (size - logoWidth) / 2
          const y = (size - logoHeight) / 2

          // Draw white background for logo if enabled
          if (logoBackground) {
            ctx.fillStyle = "#FFFFFF"
            ctx.fillRect(x - 2, y - 2, logoWidth + 4, logoHeight + 4)
          }

          // Draw logo
          ctx.drawImage(logo, x, y, logoWidth, logoHeight)

          setQrDataUrl(canvas.toDataURL())
        }
        logo.onerror = () => {
          setQrDataUrl(canvas.toDataURL())
        }
        logo.src = logoImage
      } else {
        setQrDataUrl(canvas.toDataURL())
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }, [value, logoImage, size, logoWidth, logoHeight, logoBackground])

  React.useEffect(() => {
    generateQRWithLogo()
  }, [generateQRWithLogo])

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border rounded-lg"
        style={{ display: qrDataUrl ? "block" : "none" }}
      />
      
      {!qrDataUrl && (
        <div
          className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
          style={{ width: size, height: size }}
        >
          <div className="text-center p-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <div className="text-sm text-gray-500">Generating QR...</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QRGenerator() {
  const [formData, setFormData] = useState({
    imageUrl: "",
    qrValue: "",
    groupCompanyId: 2,
  })
  const [groupData, setGroupData] = useState<any[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [groupError, setGroupError] = useState("")
  const [logoConfig] = useState({
    width: 100,
    height: 30,
    background: true,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const qrRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
    setSuccess("")
  }

  const imgURL =
    "https://static.wixstatic.com/media/babd9b_ba57d40fd60d4d3bbc5a606f6fea1666~mv2.png/v1/fill/w_209,h_56,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ac.png"

  const generateQR = async () => {
    if (!formData.qrValue.trim()) {
      setError("Please enter a URL or value for the QR code")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
        throw new Error("Please enter a valid image URL")
      }

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
      const response = await axios.post(BASE_URL +`/api/addQR`, {
        groupCompanyId: Number(formData.groupCompanyId),
        qrData: formData.qrValue,
      })

      if (response.status !== 200) {
        throw new Error(`API Error: ${response.status}`)
      }

      setSuccess("QR code posted to API successfully!")
      console.log("API Response:", response.data)
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
    setFormData({ imageUrl: "", qrValue: "", groupCompanyId: 2 })
    setQrGenerated(false)
    setError("")
    setSuccess("")
  }

  const fetchGroupData = async () => {
    setIsLoadingGroups(true)
    setGroupError("")

    try {
      const response = await axios.get(BASE_URL +`/api/getAllgroup`)
      setGroupData(response.data)
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : "Failed to fetch group data")
    } finally {
      setIsLoadingGroups(false)
    }
  }

  React.useEffect(() => {
    fetchGroupData()
  }, [])

  const downloadGroupQR = (qrData: string, groupName: string) => {
    // Create a temporary canvas to generate QR for download
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    QRCode.toCanvas(canvas, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).then(() => {
      // Add logo
      const logo = new Image()
      logo.crossOrigin = "anonymous"
      logo.onload = () => {
        const x = (300 - 100) / 2
        const y = (300 - 30) / 2

        // Draw white background for logo
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(x - 2, y - 2, 104, 34)

        // Draw logo
        ctx.drawImage(logo, x, y, 100, 30)

        // Download
        const link = document.createElement("a")
        link.download = `qr-${groupName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      logo.src = imgURL
    })
  }

  const existingGroups = groupData.filter((group) => group.qrData && group.qrData.trim() !== "")
  const nonExistingGroups = groupData.filter((group) => !group.qrData || group.qrData.trim() === "")

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
                  onChange={(e) => handleInputChange("qrValue", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupCompanyId">Group Company ID *</Label>
                <Input
                  id="groupCompanyId"
                  type="number"
                  min="1"
                  value={formData.groupCompanyId}
                  onChange={(e) => handleInputChange("groupCompanyId", e.target.value)}
                  placeholder="Enter group company ID"
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
                    <QRCodeWithLogo
                      value={formData.qrValue}
                      logoImage={imgURL}
                      size={300}
                      logoWidth={100}
                      logoHeight={30}
                      logoBackground={true}
                    />
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
                      groupCompanyId: formData.groupCompanyId,
                      logoWidth: 100,
                      logoHeight: 30,
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
      {/* Groups Table Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Group Companies</CardTitle>
              <CardDescription>Manage QR codes for all group companies</CardDescription>
            </div>
            <Button onClick={fetchGroupData} disabled={isLoadingGroups} variant="outline">
              {isLoadingGroups ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {groupError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{groupError}</AlertDescription>
            </Alert>
          )}

          {/* Existing QR Codes Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Existing QR Codes ({existingGroups.length})</h3>
            {existingGroups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Company Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">QR Data</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">QR Preview</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{group.id}</td>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{group.groupCompanyName}</td>
                        <td className="border border-gray-300 px-4 py-2">{group.category}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="max-w-xs truncate" title={group.qrData}>
                            {group.qrData}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex justify-center">
                            <QRCodeWithLogo
                              value={group.qrData}
                              logoImage={imgURL}
                              size={80}
                              logoWidth={20}
                              logoHeight={8}
                              logoBackground={true}
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadGroupQR(group.qrData, group.groupCompanyName)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No companies with existing QR codes</div>
              </div>
            )}
          </div>

          {/* Non-Existing QR Codes Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-600">
              Non-Existing QR Codes ({nonExistingGroups.length})
            </h3>
            {nonExistingGroups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-orange-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Company Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonExistingGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{group.id}</td>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{group.groupCompanyName}</td>
                        <td className="border border-gray-300 px-4 py-2">{group.category}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            No QR Data
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">All companies have QR codes</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
