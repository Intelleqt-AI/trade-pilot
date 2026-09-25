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
  ["Doors, floors and fittings", "Hanging internal doors, fire doors, skirting, architrave, laminate and wood floors.", FileCheck2],
  ["Fitted storage", "Alcove cupboards, fitted wardrobes, shelving and understairs storage.", ShieldCheck],
  ["Joinery and repairs", "Sash window overhauls, staircases and balustrades, and repairs to original features.", FileCheck2],
] as const;

const PRICES = [
  ["Carpenter day rate", "£220–£360", "Berkshire rates tend to be in the upper half"],
  ["Hang an internal door", "£80–£200 per door", "Labour only; fire doors or new frames cost more"],
  ["Fitted alcove cupboards", "£800–£2,500", "Depends on size, materials and whether they’re painted"],
  ["Replace skirting boards, one room", "£225–£450", "More for hardwood or matching period profiles"],
  ["Sash window overhaul", "£250–£950 per window", "A full refurbishment with rot repairs is at the top end"],
  ["New staircase balustrade", "£700–£1,800", "Oak or glass cost more than softwood"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a good carpenter in Reading?", "Post your job on Trade Pilot with your postcode, measurements and photos, and up to 3 vetted carpenters covering Reading can quote. Read reviews from real, invoiced jobs before you choose."],
  ["How much does a carpenter cost in Reading?", "Day rates are typically £220 to £360. Many small jobs, such as hanging a door, are priced per item."],
  ["Can old sash windows be repaired instead of replaced?", "Usually yes. A joiner can replace cords, repair rot and add draught-proofing, which often costs less than new windows. It can also avoid a planning application in a conservation area."],
  ["Do I need fire doors in my rented house in Reading?", "Shared houses and HMOs often need fire doors on bedrooms and kitchens. Check Reading Borough Council’s licensing requirements for your property, and use a carpenter who fits certified fire doors correctly."],
  ["How much do fitted alcove cupboards cost?", "Typically £800 to £2,500, depending on the size, the materials and whether painting is included."],
  ["What is the difference between a carpenter and a joiner?", "Joiners usually make items like windows, doors and stairs, often in a workshop. Carpenters usually fit and build on site. Many do both."],
];

const OTHER_TRADES = [
  { label: "Plumbers in Reading", href: "/plumbers/reading" },
  { label: "Electricians in Reading", href: "/electricians/reading" },
  { label: "Gas and boiler engineers in Reading", href: "/gas-engineers/reading" },
  { label: "Builders in Reading", href: "/builders/reading" },
  { label: "Roofers in Reading", href: "/roofers/reading" },
  { label: "Painters and decorators in Reading", href: "/painters-decorators/reading" },
  { label: "Kitchen fitters in Reading", href: "/kitchen-fitters/reading" },
];

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const META_DESCRIPTION = "Compare up to 3 vetted carpenters and joiners in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const CarpentersReading = () => {
  useEffect(() => {
    document.title = "Carpenters & Joiners in Reading | Compare up to 3 Quotes";

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
    postJobs({ postcode, job_trade: "Carpenters & Joiners", trade: "carpenter", description: "Carpentry or joinery work requested from the Carpenters & Joiners in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/carpenters" className="hover:underline">Carpenters &amp; Joiners</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-carpenters-hero.jpg"
          imageAlt="Kitchen with oak veneer tall units, open timber shelves against grey tiles and white handleless cabinets"
          imageFit="cover"
          imagePosition="50% 40%"
          tradeName="Carpenters & Joiners"
          heading="Carpenters & Joiners in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local carpenters and joiners in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a carpenter in Reading</h2>
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
            <p>Reading’s period homes keep carpenters and joiners busy. About a quarter of homes in the borough were built before 1919, and many still have original timber sash windows, panelled doors, staircases and deep skirting boards. Much of the best joinery work here is repair: keeping those features working rather than ripping them out.</p>
            <p>Sash windows are the classic example. The council’s Redlands conservation area appraisal describes timber sashes with nine and twelve panes, and similar windows survive across the town’s Victorian and Edwardian streets. A joiner can usually overhaul a tired sash by replacing the cords, easing the sashes, cutting out rot and splicing in new timber, and adding draught-proofing brushes. That’s often much cheaper than replacement. In Reading’s 15 conservation areas, replacement windows that don’t match the existing materials may need planning permission, so repair can also save a planning application.</p>
            <p>Inside, the chimney breasts in many terraces leave alcoves either side, which suit fitted cupboards and shelving. Ask whether the carpenter will scribe the units to the uneven walls, and whether the price includes painting. Victorian homes often have suspended timber floors. Creaking boards, gaps and damaged joists are common repairs, and they’re worth fixing before new flooring goes down. Replacing lost skirting or architrave with a matching profile is a job for a joiner with the right cutters, so send a photo when you post your job.</p>
            <p>Reading also has a lot of shared rented housing. The council has run borough-wide additional HMO licensing since March 2026, and shared houses often need fire doors and self-closers on bedrooms and kitchens. If you’re a landlord, check the council’s licensing requirements, then get a carpenter to quote for certified fire doors fitted correctly.</p>
            <p>When comparing quotes, check the materials, such as MDF, softwood or oak, whether the finish is ready to paint or fully decorated, and how the carpenter deals with uneven walls and floors. Reviews on Trade Pilot come from real, invoiced jobs, so you can see finished work before you choose.</p>
          </div>
        </section>
        <section className="bg-white px-4 pb-12 sm:pb-16">
          <div className="container mx-auto">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Typical prices</h2>
            <div className="overflow-x-auto rounded-xl border border-[#e4eaed]">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm sm:text-base">
                <thead className="bg-[#f7f9fa] text-[#001F3D]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Job</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Typical UK range</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-[#4d626f]">
                  {PRICES.map(([job, range, notes]) => (
                    <tr key={job} className="border-t border-[#e4eaed]">
                      <th scope="row" className="px-4 py-3 font-medium text-[#001F3D]">{job}</th>
                      <td className="px-4 py-3 font-semibold text-[#001F3D] sm:whitespace-nowrap">{range}</td>
                      <td className="px-4 py-3">{notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[#657680]">Typical UK ranges; your quotes depend on the job and access.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every carpenter before they can quote. Ask to see photos of similar work they’ve completed." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">Other trades in Reading</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {OTHER_TRADES.map(({ label, href }) => (
                <li key={href}><Link to={href} className={pill}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Carpenter?</h2><p className="mt-4 text-white/80">Get matched with vetted carpenters and joiners in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default CarpentersReading;
