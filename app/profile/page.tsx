"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle, Clock, Delete, Edit, FileText, Mail, MapPin, Phone, Shield, TrashIcon, User } from "lucide-react"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Add these imports at the top of the file (after the existing imports)
import { convertDate, formatRelativeTime, getChildObject, getStartedAgo, toCamelCase } from "@/components/generic"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useGlobalContext } from "../../components/GlobalContext"
import { Employee } from "../hr/hr-context"
import { DataByTableName } from "@/components/api"
import { EventLogger, useEvents } from "./events-context"
import { DateInput } from "@/components/ui/reusable-components"

const labelMapper = {
  "v1_login": "Login",
  "v1_inventory": "Inventory",
  "v1_clients": "Clients",
  "v1_driver": "Drivers",
}

const iconMapper: Record<string, ReactNode> = {
  create: <CheckCircle className="h-6 w-6 text-green-500" />,
  password: <Shield className="h-6 w-6 text-orange-500" />,
  update: <Edit className="h-6 w-6 text-blue-500" />,
  delete: <Delete className="h-6 w-6 text-blue-500" />,
  cancelled: <TrashIcon className="h-6 w-6 text-red-500" />,
}

const statusMapper: Record<string, string> = {
  "create": "Created",
  "update": "Updated",
  "delete": "Deleted"
}

