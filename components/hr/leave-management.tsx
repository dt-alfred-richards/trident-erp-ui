"use client"

import type React from "react"

import { useState } from "react"
import { Check, X, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample leave requests
const leaveRequests = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    leaveType: "Sick",
    startDate: "2023-10-15",
    endDate: "2023-10-16",
    days: 2,
    reason: "Not feeling well",
    status: "approved",
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    leaveType: "Vacation",
    startDate: "2023-11-01",
    endDate: "2023-11-05",
    days: 5,
    reason: "Family vacation",
    status: "pending",
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    leaveType: "Personal",
    startDate: "2023-10-25",
    endDate: "2023-10-25",
    days: 1,
    reason: "Personal work",
    status: "pending",
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Sneha Gupta",
    leaveType: "Sick",
    startDate: "2023-10-10",
    endDate: "2023-10-11",
    days: 2,
    reason: "Fever",
    status: "approved",
  },
]

// Sample leave balances
const leaveBalances = [
  {
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    leaveType: "Sick",
    total: 10,
    taken: 2,
    remaining: 8,
  },
  {
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    leaveType: "Vacation",
    total: 15,
    taken: 0,
    remaining: 15,
  },
  {
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    leaveType: "Sick",
    total: 10,
    taken: 0,
    remaining: 10,
  },
  {
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    leaveType: "Vacation",
    total: 15,
    taken: 0,
    remaining: 15,
  },
  {
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    leaveType: "Sick",
    total: 10,
    taken: 0,
    remaining: 10,
  },
  {
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    leaveType: "Vacation",
    total: 15,
    taken: 0,
    remaining: 15,
  },
]

export function LeaveManagement() {
  const [activeTab, setActiveTab] = useState("applications")
  const [selectedLeave, setSelectedLeave] = useState<number | null>(null)
  const [showLeaveDetailsDialog, setShowLeaveDetailsDialog] = useState(false)
  const [showNewLeaveDialog, setShowNewLeaveDialog] = useState(false)
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  })

  const pendingLeaves = leaveRequests.filter((leave) => leave.status === "pending")

  const handleViewLeaveDetails = (id: number) => {
    setSelectedLeave(id)
    setShowLeaveDetailsDialog(true)
  }

  const handleNewLeaveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewLeave((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewLeave((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitLeave = () => {
    // Validation logic would go here
    console.log("New leave request:", newLeave)
    setShowNewLeaveDialog(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const leaveRequest = selectedLeave ? leaveRequests.find((leave) => leave.id === selectedLeave) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-medium">Leave Management</h3>
        <Button onClick={() => setShowNewLeaveDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Leave Applications</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {pendingLeaves.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between border p-4 rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {leave.employeeName} ({leave.employeeId})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()} | {leave.leaveType} Leave
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewLeaveDetails(leave.id)}>
                          Details
                        </Button>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Leave Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.employeeId}</TableCell>
                        <TableCell className="font-medium">{leave.employeeName}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{leave.days}</TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewLeaveDetails(leave.id)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Total Leaves</TableHead>
                      <TableHead>Leaves Taken</TableHead>
                      <TableHead>Leaves Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveBalances.map((balance, index) => (
                      <TableRow key={index}>
                        <TableCell>{balance.employeeId}</TableCell>
                        <TableCell className="font-medium">{balance.employeeName}</TableCell>
                        <TableCell>{balance.leaveType}</TableCell>
                        <TableCell>{balance.total}</TableCell>
                        <TableCell>{balance.taken}</TableCell>
                        <TableCell className="font-medium">{balance.remaining}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Details Dialog */}
      <Dialog open={showLeaveDetailsDialog} onOpenChange={setShowLeaveDetailsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Review the leave request details</DialogDescription>
          </DialogHeader>

          {leaveRequest && (
            <div className="py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Employee</h4>
                    <p>
                      {leaveRequest.employeeName} ({leaveRequest.employeeId})
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Leave Type</h4>
                    <p>{leaveRequest.leaveType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Start Date</h4>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{new Date(leaveRequest.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">End Date</h4>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p>{new Date(leaveRequest.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Duration</h4>
                  <p>
                    {leaveRequest.days} {leaveRequest.days > 1 ? "days" : "day"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Reason</h4>
                  <p>{leaveRequest.reason}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <div>{getStatusBadge(leaveRequest.status)}</div>
                </div>

                {leaveRequest.status === "pending" && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="text-sm font-medium">Manager Comments</h4>
                    <Textarea placeholder="Add comments (optional)" />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {leaveRequest?.status === "pending" ? (
              <>
                <Button variant="outline" onClick={() => setShowLeaveDetailsDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setShowLeaveDetailsDialog(false)}>
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowLeaveDetailsDialog(false)}>
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowLeaveDetailsDialog(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply for Leave Dialog */}
      <Dialog open={showNewLeaveDialog} onOpenChange={setShowNewLeaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Submit a new leave request</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Select value={newLeave.employeeId} onValueChange={(value) => handleSelectChange("employeeId", value)}>
                <SelectTrigger id="employeeId">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMP001">EMP001 - Rajesh Kumar</SelectItem>
                  <SelectItem value="EMP002">EMP002 - Priya Sharma</SelectItem>
                  <SelectItem value="EMP003">EMP003 - Amit Patel</SelectItem>
                  <SelectItem value="EMP004">EMP004 - Sneha Gupta</SelectItem>
                  <SelectItem value="EMP005">EMP005 - Vikram Singh</SelectItem>
                  <SelectItem value="EMP006">EMP006 - Neha Verma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select value={newLeave.leaveType} onValueChange={(value) => handleSelectChange("leaveType", value)}>
                <SelectTrigger id="leaveType">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Vacation">Vacation Leave</SelectItem>
                  <SelectItem value="Personal">Personal Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newLeave.startDate}
                  onChange={handleNewLeaveChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={newLeave.endDate}
                  onChange={handleNewLeaveChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                name="reason"
                value={newLeave.reason}
                onChange={handleNewLeaveChange}
                placeholder="Enter reason for leave"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewLeaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitLeave}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

