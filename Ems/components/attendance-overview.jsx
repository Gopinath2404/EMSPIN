"use client"

// Helper to format Firestore Timestamp or return as-is
function formatDate(val) {
  if (!val) return "-";
  if (val && typeof val === "object" && "seconds" in val && "nanoseconds" in val) {
    const date = new Date(val.seconds * 1000);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
  return val || "-";
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Download, Clock, AlertTriangle, User } from "lucide-react";

import { db } from "../lib/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { LeaveRequests } from "./leave-requests";

export function AttendanceOverview() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [summaryFilter, setSummaryFilter] = useState(null); // null, 'total', 'present', 'late', 'underhours'

  // Fetch employees data
  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, "employees"), (snapshot) => {
      const employeeData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeData);
    });
    return () => unsubEmployees();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "attendance"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Attendance data:", data);
      setAttendance(data);
    });
    return () => unsub();
  }, []);

  // Create a map of userId to employee data for quick lookup
  const employeeMap = employees.reduce((map, emp) => {
    map[emp.id] = emp;
    map[emp.uid] = emp; // Also map by uid if it exists
    return map;
  }, {});

  // Ensure employeeName and employeeId are always present for display
  const normalizedAttendance = attendance.map((record) => {
    const userId = record.userId || record.employeeId || record.id;
    const employee = employeeMap[userId];
    
    let employeeName = employee?.name || record.employeeName || record.name || record.displayName || record.email || "Unknown Employee";
    let employeeId = employee?.id || userId || "-";
    
    return {
      ...record,
      employeeId,
      employeeName,
      department: employee?.department || "Unknown",
    };
  });

  let filteredAttendance = normalizedAttendance.filter((record) => {
    const matchesSearch =
      (record.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Apply summary filter if set
  if (summaryFilter === 'present') {
    filteredAttendance = filteredAttendance.filter((r) => r.checkIn);
  } else if (summaryFilter === 'late') {
    filteredAttendance = filteredAttendance.filter((r) => r.isLate);
  } else if (summaryFilter === 'underhours') {
    filteredAttendance = filteredAttendance.filter((r) => (r.hoursWorked || 0) > 0 && (r.hoursWorked || 0) < 8);
  } else if (summaryFilter === 'total') {
    // Show all employees (no extra filter)
  }

  // Improved status detection
  const getStatusBadge = (status, isLate, hoursWorked, checkIn, checkOut) => {
    if (!checkIn) return <Badge variant="destructive">Absent</Badge>;
    if (checkIn && !checkOut) return <Badge variant="default">Active</Badge>;
    if (checkOut) return <Badge variant="secondary">Inactive</Badge>;
    return <Badge variant="outline">{status || "Unknown"}</Badge>;
  };

  // Dynamic counts
  const presentCount = attendance.filter((r) => r.checkIn).length;
  const lateCount = attendance.filter((r) => r.isLate).length;
  const absentCount = attendance.filter((r) => !r.checkIn).length;
  const avgHours = attendance.length
    ? (attendance.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) / attendance.length).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
              Monitor employee attendance and work hours across the organization
            </CardDescription>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Summary Cards - clickable */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card
            className={summaryFilter === 'total' ? 'ring-2 ring-blue-500' : 'cursor-pointer hover:shadow'}
            onClick={() => setSummaryFilter(summaryFilter === 'total' ? null : 'total')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{normalizedAttendance.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={summaryFilter === 'present' ? 'ring-2 ring-green-500' : 'cursor-pointer hover:shadow'}
            onClick={() => setSummaryFilter(summaryFilter === 'present' ? null : 'present')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-2xl font-bold">{presentCount}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={summaryFilter === 'late' ? 'ring-2 ring-yellow-500' : 'cursor-pointer hover:shadow'}
            onClick={() => setSummaryFilter(summaryFilter === 'late' ? null : 'late')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Late Arrivals</p>
                  <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={summaryFilter === 'underhours' ? 'ring-2 ring-orange-500' : 'cursor-pointer hover:shadow'}
            onClick={() => setSummaryFilter(summaryFilter === 'underhours' ? null : 'underhours')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Under Hours (&lt;8h)</p>
                  <p className="text-2xl font-bold text-orange-600">{normalizedAttendance.filter(r => (r.hoursWorked || 0) > 0 && (r.hoursWorked || 0) < 8).length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((record) => {
              // console.log("Record:", record.employeeName, "checkIn:", record.checkIn, "checkOut:", record.checkOut);
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.employeeId}</TableCell>
                  <TableCell>{record.employeeName}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{formatDate(record.checkIn)}</TableCell>
                  <TableCell>{formatDate(record.checkOut)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{record.hoursWorked || 0}h</span>
                      {record.hoursWorked < 8 && record.hoursWorked > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(
                      record.status,
                      record.isLate,
                      record.hoursWorked,
                      record.checkIn,
                      record.checkOut
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
