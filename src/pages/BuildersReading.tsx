import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileCheck2, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import WhyTradePilot from "@/components/WhyTradePilot";
import { postJobs } from "@/lib/api";

// Keep this page noindex until at least 1 active trade covers Reading, the copy is unique and 300+ words,
// and there are at least 5 FAQs. Set to true once all three are met.
const INDEXABLE = false;

const services = [
  ["Extensions", "Single-storey and double-storey rear and side extensions, side-return kitchen extensions and wrap-around extensions.", FileCheck2],
  ["Loft and garage conversions", "Roof-window and dormer loft conversions, and turning a garage into a room, office or annexe.", ShieldCheck],
  ["Renovations and structural work", "Knocking through walls with steel beams, internal alterations, brickwork, repointing and general building repairs.", FileCheck2],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a good builder in Reading?", "Post your job on Trade Pilot with your postcode, drawings and photos, and up to 3 vetted builders covering Reading can quote. Compare itemised quotes on the same drawings, and read reviews from real, invoiced jobs."],
  ["Do I need planning permission for an extension in Reading?", "Many single-storey rear extensions fall under permitted development. That doesn’t apply on streets with Article 4 directions, such as some patterned brickwork terraces. Conservation areas and flats have extra limits. Check with Reading Borough Council, or with Wokingham or West Berkshire council if your home is in their area."],
  ["How much does an extension cost in Reading?", "Single-storey extensions typically cost £1,800 to £3,000 per square metre across the UK. Reading and the wider South East often come in above that. The finish, glazing and kitchen can make a big difference."],
  ["Do I need a party wall agreement?", "Often, yes. If you’re building on or near a shared wall, or digging foundations close to a neighbour’s, you normally need to serve notice under the Party Wall etc. Act 1996 before work starts."],
  ["Do I need building regulations approval to knock through a wall?", "Removing a load-bearing wall needs building regulations approval and a structural engineer’s calculations for the steel beam. Your builder should arrange or confirm who handles this."],
  ["Should I pay a builder upfront?", "Avoid large upfront payments. Agree stage payments tied to finished work, and get a written contract that sets out the scope, price and timings."],
];

// Service pages go live w/c 19 Oct and nearby town pages w/c 9 Nov. Flip each flag to true once those pages are deployed.
// The links always show on the local dev server so they can be previewed.
const SERVICE_WAVE_LIVE = import.meta.env.DEV || false;
const TOWN_WAVE_LIVE = import.meta.env.DEV || false;

const SERVICES = [
  { label: "House extension builders in Reading", href: "/builders/reading/extensions" },
  { label: "Loft conversions in Reading", href: "/builders/reading/loft-conversions" },
];

const NEARBY_TOWNS = [
  { label: "Builders in Wokingham", href: "/builders/wokingham" },
  { label: "Builders in Bracknell", href: "/builders/bracknell" },
];

