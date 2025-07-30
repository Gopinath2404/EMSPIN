
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Eye } from "lucide-react"
import { db } from "../lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"

const REDIRECT_TO = "/admin"

export function EmployeeManagement() {
  const router = useRouter()
  const [employees, setEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [redirectAfterAdd, setRedirectAfterAdd] = useState(false)

  const [viewEmployee, setViewEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(null)

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    position: "",
    role: "employee",
    salary: "",
    address: "",
    emergencyContact: "",
    skills: "",
    notes: "",
  })

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "employees"))
        const employeeList = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.data().id,
          docId: docSnap.id,
          ...docSnap.data(),
        }))
        setEmployees(employeeList)
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }
    fetchEmployees()
  }, [])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add Employee
  const handleAddEmployee = async () => {
    const { name, email, password, confirmPassword } = newEmployee
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all required fields.")
      return
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    try {
      const q = query(collection(db, "employees"), where("email", "==", email))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        alert("Email already exists! Please use another email.")
        return
      }

      const employee = {
        id: `EMP${String(employees.length + 1).padStart(3, "0")}`,
        ...newEmployee,
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
      }

      const docRef = await addDoc(collection(db, "employees"), employee)
      setEmployees([...employees, { ...employee, docId: docRef.id }])
      localStorage.setItem("lastEmployeeName", newEmployee.name)
      alert("Employee added successfully!")

      setRedirectAfterAdd(true)
      setIsAddDialogOpen(false)
      resetNewEmployee()
    } catch (e) {
      console.error("Error adding employee:", e)
    }
  }

  const resetNewEmployee = () => {
    setNewEmployee({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      department: "",
      position: "",
      role: "employee",
      salary: "",
      address: "",
      emergencyContact: "",
      skills: "",
      notes: "",
    })
  }

  useEffect(() => {
    if (!isAddDialogOpen && redirectAfterAdd) {
      router.push(REDIRECT_TO)
    }
  }, [isAddDialogOpen, redirectAfterAdd, router])

  // Toggle Status
  const toggleEmployeeStatus = async (id) => {
    try {
      const empToUpdate = employees.find((e) => e.id === id)
      if (!empToUpdate?.docId) return

      const newStatus = empToUpdate.status === "active" ? "inactive" : "active"
      await updateDoc(doc(db, "employees", empToUpdate.docId), { status: newStatus })

      setEmployees(
        employees.map((emp) =>
          emp.id === id ? { ...emp, status: newStatus } : emp
        )
      )
    } catch (err) {
      console.error("Error updating employee status:", err)
    }
  }

  // Edit Employee
  const openEditDialog = (employee) => {
    setEditEmployee({ ...employee }) // Pre-fill data
    setIsEditDialogOpen(true)
  }

  const handleEditEmployee = async () => {
    try {
      if (!editEmployee?.docId) return

      const { docId, ...updatedData } = editEmployee
      await updateDoc(doc(db, "employees", docId), updatedData)

      setEmployees(
        employees.map((emp) =>
          emp.id === editEmployee.id ? { ...emp, ...updatedData } : emp
        )
      )

      alert("Employee updated successfully!")
      setIsEditDialogOpen(false)
      setEditEmployee(null)
    } catch (error) {
      console.error("Error updating employee:", error)
    }
  }

  // Delete Employee
  const deleteEmployee = async (id) => {
    try {
      const empToDelete = employees.find((e) => e.id === id)
      if (empToDelete?.docId) {
        await deleteDoc(doc(db, "employees", empToDelete.docId))
      }
      setEmployees(employees.filter((emp) => emp.id !== id))
    } catch (err) {
      console.error("Error deleting employee:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage employee accounts and access permissions</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              {renderEmployeeForm(newEmployee, setNewEmployee)}
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddEmployee}>Add Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Employee Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>{employee.joinDate}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setViewEmployee(employee)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleEmployeeStatus(employee.id)}>
                      {employee.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteEmployee(employee.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* View Employee Details Modal */}
      {viewEmployee && (
        <Dialog open={!!viewEmployee} onOpenChange={() => setViewEmployee(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {renderEmployeeDetails(viewEmployee)}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewEmployee(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Employee Modal */}
      {editEmployee && (
        <Dialog open={isEditDialogOpen} onOpenChange={() => setIsEditDialogOpen(false)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            {renderEmployeeForm(editEmployee, setEditEmployee)}
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditEmployee}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

// Render Employee Form (used for Add & Edit)
function renderEmployeeForm(employee, setEmployee) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" value={employee.name} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" value={employee.email} onChange={(e) => setEmployee({ ...employee, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" value={employee.password} onChange={(e) => setEmployee({ ...employee, password: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input id="confirmPassword" type="password" value={employee.confirmPassword} onChange={(e) => setEmployee({ ...employee, confirmPassword: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={employee.phone} onChange={(e) => setEmployee({ ...employee, phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input id="department" value={employee.department} onChange={(e) => setEmployee({ ...employee, department: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input id="position" value={employee.position} onChange={(e) => setEmployee({ ...employee, position: e.target.value })} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={employee.role} onChange={(e) => setEmployee({ ...employee, role: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="salary">Salary</Label>
          <Input id="salary" value={employee.salary} onChange={(e) => setEmployee({ ...employee, salary: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" value={employee.address} onChange={(e) => setEmployee({ ...employee, address: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="skills">Skills</Label>
          <Textarea id="skills" value={employee.skills} onChange={(e) => setEmployee({ ...employee, skills: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

// Render Employee Details (for view-only modal)
function renderEmployeeDetails(employee) {
  return (
    <div className="space-y-2 text-sm">
      <p><strong>Name:</strong> {employee.name}</p>
      <p><strong>Email:</strong> {employee.email}</p>
      <p><strong>Phone:</strong> {employee.phone || "—"}</p>
      <p><strong>Department:</strong> {employee.department}</p>
      <p><strong>Position:</strong> {employee.position}</p>
      <p><strong>Role:</strong> {employee.role}</p>
      <p><strong>Salary:</strong> {employee.salary || "—"}</p>
      <p><strong>Address:</strong> {employee.address || "—"}</p>
      <p><strong>Skills:</strong> {employee.skills || "—"}</p>
      <p><strong>Status:</strong> {employee.status}</p>
      <p><strong>Join Date:</strong> {employee.joinDate}</p>
    </div>
  )
}
