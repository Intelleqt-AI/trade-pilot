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
  ["Boiler repairs", "No heating or hot water, error codes, low pressure, leaks and noisy boilers.", FileCheck2],
  ["Servicing and safety checks", "Annual boiler services, and landlord gas safety certificates for every gas appliance in a rented home.", ShieldCheck],
  ["New boilers and heating", "Combi, system and regular boiler replacements, radiators, power flushes and magnetic filters.", FileCheck2],
] as const;

const PRICES = [
  ["Annual boiler service", "£80–£150", "Many warranties need a yearly service"],
  ["Boiler repair, typical fault", "£150–£450", "A major part such as the PCB or heat exchanger can cost £400–£750"],
  ["New combi boiler, like-for-like swap", "£2,200–£4,000", "Depends on the boiler brand, flue changes, filter and warranty length"],
  ["Landlord gas safety certificate", "£65–£110", "Add about £10–£15 for each extra appliance"],
  ["Magnetic system filter, fitted", "£150–£280", "Often fitted with a new boiler or after a power flush"],
  ["Power flush", "£400–£800", "Depends on the number of radiators and the system’s condition"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a Gas Safe engineer in Reading?", "Post your job on Trade Pilot with your postcode, and up to 3 vetted gas engineers who cover Reading can quote. Before work starts, check the engineer’s Gas Safe ID card and licence number on the Gas Safe Register."],
  ["How much is a boiler service in Reading?", "Most boiler services cost between £80 and £150. Booking it together with a landlord gas safety check, if you let the property, can reduce the total."],
  ["Does Reading’s hard water affect my boiler?", "Yes. Limescale builds up in the part of a combi boiler that heats your hot water, causing uneven temperatures and noise. A scale reducer, regular servicing and a magnetic filter help protect a new boiler."],
  ["How often do landlords in Reading need a gas safety check?", "Every 12 months, by a Gas Safe registered engineer, with a copy of the record given to tenants. HMO landlords licensed by Reading Borough Council may also need to show these records."],
  ["Should I repair or replace my boiler?", "If the boiler is over 10 to 15 years old, breaks down often, or needs an expensive part, replacement is often worth pricing. Ask an engineer to quote for both so you can compare."],
  ["What should I do if I smell gas?", "Leave the property, turn off the gas at the meter if it’s safe, open windows, and call the National Gas Emergency Service on 0800 111 999. Don’t use switches or naked flames."],
];

// Service pages go live w/c 12 Oct. Flip the flag to true once those pages are deployed.
// The links always show on the local dev server so they can be previewed.
const SERVICE_WAVE_1_LIVE = import.meta.env.DEV || false;
const SERVICES = [
  { label: "Boiler repair in Reading", href: "/gas-engineers/reading/boiler-repair" },
  { label: "Boiler service in Reading", href: "/gas-engineers/reading/boiler-service" },
  { label: "New boiler installation in Reading", href: "/gas-engineers/reading/boiler-installation" },
  { label: "Landlord gas safety certificate in Reading", href: "/gas-engineers/reading/landlord-gas-safety-certificate" },
];

// Suburb pages go live in a wave from w/c 26 Oct. Flip the flag to true once those pages are deployed.
const SUBURB_WAVE_1_LIVE = false;
const SUBURBS = [
  { label: "Gas engineers in Caversham", href: "/gas-engineers/caversham" },
  { label: "Gas engineers in Tilehurst", href: "/gas-engineers/tilehurst" },
  { label: "Gas engineers in Earley", href: "/gas-engineers/earley" },
  { label: "Gas engineers in Woodley", href: "/gas-engineers/woodley" },
];

const RELATED_GUIDES = [
  ["New boiler costs explained", "/blog/new-boiler-cost-combi-system-and-regular-boiler-prices-explained"],
] as const;

const META_DESCRIPTION = "Compare up to 3 vetted gas and boiler engineers in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const GasEngineersReading = () => {
  useEffect(() => {
    document.title = "Gas & Boiler Engineers in Reading | Compare up to 3 Quotes";

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
    postJobs({ postcode, job_trade: "Gas & Boiler Engineers", trade: "gas_engineer", description: "Gas or boiler work requested from the Gas & Boiler Engineers in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/gas-engineers" className="hover:underline">Gas &amp; Boiler Engineers</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-gas-engineers-hero.jpg"
          imageAlt="Modern kitchen with white handleless cabinets, a stone worktop and splashback, a gas hob and a stainless steel tap"
          imageFit="cover"
          imagePosition="50% 60%"
          tradeName="Gas & Boiler Engineers"
          heading="Gas & Boiler Engineers in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local gas and boiler engineers in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a gas engineer in Reading</h2>
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
            <p>Gas work is not a DIY job. By law, anyone working on your boiler, gas fire or cooker must be on the Gas Safe Register, so always use a Gas Safe registered engineer. Before they start, ask to see their Gas Safe ID card and check the back to confirm they are qualified for the type of appliance you have.</p>
            <p>Reading’s hard water is the local issue most heating engineers will raise. Water here is classed as hard to very hard, and limescale builds up fastest where water is heated. In a combi boiler, that means the plate heat exchanger that makes your hot water. Signs include hot water that swings between hot and cold, a boiler that bangs or kettles, and flow that drops over time. Long-standing building regulations guidance recommends scale protection on combi boilers and water heaters where hardness is above 200 parts per million, and Reading is well above that. When you get quotes for a new boiler, check each one includes a scale reducer, as well as a magnetic system filter and chemical inhibitor.</p>
            <p>House type affects the right boiler. Many of Reading’s Victorian and Edwardian terraces have a combi in the kitchen, which suits one bathroom. Larger period houses and family homes with two bathrooms may be better served by a system boiler with a cylinder. Older solid-walled homes lose heat faster, so a good engineer will size the boiler and radiators to the house rather than simply matching the old boiler’s output. If you live in one of Reading’s 15 conservation areas, ask where the new flue will go before you agree a design.</p>
            <p>Rental homes are a big part of the work here. Around a third of Reading households rent privately, and every rented home with gas needs a landlord gas safety check every 12 months. The council’s borough-wide additional HMO licensing, in force since March 2026, means many shared-house landlords must show these records.</p>
            <p>When comparing quotes, check the boiler make and model, the warranty length and what it needs to stay valid, whether the system will be flushed, and what the flue and condensate work involves. Reviews on Trade Pilot come from real, invoiced jobs.</p>
            <p>If you smell gas, leave the property, turn off the gas at the meter if it’s safe to do so, and call 0800 111 999.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every engineer before they can quote. Always ask to see a Gas Safe ID card before work starts." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">More gas and boiler help</h2>
            {SERVICE_WAVE_1_LIVE && (
              <ul className="mt-8 flex flex-wrap justify-center gap-3">
                {SERVICES.map(({ label, href }) => (
                  <li key={href}><Link to={href} className={pill}>{label}</Link></li>
                ))}
              </ul>
            )}
            {SUBURB_WAVE_1_LIVE && (
              <ul className="mt-8 flex flex-wrap justify-center gap-3">
                {SUBURBS.map(({ label, href }) => (
                  <li key={href}><Link to={href} className={pill}>{label}</Link></li>
                ))}
              </ul>
            )}
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {RELATED_GUIDES.map(([label, href]) => (
                <li key={href}><a href={href} className={pill}>{label}</a></li>
              ))}
            </ul>
          </div>
        </section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Gas Engineer?</h2><p className="mt-4 text-white/80">Get matched with vetted gas and boiler engineers in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default GasEngineersReading;