const OTHER_TRADES = [
  { label: "Plumbers in Reading", href: "/plumbers/reading" },
  { label: "Electricians in Reading", href: "/electricians/reading" },
  { label: "Gas and boiler engineers in Reading", href: "/gas-engineers/reading" },
  { label: "Roofers in Reading", href: "/roofers/reading" },
  { label: "Painters and decorators in Reading", href: "/painters-decorators/reading" },
  { label: "Kitchen fitters in Reading", href: "/kitchen-fitters/reading" },
  { label: "Carpenters and joiners in Reading", href: "/carpenters/reading" },
];

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const META_DESCRIPTION = "Compare up to 3 vetted builders in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const BuildersReading = () => {
  useEffect(() => {
    document.title = "Builders in Reading | Compare up to 3 Quotes | Trade Pilot";

    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const descriptionCreated = !description;
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    const previousDescription = description.content;
    description.content = META_DESCRIPTION;

    // The site default is "index, follow", so override it while this page is noindex.
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robotsCreated = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousRobots = robots.content;
    if (!INDEXABLE) robots.content = "noindex, follow";

    return () => {
      if (descriptionCreated) description?.remove();
      else if (description) description.content = previousDescription;
      if (robotsCreated) robots?.remove();
      else if (robots) robots.content = previousRobots;
    };
  }, []);

  const submitQuoteRequest = (postcode: string) =>
    postJobs({ postcode, job_trade: "Builders", trade: "builder", description: "Building work requested from the Builders in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/builders" className="hover:underline">Builders</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-builders-hero-v2.jpg"
          imageAlt="Modern kitchen with wood cabinetry, pendant lighting and a large island"
          imageFit="cover"
          imagePosition="50% 65%"
          tradeName="Builders"
          heading="Builders in Reading"
          description="Tell us about the project and compare quotes from up to 3 vetted local builders in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a builder in Reading</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {services.map(([title, description, Icon]) => (
                <article key={title} className="flex flex-col rounded-xl border border-[#e4eaed] bg-white p-6 shadow-[0_2px_8px_rgba(0,43,73,0.04)]">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f5f4] text-[#16aaa5]"><Icon className="h-6 w-6" /></div>
                  <h3 className="text-xl font-semibold text-[#001F3D]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#657680]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-white px-4 pb-12 sm:pb-16">
          <div className="container mx-auto space-y-5 text-[16px] leading-7 text-[#4d626f]">
            <p>Before you get quotes for building work in Reading, find out which rules apply to your street. Reading Borough Council has 15 conservation areas, from Redlands and Eldon Square to Castle Hill/Russell Street/Oxford Road and St Peter’s in Caversham. In these areas, new windows, doors or roof coverings may need planning permission unless the materials match what’s already there.</p>
            <p>Some streets have stricter rules. The council has Article 4 directions on a number of patterned brickwork terraces, including School Terrace, Jesse Terrace, Field Road and Wantage Road. These remove permitted development rights, so even a rear extension that would normally go ahead without an application needs planning permission there. A separate Article 4 direction covers much of Park, Redlands and Katesgrove wards. It requires planning permission to turn a family house into a small shared house. The council’s website lists the exact addresses.</p>
            <p>Also check which council covers you. Earley and Woodley are in Wokingham Borough, and part of Tilehurst is in West Berkshire, so planning applications go to those councils.</p>
            <p>The ground matters for extensions too. According to the British Geological Survey, much of the Reading area sits on chalk overlain by clays of the Reading Formation and London Clay. These clays can shrink and swell as they dry out and get wet, so your building control officer or engineer will set the foundation depth, particularly near trees. The survey also records chalk dissolution hollows in places. A good builder will allow for trial holes rather than guessing.</p>
            <p>Reading’s older terraces lend themselves to certain projects:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Kitchen extensions into the side return.</li>
              <li>Loft conversions with a rear dormer.</li>
              <li>Opening up the back rooms. Knocking through usually means taking out a load-bearing wall, which needs a structural engineer’s calculations and building control sign-off.</li>
            </ul>
            <p>On terraced and semi-detached houses, work on or near a shared wall often needs a party wall agreement with your neighbours before it starts.</p>
            <p>When you compare builders, ask for itemised quotes on the same drawings. Check that each quote says who deals with building control and what the payment stages are, and never pay large sums upfront. Reviews on Trade Pilot are tied to real, invoiced jobs, so you can see how a builder has handled projects like yours.</p>
          </div>
        </section>
        <section className="bg-white px-4 pb-12 sm:pb-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">How it works</h2>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map(([title, description], index) => (
                <li key={title} className="flex flex-col rounded-xl border border-[#e4eaed] bg-white p-6 shadow-[0_2px_8px_rgba(0,43,73,0.04)]">
                  <span aria-hidden="true" className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e5f5f4] text-xl font-bold text-[#16aaa5]">{index + 1}</span>
                  <h3 className="text-xl font-semibold text-[#001F3D]"><span className="sr-only">Step {index + 1}: </span>{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#657680]">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every builder before they can quote. Always ask for proof of insurance before work starts." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        {(SERVICE_WAVE_LIVE || TOWN_WAVE_LIVE) && (
          <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">More building help</h2>
              {SERVICE_WAVE_LIVE && (
                <ul className="mt-8 flex flex-wrap justify-center gap-3">
                  {SERVICES.map(({ label, href }) => (
                    <li key={href}><Link to={href} className={pill}>{label}</Link></li>
                  ))}
                </ul>
              )}
              {TOWN_WAVE_LIVE && (
                <ul className="mt-8 flex flex-wrap justify-center gap-3">
                  {NEARBY_TOWNS.map(({ label, href }) => (
                    <li key={href}><Link to={href} className={pill}>{label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">Other trades in Reading</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {OTHER_TRADES.map(({ label, href }) => (
                <li key={href}><Link to={href} className={pill}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Builder?</h2><p className="mt-4 text-white/80">Get matched with vetted builders in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default BuildersReading;
