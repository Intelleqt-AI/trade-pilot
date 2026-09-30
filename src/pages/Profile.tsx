import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Mail, Phone, MapPin, User } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { patchData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/Navigation"

const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  // Field names must match TradePilotMeSerializer exactly — DRF drops unknown
  // keys silently, so anything invented here is saved nowhere and read back blank.
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    postcode: ""
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        postcode: profile.postcode || ""
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    try {
      setLoading(true)
      
      await patchData({
        url: 'api/v1/tradepilot/auth/me/',
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          postcode: formData.postcode,
        },
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold mb-4">Please sign in to view your profile</h1>
          <Link to="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="flex items-center space-x-2 text-secondary font-semibold mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to home</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.first_name}
                      onChange={(e) => updateFormData("first_name", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) => updateFormData("last_name", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="Your email address"
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed here. Contact support if you need to update your email.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Address Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Two fields, because that is what the API stores: address and
                    postcode. The five-field version here silently lost everything
                    typed into it — none of those names exist on the serializer. */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    placeholder="e.g. 12 Example Street, Reading"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => updateFormData("postcode", e.target.value.toUpperCase())}
                    placeholder="e.g. RG1 1AA"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile