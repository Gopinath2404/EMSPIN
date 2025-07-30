import { NextResponse } from "next/server"

// Demo employee data
const employees = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    role: "employee",
    status: "active",
    joinDate: "2023-01-15",
    biometricId: "BIO001",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    role: "employee",
    status: "active",
    joinDate: "2023-02-20",
    biometricId: "BIO002",
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    department: "Sales",
    role: "employee",
    status: "inactive",
    joinDate: "2022-11-10",
    biometricId: "BIO003",
  },
]

export async function GET() {
  return NextResponse.json({ employees })
}

export async function POST(request) {
  try {
    const employeeData = await request.json()

    const newEmployee = {
      id: `EMP${String(employees.length + 1).padStart(3, "0")}`,
      ...employeeData,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      biometricId: `BIO${String(employees.length + 1).padStart(3, "0")}`,
    }

    employees.push(newEmployee)

    return NextResponse.json({
      employee: newEmployee,
      message: "Employee created successfully",
    })
  } catch (error) {
    return NextResponse.json({ message: "Failed to create employee" }, { status: 500 })
  }
}
