import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Shield, Zap, Clock, Phone, Search, ArrowRight, MapPin, Wrench, Zap as Electric, Hammer, Paintbrush, Flower, Sparkles, TrendingUp, Users, DollarSign, FileCheck, Bot, CreditCard, Smartphone, ChevronLeft, ChevronRight, Home, ChefHat, Flame, CheckCircle, Info, UserCheck, ShieldCheck, Banknote } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "/lovable-uploads/c7b681c7-7a7b-41b3-a2cd-b1c3508f99c0.png";
import stepSnapImage from "/lovable-uploads/bb6bc857-8b38-4995-ae7d-e5a77b1f0303.png";
import stepMatchImage from "/lovable-uploads/3ee8a739-9971-4a96-86e1-14de2728d255.png";
import stepCompleteImage from "/lovable-uploads/c067a8dd-6671-4c98-9bd8-5fc0734cc817.png";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, loading, isTrade } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    
    // Handle email confirmation redirect
    const handleAuthStateChange = () => {
      if (isAuthenticated && !loading) {
        // Small delay to ensure profile is loaded
        setTimeout(() => {
          window.location.href = isTrade ? "/trades-crm" : "/dashboard";
        }, 100);
      }
    };

    if (!loading) {
      handleAuthStateChange();
    }
  }, [isAuthenticated, loading, isTrade]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to appropriate dashboard
  if (isAuthenticated) {
    return <Navigate to={isTrade ? "/trades-crm" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Starling-style layout */}
      <section
        className="relative min-h-[100svh] lg:min-h-screen flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50 lg:from-slate-900/80 lg:via-slate-900/50 lg:to-slate-900/30"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80svh] lg:min-h-[70vh]">
            {/* Left side - Content */}
            <div className="flex flex-col justify-center text-center lg:text-left">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                Find trusted local tradespeople.
              </h1>
              <p className={`text-base sm:text-lg md:text-xl text-white/80 font-light mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                Every professional vetted, reviewed, and rated. Get matched with quality trades in minutes.
              </p>
              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl" asChild>
                  <a href="/find-tradespeople">Find a tradesperson</a>
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-secondary px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl" asChild>
                  <a href="/trades/join">Join as a trade</a>
                </Button>
              </div>
            </div>

            {/* Right side - Search Card / Visual */}
            <div className={`flex justify-center lg:justify-end transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="bg-white/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                <h3 className="text-lg sm:text-xl font-semibold text-secondary mb-2 sm:mb-4">Get started now</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">Tell us what you need and we'll match you with the right trades</p>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted rounded-lg sm:rounded-xl">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="What do you need?"
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted rounded-lg sm:rounded-xl">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Your postcode"
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
                    />
                  </div>
                  <Button size="lg" className="w-full rounded-lg sm:rounded-xl py-5 sm:py-6 bg-secondary hover:bg-secondary/90 text-white text-sm sm:text-base" asChild>
                    <a href="/find-tradespeople">
                      Get quotes
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </a>
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-muted">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span>Vetted trades</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span>4.8 rating</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span>Fast quotes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom trust badges - Starling style */}
        <div className={`absolute bottom-4 sm:bottom-8 left-0 right-0 transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-white text-xs sm:text-sm font-medium">50,000+ homeowners helped</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-current" />
                <span className="text-white text-xs sm:text-sm font-medium">4.8 average rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-white text-xs sm:text-sm font-medium">All trades verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 sm:py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-center text-white mb-8 sm:mb-12 lg:mb-16">Browse our most popular categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Wrench className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Plumbers</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Electric className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Electricians</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Hammer className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Builders</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Home className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Roofers</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Paintbrush className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Painters / Decorators</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <ChefHat className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Kitchen Installers</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Flame className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Gas Engineers</h3>
              </div>
            </div>
            
            <div className="group cursor-pointer">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Wrench className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Carpenters / Joiners</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-center text-secondary mb-8 sm:mb-12 lg:mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-muted rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img src={stepSnapImage} alt="Snap a photo" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-orange-500 text-sm font-medium mb-3">Step 1</span>
                  <h3 className="text-xl font-semibold text-secondary mb-4">Post your job (60 seconds)</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Add your postcode and a short brief. You can attach a photo or record a quick voice note.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-muted rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img src={stepMatchImage} alt="Match with tradespeople" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-orange-500 text-sm font-medium mb-3">Step 2</span>
                  <h3 className="text-xl font-semibold text-secondary mb-4">Get 3 verified trades quotes</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    We shortlist three nearby trades based on reviews, certifications and availability. They receive your brief instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-muted rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img src={stepCompleteImage} alt="Complete and review" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-orange-500 text-sm font-medium mb-3">Step 3</span>
                  <h3 className="text-xl font-semibold text-secondary mb-4">Compare and book direct</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    See quotes side by side, message the pros, and choose the one you prefer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keep Your Home in Shape */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-center text-secondary mb-8 sm:mb-12 lg:mb-16">Keep your home in shape</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
            {/* Kitchen Installation */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl h-64 sm:h-80 lg:h-96 shadow-lg hover:shadow-xl transition-all duration-300">
                <img 
                  src="/lovable-uploads/b63cd1f9-6e40-4716-bda0-9c34b9f6d061.png" 
                  alt="Kitchen Installation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Kitchen</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Installation</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white">
                  <p className="text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">Kitchen Installation</p>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-4">Starting at £450.00</p>
                  <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
                    Get Help Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bathroom Renovation */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl h-64 sm:h-80 lg:h-96 shadow-lg hover:shadow-xl transition-all duration-300">
                <img 
                  src="/lovable-uploads/31f52746-1420-439c-9f35-555016c7e6ba.png" 
                  alt="Bathroom Renovation" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Bathroom</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Renovation</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white">
                  <p className="text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">Bathroom Renovation</p>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-4">Starting at £320.00</p>
                  <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
                    Get Help Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Electrical Work */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl h-64 sm:h-80 lg:h-96 shadow-lg hover:shadow-xl transition-all duration-300">
                <img 
                  src="/lovable-uploads/a5c5ec1d-c610-4a2f-999d-0f3695ecbbde.png" 
                  alt="Electrical Repairs" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Electrical</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Wiring</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white">
                  <p className="text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">Electrical Repairs</p>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-4">Starting at £85.00</p>
                  <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
                    Get Help Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Garden Landscaping */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl h-64 sm:h-80 lg:h-96 shadow-lg hover:shadow-xl transition-all duration-300">
                <img 
                  src="/lovable-uploads/ede9e89a-df34-4177-b17f-d9d9577b0a7c.png" 
                  alt="Garden Landscaping" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Garden</span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] sm:text-xs font-medium text-white">Landscaping</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white">
                  <p className="text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">Garden Landscaping</p>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-4">Starting at £280.00</p>
                  <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center">
                    Get Help Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Trade Pilot */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-6 sm:mb-8 text-center lg:text-left">Why Trade Pilot?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Invoice-verified reviews</h3>
                    <p className="text-muted-foreground">Reviews linked to a job & invoice to reduce fakery.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Predictable, low fees</h3>
                    <p className="text-muted-foreground">Simple monthly plans. No pay-per-lead roulette.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Modern, mobile first</h3>
                    <p className="text-muted-foreground">Fast, clean UX for both homeowners and trades.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Banknote className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">No escrow: you pay the trade direct</h3>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Trade Vetting badges</h3>
                    <p className="text-muted-foreground">ID ✓ · insurance ✓ · Gas Safe / NICEIC</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/78c45c37-043b-4102-be34-98a64df6bb17.png" 
                  alt="Happy customers with tradesperson in kitchen" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Reviews Section */}
      <section className="py-12 sm:py-16 lg:py-20 pb-20 sm:pb-24 lg:pb-32 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-4 sm:mb-6">Join our group of happy customers</h2>
            
            {/* Trust Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Excellent</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-green-500" />
                  ))}
                </div>
              </div>
              <div className="text-muted-foreground text-center sm:text-left">
                <span className="font-medium">4.8/5</span> based on <span className="font-medium">2,450+</span> reviews
              </div>
            </div>
          </div>

          {/* Review Cards Carousel */}
          <div className="max-w-7xl mx-auto">
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-2 md:-ml-4 pb-4">
                {/* Card 1 - Overview */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card bg-primary/5 border-primary/20 h-full flex flex-col">
                    <div className="text-center mb-6 flex-grow">
                      <h3 className="text-2xl font-bold text-primary mb-2">2,450+</h3>
                      <p className="text-lg font-semibold mb-2">Five star reviews</p>
                      <div className="flex items-center justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Read real reviews from customers about their service experiences.
                      </p>
                    </div>
                    <Button className="w-full mt-auto" asChild>
                      <a href="/find-tradespeople">Find a tradesperson</a>
                    </Button>
                  </div>
                </CarouselItem>

                {/* Card 2 - Trade Review */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold mb-3">Perfect Service</h4>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      "Trade Pilot has transformed my business. Quality leads without the endless admin. The platform is intuitive and the support team is excellent."
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-secondary-foreground font-semibold text-xs">JM</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">John Mason</p>
                        <p className="text-muted-foreground text-xs">Electrician</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Card 3 - Homeowner Review */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold mb-3">Best Platform</h4>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      "This is probably the best site to get experts for your job. I've found some really good tradespeople on here. Highly recommend!"
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-primary-foreground font-semibold text-xs">HK</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Helen</p>
                        <p className="text-muted-foreground text-xs">Homeowner</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Card 4 - Trade Review */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold mb-3">Highly Recommend</h4>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      "It was so easy to use. Leave an explanation of what you would like done and wait for responses. More work, better customers!"
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-secondary-foreground font-semibold text-xs">SP</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Sarah Parker</p>
                        <p className="text-muted-foreground text-xs">Plumber</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Card 5 - Additional Review */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold mb-3">Outstanding Quality</h4>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      "Finally, a platform that understands what trades actually need. The quality of leads is outstanding."
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-secondary-foreground font-semibold text-xs">MT</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Mike Thompson</p>
                        <p className="text-muted-foreground text-xs">Carpenter</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Card 6 - Additional Review */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold mb-3">Quick & Reliable</h4>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      "Quick, reliable connections with vetted professionals. Exactly what I needed for my home renovations."
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-primary-foreground font-semibold text-xs">EM</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Emma</p>
                        <p className="text-muted-foreground text-xs">Homeowner</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Card 7 - Additional Review */}
                <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="trade-card h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold mb-3">Brilliant Platform</h4>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      "The verification system gives me confidence in every tradesperson I hire. Brilliant platform!"
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <span className="text-primary-foreground font-semibold text-xs">DW</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">David Wilson</p>
                        <p className="text-muted-foreground text-xs">Property Manager</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              
              {/* Navigation arrows positioned below the carousel */}
              <div className="flex justify-center mt-12 space-x-4">
                <CarouselPrevious className="relative top-0 left-0 translate-y-0 translate-x-0 bg-white border-border hover:bg-muted" />
                <CarouselNext className="relative top-0 right-0 translate-y-0 translate-x-0 bg-white border-border hover:bg-muted" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-center text-secondary mb-16">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="vetting" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold py-6">
                  How are trades vetted?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  All tradespeople go through our comprehensive vetting process which includes ID verification, insurance checks, and relevant trade qualifications (Gas Safe, NICEIC, etc.). We verify their credentials, insurance coverage, and past work history to ensure you're connected with qualified professionals.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="homeowner-fees" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold py-6">
                  Do you charge homeowners?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  No, Trade Pilot is completely free for homeowners. You can post jobs, receive quotes, and connect with tradespeople at no cost. Our revenue comes from subscription fees paid by tradespeople who want to access leads and grow their business through our platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="review-verification" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold py-6">
                  How are reviews verified?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  All reviews are linked to actual completed jobs with verified invoices. This means every review comes from a real customer who has hired and paid the tradesperson through a documented transaction, significantly reducing fake or misleading reviews and ensuring authentic feedback.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="problems" className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold py-6">
                  What happens if there's a problem?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  If you encounter any issues with a tradesperson or job, our support team is here to help resolve disputes. Since all trades are vetted and insured, you have protection. We also maintain a feedback system to ensure quality standards are maintained across our network of professionals.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Structured Data for Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How are trades vetted?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "All tradespeople go through our comprehensive vetting process which includes ID verification, insurance checks, and relevant trade qualifications (Gas Safe, NICEIC, etc.). We verify their credentials, insurance coverage, and past work history to ensure you're connected with qualified professionals."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you charge homeowners?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No, Trade Pilot is completely free for homeowners. You can post jobs, receive quotes, and connect with tradespeople at no cost. Our revenue comes from subscription fees paid by tradespeople who want to access leads and grow their business through our platform."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How are reviews verified?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "All reviews are linked to actual completed jobs with verified invoices. This means every review comes from a real customer who has hired and paid the tradesperson through a documented transaction, significantly reducing fake or misleading reviews and ensuring authentic feedback."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What happens if there's a problem?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "If you encounter any issues with a tradesperson or job, our support team is here to help resolve disputes. Since all trades are vetted and insured, you have protection. We also maintain a feedback system to ensure quality standards are maintained across our network of professionals."
                  }
                }
              ]
            })
          }}
        />
      </section>

      {/* For Tradespeople */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto bg-primary text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-12 text-white">For Tradespeople</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-secondary mb-4" />
                <h4 className="text-lg font-semibold mb-2 text-white">Get new leads</h4>
                <p className="text-white/80">Connect with customers in your area looking for your services</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-secondary mb-4" />
                <h4 className="text-lg font-semibold mb-2 text-white">Build your reputation</h4>
                <p className="text-white/80">Showcase your work and build trust with verified reviews</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <DollarSign className="h-8 w-8 text-secondary mb-4" />
                <h4 className="text-lg font-semibold mb-2 text-white">Simple, fair pricing</h4>
                <p className="text-white/80">Transparent fees with no hidden costs or surprise charges</p>
              </div>
            </div>
            
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:text-secondary-foreground px-8 py-4 text-lg rounded-lg" asChild>
              <a href="/trades/join">Join Our Network</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
