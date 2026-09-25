import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Shield, Zap, Clock, Phone, Search, ArrowRight, MapPin, Wrench, Zap as Electric, Hammer, Paintbrush, Flower, Sparkles, TrendingUp, Users, DollarSign, FileCheck, Bot, CreditCard, Smartphone, ChevronLeft, ChevronRight, Home, ChefHat, Flame, CheckCircle, Info, UserCheck, ShieldCheck, Banknote } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
const heroImage = "/site-assets/c7b681c7-7a7b-41b3-a2cd-b1c3508f99c0.png";
const stepSnapImage = "/site-assets/how-it-works-1.jpg";
const stepMatchImage = "/site-assets/how-it-works-2.jpg";
const stepCompleteImage = "/site-assets/how-it-works-3.jpg";

const faqs = [
  { question: "How does Trade Pilot work?", answer: "Tell us what you need and your postcode. Up to 3 vetted local trades who cover your area can quote. You compare their quotes and reviews, then choose who to invite round." },
  { question: "Is Trade Pilot free for homeowners?", answer: "Yes. Posting a job and getting quotes is free, and you don’t have to accept any quote." },
  { question: "How do you check the trades?", answer: "We check every trade before they can quote on Trade Pilot. You should still check the right registration for the job, such as the Gas Safe Register for gas work and a registered electrician for electrical work, and ask for proof of insurance." },
  { question: "What does “reviews from real, invoiced jobs” mean?", answer: "Reviews on Trade Pilot are linked to jobs that were invoiced through the platform. That means you’re reading about work that was actually done and paid for, not reviews anyone could post." },
  { question: "Which areas do you cover?", answer: "We’re launching town by town, starting with Reading. Enter your postcode when you post a job and we’ll match you with trades who cover your area." },
  { question: "Why up to 3 quotes?", answer: "Three quotes are enough to compare prices and approaches without being chased by lots of trades. Each job goes to no more than 3 trades." },
];

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
                Find trusted local tradespeople
              </h1>
              <p className={`text-base sm:text-lg md:text-xl text-white/80 font-light mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                Tell us about the job once and compare quotes from up to 3 vetted local trades. Free for homeowners, with no obligation.
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
                  <div>
                    <label htmlFor="enquiry-trade" className="mb-1.5 block text-xs sm:text-sm font-medium text-secondary">What do you need?</label>
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted rounded-lg sm:rounded-xl">
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <select
                        id="enquiry-trade"
                        defaultValue=""
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground text-sm sm:text-base"
                      >
                        <option value="" disabled>Select a trade</option>
                        {["Plumbers", "Electricians", "Gas & Boiler Engineers", "Builders", "Roofers", "Painters & Decorators", "Kitchen Fitters", "Carpenters & Joiners"].map((trade) => (
                          <option key={trade} value={trade}>{trade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="enquiry-postcode" className="mb-1.5 block text-xs sm:text-sm font-medium text-secondary">Your postcode</label>
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-muted rounded-lg sm:rounded-xl">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <input
                        id="enquiry-postcode"
                        type="text"
                        placeholder="e.g. RG1 1AA"
                        autoComplete="postal-code"
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <Button size="lg" className="w-full rounded-lg sm:rounded-xl py-5 sm:py-6 bg-secondary hover:bg-secondary/90 text-white text-sm sm:text-base" asChild>
                    <a href="/find-tradespeople">
                      Compare up to 3 quotes
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </a>
                  </Button>
                  <p className="text-center text-xs sm:text-sm text-muted-foreground">Free for homeowners. You don’t have to accept any quote.</p>
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
            <Link to="/plumbers" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Wrench className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Plumbers</h3>
              </div>
            </Link>
            
            <Link to="/electricians" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Electric className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Electricians</h3>
              </div>
            </Link>
            
            <Link to="/builders" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Hammer className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Builders</h3>
              </div>
            </Link>
            
            <Link to="/roofers" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Home className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Roofers</h3>
              </div>
            </Link>
            
            <Link to="/painters-decorators" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Paintbrush className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Painters / Decorators</h3>
              </div>
            </Link>
            
            <Link to="/kitchen-fitters" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <ChefHat className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Kitchen Installers</h3>
              </div>
            </Link>
            
            <Link to="/gas-engineers" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Flame className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Gas Engineers</h3>
              </div>
            </Link>
            
            <Link to="/carpenters" className="group block">
              <div className="bg-white rounded-xl sm:rounded-2xl h-24 sm:h-28 lg:h-32 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-primary transition-all duration-300 border border-white/20">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-colors">
                  <Wrench className="h-6 w-6 text-secondary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-secondary group-hover:text-white text-sm">Carpenters / Joiners</h3>
              </div>
            </Link>
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
                  <img src={stepSnapImage} alt="Modern kitchen with a marble island and wooden cabinets" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-orange-500 text-sm font-medium mb-3">Step 1</span>
                  <h3 className="text-xl font-semibold text-secondary mb-4">Tell us about the job</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Choose the trade, add your postcode and describe what you need. Photos help. It takes about a minute.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-muted rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img src={stepMatchImage} alt="Modern kitchen with dark cabinets and a large window overlooking trees" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-orange-500 text-sm font-medium mb-3">Step 2</span>
                  <h3 className="text-xl font-semibold text-secondary mb-4">Get up to 3 quotes</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Up to 3 vetted local trades who cover your area can quote for the job.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-muted rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img src={stepCompleteImage} alt="Modern bathroom with twin basins and a stone vanity" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <span className="text-orange-500 text-sm font-medium mb-3">Step 3</span>
                  <h3 className="text-xl font-semibold text-secondary mb-4">Compare and choose</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Trade Pilot */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10 text-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-3">Find a trusted local tradesperson, without the guesswork</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">Finding a reliable local tradesperson usually means asking around, phoning several firms and hoping the online reviews are real. Trade Pilot makes it simpler. Tell us what you need and your postcode, and up to 3 vetted local trades who cover your area can quote. Each job goes to no more than 3 trades, so you get enough quotes to compare without being chased by a crowd. It’s free for homeowners, and you don’t have to accept any quote.</p>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-3">Reviews from real, invoiced jobs</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">Most trade review sites let anyone post a review. On Trade Pilot, reviews are tied to jobs that were invoiced through the platform, so you’re reading about work that was actually done and paid for. That makes it easier to compare tradespeople on what matters: the quality of their work, how they communicate and whether they finish on time and on budget.</p>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-3">Plumbers, electricians, builders and more</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">You can compare quotes from plumbers, electricians, gas and boiler engineers, builders, roofers, painters and decorators, kitchen fitters and carpenters and joiners. Whether it’s a dripping tap, a boiler service, an electrical safety check, a roof repair or a new kitchen, one short form reaches local trades who do that work.</p>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-3">Launching town by town, starting with Reading</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">We’re opening one area at a time, starting with Reading in Berkshire, and we only open an area once there are local trades ready to cover it. Before any work starts, check the trade’s registration and insurance, ask for a written quote, and avoid paying large sums upfront.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keep Your Home in Shape */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-center text-secondary mb-8 sm:mb-12 lg:mb-16">Popular areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
            {[
              { trade: "Plumber", image: "/site-assets/popular-areas-1.jpg", alt: "Modern kitchen with oak cabinets, a white island with a gas hob and a round dining table" },
              { trade: "Electrician", image: "/site-assets/popular-areas-2.jpg", alt: "Kitchen with dark wood cabinets, a marble island and two chrome pendant lights" },
              { trade: "Builder", image: "/site-assets/popular-areas-3.jpg", alt: "Kitchen with brown wood cabinets, under-cabinet lighting and a stone tile floor" },
              { trade: "Roofer", image: "/site-assets/popular-areas-4.jpg", alt: "Black clad garden building with a pitched roof and large glass sliding doors" },
            ].map(({ trade, image, alt }) => (
              <Link key={trade} to="/areas/reading" className="group block">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl h-64 sm:h-80 lg:h-96 shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src={image}
                    alt={alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 text-white">
                    <p className="text-sm sm:text-base lg:text-lg font-medium mb-2 sm:mb-4">{trade} in Reading</p>
                    <span className="flex w-full items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium group-hover:bg-white/30 transition-all duration-150">
                      Find a {trade.toLowerCase()}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trade Pilot */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500 mb-3 text-center lg:text-left">Why use Trade Pilot</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-6 sm:mb-8 text-center lg:text-left">How Trade Pilot helps you hire</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Vetted local trades</h3>
                    <p className="text-muted-foreground">We check every trade before they can quote on Trade Pilot. For gas work, always ask to see a Gas Safe ID card.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Reviews from real jobs</h3>
                    <p className="text-muted-foreground">Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">Free, with no obligation</h3>
                    <p className="text-muted-foreground">Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/site-assets/why-trade-pilot.jpg" 
                  alt="Marble bathroom with a double vanity, brass taps and a large mirror" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews section removed until there are real, invoice-verified reviews to show. When it returns, show the reviewer's first name and town only, and only with their permission. */}

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-center text-secondary mb-16">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map(({ question, answer }, index) => (
                <AccordionItem key={question} value={`faq-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-semibold py-6">
                    {question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
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
              "mainEntity": faqs.map(({ question, answer }) => ({
                "@type": "Question",
                "name": question,
                "acceptedAnswer": { "@type": "Answer", "text": answer },
              })),
            })
          }}
        />
      </section>

      {/* For Tradespeople */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto bg-primary text-white rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-6 text-white">For tradespeople</h2>
            <p className="mx-auto mb-8 max-w-3xl text-base sm:text-lg leading-relaxed text-white/90">
              Get homeowner enquiries in your area without a monthly subscription. It’s free to join. Buy credits and spend them only on the jobs you want. Each job goes to no more than 3 trades, and your reviews come from real, invoiced work.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:text-secondary-foreground px-8 py-4 text-lg rounded-lg" asChild>
                <a href="https://app.mytradepilot.io/trades/join">Join as a trade</a>
              </Button>
              <Link to="/trades" className="text-base sm:text-lg font-medium text-white underline underline-offset-4 hover:text-white/80">
                How Trade Pilot works for trades
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
