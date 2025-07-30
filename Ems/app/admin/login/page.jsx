"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Shield, AlertCircle, Building2 } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin2325@praskla.com")
  const [password, setPassword] = useState("Admin@123")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (email === "admin2325@praskla.com" && password === "Admin@123") {
        const adminUser = {
          name: "System Admin",
          email: "admin2325@praskla.com",
          role: "admin",
          id: "ADM-001",
          department: "IT",
        }
        localStorage.setItem("user", JSON.stringify(adminUser)) // ✅ Save admin info
        router.push("/admin") // ✅ Route to admin dashboard
      } else {
        setError("Invalid administrator credentials.")
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 text-3xl font-bold text-slate-900">
            <div className="relative">
              <Building2 className="h-10 w-10 text-red-600" />
              <Shield className="h-5 w-5 text-red-800 absolute -top-1 -right-1" />
            </div>
            <span>Admin Portal</span>
          </Link>
          <p className="text-slate-600 mt-3 text-lg">Administrator Access</p>
        </div>

        <Card className="shadow-xl border-0 border-t-4 border-t-red-600">
          <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-red-900">Administrator Sign In</CardTitle>
            <CardDescription className="text-center text-base text-red-700">
              Secure access to system administration
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Administrator Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-red-200 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Administrator Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-red-200 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11 text-base bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/get-started" className="text-sm text-red-600 hover:underline font-medium">
                ← Back to Portal Selection
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 text-sm">Administrator Access Only</h4>
                    <p className="text-xs text-red-700 mt-1">
                      This portal is restricted to system administrators. Unauthorized access attempts are logged and
                      monitored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
