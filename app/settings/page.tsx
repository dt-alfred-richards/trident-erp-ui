"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Globe,
  Bell,
  Shield,
  Palette,
  Users,
  Database,
  Mail,
  Printer,
  HardDrive,
  FileText,
  Clock,
  Sliders,
} from "lucide-react"
import { useGlobalContext } from "../GlobalContext"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Configure system settings and preferences" />

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 h-auto">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Localization</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="printing" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden md:inline">Printing</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="hidden md:inline">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">Maintenance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="Dhaara Industries" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input id="system-name" defaultValue="Dhaara ERP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@dhaara.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input id="contact-phone" defaultValue="+91 98765 43210" />
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">System Behavior</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-logout">Auto Logout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Switch id="auto-logout" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the system in maintenance mode</p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed error messages and logging</p>
                  </div>
                  <Switch id="debug-mode" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Default Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <select id="default-currency" className="w-full p-2 border rounded-md">
                    <option value="inr">Indian Rupee (₹)</option>
                    <option value="usd">US Dollar ($)</option>
                    <option value="eur">Euro (€)</option>
                    <option value="gbp">British Pound (£)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <select id="default-language" className="w-full p-2 border rounded-md">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="kn">Kannada</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-year-start">Fiscal Year Start</Label>
                  <Input id="fiscal-year-start" type="date" defaultValue="2023-04-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <select id="default-timezone" className="w-full p-2 border rounded-md">
                    <option value="ist">Indian Standard Time (IST)</option>
                    <option value="gmt">Greenwich Mean Time (GMT)</option>
                    <option value="est">Eastern Standard Time (EST)</option>
                    <option value="pst">Pacific Standard Time (PST)</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 cursor-pointer bg-white">
                    <div className="h-20 bg-gray-100 rounded-md mb-2"></div>
                    <p className="text-center font-medium">Light</p>
                  </div>
                  <div className="border rounded-md p-4 cursor-pointer bg-gray-900">
                    <div className="h-20 bg-gray-800 rounded-md mb-2"></div>
                    <p className="text-center font-medium text-white">Dark</p>
                  </div>
                  <div className="border rounded-md p-4 cursor-pointer bg-gradient-to-r from-white to-gray-900">
                    <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-800 rounded-md mb-2"></div>
                    <p className="text-center font-medium">System</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Accent Color</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Default", color: "bg-blue-500" },
                    { name: "Red", color: "bg-red-500" },
                    { name: "Green", color: "bg-green-500" },
                    { name: "Purple", color: "bg-purple-500" },
                    { name: "Orange", color: "bg-orange-500" },
                    { name: "Teal", color: "bg-teal-500" },
                    { name: "Pink", color: "bg-pink-500" },
                    { name: "Indigo", color: "bg-indigo-500" },
                  ].map((item) => (
                    <div key={item.name} className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full ${item.color}`}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Layout</h3>
                <div className="space-y-2">
                  <Label htmlFor="sidebar-position">Sidebar Position</Label>
                  <select id="sidebar-position" className="w-full p-2 border rounded-md">
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout to fit more content</p>
                  </div>
                  <Switch id="compact-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-breadcrumbs">Show Breadcrumbs</Label>
                    <p className="text-sm text-muted-foreground">Display navigation breadcrumbs</p>
                  </div>
                  <Switch id="show-breadcrumbs" defaultChecked />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Branding</h3>
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Logo</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Upload New Logo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon-upload">Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">Icon</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Upload New Favicon
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">System Notifications</h3>
                <div className="space-y-2">
                  {[
                    "Low inventory alerts",
                    "Order status changes",
                    "Production delays",
                    "Shipment updates",
                    "Payment reminders",
                    "System maintenance",
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item}</p>
                        <p className="text-sm text-muted-foreground">Send notifications for {item.toLowerCase()}</p>
                      </div>
                      <Switch id={`notify-${item.replace(/\s+/g, "-").toLowerCase()}`} defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Channels</h3>
                <div className="space-y-2">
                  {[
                    { name: "In-app notifications", id: "in-app" },
                    { name: "Email notifications", id: "email" },
                    { name: "SMS notifications", id: "sms" },
                    { name: "Desktop notifications", id: "desktop" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Enable {item.name.toLowerCase()}</p>
                      </div>
                      <Switch id={`channel-${item.id}`} defaultChecked={item.id !== "sms"} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Schedule</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quiet-hours">Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">Don't send notifications during these hours</p>
                  </div>
                  <Switch id="quiet-hours" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input id="quiet-start" type="time" defaultValue="22:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input id="quiet-end" type="time" defaultValue="08:00" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Password Policy</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="password-expiry">Password Expiry</Label>
                      <p className="text-sm text-muted-foreground">Force password change after a period</p>
                    </div>
                    <Switch id="password-expiry" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-days">Password Expiry Days</Label>
                    <Input id="password-days" type="number" defaultValue="90" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-password-length">Minimum Password Length</Label>
                    <Input id="min-password-length" type="number" defaultValue="8" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-special-chars">Require Special Characters</Label>
                      <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                    </div>
                    <Switch id="require-special-chars" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-numbers">Require Numbers</Label>
                      <p className="text-sm text-muted-foreground">Passwords must contain numbers</p>
                    </div>
                    <Switch id="require-numbers" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enforce-2fa">Enforce 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Require all users to set up two-factor authentication
                    </p>
                  </div>
                  <Switch id="enforce-2fa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="2fa-method">Default 2FA Method</Label>
                  <select id="2fa-method" className="w-full p-2 border rounded-md">
                    <option value="app">Authenticator App</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Session Security</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="concurrent-sessions">Allow Concurrent Sessions</Label>
                    <p className="text-sm text-muted-foreground">Allow users to be logged in from multiple devices</p>
                  </div>
                  <Switch id="concurrent-sessions" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ip-restriction">IP Restriction</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch id="ip-restriction" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                  <Input id="allowed-ips" placeholder="e.g., 192.168.1.1, 10.0.0.0/24" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management Settings</CardTitle>
              <CardDescription>Configure user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">User Registration</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="self-registration">Allow Self-Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow users to create their own accounts</p>
                  </div>
                  <Switch id="self-registration" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-approval">Require Admin Approval</Label>
                    <p className="text-sm text-muted-foreground">New accounts require administrator approval</p>
                  </div>
                  <Switch id="admin-approval" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-verification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify their email address</p>
                  </div>
                  <Switch id="email-verification" defaultChecked />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Default User Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="default-role">Default User Role</Label>
                  <select id="default-role" className="w-full p-2 border rounded-md">
                    <option value="user">Basic User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-department">Default Department</Label>
                  <select id="default-department" className="w-full p-2 border rounded-md">
                    <option value="general">General</option>
                    <option value="sales">Sales</option>
                    <option value="production">Production</option>
                    <option value="inventory">Inventory</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">User Limits</h3>
                <div className="space-y-2">
                  <Label htmlFor="max-users">Maximum Users</Label>
                  <Input id="max-users" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-admins">Maximum Administrators</Label>
                  <Input id="max-admins" type="number" defaultValue="5" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Placeholder content for other tabs */}
        {["localization", "database", "email", "printing", "storage", "logs", "maintenance"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{tab.charAt(0).toUpperCase() + tab.slice(1)} Settings</CardTitle>
                <CardDescription>Configure {tab} settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} settings content will be displayed here
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardShell>
  )
}
