"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  LogOut,
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Plane,
} from "lucide-react";
import { WorkHoursSummary } from "../../components/work-hours-summary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

// Firebase
import { auth, db } from "../../lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  collectionGroup,
  getDocs,
} from "firebase/firestore";

const ATTENDANCE_COLLECTION = "attendance";
const LEAVES_COLLECTION = "leaves";

// IST windows (24h)
const CHECKIN_OK_FROM = 8;  // 08:00
const CHECKIN_OK_TO = 9;    // 09:00
const CHECKOUT_OK_FROM = 18; // 18:00
const CHECKOUT_OK_TO = 19;   // 19:00

function dateKeyIST(d = new Date()) {
  return d.toISOString().split("T")[0];
}

function isOnTimeCheckIn(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  return (h > CHECKIN_OK_FROM && h < CHECKIN_OK_TO) ||
         (h === CHECKIN_OK_FROM) ||
         (h === CHECKIN_OK_TO && m === 0);
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // Leave dialog
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [myLeaves, setMyLeaves] = useState([]);
  const leaveUnsubRef = useRef(null);

  // Fetch all leaves for debug
  const [allLeaves, setAllLeaves] = useState([]);
  
  // Employee details from employees collection
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const local = localStorage.getItem("user");
      if (!firebaseUser || !local) {
        router.push("/employee/login");
        return;
      }
      const parsedUser = JSON.parse(local);
      setUser(parsedUser);

      attachTodayAttendanceListener(parsedUser.id || parsedUser.uid);
      attachMyLeavesListener(parsedUser.id || parsedUser.uid);
      fetchEmployeeDetails(parsedUser.id || parsedUser.uid);
    });

    setWeeklyHours(38.5);

    return () => unsub();
  }, [router]);

  // Fetch all leaves for debug
  useEffect(() => {
    async function fetchAllLeaves() {
      const snap = await getDocs(collection(db, "leaves"));
      setAllLeaves(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchAllLeaves();
  }, []);

  const attachTodayAttendanceListener = (employeeId) => {
    const todayKey = dateKeyIST();
    const ref = doc(db, ATTENDANCE_COLLECTION, `${employeeId}_${todayKey}`);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTodayAttendance({
          ...data,
          isLate: data.isLate ?? false,
          status: "present",
        });
      } else {
        setTodayAttendance(null);
      }
      setLoadingAttendance(false);
    });

    return unsub;
  };

  // Attach leave listener and allow manual refresh
  const attachMyLeavesListener = (employeeId) => {
    console.log("[EMPLOYEE DEBUG] Setting up leave listener for employeeId:", employeeId);
    const qLeaves = query(
      collection(db, "leaves"),
      where("userId", "==", employeeId),
      orderBy("appliedAt", "desc")
    );
    if (leaveUnsubRef.current) leaveUnsubRef.current();
    leaveUnsubRef.current = onSnapshot(qLeaves, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("[EMPLOYEE DEBUG] My Leaves for user", employeeId, arr); // Debug log
      setMyLeaves(arr);
    }, (error) => {
      console.error("[EMPLOYEE DEBUG] Error in leave listener:", error);
    });
  };

  // Manual refresh for leave requests
  const handleLeaveRefresh = () => {
    if (user) {
      attachMyLeavesListener(user.id || user.uid);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("signOut error", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/employee/login");
  };

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // Fetch detailed employee information from employees collection
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setLoadingProfile(true);
      console.log("[PROFILE DEBUG] Fetching employee details for ID:", employeeId);
      
      // First try to get from employees collection
      const employeeDoc = await getDoc(doc(db, "employees", employeeId));
      if (employeeDoc.exists()) {
        const data = employeeDoc.data();
        console.log("[PROFILE DEBUG] Employee details from employees collection:", data);
        setEmployeeDetails({ id: employeeDoc.id, ...data });
        setLoadingProfile(false);
        return;
      }
      
      // If not found in employees collection, try to get all employees and find by email
      console.log("[PROFILE DEBUG] Employee not found by ID, searching by email...");
      const employeesSnapshot = await getDocs(collection(db, "employees"));
      const allEmployees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("[PROFILE DEBUG] All employees:", allEmployees);
      
      const employeeByEmail = allEmployees.find(emp => emp.email === user?.email);
      if (employeeByEmail) {
        console.log("[PROFILE DEBUG] Found employee by email:", employeeByEmail);
        setEmployeeDetails(employeeByEmail);
        setLoadingProfile(false);
        return;
      }
      
      console.log("[PROFILE DEBUG] No employee document found for ID:", employeeId);
      setEmployeeDetails(null);
      setLoadingProfile(false);
    } catch (error) {
      console.error("[PROFILE DEBUG] Error fetching employee details:", error);
      setEmployeeDetails(null);
      setLoadingProfile(false);
    }
  };

  // ---- Attendance Actions ----
  const handleCheckIn = async () => {
    if (!user) return;
    const now = new Date();
    const todayKey = dateKeyIST(now);
    const attendanceId = `${user.id || user.uid}_${todayKey}`;
    const attendanceRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
    const snap = await getDoc(attendanceRef);

    if (snap.exists()) {
      alert("You've already checked in today.");
      return;
    }

    const late = !isOnTimeCheckIn(now);
    await setDoc(attendanceRef, {
      userId: user.id || user.uid,
      employeeId: user.id || user.uid,
      employeeName: user.name,
      department: user.department,
      date: todayKey,
      checkIn: Timestamp.fromDate(now),
      checkOut: null,
      isLate: late,
      status: "present",
      workedMinutes: 0,
      hoursWorked: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert(`Checked in ${late ? "late" : "on time"}.`);
  };

  const handleCheckOut = async () => {
    if (!user) return;
    const now = new Date();
    const todayKey = dateKeyIST(now);
    const attendanceId = `${user.id || user.uid}_${todayKey}`;
    const attendanceRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
    const snap = await getDoc(attendanceRef);

    if (!snap.exists()) {
      alert("You haven't checked in yet.");
      return;
    }

    const data = snap.data();
    if (data.checkOut) {
      alert("You've already checked out today.");
      return;
    }

    const checkInDate = data.checkIn.toDate();
    const minutes = Math.max(0, Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60)));
    const hoursWorked = (minutes / 60).toFixed(2);

    await updateDoc(attendanceRef, {
      checkOut: Timestamp.fromDate(now),
      workedMinutes: minutes,
      hoursWorked: parseFloat(hoursWorked),
      updatedAt: serverTimestamp(),
    });

    alert("Checked out successfully.");
  };

  // ---- Leave Actions ----
  const handleApplyLeave = async () => {
    if (!user) return;

    const { fromDate, toDate, reason } = leaveForm;
    if (!fromDate || !toDate || !reason.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const userId = user.id || user.uid;
    console.log("[EMPLOYEE DEBUG] Applying leave for userId:", userId, "User object:", user);

    await addDoc(collection(db, LEAVES_COLLECTION), {
      userId: userId,
      name: user.name,
      email: user.email,
      department: user.department,
      fromDate,
      toDate,
      reason,
      status: "pending",
      appliedAt: serverTimestamp(),
    });

    setLeaveForm({ fromDate: "", toDate: "", reason: "" });
    setLeaveOpen(false);
    alert("Leave applied successfully.");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                <span>•</span>
                <Building className="h-4 w-4" />
                <span>{user.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Plane className="w-4 h-4 mr-1" />
                  Apply Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>Submit your leave request for admin approval.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromDate">From</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={leaveForm.fromDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toDate">To</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={leaveForm.toDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Explain your reason..."
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleApplyLeave}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Attendance Action Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Actions</CardTitle>
            <CardDescription>Check in/out with policy validation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
              onClick={handleCheckIn}
              disabled={loadingAttendance || (todayAttendance && todayAttendance.checkIn)}
            >
              Check In
            </Button>
            <Button
              variant="secondary"
              onClick={handleCheckOut}
              disabled={
                loadingAttendance ||
                !todayAttendance ||
                (todayAttendance && todayAttendance.checkOut)
              }
            >
              Check Out
            </Button>
            {todayAttendance && (
              <div className="text-sm text-muted-foreground">
                {todayAttendance.checkIn && (
                  <span>
                    In:{" "}
                    {todayAttendance.checkIn.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {todayAttendance.checkOut && (
                  <>
                    {"  •  "}
                    <span>
                      Out:{" "}
                      {todayAttendance.checkOut.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </>
                )}
                {todayAttendance.isLate && (
                  <Badge variant="destructive" className="ml-2">
                    Late
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {todayAttendance?.status === "present" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-lg font-semibold capitalize">
                  {todayAttendance?.status || "Absent"}
                </span>
              </div>
              {todayAttendance?.isLate && (
                <Badge variant="destructive" className="mt-2">
                  Late Arrival
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Check In/Out */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Check In/Out</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">In: </span>
                  <span className="font-medium">
                    {todayAttendance?.checkIn
                      ? todayAttendance.checkIn.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not checked in"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Out: </span>
                  <span className="font-medium">
                    {todayAttendance?.checkOut
                      ? todayAttendance.checkOut.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not checked out"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Hours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyHours}h</div>
              <p className="text-xs text-muted-foreground">
                {weeklyHours < 40 ? `${40 - weeklyHours}h remaining` : "Target achieved"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Warning Alert */}
        {weeklyHours < 40 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Work Hours Warning</p>
                  <p className="text-sm text-yellow-700">
                    You are currently {40 - weeklyHours} hours behind the weekly target of 40 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="hours" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hours">Work Hours</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="leaves">My Leaves</TabsTrigger>
          </TabsList>

          {/* Hours Tab */}
          <TabsContent value="hours">
            <WorkHoursSummary employeeId={user.id} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Employee Profile</CardTitle>
                    <CardDescription>Your personal information and employment details</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fetchEmployeeDetails(user.id || user.uid)}
                    disabled={loadingProfile}
                  >
                    {loadingProfile ? "Loading..." : "Refresh Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingProfile ? (
                  <div className="text-center py-8">
                    <p>Loading profile...</p>
                  </div>
                ) : employeeDetails ? (
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="bg-blue-600 text-white text-2xl">
                        {getInitials(employeeDetails.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column: Only show fields that exist */}
                        <div className="space-y-4">
                          {employeeDetails.name && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Full Name</span>
                              </label>
                              <p className="text-lg font-semibold">{employeeDetails.name}</p>
                            </div>
                          )}
                          {employeeDetails.email && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>Email Address</span>
                              </label>
                              <p className="text-lg">{employeeDetails.email}</p>
                            </div>
                          )}
                          {employeeDetails.department && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Building className="h-4 w-4" />
                                <span>Department</span>
                              </label>
                              <p className="text-lg">{employeeDetails.department}</p>
                            </div>
                          )}
                          {employeeDetails.role && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Role</label>
                              <p className="text-lg">{employeeDetails.role}</p>
                            </div>
                          )}
                        </div>
                        {/* Right Column: Only show fields that exist */}
                        <div className="space-y-4">
                          {employeeDetails.id && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Employee ID</label>
                              <p className="text-lg font-mono">{employeeDetails.id}</p>
                            </div>
                          )}
                          {employeeDetails.position && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Position</label>
                              <p className="text-lg">{employeeDetails.position}</p>
                            </div>
                          )}
                          {employeeDetails.phone && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>Phone</span>
                              </label>
                              <p className="text-lg">{employeeDetails.phone}</p>
                            </div>
                          )}
                          {employeeDetails.status && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Status</label>
                              <p className="text-lg">{employeeDetails.status}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Additional Info: Only show fields that exist */}
                      <div className="pt-4 border-t">
                        <div className="space-y-3">
                          {employeeDetails.address && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>Address</span>
                              </label>
                              <p className="text-sm text-gray-700">{employeeDetails.address}</p>
                            </div>
                          )}
                          {employeeDetails.emergencyContact && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                              <p className="text-sm text-gray-700">{employeeDetails.emergencyContact}</p>
                            </div>
                          )}
                          {employeeDetails.skills && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Skills</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {employeeDetails.skills.split(',').map((skill) => (
                                  <span
                                    key={skill.trim()}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {skill.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {employeeDetails.salary && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Salary</label>
                              <p className="text-sm text-gray-700">${employeeDetails.salary}</p>
                            </div>
                          )}
                          {employeeDetails.joinDate && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Join Date</label>
                              <p className="text-sm text-gray-700">{employeeDetails.joinDate}</p>
                            </div>
                          )}
                          {employeeDetails.notes && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Notes</label>
                              <p className="text-sm text-gray-700">{employeeDetails.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>Profile not found. Please contact administrator.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves">
            <Card>
              <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
                <CardDescription>Track your leave application status</CardDescription>
                <Button size="sm" variant="outline" onClick={handleLeaveRefresh} className="ml-2">Refresh</Button>
              </CardHeader>
              <CardContent>
                {myLeaves.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leave requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myLeaves.map((l) => {
                      const formatDate = (d) => {
                        if (!d) return "-";
                        if (typeof d === "string") return d;
                        if (d.toDate) return d.toDate().toLocaleDateString();
                        return d;
                      };
                      return (
                        <div
                          key={l.id}
                          className="p-3 border rounded-md flex items-center justify-between text-sm"
                        >
                          <div>
                            <div className="font-medium">
                              {formatDate(l.fromDate)} → {formatDate(l.toDate)}
                            </div>
                            <div className="text-muted-foreground">{l.reason}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Applied: {l.appliedAt && l.appliedAt.toDate ? l.appliedAt.toDate().toLocaleDateString() : "-"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 min-w-[120px]">
                            <Badge
                              variant={
                                l.status && l.status.toLowerCase() === "approved"
                                  ? "default"
                                  : l.status && l.status.toLowerCase() === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {l.status && l.status.toLowerCase() === "approved"
                                ? "Approved"
                                : l.status && l.status.toLowerCase() === "rejected"
                                ? "Rejected"
                                : "Pending"}
                            </Badge>
                            {l.reviewedAt && l.status && l.status.toLowerCase() !== "pending" && (
                              <span className="text-xs text-gray-500">
                                {l.status && l.status.toLowerCase() === "approved" ? "Accepted" : "Rejected"} by {l.reviewerName || "Admin"} on {l.reviewedAt?.toDate ? l.reviewedAt.toDate().toLocaleDateString() : "-"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

