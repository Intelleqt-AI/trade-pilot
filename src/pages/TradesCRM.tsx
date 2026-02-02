import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  Bell,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Video,
  LayoutDashboard,
  ShoppingCart,
  Star,
  Headphones,
  LogOut,
  CreditCard,
  Home,
  Coins,
  Search,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Zap,
  TrendingDown,
  FileText,
  Award,
  Plus,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TradeJobs from '@/components/Trade-CRM/TradeJobs';
import TradeLeads from '@/components/Trade-CRM/TradeLeads';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchJobs, fetchLeads, updateProfile } from '@/lib/api';
import LeadPurchase from '@/components/Trade-CRM/LeadPurchase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const TradesCRM = () => {
  const { isAuthenticated, loading, isTrade, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);

  // Personal Information State
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  // Business Information State
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [tradeSpecialty, setTradeSpecialty] = useState(profile?.trade_specialty || '');
  const [businessType, setBusinessType] = useState(profile?.business_type || '');
  const [yearsExperience, setYearsExperience] = useState(profile?.years_experience || '');
  const [postcode, setPostcode] = useState(profile?.postcode || '');
  const [profileDescription, setProfileDescription] = useState(profile?.profile_description || '');
  const [addressLine1, setAddressLine1] = useState(profile?.address_line_1 || '');
  const [addressLine2, setAddressLine2] = useState(profile?.address_line_2 || '');
  const [city, setCity] = useState(profile?.city || '');
  const [county, setCounty] = useState(profile?.county || '');
  const [hasInsurance, setHasInsurance] = useState(profile?.has_insurance || false);
  const [hasLicense, setHasLicense] = useState(profile?.has_license || false);

  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsErros,
    refetch: refetchLeads,
  } = useQuery({
    queryKey: ['fetchLeads'],
    queryFn: fetchLeads,
  });
  
  console.log('profile',profile)

  // Update state when profile changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setBusinessName(profile.business_name || '');
      setTradeSpecialty(profile.trade_specialty || '');
      setBusinessType(profile.business_type || '');
      setYearsExperience(profile.years_experience || '');
      setPostcode(profile.postcode || '');
      setProfileDescription(profile.profile_description || '');
      setAddressLine1(profile.address_line_1 || '');
      setAddressLine2(profile.address_line_2 || '');
      setCity(profile.city || '');
      setCounty(profile.county || '');
      setHasInsurance(profile.has_insurance || false);
      setHasLicense(profile.has_license || false);
    }
  }, [profile]);

  useEffect(() => {
    if (leadsLoading) return;
    const userLeads = profile?.leads || [];
    const filterByLocation = leadsData.filter(item => item.location == profile?.postcode);
    setFilteredLeads(filterByLocation.filter(lead => userLeads.includes(Number(lead.id))));
  }, [leadsLoading, leadsData, profile]);

  const { data: jobsData, isLoading } = useQuery({ queryKey: ['Jobs'], queryFn: fetchJobs });

  // Profile update mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const handleSavePersonalInfo = () => {
    updateProfileMutation.mutate({
      id: profile?.id,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
    });
  };

  const handleSaveBusinessInfo = () => {
    updateProfileMutation.mutate({
      id: profile?.id,
      business_name: businessName,
      trade_specialty: tradeSpecialty,
      business_type: businessType,
      years_experience: yearsExperience,
      postcode: postcode,
      profile_description: profileDescription,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city: city,
      county: county,
      has_insurance: hasInsurance,
      has_license: hasLicense,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect non-trade users to customer dashboard
  if (!isTrade) {
    return <Navigate to="/dashboard" replace />;
  }

  // Navigation items for sidebar - Main section
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'leads', label: 'My Leads', icon: Users },
  ];

  // Navigation items for sidebar - Secondary section
  const secondaryNavItems = [
    { id: 'settings', label: 'My Profile', icon: FileText },
    { id: 'leads to purchase', label: 'Credits', icon: Coins },
    { id: 'account-settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help Centre', icon: HelpCircle },
  ];

  // Calculate dynamic stats
  const creditBalance = profile?.credit ?? 0;
  const jobsNearYou = leadsData?.filter(item => item.location === profile?.postcode).length ?? 0;
  const activeLeadsCount = filteredLeads?.length ?? 0;
  const pendingTasks = jobsData?.filter(job => job.status !== 'complete').length ?? 0;
  const completedJobs = jobsData?.filter(job => job.status === 'complete').length ?? 0;
  const totalJobs = jobsData?.length ?? 0;
  const responseRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  // Profile completeness check
  const isProfileComplete = !!(
    profile?.first_name &&
    profile?.last_name &&
    profile?.trade_specialty &&
    profile?.postcode &&
    profile?.phone
  );
  const hasServicesSet = !!profile?.trade_specialty;
  const hasAreaSet = !!profile?.postcode;
  const hasCredits = creditBalance > 0;
  const isVerified = profile?.has_insurance || profile?.has_license;

  // Contextual banner logic
  const getBannerContent = () => {
    if (creditBalance === 0) {
      return {
        type: 'warning',
        message: "You're out of credits - top up to keep receiving leads",
        cta: 'Buy Credits',
        icon: AlertTriangle,
        action: () => setActiveTab('leads to purchase')
      };
    }
    if (creditBalance < 50 && creditBalance > 0) {
      return {
        type: 'info',
        message: `${creditBalance} credits remaining - top up before they run out`,
        cta: 'Top Up',
        icon: Coins,
        action: () => setActiveTab('leads to purchase')
      };
    }
    if (jobsNearYou > 0) {
      return {
        type: 'success',
        message: `${jobsNearYou} new jobs matching your services in your area`,
        cta: 'View Jobs',
        icon: Zap,
        action: () => setActiveTab('leads to purchase')
      };
    }
    if (!isProfileComplete) {
      return {
        type: 'neutral',
        message: 'Complete your profile to appear higher in homeowner searches',
        cta: 'Complete Profile',
        icon: FileText,
        action: () => setActiveTab('settings')
      };
    }
    return null;
  };

  const bannerContent = getBannerContent();

  // Enhanced stats for dashboard cards
  const dashboardStats = [
    {
      title: 'Credit Balance',
      value: creditBalance,
      subtitle: creditBalance === 0 ? 'Top up to get leads' : creditBalance < 50 ? 'Running low' : 'Credits available',
      icon: Coins,
      color: 'bg-teal-50',
      iconColor: 'text-teal-600',
      trend: null,
      variant: creditBalance === 0 ? 'warning' : creditBalance < 50 ? 'highlight' : 'default',
      action: () => setActiveTab('leads to purchase'),
      actionLabel: 'Top Up'
    },
    {
      title: 'Jobs Near You',
      value: jobsNearYou,
      subtitle: jobsNearYou > 0 ? `${jobsNearYou} available now` : 'None in your area',
      icon: MapPin,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: jobsNearYou > 0 ? { direction: 'up', value: 'New' } : null,
      variant: jobsNearYou > 0 ? 'highlight' : 'default',
      action: () => setActiveTab('leads to purchase'),
      actionLabel: 'Browse'
    },
    {
      title: 'Active Leads',
      value: activeLeadsCount,
      subtitle: activeLeadsCount > 0 ? 'Currently working' : 'No active leads',
      icon: Users,
      color: 'bg-sky-50',
      iconColor: 'text-sky-600',
      trend: null,
      variant: 'default',
      action: () => setActiveTab('leads'),
      actionLabel: 'View All'
    },
    {
      title: 'Profile Completion',
      value: '60%',
      subtitle: 'Complete your profile',
      icon: Award,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: null,
      variant: 'default',
      action: () => setActiveTab('settings'),
      actionLabel: 'Complete',
      isPieChart: true,
      percentage: 60
    },
  ];

  const upcomingAppointments = [];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 capitalize';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 capitalize';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 capitalize';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 capitalize';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-secondary tracking-tight">Trade </span>
            <span className="relative">
              <span className="text-accent absolute -top-2.5 left-0 text-xs font-bold" style={{ transform: 'rotate(-15deg)' }}>✓</span>
              <span className="text-xl font-bold text-secondary tracking-tight">Pilot</span>
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 flex flex-col">
          {/* Main Navigation */}
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Spacer */}
          <div className="my-4 border-t border-slate-200"></div>

          {/* Secondary Navigation */}
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Push Sign Out to bottom */}
          <div className="flex-1"></div>
        </nav>

        {/* Sign Out Section */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Welcome back</p>
                  <h1 className="text-xl font-bold text-slate-800">Ben</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Secondary Button - Outlined Style */}
              <Button
                variant="outline"
                className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold px-5 py-2"
                onClick={() => setActiveTab('leads')}
              >
                View Leads
              </Button>
              {/* Primary Button - Filled Style like "Join as a Trade" */}
              <Button
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-5 py-2 shadow-md"
                onClick={() => setActiveTab('leads to purchase')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
              <Button variant="outline" size="icon" className="relative border-slate-300">
                <Bell className="h-4 w-4 text-slate-600" />
                {(jobsData?.filter(job => job.status !== 'complete').length ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {jobsData?.filter(job => job.status !== 'complete').length ?? 0}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="icon" className="border-slate-300" onClick={() => setActiveTab('settings')}>
                <Settings className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Contextual Smart Banner - Only shows when relevant */}
              {bannerContent && (
                <Card className={`border-none shadow-sm ${
                  bannerContent.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                  bannerContent.type === 'success' ? 'bg-gradient-to-r from-primary to-primary/80' :
                  bannerContent.type === 'info' ? 'bg-gradient-to-r from-sky-500 to-sky-600' :
                  'bg-gradient-to-r from-secondary to-secondary/90'
                } text-white`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          bannerContent.type === 'warning' ? 'bg-white/20' : 'bg-white/20'
                        }`}>
                          <bannerContent.icon className="h-5 w-5" />
                        </div>
                        <p className="font-medium">{bannerContent.message}</p>
                      </div>
                      <Button
                        className={`font-semibold px-5 shrink-0 ${
                          bannerContent.type === 'warning' ? 'bg-white text-amber-600 hover:bg-white/90' :
                          bannerContent.type === 'success' ? 'bg-white text-primary hover:bg-white/90' :
                          'bg-white text-secondary hover:bg-white/90'
                        }`}
                        onClick={bannerContent.action}
                      >
                        {bannerContent.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Stats Cards - Clickable with hover states */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {dashboardStats.map((stat, index) => (
                  <Card
                    key={index}
                    className={`border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-white group
                      ${stat.variant === 'warning' ? 'border-amber-200 hover:border-amber-300' : ''}
                      ${stat.variant === 'highlight' ? 'border-primary/20 hover:border-primary/40' : 'border-slate-100 hover:border-slate-200'}
                    `}
                    onClick={stat.action}
                  >
                    <CardContent className="p-5">
                      {stat.isPieChart ? (
                        /* Profile Completion Card with Pie Chart - matches standard card structure */
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="relative w-11 h-11">
                              <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                                {/* Background circle */}
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  stroke="#e2e8f0"
                                  strokeWidth="3"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="14"
                                  fill="none"
                                  stroke="#9333ea"
                                  strokeWidth="3"
                                  strokeDasharray={`${stat.percentage * 0.88} 88`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-purple-600">{stat.percentage}%</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.percentage}%</p>
                            <p className="text-xs mt-1 text-slate-400">{stat.subtitle}</p>
                          </div>
                        </>
                      ) : (
                        /* Standard Stats Card */
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-105 transition-transform`}>
                              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </div>
                            <div className="flex items-center gap-2">
                              {stat.trend && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  stat.trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.value}
                                </span>
                              )}
                              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className={`text-xs mt-1 ${
                              stat.variant === 'warning' ? 'text-amber-600' :
                              stat.variant === 'highlight' ? 'text-primary' : 'text-slate-400'
                            }`}>{stat.subtitle}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity - Wider left, narrower right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads Section - Takes 2 columns */}
                <Card className="border border-slate-100 shadow-sm lg:col-span-2">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800">Your Leads</CardTitle>
                        <p className="text-sm text-slate-500">
                          {activeLeadsCount > 0 ? `${activeLeadsCount} active leads` : 'Get started with leads'}
                        </p>
                      </div>
                    </div>
                    {activeLeadsCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 hover:border-primary/30"
                        onClick={() => setActiveTab('leads')}
                      >
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {!leadsLoading && filteredLeads.length > 0 ? (
                        filteredLeads.slice(0, 4).map(lead => (
                          <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/80 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Briefcase className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-800">{lead.name}</h4>
                                <p className="text-sm text-slate-500">{lead.service}</p>
                                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {lead.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(lead?.priority)}>{lead?.priority}</Badge>
                              <p className="text-sm font-semibold text-slate-800 mt-2">£{lead?.value ? lead?.value : '0'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        /* Onboarding Checklist for New Users */
                        <div className="py-6">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Zap className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Get your first leads</h3>
                            <p className="text-sm text-slate-500">Complete these steps to start receiving job opportunities</p>
                          </div>

                          <div className="space-y-3 max-w-md mx-auto">
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${isProfileComplete ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                              {isProfileComplete ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${isProfileComplete ? 'text-green-800' : 'text-slate-700'}`}>Complete your profile</p>
                              </div>
                              {!isProfileComplete && (
                                <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setActiveTab('settings')}>
                                  Complete
                                </Button>
                              )}
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg ${hasServicesSet ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                              {hasServicesSet ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${hasServicesSet ? 'text-green-800' : 'text-slate-700'}`}>Set your services & pricing</p>
                              </div>
                              {!hasServicesSet && (
                                <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setActiveTab('settings')}>
                                  Set up
                                </Button>
                              )}
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg ${hasAreaSet ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                              {hasAreaSet ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${hasAreaSet ? 'text-green-800' : 'text-slate-700'}`}>Define your service area</p>
                              </div>
                              {!hasAreaSet && (
                                <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setActiveTab('settings')}>
                                  Add area
                                </Button>
                              )}
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg ${hasCredits ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                              {hasCredits ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${hasCredits ? 'text-green-800' : 'text-slate-700'}`}>Purchase credits</p>
                              </div>
                              {!hasCredits && (
                                <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setActiveTab('leads to purchase')}>
                                  Buy now
                                </Button>
                              )}
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg ${isVerified ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                              {isVerified ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${isVerified ? 'text-green-800' : 'text-slate-700'}`}>Add certifications</p>
                                <p className="text-xs text-slate-400">Optional - builds trust</p>
                              </div>
                              {!isVerified && (
                                <Button size="sm" variant="ghost" className="text-xs text-primary" onClick={() => setActiveTab('settings')}>
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="text-center mt-6">
                            <Button
                              className="bg-primary hover:bg-primary/90 text-white"
                              onClick={() => setActiveTab('leads to purchase')}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Browse Available Jobs
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks & Reminders Section - Takes 1 column */}
                <Card className="border border-slate-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-800">Tasks & Reminders</CardTitle>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 max-h-80 overflow-y-auto mt-6">
                      {/* Demo Task 1 */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">Invoice for 6 London Road</h4>
                            <p className="text-xs text-slate-500">Invoicing</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-slate-500">To Do</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>

                      {/* Demo Task 2 */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">Send quote to Mr Ward</h4>
                            <p className="text-xs text-slate-500">Quotes</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-primary">In Progress</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>

                      {/* Demo Task 3 */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                            <MessageCircle className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">Follow up with Miss Laton</h4>
                            <p className="text-xs text-slate-500">Follow-up</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-slate-500">To Do</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>

                      {/* Demo Task 4 */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 truncate">Book in Van MOT</h4>
                            <p className="text-xs text-slate-500">Reminder</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-slate-500">To Do</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full mt-3 text-sm text-slate-600 hover:text-primary"
                    >
                      View all tasks
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        {activeTab === 'leads' && <TradeLeads />}
        {activeTab === 'leads to purchase' && <LeadPurchase />}

        {activeTab === 'jobs' && <TradeJobs />}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Calendar & Schedule</h2>
              <Button>Book Appointment</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      March 2025
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Today
                        </Button>
                        <Button variant="outline" size="sm">
                          Week
                        </Button>
                        <Button variant="outline" size="sm">
                          Month
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = i - 6; // Start from previous month
                        const isCurrentMonth = date > 0 && date <= 31;
                        const isToday = date === 12;
                        const hasAppointment = [10, 12, 15, 18, 20, 25].includes(date);

                        return (
                          <div
                            key={i}
                            className={`h-16 p-1 border rounded text-sm ${
                              isCurrentMonth ? 'bg-background' : 'bg-muted/50 text-muted-foreground'
                            } ${isToday ? 'bg-primary text-primary-foreground' : ''}
                            ${hasAppointment ? 'border-primary' : ''}`}
                          >
                            <div className="font-medium">{isCurrentMonth ? date : ''}</div>
                            {hasAppointment && isCurrentMonth && (
                              <div className="text-xs bg-secondary text-secondary-foreground rounded px-1 mt-1">
                                {date === 12 ? '3 jobs' : date === 15 ? '2 jobs' : '1 job'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Today's Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <h4 className="font-medium">{appointment.client}</h4>
                          <p className="text-sm text-muted-foreground">{appointment.service}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {appointment.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Appointments</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed Jobs</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">£2,340</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Travel Time</span>
                        <span className="font-medium">6.5 hrs</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calendar Image */}
                <Card>
                  <CardContent className="p-4">
                    <img
                      src="https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=300&fit=crop"
                      alt="Digital planning workspace"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2 text-center">Smart scheduling for your trade business</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Reviews & Reputation</h2>
              <Button>Request Reviews</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Rating</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        4.8 <span className="text-yellow-500">★</span>
                      </p>
                      <p className="text-sm text-green-600">+0.2 this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reviews</p>
                      <p className="text-2xl font-bold">127</p>
                      <p className="text-sm text-green-600">+12 this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Response Rate</p>
                      <p className="text-2xl font-bold">98%</p>
                      <p className="text-sm text-green-600">+3% this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Repeat Customers</p>
                      <p className="text-2xl font-bold">34%</p>
                      <p className="text-sm text-green-600">+8% this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Sarah Johnson</h4>
                          <p className="text-sm text-muted-foreground">Bathroom Renovation</p>
                        </div>
                        <div className="flex text-yellow-500">★★★★★</div>
                      </div>
                      <p className="text-sm">"Excellent work! Professional and on time."</p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Mike Thompson</h4>
                          <p className="text-sm text-muted-foreground">Emergency Plumbing</p>
                        </div>
                        <div className="flex text-yellow-500">★★★★★</div>
                      </div>
                      <p className="text-sm">"Quick response and fair pricing."</p>
                      <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reputation Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">9.6/10</div>
                    <p className="text-muted-foreground mb-4">Excellent</p>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between">
                        <span>Quality</span>
                        <span>9.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Punctuality</span>
                        <span>9.7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Communication</span>
                        <span>9.5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Support Centre</h2>
              <Button>Contact Support</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Get instant help from our support team</p>
                  <p className="text-sm text-muted-foreground mb-4">Available: 9 AM - 6 PM, Mon-Fri</p>
                  <Button className="w-full">Start Chat</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="h-5 w-5" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Call us for urgent issues</p>
                  <p className="text-sm text-muted-foreground mb-4">0800 123 4567</p>
                  <Button variant="outline" className="w-full">
                    Call Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Send us detailed questions</p>
                  <p className="text-sm text-muted-foreground mb-4">support@tradepilot.co.uk</p>
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Profile verification help</h4>
                        <p className="text-sm text-muted-foreground">Ticket #TP-001</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Payment method update</h4>
                        <p className="text-sm text-muted-foreground">Ticket #TP-002</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Frequently Asked Questions
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      User Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Video Tutorials
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
           <div className='flex items-center justify-between'>
            <h2 className="text-xl font-bold">Account Settings</h2>
            <p>Remaining Credit: {profile?.credit}</p>
           </div>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name *</label>
                    <input 
                      className="w-full p-2 border border-border rounded-md bg-background" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name *</label>
                    <input 
                      className="w-full p-2 border border-border rounded-md bg-background" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <input readOnly disabled 
                    className="w-full p-2 border border-border rounded-md bg-background" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input 
                    className="w-full p-2 border border-border rounded-md bg-background" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button onClick={handleSavePersonalInfo} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Personal Details'}
                </Button>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
                <CardDescription>Manage your business profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{businessName || 'Your Business'}</h3>
                    <p className="text-muted-foreground">{tradeSpecialty || 'Trade Professional'}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <input 
                    className="w-full p-2 border border-border rounded-md bg-background" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Trade *</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md bg-background"
                      value={tradeSpecialty}
                      onChange={(e) => setTradeSpecialty(e.target.value)}
                    >
                      <option value="">Select Trade</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Builder">Builder</option>
                      <option value="Roofer">Roofer</option>
                      <option value="Painter">Painter/Decorator</option>
                      <option value="Kitchen Installer">Kitchen Installer</option>
                      <option value="Gas Engineer">Gas Engineer</option>
                      <option value="Carpenter">Carpenter/Joiner</option>
                      <option value="Tiler">Tiler</option>
                      <option value="Plasterer">Plasterer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Type *</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md bg-background"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="sole-trader">Sole Trader</option>
                      <option value="limited-company">Limited Company</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience *</label>
                  <select 
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                  >
                    <option value="">Select Experience</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Postcode *</label>
                  <input disabled readOnly 
                    className="w-full p-2 border border-border rounded-md bg-background" 
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Enter your postcode"
                  />
                  <p className="text-xs text-muted-foreground">This will be used to show you relevant leads in your area</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Description</label>
                  <textarea
                    className="w-full p-2 border border-border rounded-md bg-background h-24 resize-none"
                    placeholder="Describe your services, experience, and what makes you stand out..."
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                  />
                </div>

                <Button onClick={handleSaveBusinessInfo} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Business Details'}
                </Button>
              </CardContent>
            </Card>

            {/* Verification & Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification & Credentials</CardTitle>
                <CardDescription>Manage your insurance and certifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Public Liability Insurance</h4>
                      <p className="text-sm text-muted-foreground">Valid until: March 2025</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Gas Safe Registration</h4>
                      <p className="text-sm text-muted-foreground">Registration: 123456</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Verified</Badge>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Upload New Documents
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services & Pricing</CardTitle>
                <CardDescription>Manage your service offerings and rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border border-border rounded-lg">
                    <h4 className="font-medium">Emergency Plumbing</h4>
                    <p className="text-sm text-muted-foreground">24/7 emergency repairs</p>
                    <p className="font-semibold text-primary">£85/hour</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <h4 className="font-medium">Bathroom Installation</h4>
                    <p className="text-sm text-muted-foreground">Complete bathroom fitting</p>
                    <p className="font-semibold text-primary">From £2,500</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <h4 className="font-medium">Boiler Service</h4>
                    <p className="text-sm text-muted-foreground">Annual service and maintenance</p>
                    <p className="font-semibold text-primary">£120</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default TradesCRM;
