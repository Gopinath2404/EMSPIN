import { NextResponse } from "next/server"

// Demo users for authentication
const demoUsers = [
  {
    id: "admin1",
    email: "admin@demo.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    department: "Management",
  },
  {
    id: "emp1",
    email: "employee@demo.com",
    password: "emp123",
    name: "John Doe",
    role: "employee",
    department: "Engineering",
  },
]

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = demoUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Generate demo token
    const token = `demo-token-${user.id}-${Date.now()}`

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
