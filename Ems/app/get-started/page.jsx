"use client"

import Link from "next/link"
import { Button } from "../../components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Building2, User, Shield } from "lucide-react"

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Enterprise Portal</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Access Portal</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced attendance tracking with biometric authentication, comprehensive reporting, and enterprise-grade
              security for modern organizations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            {/* Employee Access Card */}
            <Card className="w-full max-w-sm border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-6 bg-blue-100 rounded-full w-fit">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-900">Employee Access</CardTitle>
                <CardDescription className="text-base">
                  Access your personal dashboard, attendance records, and work schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/employee/login" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">
                    <User className="h-5 w-5 mr-2" />
                    Employee Access
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Administrator Access Card */}
            <Card className="w-full max-w-sm border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-6 bg-red-100 rounded-full w-fit">
                  <Shield className="h-12 w-12 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-900">Administrator Access</CardTitle>
                <CardDescription className="text-base">
                  Manage employees, monitor attendance, and access system administration tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/login" className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-base border border-red-600">
                    <Shield className="h-5 w-5 mr-2" />
                    Administrator Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Security Notice</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      All login attempts are monitored and logged for security purposes. Please ensure you are accessing
                      the appropriate portal for your role within the organization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
