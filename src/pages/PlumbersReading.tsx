import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileCheck2, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import WhyTradePilot from "@/components/WhyTradePilot";
import { postJobs } from "@/lib/api";

const services = [
  ["Leaks and urgent repairs", "Burst and leaking pipes, dripping taps, running toilets, blocked sinks and drains, and low water pressure.", FileCheck2],
  ["Bathrooms and fittings", "Bathroom and shower room installations, new taps, toilets and basins, outside taps and appliance connections.", ShieldCheck],
  ["Hot water and heating pipework", "Radiator replacements, power flushes, hot water cylinders and immersion heaters. Gas boiler work needs a Gas Safe registered engineer.", FileCheck2],
] as const;

const PRICES = [
  ["Plumber, per hour", "£45–£75", "Many plumbers have a one-hour minimum; day rates are around £325–£450"],
  ["Emergency call-out, out of hours", "£100–£180 call-out, then £75–£150 an hour", "Higher at night, weekends and bank holidays"],
  ["Replace a kitchen or basin tap", "£80–£200", "Includes a standard tap; more if the isolation valves need replacing"],
  ["Repair a leak under a sink or a pipe", "£75–£350", "Minor leaks are at the low end; access problems add time"],
  ["Fix a running toilet", "£65–£150", "Diaphragm or fill valve repairs are cheapest; a full syphon costs more"],
  ["Fit an outside tap", "£100–£200", "For a standard tap close to the supply; longer pipe runs cost more"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How much does a plumber cost in Reading?", "Most plumbers charge between £45 and £75 an hour, often with a one-hour minimum. Fixed prices for small jobs, such as replacing a tap, are common. Prices in Berkshire tend to sit in the upper half of UK ranges."],
  ["How do I find a reliable plumber in Reading?", "Post your job on Trade Pilot with your postcode. Up to 3 vetted plumbers can quote, and reviews come from real, invoiced jobs. Ask for a written quote and check how extra time and parts are charged."],
  ["Does hard water in Reading damage plumbing?", "It can shorten the life of taps, shower valves, cylinders and immersion heaters by building up limescale. Descaling shower heads, fitting scale protection or a water softener, and servicing valves help."],
  ["Can a plumber fix my boiler?", "Only if they’re Gas Safe registered. Any work on a gas boiler must be done by a Gas Safe registered engineer, so check the Gas Safe ID card before work starts."],
  ["What should I do if a pipe bursts?", "Turn off the water at the stop tap, switch off electrics near the leak if it’s safe, open the cold taps to drain the system, and call a plumber. Our guide on burst pipes explains the first steps."],
  ["Do Reading plumbers cover Caversham, Tilehurst, Earley and Woodley?", "Trades choose the postcodes they cover. Enter your postcode when you post your job and we’ll match you with plumbers who work in your area."],
  ["Is it free to get plumbing quotes?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

// Service pages go live in two waves. Flip each flag to true once those pages are deployed.
// The links always show on the local dev server so they can be previewed.
const SERVICE_WAVE_1_LIVE = import.meta.env.DEV || false; // w/c 12 Oct
const SERVICE_WAVE_2_LIVE = import.meta.env.DEV || false; // w/c 19 Oct
const SERVICES = [
  { label: "Emergency plumber in Reading", href: "/plumbers/reading/emergency-plumber", live: SERVICE_WAVE_1_LIVE },
  { label: "Leak detection in Reading", href: "/plumbers/reading/leak-detection", live: SERVICE_WAVE_1_LIVE },
  { label: "Blocked drains in Reading", href: "/plumbers/reading/blocked-drains", live: SERVICE_WAVE_1_LIVE },
  { label: "Bathroom installation in Reading", href: "/plumbers/reading/bathroom-installation", live: SERVICE_WAVE_2_LIVE },
].filter((service) => service.live);

// Suburb pages go live in two waves. Flip the flag to true once those pages are deployed.
const SUBURB_WAVE_1_LIVE = false; // plumbers, w/c 26 Oct
const SUBURBS = [
  { label: "Plumbers in Caversham", href: "/plumbers/caversham" },
  { label: "Plumbers in Tilehurst", href: "/plumbers/tilehurst" },
  { label: "Plumbers in Earley", href: "/plumbers/earley" },
  { label: "Plumbers in Woodley", href: "/plumbers/woodley" },
];

const RELATED_GUIDES = [
  ["How much does a plumber cost?", "/blog/how-much-does-a-plumber-cost-hourly-rates-call-out-fees-and-typical-jobs"],
  ["Burst pipe: what to do first", "/blog/burst-pipe-what-to-do-in-the-first-30-minutes-and-what-a-plumber-will-charge"],
  ["How to choose a plumber", "/blog/how-to-choose-a-plumber-9-checks-before-you-let-anyone-in"],
] as const;

const META_DESCRIPTION = "Compare up to 3 vetted plumbers in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const PlumbersReading = () => {
  useEffect(() => {
    document.title = "Plumbers in Reading | Compare up to 3 Quotes | Trade Pilot";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const previous = meta.content;
    meta.content = META_DESCRIPTION;
    return () => {
      if (!meta) return;
      if (created) meta.remove();
      else meta.content = previous;
    };
  }, []);

  const submitQuoteRequest = (postcode: string) =>
    postJobs({ postcode, job_trade: "Plumbers", trade: "plumber", description: "Plumbing work requested from the Plumbers in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/plumbers" className="hover:underline">Plumbers</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-plumbers-hero-v2.jpg"
          imageAlt="Modern bathroom with a stone basin, illuminated mirror and wall lights"
          imageFit="cover"
          imagePosition="50% 100%"
          tradeName="Plumbers"
          heading="Plumbers in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local plumbers in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a plumber in Reading</h2>
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
            <p>If you’ve lived in Reading for a while, you’ll know the white crust that builds up on taps, shower screens and kettles. Thames Water classes the area’s water as hard to very hard. Its supply zone figures range from about 260 mg/l in Reading East to over 300 mg/l around Tilehurst village. Limescale is behind many local plumbing calls: shower valves that stick, cartridge taps that drip, and immersion heaters and cylinders that slowly lose efficiency.</p>
            <p>The age of Reading’s homes matters too. About a quarter of homes in the borough were built before 1919. In the Victorian terraces of Katesgrove, Newtown and the Oxford Road, pipework has often been altered several times over the decades, so a good plumber will trace runs before cutting in. If your home was built before about 1970, it may still have a lead supply pipe between the stop tap and the street. Your plumber can tell you, and Thames Water can advise on replacing its section.</p>
            <p>Common plumbing jobs in Reading include:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Fixing dripping taps and replacing worn cartridges.</li>
              <li>Repairing leaks under sinks and baths, or behind the toilet.</li>
              <li>Replacing running toilet cistern parts.</li>
              <li>Fitting outside taps.</li>
              <li>Emergency call-outs for burst or frozen pipes in winter.</li>
            </ul>
            <p>Rental homes add to the workload. Around a third of Reading households rent privately, and landlords need quick, reliable repairs between tenancies.</p>
            <p>When choosing a plumber, ask for a written quote that says whether parts are included and how extra time is charged. Check whether there’s a call-out fee or a minimum charge, and ask how long the work is guaranteed for. For anything involving your boiler or gas supply, use a Gas Safe registered engineer instead. Reviews on Trade Pilot are tied to real, invoiced jobs, so you can see what a plumber has done for other Reading homeowners before you invite them round.</p>
            <p>It’s worth knowing where your stop tap is before you need it. In many terraces it’s under the kitchen sink or just inside the front door.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every plumber before they can quote. For any gas work, always ask to see a Gas Safe ID card." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">More plumbing help</h2>
            {SERVICES.length > 0 && (
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
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Plumber?</h2><p className="mt-4 text-white/80">Get matched with vetted plumbers in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default PlumbersReading;
