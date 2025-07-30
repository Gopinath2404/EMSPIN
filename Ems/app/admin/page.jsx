"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Users, Clock, AlertTriangle, TrendingUp, LogOut,
  User, Building
} from "lucide-react";
import { AttendanceOverview } from "../../components/attendance-overview";
import { LeaveRequests } from "../../components/leave-requests";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { EmployeeManagement } from "../../components/employee-management";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateArrivals: 0,
    underHours: 0,
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [cardData, setCardData] = useState([]);
  const router = useRouter();

  // Check admin login
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/employee");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  // Total employees
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "employees"), (snapshot) => {
      const employeeList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStats((prev) => ({
        ...prev,
        totalEmployees: employeeList.length,
      }));
    });
    return () => unsub();
  }, []);

  // Attendance stats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "attendance"), (snapshot) => {
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = snapshot.docs
        .map((doc) => doc.data())
        .filter((rec) => rec.date === today);

      const presentCount = todayRecords.length;
      const lateCount = todayRecords.filter((rec) => rec.isLate).length;

      setStats((prev) => ({
        ...prev,
        presentToday: presentCount,
        lateArrivals: lateCount,
      }));
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div>Loading...</div>;

  const getInitials = (name) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  /** Fetch data based on card click **/
  const handleCardClick = async (type) => {
    setSelectedCard(type);
    let data = [];

    if (type === "employees") {
      const snapshot = await getDocs(collection(db, "employees"));
      data = snapshot.docs.map((doc) => doc.data().name);
    } else if (type === "present") {
      const today = new Date().toISOString().split("T")[0];
      const snapshot = await getDocs(collection(db, "attendance"));
      data = snapshot.docs
        .map((doc) => doc.data())
        .filter((rec) => rec.date === today)
        .map((rec) => `${rec.name} - Check-in: ${rec.checkInTime || "N/A"}`);
    } else if (type === "late") {
      const today = new Date().toISOString().split("T")[0];
      const snapshot = await getDocs(collection(db, "attendance"));
      data = snapshot.docs
        .map((doc) => doc.data())
        .filter((rec) => rec.date === today && rec.isLate)
        .map((rec) => `${rec.name} - Late at: ${rec.checkInTime || "N/A"}`);
    }

    setCardData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Avatar removed */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                <span>•</span>
                <Building className="h-4 w-4" />
                <span>{user.department}</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer" onClick={() => handleCardClick("employees")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer" >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.presentToday}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalEmployees > 0
                  ? ((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)
                  : 0}
                % attendance
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer" >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lateArrivals}</div>
              <p className="text-xs text-muted-foreground">Today's late check-ins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Hours</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.underHours}</div>
              <p className="text-xs text-muted-foreground">{"< 8 hours yesterday"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Modal Dialog */}
        <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCard === "employees"
                  ? "Total Employees"
                  : selectedCard === "present"
                  ? "Present Today"
                  : "Late Arrivals"}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {cardData.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {cardData.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList>
            <TabsTrigger value="employees">Employee Management</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Overview</TabsTrigger>
            <TabsTrigger value="reports">Leave Requests</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="attendance">
                        {/* Attendance Overview Component */}
                        <AttendanceOverview />
          </TabsContent>

          <TabsContent value="reports">
            <LeaveRequests />
          </TabsContent>

          <TabsContent value="profile">
            {/* Add admin profile details here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
