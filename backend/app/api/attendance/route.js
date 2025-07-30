import { NextResponse } from "next/server"

// Demo attendance data
const attendanceRecords = [
  {
    id: "ATT001",
    employeeId: "EMP001",
    date: "2024-01-22",
    checkIn: "2024-01-22T09:00:00Z",
    checkOut: "2024-01-22T18:00:00Z",
    hoursWorked: 8.0,
    deviceId: "HIK001",
    authMethod: "fingerprint",
  },
  {
    id: "ATT002",
    employeeId: "EMP002",
    date: "2024-01-22",
    checkIn: "2024-01-22T09:15:00Z",
    checkOut: "2024-01-22T17:45:00Z",
    hoursWorked: 7.5,
    deviceId: "HIK001",
    authMethod: "face",
  },
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get("employeeId")
  const date = searchParams.get("date")

  let filteredRecords = attendanceRecords

  if (employeeId) {
    filteredRecords = filteredRecords.filter((record) => record.employeeId === employeeId)
  }

  if (date) {
    filteredRecords = filteredRecords.filter((record) => record.date === date)
  }

  return NextResponse.json({ attendance: filteredRecords })
}

export async function POST(request) {
  try {
    const attendanceData = await request.json()

    // This would typically come from Hikvision device webhook
    const newRecord = {
      id: `ATT${String(attendanceRecords.length + 1).padStart(3, "0")}`,
      ...attendanceData,
      date: new Date().toISOString().split("T")[0],
    }

    // Calculate hours worked if both check-in and check-out exist
    if (newRecord.checkIn && newRecord.checkOut) {
      const checkInTime = new Date(newRecord.checkIn)
      const checkOutTime = new Date(newRecord.checkOut)
      const diffMs = checkOutTime.getTime() - checkInTime.getTime()
      newRecord.hoursWorked = diffMs / (1000 * 60 * 60) // Convert to hours
    }

    attendanceRecords.push(newRecord)

    // Check if hours worked is less than 8 and send warning
    const warning =
      newRecord.hoursWorked < 8
        ? {
            type: "under_hours",
            message: `Employee worked ${newRecord.hoursWorked} hours, which is less than the required 8 hours.`,
          }
        : null

    return NextResponse.json({
      record: newRecord,
      warning,
      message: "Attendance recorded successfully",
    })
  } catch (error) {
    return NextResponse.json({ message: "Failed to record attendance" }, { status: 500 })
  }
}
