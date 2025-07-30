import { NextResponse } from "next/server"

// This endpoint receives real-time events from Hikvision device
export async function POST(request) {
  try {
    const eventData = await request.json()

    // Process Hikvision event data
    const {
      deviceId,
      employeeId, // This would be mapped from biometric ID
      eventType, // "check_in" or "check_out"
      timestamp,
      authMethod, // "fingerprint", "face", "nfc"
    } = eventData

    // Create attendance record
    const attendanceRecord = {
      employeeId,
      deviceId,
      authMethod,
      timestamp: new Date(timestamp).toISOString(),
      eventType,
    }

    // Save to database (in real implementation)
    // await saveAttendanceRecord(attendanceRecord)

    // Calculate work hours if this is a check-out event
    if (eventType === "check_out") {
      // Get check-in time for the same day
      // Calculate hours worked
      // Check if < 8 hours and trigger warning
    }

    return NextResponse.json({
      message: "Event processed successfully",
      record: attendanceRecord,
    })
  } catch (error) {
    console.error("Hikvision webhook error:", error)
    return NextResponse.json({ message: "Failed to process event" }, { status: 500 })
  }
}
