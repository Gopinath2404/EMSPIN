import Link from "next/link"
import { Button } from "../components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CheckCircle, Building2, Users, Shield, Fingerprint, Eye, CreditCard } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Enterprise Portal</span>
          </div>
          <div className="space-x-4">
            <Link href="/get-started">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">
            Powered by Advanced Biometric Technology
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Professional Employee Management System</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced attendance tracking with biometric authentication, comprehensive reporting, and enterprise-grade
            security for modern organizations.
          </p>
          <div className="space-x-4">
            <Link href="/get-started">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Grade Solutions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive workforce management tools designed for modern enterprises with advanced security and
              compliance features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Fingerprint className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Biometric Authentication</CardTitle>
                <CardDescription>
                  Multi-factor authentication with fingerprint, facial recognition, and NFC card access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Advanced fingerprint scanning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    AI-powered face recognition
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Secure NFC card integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Workforce Management</CardTitle>
                <CardDescription>Complete employee lifecycle management with advanced analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Comprehensive employee profiles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Role-based access control
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Department-wise organization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Enterprise Analytics</CardTitle>
                <CardDescription>Real-time monitoring with compliance tracking and automated reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real-time attendance monitoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Automated compliance alerts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Advanced reporting suite
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Device Integration */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="outline">
                Enterprise Hardware Integration
              </Badge>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Professional-Grade Security</h3>
              <p className="text-gray-600 mb-6">
                Seamlessly integrated with enterprise-grade access control systems for maximum security and reliability
                in professional environments.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Advanced facial recognition technology</span>
                </div>
                <div className="flex items-center">
                  <Fingerprint className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Multi-point fingerprint authentication</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Encrypted NFC card support</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Real-time secure data transmission</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <img
                src="/placeholder.svg?height=300&width=400"
                alt="Enterprise Security Device"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Modernize Your Workforce Management?</h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join leading enterprises using our professional employee management system to streamline operations and
            enhance security.
          </p>
          <Link href="/get-started">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="text-xl font-bold">Enterprise Portal</span>
              </div>
              <p className="text-gray-400">Professional employee management system with enterprise-grade security.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Workforce Management</li>
                <li>Attendance Tracking</li>
                <li>Security & Compliance</li>
                <li>Analytics & Reporting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Technical Support</li>
                <li>System Status</li>
                <li>Contact Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enterprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Security</li>
                <li>Compliance</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Enterprise Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
