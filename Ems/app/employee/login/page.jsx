"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { User, AlertCircle, Building2 } from "lucide-react";

import { auth, db, provider } from "../../../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function EmployeeLoginPage() {
  const [email, setEmail] = useState("employee@demo.com");
  const [password, setPassword] = useState("emp123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hydrateEmployeeFromFirestore = async (user) => {
    try {
      const q = query(collection(db, "employees"), where("email", "==", user.email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data(), uid: user.uid };
      }
    } catch (e) {
      console.error("Error hydrating employee:", e);
    }
    return {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      name: user.displayName || "Employee",
      role: "employee",
      department: "General",
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic confirm password check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "employees"), where("email", "==", email));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("This email is not registered as an employee.");
        setLoading(false);
        return;
      }

      const doc = snap.docs[0];
      const employeeData = { id: doc.id, ...doc.data() };

      if (!employeeData.password || employeeData.password !== password) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", "employee-session-token");
      localStorage.setItem("user", JSON.stringify(employeeData));

      router.push("/employee");
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const enriched = await hydrateEmployeeFromFirestore(user);

      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(enriched));

      router.push("/employee");
    } catch (err) {
      console.error(err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 text-3xl font-bold text-slate-900">
            <div className="relative">
              <Building2 className="h-10 w-10 text-blue-600" />
              <User className="h-5 w-5 text-blue-800 absolute -top-1 -right-1" />
            </div>
            <span>Employee Portal</span>
          </Link>
          <p className="text-slate-600 mt-3 text-lg">Employee Access</p>
        </div>

        <Card className="shadow-xl border-0 border-t-4 border-t-blue-600">
          <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-blue-900">Employee Sign In</CardTitle>
            <CardDescription className="text-center text-base text-blue-700">
              Access your employee dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-11 mb-6 border-blue-200 hover:bg-blue-50 bg-transparent"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-blue-600">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Employee Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Signing in..." : "Access Dashboard"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/get-started" className="text-sm text-blue-600 hover:underline font-medium">
                ← Back to Portal Selection
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm">Employee Access</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Access your attendance records, work hours, and personal information through this secure portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
