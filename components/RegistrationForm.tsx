'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { User, Lock, Phone, UserCheck } from 'lucide-react'

interface RegistrationFormProps {
  onSuccess?: () => void
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    contact_number: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate passwords match
      if (form.password !== form.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Validate password length
      if (form.password.length < 6) {
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
          username: form.username,
          password: form.password,
          name: form.name,
          contact_number: form.contact_number
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "You have been registered as a responder successfully!",
        })
        
        // Reset form
        setForm({
          username: '',
          password: '',
          confirmPassword: '',
          name: '',
          contact_number: ''
        })
        
        onSuccess?.()
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
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Register as Responder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="contact_number"
                name="contact_number"
                type="tel"
                placeholder="Enter contact number"
                value={form.contact_number}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Responder"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>By registering, you agree to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Provide accurate information</li>
            <li>Maintain availability when marked as "Available"</li>
            <li>Respond to emergency calls promptly</li>
            <li>Keep your location updated for dispatch</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 