"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Lock, Mail, Phone, UserCheck, Edit, Save, X, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ResponderProfile {
  id: number;
  username: string;
  name: string;
  contact_number: string;
  status: string;
  last_active: string;
  firstname: string;
  lastname: string;
}

interface SettingsScreenProps {
  user?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  } | null;
}

export default function SettingsScreen({ user }: SettingsScreenProps) {
  const [profile, setProfile] = useState<ResponderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Profile editing form state
  const [editForm, setEditForm] = useState({
    name: "",
    contact_number: "",
    firstname: "",
    lastname: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    contact_number: ""
  })
  const [registrationLoading, setRegistrationLoading] = useState(false)

  // Get current user from props
  const getCurrentUser = () => {
    return user
  }

  const loadProfile = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser?.username) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/responder/profile?username=${encodeURIComponent(currentUser.username)}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm({
          name: data.name || "",
          contact_number: data.contact_number || "",
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        })
      } else if (response.status === 404) {
        // User is not registered as a responder
        setProfile(null)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleEditProfile = async () => {
    if (!profile) return

    // Validate passwords if changing password
    if (editForm.newPassword || editForm.confirmNewPassword) {
      if (!editForm.oldPassword) {
        toast({
          title: "Old Password Required",
          description: "Please enter your current password to change it.",
          variant: "destructive",
        })
        return
      }

      if (editForm.newPassword !== editForm.confirmNewPassword) {
        toast({
          title: "Password Mismatch",
          description: "New passwords do not match. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (editForm.newPassword.length < 6) {
        toast({
          title: "Password Too Short",
          description: "New password must be at least 6 characters long.",
          variant: "destructive",
        })
        return
      }
    }

    setProfileLoading(true)
    try {
      const response = await fetch('/api/responder/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          name: editForm.name,
          contact_number: editForm.contact_number,
          firstname: editForm.firstname,
          lastname: editForm.lastname,
          oldPassword: editForm.oldPassword,
          newPassword: editForm.newPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        setEditing(false)
        // Reset password fields
        setEditForm(prev => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        }))
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update profile.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistrationLoading(true)

    try {
      // Validate passwords match
      if (registrationForm.password !== registrationForm.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Validate password length
      if (registrationForm.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registrationForm.username,
          password: registrationForm.password,
          name: registrationForm.name,
          contact_number: registrationForm.contact_number
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "You have been registered as a responder successfully!",
        })
        
        // Reset form and reload profile
        setRegistrationForm({
          username: "",
          password: "",
          confirmPassword: "",
          name: "",
          contact_number: ""
        })
        await loadProfile()
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to register. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegistrationFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <h2 className="text-xl font-bold">Settings</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <h2 className="text-xl font-bold">Settings</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Responder Profile
          </TabsTrigger>
          <TabsTrigger value="registration" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register New Responder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {profile ? (
            // Show Profile Details
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  Your Profile
                </CardTitle>
                <CardDescription>Your personal information and responder details</CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="firstname"
                          name="firstname"
                          value={editForm.firstname}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Enter your first name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="lastname"
                          name="lastname"
                          value={editForm.lastname}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="name"
                          name="name"
                          value={editForm.name}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Enter your display name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_number">Contact Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="contact_number"
                          name="contact_number"
                          type="tel"
                          value={editForm.contact_number}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Enter your contact number"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="oldPassword"
                          name="oldPassword"
                          type="password"
                          value={editForm.oldPassword}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Enter your current password (required to change password)"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={editForm.newPassword}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          type="password"
                          value={editForm.confirmNewPassword}
                          onChange={handleFormChange}
                          className="pl-9"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditing(false)
                          setEditForm({
                            name: profile.name || "",
                            contact_number: profile.contact_number || "",
                            firstname: profile.firstname || "",
                            lastname: profile.lastname || "",
                            oldPassword: "",
                            newPassword: "",
                            confirmNewPassword: ""
                          })
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleEditProfile}
                        disabled={profileLoading}
                        className="flex-1"
                      >
                        {profileLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Username</Label>
                        <p className="text-sm">{profile.username}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <p className="text-sm capitalize">{profile.status}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">First Name</Label>
                        <p className="text-sm">{profile.firstname || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                        <p className="text-sm">{profile.lastname || "Not set"}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Display Name</Label>
                      <p className="text-sm">{profile.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Contact Number</Label>
                      <p className="text-sm">{profile.contact_number}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Active</Label>
                      <p className="text-sm">{profile.last_active ? new Date(profile.last_active).toLocaleString() : "Never"}</p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setEditing(true)}
                      className="w-full flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Show Registration Form for non-responders
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-slate-600" />
                  Responder Registration
                </CardTitle>
                <CardDescription>Register as an emergency responder to receive alerts and respond to emergencies</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="name"
                        name="name"
                        value={registrationForm.name}
                        onChange={handleRegistrationFormChange}
                        className="pl-9"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="username"
                        name="username"
                        value={registrationForm.username}
                        onChange={handleRegistrationFormChange}
                        className="pl-9"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="contact_number"
                        name="contact_number"
                        type="tel"
                        value={registrationForm.contact_number}
                        onChange={handleRegistrationFormChange}
                        className="pl-9"
                        placeholder="Enter your contact number"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={registrationForm.password}
                        onChange={handleRegistrationFormChange}
                        className="pl-9"
                        placeholder="Enter password (min 6 characters)"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={registrationForm.confirmPassword}
                        onChange={handleRegistrationFormChange}
                        className="pl-9"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={registrationLoading}>
                    {registrationLoading ? "Registering..." : "Register as Responder"}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What happens after registration?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll be added to the responder database</li>
                    <li>• You can toggle your availability status on the home screen</li>
                    <li>• When available, your location will be tracked for emergency dispatch</li>
                    <li>• You'll receive alerts for nearby emergencies</li>
                    <li>• You can navigate to emergency locations using the map</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="registration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-slate-600" />
                Register New Responder
              </CardTitle>
              <CardDescription>Register a new user as an emergency responder</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                You can register additional users as emergency responders. This will create a new account and responder profile.
              </p>
              
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="new-name"
                      name="name"
                      value={registrationForm.name}
                      onChange={handleRegistrationFormChange}
                      className="pl-9"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="new-username"
                      name="username"
                      value={registrationForm.username}
                      onChange={handleRegistrationFormChange}
                      className="pl-9"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-contact_number">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="new-contact_number"
                      name="contact_number"
                      type="tel"
                      value={registrationForm.contact_number}
                      onChange={handleRegistrationFormChange}
                      className="pl-9"
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="new-password"
                      name="password"
                      type="password"
                      value={registrationForm.password}
                      onChange={handleRegistrationFormChange}
                      className="pl-9"
                      placeholder="Enter password (min 6 characters)"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="new-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={registrationForm.confirmPassword}
                      onChange={handleRegistrationFormChange}
                      className="pl-9"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={registrationLoading}>
                  {registrationLoading ? "Registering..." : "Register New Responder"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What happens after registration?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A new user account will be created</li>
                  <li>• The user will be added to the responder database</li>
                  <li>• They can login and manage their availability status</li>
                  <li>• They'll receive alerts for nearby emergencies</li>
                  <li>• They can navigate to emergency locations using the map</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 