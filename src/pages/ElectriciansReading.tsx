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
  ["Faults and urgent repairs", "Power cuts to part of the house, a trip switch that keeps going off, sockets or switches that spark or feel warm, and fault finding.", FileCheck2],
  ["Rewiring and fuse box upgrades", "Full and partial rewires, consumer unit replacements with modern RCD protection, extra sockets, new lighting circuits and EV chargers.", ShieldCheck],
  ["Safety checks and certificates", "Electrical Installation Condition Reports (EICRs) for homeowners, buyers and landlords, and certificates for new work.", FileCheck2],
] as const;

const PRICES = [
  ["EICR, 2–3 bed house", "£150–£300", "Any repairs found are quoted separately"],
  ["Consumer unit replacement", "£450–£850", "More for boards with RCBOs or if faults are found"],
  ["Add a double socket", "£80–£180", "More for long cable runs or chasing into plaster"],
  ["Full rewire, 3-bed house", "£4,500–£9,000", "Plastering and redecorating are usually extra"],
  ["EV charger, installed", "£800–£1,300", "Depends on the cable run and whether the consumer unit needs upgrading"],
  ["Replace a light fitting", "£60–£140", "The fitting itself is extra if you don’t supply it"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a registered electrician in Reading?", "Post your job on Trade Pilot with your postcode, and up to 3 vetted electricians covering Reading can quote. Check their registration on the Electrical Competent Person register, and ask for a certificate when the work is done."],
  ["How much does an electrician cost in Reading?", "Hourly rates are typically £45 to £70, and day rates £300 to £480. Most small jobs are priced as a fixed amount. Berkshire prices usually sit in the upper half of UK ranges."],
  ["How often do landlords in Reading need an EICR?", "At least every five years, or sooner if the report says so, with a copy given to tenants. HMO landlords licensed by Reading Borough Council may also need to provide it."],
  ["Do I need a new fuse box?", "If you still have rewirable fuses, or a board without RCD protection, an upgrade is usually recommended. An EICR will tell you whether it’s needed."],
  ["How do I know if my house needs rewiring?", "Warning signs include rubber or fabric-covered cable, round-pin sockets, frequent tripping, scorch marks or a burning smell. An EICR will confirm the condition of your wiring."],
  ["Can I do my own electrical work?", "Don’t DIY. Use a registered electrician. Most new circuits and bathroom work must be notified under Building Regulations, and a registered electrician can do this for you."],
];

// Service pages go live in two waves. Flip each flag to true once those pages are deployed.
// The links always show on the local dev server so they can be previewed.
const SERVICE_WAVE_1_LIVE = import.meta.env.DEV || false; // w/c 12 Oct
const SERVICE_WAVE_2_LIVE = import.meta.env.DEV || false; // w/c 19 Oct
const SERVICES = [
  { label: "Emergency electrician in Reading", href: "/electricians/reading/emergency-electrician", live: SERVICE_WAVE_1_LIVE },
  { label: "EICR electrical safety check in Reading", href: "/electricians/reading/eicr", live: SERVICE_WAVE_2_LIVE },
  { label: "Fuse box replacement in Reading", href: "/electricians/reading/fuse-box-replacement", live: SERVICE_WAVE_2_LIVE },
  { label: "House rewiring in Reading", href: "/electricians/reading/house-rewire", live: SERVICE_WAVE_2_LIVE },
  { label: "EV charger installation in Reading", href: "/electricians/reading/ev-charger-installation", live: SERVICE_WAVE_2_LIVE },
].filter((service) => service.live);

// Suburb pages go live w/c 2 Nov. Flip the flag to true once those pages are deployed.
const SUBURB_WAVE_2_LIVE = false;
const SUBURBS = [
  { label: "Electricians in Caversham", href: "/electricians/caversham" },
  { label: "Electricians in Tilehurst", href: "/electricians/tilehurst" },
  { label: "Electricians in Earley", href: "/electricians/earley" },
  { label: "Electricians in Woodley", href: "/electricians/woodley" },
];

const META_DESCRIPTION = "Compare up to 3 vetted electricians in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const ElectriciansReading = () => {
  useEffect(() => {
    document.title = "Electricians in Reading | Compare up to 3 Quotes";

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
    postJobs({ postcode, job_trade: "Electricians", trade: "electrician", description: "Electrical work requested from the Electricians in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/electricians" className="hover:underline">Electricians</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-electricians-reading-hero.jpg"
          imageAlt="Kitchen with brown wood cabinets, under-cabinet lighting, chrome pendant lights and a stone tile floor"
          imageFit="cover"
          imagePosition="50% 40%"
          tradeName="Electricians"
          heading="Electricians in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local electricians in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find an electrician in Reading</h2>
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
            <p>Electrical work is not something to DIY. Use a registered electrician who can test the work and give you a certificate. Most new circuits, consumer unit replacements and work in bathrooms are notifiable under Part P of the Building Regulations. An electrician registered with a competent person scheme can sign the work off for you, and you can check their registration on the Electrical Competent Person register before they start.</p>
            <p>Reading’s housing is older than average: about a quarter of homes in the borough were built before 1919. Many were rewired decades ago, and some haven’t been fully updated since. Signs that your wiring needs checking include an old fuse box with rewirable fuses, and sockets or light switches with black or brown bakelite fronts. Other warning signs are round-pin sockets, scorch marks, a burning smell, or a trip switch that keeps going off. An Electrical Installation Condition Report, or EICR, is the best starting point. The electrician tests each circuit and tells you what, if anything, needs doing, graded by urgency.</p>
            <p>Renting shapes a lot of electrical work in Reading. Around a third of households here rent privately, and landlords in England must have the electrics in rented homes inspected at least every five years and give tenants a copy of the report. Reading Borough Council has also run borough-wide additional HMO licensing since March 2026, so many shared-house landlords need their electrical paperwork in order. If you’re buying one of Reading’s Victorian terraces or 1930s semis, an EICR before you move in helps you budget for any rewiring while the house is empty.</p>
            <p>Other common jobs include:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Consumer unit upgrades to modern boards with RCD protection.</li>
              <li>Extra sockets for home working.</li>
              <li>Outdoor lighting.</li>
              <li>EV chargers. Many of Reading’s terraced streets have no driveways, so check you have off-street parking before paying for a survey.</li>
            </ul>
            <p>When you compare quotes, check whether testing and certification are included, and how any extra faults found during the job will be priced. For a rewire, ask who will do the plastering and making good afterwards. Reviews on Trade Pilot come from real, invoiced jobs, so you can see the work an electrician has actually completed.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every electrician before they can quote. Always ask to see their registration before work starts." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        {(SERVICES.length > 0 || SUBURB_WAVE_2_LIVE) && (
          <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">More electrician help</h2>
              {SERVICES.length > 0 && (
                <ul className="mt-8 flex flex-wrap justify-center gap-3">
                  {SERVICES.map(({ label, href }) => (
                    <li key={href}><Link to={href} className={pill}>{label}</Link></li>
                  ))}
                </ul>
              )}
              {SUBURB_WAVE_2_LIVE && (
                <ul className="mt-8 flex flex-wrap justify-center gap-3">
                  {SUBURBS.map(({ label, href }) => (
                    <li key={href}><Link to={href} className={pill}>{label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Electrician?</h2><p className="mt-4 text-white/80">Get matched with vetted electricians in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default ElectriciansReading;