export default function ProfilePage() {
  const { user = {}, saveUser, sessionInfo, tokenDetails, logout = () => { }, logoutSession } = useGlobalContext()
  const fetchRef = useRef(true)
  const [activeTab, setActiveTab] = useState("account")
  const [avatarSrc, setAvatarSrc] = useState("/placeholder.svg?height=96&width=96")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showActivityLog, setShowActivityLog] = useState(false)

  const processTableName = (str: string) => {
    const replaced = str.replace('v1', "")
      .split("_")
      .filter(item => item);
    return replaced.join(" ")
  }

  const [userDetails, setUserDetails] = useState<Partial<Employee>>({})

  console.log({ userDetails })

  const eventsInstance = new DataByTableName("events_logger");
  const [eventsLogger, setEventsLogger] = useState<EventLogger[]>([])

  useEffect(() => {
    eventsInstance.get().then((res) => {
      const responseData = getChildObject(res, "data", []);
      setEventsLogger(responseData)
    })
  }, [])

  const updateUser = (event: any) => {
    setUserDetails(p => ({
      ...p,
      [getChildObject(event, "target.name", "")]: getChildObject(event, "target.value")
    }))
  }

  const latestLogin = useMemo(() => {
    return (eventsLogger || []).filter(item => item.tableName === "v1_login").sort((a, b) => new Date(b?.createdOn)?.getTime() - new Date(a?.createdOn)?.getTime())[0];
  }, [eventsLogger])
  const passwordLoggers = useMemo(() => {
    return (eventsLogger || []).filter(item => item.tableName === "v1_employee" && (item?.payload || '').includes("password")).sort((a, b) => new Date(b?.createdOn)?.getTime() - new Date(a?.createdOn)?.getTime());
  }, [eventsLogger])


  const passwordLogIds = useMemo(() => {
    return passwordLoggers.map(item => item.id)
  }, [passwordLoggers])


  // Full activity log data - this would come from your API in a real application
  const fullActivityLog = useMemo(() => {
    return ([
      {
        action: "Logged in",
        details: latestLogin?.fieldValue || '',
        time: formatRelativeTime(getChildObject(latestLogin, 'createdOn', '')),
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      },
      ...eventsLogger.filter(item => item.tableName !== "v1_login" && !passwordLogIds.includes(item.id)).map(item => {
        return ({
          action: processTableName(item.tableName),
          details: item.fieldValue === "cancelled" ? "Cancelled" : item.category,
          time: formatRelativeTime(item.createdOn),
          icon: iconMapper[item.fieldValue] || iconMapper[item.category],
        })
      }), {
        action: "Password changed",
        details: "Security update",
        time: formatRelativeTime(getChildObject(passwordLoggers, '0.createdOn', '')),
        icon: <Shield className="h-6 w-6 text-orange-500" />,
      }
    ])
  }, [eventsLogger])

  useEffect(() => {
    setFilteredActivityLog(fullActivityLog)
  }, [fullActivityLog])

  useEffect(() => {
    if (Object.values(user).length === 0 || !fetchRef.current) return
    setUserDetails(user)
    fetchRef.current = false
  }, [user])

  const onAccountSave = () => {
    if (!saveUser) return
    saveUser(userDetails)?.then(res => {
      alert("User saved successfully")
    })
  }

  // Add these state variables inside the ProfilePage component (after the existing state variables)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [filteredActivityLog, setFilteredActivityLog] = useState(fullActivityLog)

  const handleEditProfilePicture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a URL for the selected file
      const imageUrl = URL.createObjectURL(file)
      setAvatarSrc(imageUrl)

      // In a real application, you would upload the file to your server here
      // and update the avatar with the returned URL
      console.log("File selected:", file.name)
    }
  }

  // Add this function inside the ProfilePage component (before the return statement)
  const filterActivitiesByDate = () => {
    if (!dateRange.from && !dateRange.to) {
      setFilteredActivityLog(fullActivityLog)
      return
    }

    const filtered = fullActivityLog.filter((activity) => {
      const activityDate = new Date(activity.time.replace(/Today, |Yesterday, /g, ""))

      // Handle relative dates like "Today" and "Yesterday"
      if (activity.time.includes("Today")) {
        activityDate.setFullYear(new Date().getFullYear())
        activityDate.setMonth(new Date().getMonth())
        activityDate.setDate(new Date().getDate())
      } else if (activity.time.includes("Yesterday")) {
        activityDate.setFullYear(new Date().getFullYear())
        activityDate.setMonth(new Date().getMonth())
        activityDate.setDate(new Date().getDate() - 1)
      }

      // If only from date is set
      if (dateRange.from && !dateRange.to) {
        return activityDate >= dateRange.from
      }

      // If only to date is set
      if (!dateRange.from && dateRange.to) {
        return activityDate <= dateRange.to
      }

      // If both dates are set
      return activityDate >= dateRange.from! && activityDate <= dateRange.to!
    })

    setFilteredActivityLog(filtered)
  }

  // Add this useEffect to update filtered activities when dateRange changes
  useEffect(() => {
    filterActivitiesByDate()
  }, [dateRange])

  const getAttributes = (key: keyof Employee, isCheckBox: boolean = false) => {
    const rawValue = getChildObject(userDetails, key, isCheckBox ? true : "");
    const value = rawValue === null ? "" : rawValue; // convert null to empty string

    return {
      name: key,
      value: isCheckBox ? !!value : value, // for checkboxes, use boolean
      onChange: (e: any) => {
        updateUser({
          target: {
            name: e.target.name,
            value: isCheckBox ? e.target.checked : e.target.value
          }
        });
      }
    };
  };


  const [tempPassword, setTempPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState('')

  const userPassword = useMemo(() => getChildObject(tokenDetails, 'password', ''), [tokenDetails])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Summary Card */}
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="@admin" />
                <AvatarFallback className="text-2xl">AD</AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm hover:bg-primary/90 transition-colors"
                aria-label="Edit profile picture"
                onClick={handleEditProfilePicture}
              >
                <Edit className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                aria-label="Upload profile picture"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">Administrator</h2>
              <p className="text-sm text-muted-foreground">System Administrator</p>
              <Badge className="mt-2" variant="outline">
                Active
              </Badge>
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{userDetails?.emailId || ""}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{userDetails?.contactNumber || ""}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{[userDetails?.city, userDetails?.country].filter(item => item).join(",")}</span>
              </div>
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm">{convertDate(userDetails?.createdOn)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last login</span>
                <span className="text-sm">{formatRelativeTime(userDetails.loggedOn)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="md:w-2/3">
          <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4 p-1 bg-muted dark:bg-muted">
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] transition-all"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger
                value="basic-info"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] transition-all"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] transition-all"
              >
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] transition-all"
              >
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] transition-all"
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Emp-ID</Label>
                    <Input id="username" defaultValue="admin" name="id" value={userDetails?.id || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">First Name</Label>
                    <Input id="display-name" defaultValue="Administrator" name="firstName" value={userDetails?.firstName || ""} onChange={updateUser} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Last Name</Label>
                    <Input id="display-name" defaultValue="Administrator" name="firstName" value={userDetails?.lastName || ""} onChange={updateUser} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      value={userDetails?.bio || ""}
                      name="bio"
                      onChange={updateUser}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select id="language" value={userDetails?.language || ""} name="language" onChange={updateUser} className="w-full p-2 border rounded-md">
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="kn">Kannada</option>
                          <option value="ta">Tamil</option>
                          <option value="te">Telugu</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select id="timezone" className="w-full p-2 border rounded-md" value={userDetails?.timezone || ""} name="timezone" onChange={updateUser}>
                          <option value="ist">Indian Standard Time (IST)</option>
                          <option value="gmt">Greenwich Mean Time (GMT)</option>
                          <option value="est">Eastern Standard Time (EST)</option>
                          <option value="pst">Pacific Standard Time (PST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-[#1b84ff] text-[#ffffff] hover:bg-[#1b84ff]/90" onClick={onAccountSave}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Basic Info Tab */}
            <TabsContent value="basic-info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your personal and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date-of-birth">Date of Birth</Label>
                        <Input id="date-of-birth" type="date" defaultValue="1985-06-15" name="dob" value={userDetails?.dob || ""} onChange={updateUser} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select id="gender" className="w-full p-2 border rounded-md" {...getAttributes("gender")}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blood-group">Blood Group</Label>
                        <select id="blood-group" className="w-full p-2 border rounded-md" {...getAttributes("bloodGroup")}>
                          <option value="a+">A+</option>
                          <option value="a-">A-</option>
                          <option value="b+">B+</option>
                          <option value="b-">B-</option>
                          <option value="ab+">AB+</option>
                          <option value="ab-">AB-</option>
                          <option value="o+">O+</option>
                          <option value="o-">O-</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input id="nationality" defaultValue="Indian" {...getAttributes("nationality")} />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-email">Email id</Label>
                        <Input id="primary-email" type="email" defaultValue="admin@dhaara.com" {...getAttributes("emailId")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary-email">Personal Email</Label>
                        <Input id="secondary-email" type="email" defaultValue="" placeholder="Add a backup email" {...getAttributes("personalEmail")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile-number">Mobile Number</Label>
                        <Input id="mobile-number" defaultValue="+91 98765 43210" {...getAttributes("contactNumber")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work-phone">Work Phone</Label>
                        <Input id="work-phone" defaultValue="+91 80 4567 8901" {...getAttributes("workPhone")} />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Address Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="address-line1">Address</Label>
                      <Input id="address-line1" defaultValue="123 Tech Park" {...getAttributes("address")} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" defaultValue="Bangalore" {...getAttributes("city")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" defaultValue="Karnataka" {...getAttributes("state")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal-code">Postal Code</Label>
                        <Input id="postal-code" defaultValue="560100" {...getAttributes("postalCode")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <select id="country" className="w-full p-2 border rounded-md" defaultValue={undefined}  {...getAttributes("country")}>
                        <option value="india">India</option>
                        <option value="usa">United States</option>
                        <option value="uk">United Kingdom</option>
                        <option value="canada">Canada</option>
                        <option value="australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="System Administrator" {...getAttributes("role")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <select id="department" className="w-full p-2 border rounded-md" {...getAttributes("department")}>
                          <option value="it">IT & Systems</option>
                          <option value="finance">Finance</option>
                          <option value="hr">Human Resources</option>
                          <option value="production">Production</option>
                          <option value="sales">Sales</option>
                          <option value="procurement">Procurement</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employment-type">Employment Type</Label>
                        <select id="employment-type" className="w-full p-2 border rounded-md" {...getAttributes("employeeType")}>
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="temporary">Temporary</option>
                          <option value="intern">Intern</option>
                          <option value="consultant">Consultant</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="working-hours">Average Working Hours</Label>
                        <Input id="working-hours" defaultValue="40" {...getAttributes("averageWorkingHours")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shift-duration">Shift Duration</Label>
                        <select id="shift-duration" className="w-full p-2 border rounded-md" {...getAttributes("shiftDuration")}>
                          <option value="8">8 Hours</option>
                          <option value="9">9 Hours</option>
                          <option value="10">10 Hours</option>
                          <option value="12">12 Hours</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Salary Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Salary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" defaultValue="₹1,200,000" {...getAttributes("salary")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base-pay">Base Pay</Label>
                        <Input id="base-pay" defaultValue="₹100,000" {...getAttributes("basePay")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthly-payment">Monthly Payment</Label>
                        <select id="monthly-payment" className="w-full p-2 border rounded-md" {...getAttributes("monthlyPayment")}>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pay-cycle">Pay Cycle</Label>
                        <select id="pay-cycle" className="w-full p-2 border rounded-md" {...getAttributes("payCycle")}>
                          <option value="monthly">Monthly</option>
                          <option value="bi-weekly">Bi-Weekly</option>
                          <option value="weekly">Weekly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Identifications and Banking */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Identifications and Banking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aadhaar-number">Aadhaar Number</Label>
                        <Input id="aadhaar-number" defaultValue="1234 5678 9012" {...getAttributes("aadhaarNumber")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan-number">PAN Number</Label>
                        <Input id="pan-number" defaultValue="ABCDE1234F" {...getAttributes("panNumber")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uan-number">UAN Number</Label>
                        <Input id="uan-number" defaultValue="123456789012" {...getAttributes("uanNumber")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input id="bank-name" defaultValue="State Bank of India" {...getAttributes("bankName")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-branch">Bank Branch</Label>
                        <Input id="bank-branch" defaultValue="Electronic City" {...getAttributes("bankBranch")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input id="account-number" defaultValue="1234567890" {...getAttributes("accountNumber")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifsc-code">IFSC Code</Label>
                        <Input id="ifsc-code" defaultValue="SBIN0012345" {...getAttributes("ifscCode")} />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Leaves Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Leaves</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="total-leaves">Total Leaves</Label>
                        <Input id="total-leaves" defaultValue="24" {...getAttributes("leaves")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="earned-leaves">Earned Leaves</Label>
                        <Input id="earned-leaves" defaultValue="18" {...getAttributes("earnedLeaves")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="used-leaves">Used Leaves</Label>
                        <Input id="used-leaves" defaultValue="12" {...getAttributes("usedLeaves")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="balance-leaves">Balance Leaves</Label>
                        <Input id="balance-leaves" defaultValue="12" disabled value={(userDetails?.leaves || 0) - (userDetails?.usedLeaves || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sunday-holiday">Sunday Holiday</Label>
                        <select id="sunday-holiday" className="w-full p-2 border rounded-md" {...getAttributes("sundayOn")}>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-[#1b84ff] text-[#ffffff] hover:bg-[#1b84ff]/90" onClick={onAccountSave}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Change Password</h3>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Current Password</Label>
                      <Input id="new-password" type="text" value={currentPassword} onChange={(event) => {
                        setCurrentPassword(event.target.value)
                      }} />
                      {
                        currentPassword && currentPassword !== userPassword && <div style={{ color: "red" }}>Current  Password doesnt match</div>
                      }
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" value={tempPassword} onChange={(event) => {
                        setTempPassword(event.target.value)
                      }} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => {
                        setConfirmPassword(event.target.value)
                      }} />
                    </div>
                    {
                      tempPassword !== confirmPassword && <div style={{ color: "red" }}>Password doesnt match</div>
                    }
                    <Button
                      disabled={currentPassword !== userPassword}
                      className="bg-[#725af2] text-[#ffffff] hover:bg-[#725af2]/90" onClick={() => {
                        if (!saveUser) return;
                        saveUser({ password: tempPassword, employeeId: userDetails.employeeId })?.then(res => {
                          alert("Password changed successfully")
                        })
                      }}>Update Password</Button>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{`Two-factor authentication is ${userDetails?.twoFactor ? "disabled" : "enabled"}`}</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" onClick={() => {
                        if (!saveUser) return;
                        saveUser({ twoFactor: userDetails?.twoFactor ? false : true, employeeId: userDetails.employeeId })?.then(res => {
                          // alert("Password changed successfully")
                        })
                      }}>{!userDetails?.twoFactor ? "Disabled" : "Enabled"}</Button>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Active Sessions</h3>
                    <div className="space-y-4">
                      {
                        sessionInfo.map(item => {
                          return <div className="flex items-center justify-between" key={item.id}>
                            <div>
                              <p className="font-medium">{tokenDetails.sessionId === item.sessionId ? "Current Session" : "Session"}</p>
                              <p className="text-sm text-muted-foreground">{`${[item.location, item.deviceInfo].filter(item => item).join(", ")}`}</p>
                              <p className="text-xs text-muted-foreground">{getStartedAgo(item.createdOn)}</p>
                            </div>
                            {
                              tokenDetails.sessionId === item.sessionId ? <Badge>Active</Badge> :
                                <Button variant="outline" size="sm" onClick={() => logoutSession?.(item.sessionId)}>
                                  Sign Out
                                </Button>
                            }
                          </div>
                        })
                      }
                    </div>
                    <Button variant="outline" onClick={() => logout()}>Sign Out All Devices</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <div className="space-y-2">
                      {[
                        "System alerts",
                        "Order updates",
                        "Production status changes",
                        "Inventory alerts",
                        "Financial reports",
                      ].map((item) => (
                        <div key={item} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item}</p>
                            <p className="text-sm text-muted-foreground">
                              Receive email notifications for {item.toLowerCase()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`email-${item.replace(/\s+/g, "-").toLowerCase()}`}
                              {...getAttributes(toCamelCase(item) as keyof Employee, true)}
                            />
                            <Label htmlFor={`email-${item.replace(/\s+/g, "-").toLowerCase()}`} className="sr-only">
                              {item}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">In-App Notifications</h3>
                    <div className="space-y-2">
                      {["Task assignments", "Mentions", "Comments", "Approvals", "System updates"].map((item) => (
                        <div key={item} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item}</p>
                            <p className="text-sm text-muted-foreground">
                              Receive in-app notifications for {item.toLowerCase()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`app-${item.replace(/\s+/g, "-").toLowerCase()}`}
                              {...getAttributes(toCamelCase(item) as keyof Employee, true)}
                            />
                            <Label htmlFor={`app-${item.replace(/\s+/g, "-").toLowerCase()}`} className="sr-only">
                              {item}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Schedule</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Quiet Hours</p>
                          <p className="text-sm text-muted-foreground" >Don't send notifications during these hours</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="quiet-hours" {...getAttributes("quietHours", true)} />
                          <Label htmlFor="quiet-hours" className="sr-only">
                            Quiet Hours
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiet-start">Start Time</Label>
                          <Input id="quiet-start" type="time" defaultValue="22:00" {...getAttributes("startTime")} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiet-end">End Time</Label>
                          <Input id="quiet-end" type="time" defaultValue="08:00" {...getAttributes("endTime")} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button className="bg-[#1b84ff] text-[#ffffff] hover:bg-[#1b84ff]/90" onClick={onAccountSave}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Activity</CardTitle>
                  <CardDescription>Recent activity on your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[...filteredActivityLog.filter(item => item.action !== "Password Changed").slice(0, 4), {
                      action: "Password changed",
                      details: "Security update",
                      time: formatRelativeTime(getChildObject(passwordLoggers, '0.createdOn', '')),
                      icon: <Shield className="h-6 w-6 text-orange-500" />,
                    }].map((item, index) => (
                      <div key={index} className="flex">
                        <div className="mr-4 flex-shrink-0">{item.icon}</div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <p className="font-medium" style={{ textTransform: "capitalize" }}>{item.action}</p>
                            <span className="text-sm text-muted-foreground">{item.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground" style={{ textTransform: "capitalize" }}>{statusMapper[item.details] || item.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#725af2] text-[#ffffff] hover:bg-[#725af2]/90"
                    onClick={() => setShowActivityLog(true)}
                  >
                    View Full Activity Log
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Activity Log Dialog */}

      <Dialog open={showActivityLog} onOpenChange={setShowActivityLog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Full Activity Log</DialogTitle>
            <DialogDescription>Complete history of account activity</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="date-from">From Date</Label>
              <DateInput
                selectedDate={dateRange.from}
                setState={value => {
                  setDateRange(prev => ({ ...prev, from: value } as any));
                }}
              />
            </div>

            <div className="flex-1 space-y-1">
              <Label htmlFor="date-to">To Date</Label>
              <DateInput
                selectedDate={dateRange.to}
                setState={value => {
                  setDateRange(prev => ({ ...prev, to: value } as any));
                }}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setDateRange({ from: undefined, to: undefined })
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {filteredActivityLog.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No activities found for the selected date range
            </div>
          ) : (
            <div className="relative">
              <ScrollArea className="h-[50vh] pr-4 -mr-6">
                <div className="space-y-4 py-2 pr-6">
                  {filteredActivityLog.map((item, index) => (
                    <div key={index} className="flex border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                      <div className="mr-4 flex-shrink-0">{item.icon}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium truncate" style={{ textTransform: 'capitalize' }}>{item.action}</p>
                          <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground" style={{ textTransform: "capitalize" }}>{statusMapper[item.details] || item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
