"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { db } from "../lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"

const demoAttendanceData = [
  { date: 1, status: "present", checkIn: "09:00", checkOut: "18:00", hoursWorked: 8 },
  { date: 2, status: "present", checkIn: "09:15", checkOut: "17:45", hoursWorked: 7.5 },
  { date: 3, status: "late", checkIn: "09:30", checkOut: "18:00", hoursWorked: 7.5 },
  { date: 4, status: "present", checkIn: "08:45", checkOut: "17:30", hoursWorked: 7.75 },
  { date: 5, status: "absent" },
  { date: 8, status: "present", checkIn: "09:00", checkOut: "18:00", hoursWorked: 8 },
  { date: 9, status: "present", checkIn: "09:10", checkOut: "17:50", hoursWorked: 7.67 },
  { date: 10, status: "holiday" },
  { date: 11, status: "present", checkIn: "08:55", checkOut: "17:55", hoursWorked: 8 },
  { date: 12, status: "late", checkIn: "09:45", checkOut: "18:00", hoursWorked: 7.25 },
]

export function AttendanceCalendar({ employeeId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)

  // Add these for the picker
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 5; y++) years.push(y);

  const handleMonthYearChange = (e) => {
    const [year, month] = e.target.value.split('-').map(Number);
    setCurrentMonth(new Date(year, month, 1));
  };

  // Fetch real-time attendance data from Firebase
  useEffect(() => {
    if (!employeeId) {
      console.log("[ATTENDANCE DEBUG] No employeeId provided")
      setLoading(false)
      return
    }

    console.log("[ATTENDANCE DEBUG] Fetching data for employeeId:", employeeId)

    // Simplified query - just get all attendance for this employee
    const q = query(
      collection(db, "attendance"),
      where("userId", "==", employeeId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("[ATTENDANCE DEBUG] Received snapshot with", snapshot.docs.length, "documents")
      
      const data = snapshot.docs.map(doc => {
        const docData = doc.data()
        console.log("[ATTENDANCE DEBUG] Document data:", docData)
        
        // Handle different date formats
        let dateObj
        if (docData.date) {
          if (typeof docData.date === 'string') {
            dateObj = new Date(docData.date)
          } else if (docData.date.toDate) {
            dateObj = docData.date.toDate()
          } else {
            dateObj = new Date(docData.date)
          }
        } else {
          console.log("[ATTENDANCE DEBUG] No date found in document")
          return null
        }

        // Check if this record is for the current month
        const currentYear = currentMonth.getFullYear()
        const currentMonthNum = currentMonth.getMonth() + 1
        const recordYear = dateObj.getFullYear()
        const recordMonth = dateObj.getMonth() + 1

        console.log("[ATTENDANCE DEBUG] Comparing dates:", {
          currentYear,
          currentMonthNum,
          recordYear,
          recordMonth,
          dateObj: dateObj.toISOString()
        })

        if (recordYear === currentYear && recordMonth === currentMonthNum) {
          return {
            id: doc.id,
            date: dateObj.getDate(),
            status: docData.checkIn ? (docData.isLate ? "late" : "present") : "absent",
            checkIn: docData.checkIn ? (docData.checkIn.toDate ? docData.checkIn.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : docData.checkIn) : null,
            checkOut: docData.checkOut ? (docData.checkOut.toDate ? docData.checkOut.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : docData.checkOut) : null,
            hoursWorked: docData.hoursWorked || 0,
            isLate: docData.isLate || false,
            ...docData
          }
        }
        return null
      }).filter(item => item !== null)

      console.log("[ATTENDANCE DEBUG] Processed data for current month:", data)
      setAttendanceData(data)
      setLoading(false)
    }, (error) => {
      console.error("[ATTENDANCE DEBUG] Error fetching attendance data:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [employeeId, currentMonth])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAttendanceForDay = (day) => {
    return attendanceData.find((a) => a.date === day) || null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200"
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "absent":
        return "bg-red-100 text-red-800 border-red-200"
      case "holiday":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // Helper to get attendance status for a day
  const getDayStatus = (day) => {
    const attendance = attendanceData.find((a) => a.date === day);
    if (!attendance) return "absent";
    return attendance.isLate ? "late" : "present";
  };

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Attendance Calendar</span>
                </CardTitle>
                <CardDescription>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </CardDescription>
              </div>
              <div className="flex space-x-2 items-center">
                {/* Month/Year Picker */}
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
                  onChange={handleMonthYearChange}
                >
                  {years.map((year) =>
                    monthNames.map((month, idx) => (
                      <option key={`${year}-${idx}`} value={`${year}-${idx}`}>
                        {month} {year}
                      </option>
                    ))
                  )}
                </select>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}> <ChevronLeft className="h-4 w-4" /> </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}> <ChevronRight className="h-4 w-4" /> </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading attendance data...</p>
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No attendance data found for this month.</p>
                <p className="text-xs text-gray-400 mt-1">Check in/out to see your attendance here.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map((day) => (
                    <div key={`empty-${day}`} className="h-12"></div>
                  ))}

                  {days.map((day) => {
                    const status = getDayStatus(day);
                    const attendance = attendanceData.find((a) => a.date === day);
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(attendance)}
                        className={`h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80 ${
                          getStatusColor(status)
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span>Absent</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Day Details</CardTitle>
            <CardDescription>
              {selectedDay ? `Details for day ${selectedDay.date}` : "Select a day to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDay ? (
              <div className="space-y-4">
                <div>
                  <Badge className={getStatusColor(selectedDay.status)}>
                    {selectedDay.status.charAt(0).toUpperCase() + selectedDay.status.slice(1)}
                  </Badge>
                </div>

                {selectedDay.checkIn && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check In</label>
                    <p className="text-lg">{selectedDay.checkIn}</p>
                  </div>
                )}

                {selectedDay.checkOut && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check Out</label>
                    <p className="text-lg">{selectedDay.checkOut}</p>
                  </div>
                )}

                {selectedDay.hoursWorked && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hours Worked</label>
                    <p className="text-lg">{selectedDay.hoursWorked}h</p>
                    {selectedDay.hoursWorked < 8 && (
                      <p className="text-sm text-yellow-600 mt-1">⚠️ Below 8-hour requirement</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click on a calendar day to view attendance details.</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
