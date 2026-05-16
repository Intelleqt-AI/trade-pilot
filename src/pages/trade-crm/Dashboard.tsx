import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Briefcase,
  MapPin,
  Coins,
  Award,
  Bell,
  Clock,
  FileText,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Search,
} from 'lucide-react';
import type { TradeCRMOutletContext } from '@/layouts/TradeCRMLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { jobMarketCredits } = useOutletContext<TradeCRMOutletContext>();
  const { user, profile } = useAuth();

  const { data: jobsData } = useQuery({ queryKey: ['Jobs'], queryFn: fetchJobs });

  const creditBalance =
    jobMarketCredits ?? (user as any)?.credit_balance ?? profile?.credit ?? 0;
  const jobsNearYou = 10;
  const activeLeadsCount = 3;

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

  const getBannerContent = () => {
    if (creditBalance === 0) {
      return {
        type: 'warning',
        message: "You're out of credits - top up to keep receiving leads",
        cta: 'Buy Credits',
        icon: AlertTriangle,
        action: () => navigate('/trades-crm/credits'),
      };
    }
    if (creditBalance < 50 && creditBalance > 0) {
      return {
        type: 'info',
        message: `${creditBalance} credits remaining - top up before they run out`,
        cta: 'Top Up',
        icon: Coins,
        action: () => navigate('/trades-crm/credits'),
      };
    }
    if (jobsNearYou > 0) {
      return {
        type: 'success',
        message: `${jobsNearYou} new jobs matching your services in your area`,
        cta: 'View Jobs',
        icon: Zap,
        action: () => navigate('/trades-crm/job-market'),
      };
    }
    if (!isProfileComplete) {
      return {
        type: 'neutral',
        message: 'Complete your profile to appear higher in homeowner searches',
        cta: 'Complete Profile',
        icon: FileText,
        action: () => navigate('/trades-crm/profile'),
      };
    }
    return null;
  };

  const bannerContent = getBannerContent();

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

  const dashboardStats = [
    {
      title: 'Credit Balance',
      value: creditBalance,
      subtitle:
        creditBalance === 0
          ? 'Top up to get leads'
          : creditBalance < 50
          ? 'Running low'
          : 'Credits available',
      icon: Coins,
      color: 'bg-teal-50',
      iconColor: 'text-teal-600',
      trend: null,
      variant:
        creditBalance === 0 ? 'warning' : creditBalance < 50 ? 'highlight' : 'default',
      action: () => navigate('/trades-crm/credits'),
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
      action: () => navigate('/trades-crm/job-market'),
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
      action: () => navigate('/trades-crm/leads'),
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
      action: () => navigate('/trades-crm/profile'),
      isPieChart: true,
      percentage: 60,
    },
  ];

  const checklistSteps = [
    {
      done: isProfileComplete,
      label: 'Complete your profile',
      action: () => navigate('/trades-crm/profile'),
      cta: 'Complete',
    },
    {
      done: hasServicesSet,
      label: 'Set your services & pricing',
      action: () => navigate('/trades-crm/profile'),
      cta: 'Set up',
    },
    {
      done: hasAreaSet,
      label: 'Define your service area',
      action: () => navigate('/trades-crm/profile'),
      cta: 'Add area',
    },
    {
      done: hasCredits,
      label: 'Purchase credits',
      action: () => navigate('/trades-crm/credits'),
      cta: 'Buy now',
    },
    {
      done: isVerified,
      label: 'Add certifications',
      sub: 'Optional - builds trust',
      action: () => navigate('/trades-crm/profile'),
      cta: 'Add',
    },
  ];

  const tasks = [
    { title: 'Invoice for 6 London Road', sub: 'Invoicing', status: 'To Do', icon: Clock, statusColor: 'text-slate-500' },
    { title: 'Send quote to Mr Ward', sub: 'Quotes', status: 'In Progress', icon: FileText, statusColor: 'text-primary' },
    { title: 'Follow up with Miss Laton', sub: 'Follow-up', status: 'To Do', icon: MessageCircle, statusColor: 'text-slate-500' },
    { title: 'Book in Van MOT', sub: 'Reminder', status: 'To Do', icon: Clock, statusColor: 'text-slate-500' },
  ];

  return (
    <div className="space-y-6">
      {bannerContent && (
        <Card
          className={`border-none shadow-sm ${
            bannerContent.type === 'warning'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : bannerContent.type === 'success'
              ? 'bg-gradient-to-r from-primary to-primary/80'
              : bannerContent.type === 'info'
              ? 'bg-gradient-to-r from-sky-500 to-sky-600'
              : 'bg-gradient-to-r from-secondary to-secondary/90'
          } text-white`}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/20">
                  <bannerContent.icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm sm:text-base">{bannerContent.message}</p>
              </div>
              <Button
                className={`font-semibold px-5 shrink-0 w-full sm:w-auto ${
                  bannerContent.type === 'warning'
                    ? 'bg-white text-amber-600 hover:bg-white/90'
                    : bannerContent.type === 'success'
                    ? 'bg-white text-primary hover:bg-white/90'
                    : 'bg-white text-secondary hover:bg-white/90'
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboardStats.map((stat, index) => (
          <Card
            key={index}
            className={`border shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-white group
              ${stat.variant === 'warning' ? 'border-amber-200 hover:border-amber-300' : ''}
              ${
                stat.variant === 'highlight'
                  ? 'border-primary/20 hover:border-primary/40'
                  : 'border-slate-100 hover:border-slate-200'
              }
            `}
            onClick={stat.action}
          >
            <CardContent className="p-5">
              {(stat as any).isPieChart ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="relative w-11 h-11">
                      <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#9333ea"
                          strokeWidth="3"
                          strokeDasharray={`${(stat as any).percentage * 0.88} 88`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-purple-600">
                          {(stat as any).percentage}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">{(stat as any).percentage}%</p>
                    <p className="text-xs mt-1 text-slate-400">{stat.subtitle}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-105 transition-transform`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {stat.trend && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            stat.trend.direction === 'up'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.value}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p
                      className={`text-xs mt-1 ${
                        stat.variant === 'warning'
                          ? 'text-amber-600'
                          : stat.variant === 'highlight'
                          ? 'text-primary'
                          : 'text-slate-400'
                      }`}
                    >
                      {stat.subtitle}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-100 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-slate-800">
                  Your Leads
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {activeLeadsCount > 0
                    ? `${activeLeadsCount} active leads`
                    : 'Get started with leads'}
                </p>
              </div>
            </div>
            {activeLeadsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 hover:border-primary/30"
                onClick={() => navigate('/trades-crm/leads')}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!leadsLoading && filteredLeads.length > 0 ? (
                filteredLeads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/80 transition-all cursor-pointer group gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-800 truncate">{lead.name}</h4>
                        <p className="text-sm text-slate-500 truncate">{lead.service}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {lead.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start ml-13 sm:ml-0">
                      <Badge className={getStatusColor(lead?.priority)}>{lead?.priority}</Badge>
                      <p className="text-sm font-semibold text-slate-800 sm:mt-2">
                        £{lead?.value ? lead?.value : '0'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      Get your first leads
                    </h3>
                    <p className="text-sm text-slate-500">
                      Complete these steps to start receiving job opportunities
                    </p>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto">
                    {checklistSteps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          step.done
                            ? 'bg-green-50 border border-green-100'
                            : 'bg-slate-50 border border-slate-100'
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              step.done ? 'text-green-800' : 'text-slate-700'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.sub && <p className="text-xs text-slate-400">{step.sub}</p>}
                        </div>
                        {!step.done && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-primary"
                            onClick={step.action}
                          >
                            {step.cta}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-6">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => navigate('/trades-crm/credits')}
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

        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Tasks & Reminders
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-white text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 max-h-80 overflow-y-auto mt-6">
              {tasks.map((task, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                      <task.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate">{task.title}</h4>
                      <p className="text-xs text-slate-500">{task.sub}</p>
                      <span className={`text-xs font-medium ${task.statusColor}`}>
                        {task.status}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-sm text-slate-600 hover:text-primary">
              View all tasks
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
