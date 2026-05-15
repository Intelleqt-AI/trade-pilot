import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Loader2, Star, Shield, Users, Eye, EyeOff, Check, ChevronsUpDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePost } from '@/hooks/usePost';
import { toast } from '@/lib/toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { UK_LOCATIONS, LOCATION_POSTCODE } from '@/lib/ukLocations';

const TradeRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Step 2: Business Details
    businessName: '',
    businessType: '',
    yearsExperience: '',
    tradeSpecialty: '',
    location: '',
    postcode: '',

    // Step 3: Verification
    hasInsurance: false,
    hasLicense: false,
    agreedToTerms: false,

    // Step 4: Complete
    profileDescription: '',
  });

  const totalSteps = 4;

  const registerMutation = usePost({
    onError: (err: any) => {
      const errors = err?.response?.data?.errors ?? {};
      const msg = errors.email?.[0] || errors.password?.[0] || errors.postcode?.[0] || err?.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    },
  });

  const loading = registerMutation.isPending;

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all required fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.businessName || !formData.tradeSpecialty || !formData.businessType || !formData.postcode) {
        toast.error('Please fill in all required business fields.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.agreedToTerms) {
        toast.error('You must agree to the Terms & Conditions.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Final step — submit all data
      try {
        const res: any = await registerMutation.mutateAsync({
          url: '/api/v1/tradepilot/auth/trade/register/',
          data: {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password,
            password_confirm: formData.confirmPassword,
            phone: formData.phone,
            business_name: formData.businessName,
            business_type: formData.businessType,
            years_experience: formData.yearsExperience,
            trade_specialty: formData.tradeSpecialty,
            location: formData.location,
            postcode: formData.postcode,
            has_insurance: formData.hasInsurance,
            has_license: formData.hasLicense,
            profile_description: formData.profileDescription,
          },
        } as any);
        const pending_token = res?.data?.pending_token;
        navigate(`/verify-email?pending_token=${pending_token}&email=${encodeURIComponent(formData.email)}`);
      } catch {
        // error handled in onError
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const tradeOptions = [
    'Plumber',
    'Electrician',
    'Builder',
    'Roofer',
    'Painter/Decorator',
    'Kitchen Installer',
    'Gas Engineer',
    'Carpenter/Joiner',
    'Tiler',
    'Plasterer',
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-secondary mb-2">Let's get started</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={e => updateFormData('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={e => updateFormData('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => updateFormData('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateFormData('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => updateFormData('password', e.target.value)}
                    placeholder="Create a password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-secondary mb-2">Business Details</h2>
              <p className="text-muted-foreground">Tell us about your trade business</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={e => updateFormData('businessName', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeSpecialty">Primary Trade *</Label>
                <Select onValueChange={value => updateFormData('tradeSpecialty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeOptions.map(trade => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select onValueChange={value => updateFormData('businessType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole-trader">Sole Trader</SelectItem>
                      <SelectItem value="limited-company">Limited Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Select onValueChange={value => updateFormData('yearsExperience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>City / Area</Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        !formData.location ? 'text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      <span className="truncate">{formData.location || 'Select city or area'}</span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search area…" />
                      <CommandList>
                        <CommandEmpty>No area found.</CommandEmpty>
                        {UK_LOCATIONS.map(group => (
                          <CommandGroup key={group.group} heading={group.group}>
                            {group.items.map(item => (
                              <CommandItem
                                key={item}
                                value={item}
                                onSelect={val => {
                                  updateFormData('location', val);
                                  updateFormData('postcode', LOCATION_POSTCODE[val] ?? formData.postcode);
                                  setLocationOpen(false);
                                }}
                              >
                                <Check className={cn('mr-2 h-3.5 w-3.5', formData.location === item ? 'opacity-100' : 'opacity-0')} />
                                {item}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={e => updateFormData('postcode', e.target.value.toUpperCase())}
                  placeholder="e.g. M1 1AE"
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground">Auto-filled from area selection — you can edit it.</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-secondary mb-2">Verification & Requirements</h2>
              <p className="text-muted-foreground">Help us verify your credentials</p>
            </div>

            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="insurance"
                      checked={formData.hasInsurance}
                      onCheckedChange={checked => updateFormData('hasInsurance', checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="insurance" className="text-base font-medium">
                        I have valid public liability insurance *
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum £1M coverage required. You'll need to upload proof later.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="license"
                      checked={formData.hasLicense}
                      onCheckedChange={checked => updateFormData('hasLicense', checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="license" className="text-base font-medium">
                        I have all required trade licenses/certifications
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">Gas Safe, NICEIC, or other relevant trade certifications.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={checked => updateFormData('agreedToTerms', checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="terms" className="text-base font-medium">
                        I agree to the Terms & Conditions and Privacy Policy *
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-secondary mb-2">One last step</h2>
              <p className="text-muted-foreground">Tell customers about your services (optional)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileDescription">About your business</Label>
              <Textarea
                id="profileDescription"
                value={formData.profileDescription}
                onChange={e => updateFormData('profileDescription', e.target.value)}
                placeholder="Describe your experience, specialties, and what makes you stand out..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">This will appear on your public profile. You can update it later.</p>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-3">After creating your account:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
                    <span className="text-sm">Verify your email with the code we send you</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</div>
                    <span className="text-sm">We'll review your application within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</div>
                    <span className="text-sm">Start receiving job leads immediately</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden">
          <img
            src="/lovable-uploads/3ee8a739-9971-4a96-86e1-14de2728d255.png"
            alt="Professional tradesperson"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/40"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="max-w-md mx-auto lg:mx-0">
              <h1 className="text-3xl lg:text-4xl font-bold mb-6">Join the UK's leading trade network</h1>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Get more customers with 5-star reviews</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Trusted by over 50,000 tradespeople</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Connect with local homeowners daily</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Free to join
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  No setup fees
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-8 py-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 text-secondary font-semibold text-sm sm:text-base">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to home</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">{renderStepContent()}</div>

          {/* Footer */}
          <div className="px-4 sm:px-8 py-6 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center justify-center space-x-2 order-2 sm:order-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <Button onClick={nextStep} className="flex items-center justify-center space-x-2 order-1 sm:order-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                <span>{loading ? (currentStep === 4 ? 'Creating Account...' : 'Loading...') : (currentStep === 4 ? 'Create Account' : 'Continue')}</span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>

            {currentStep === 1 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login?type=trade" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeRegistration;
