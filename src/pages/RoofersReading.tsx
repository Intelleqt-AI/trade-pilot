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
  ["Roof repairs", "Slipped or broken tiles and slates, leaks, ridge tiles, chimney flashing and storm damage.", FileCheck2],
  ["Flat roofs and new roofs", "Flat roof repairs and replacements in felt, rubber or fibreglass, and full re-roofs.", ShieldCheck],
  ["Gutters, fascias and soffits", "Gutter clearing and repairs, replacement guttering and downpipes, fascias and soffits.", FileCheck2],
] as const;

const PRICES = [
  ["Replace a few slipped tiles or slates", "£150–£500", "The top end usually means scaffolding is needed"],
  ["Chimney flashing repair", "£250–£1,200", "A patch repair is cheapest; new lead and scaffolding cost more"],
  ["Rebed or repoint ridge tiles", "£250–£700", "Depends on the length of the ridge and access"],
  ["Flat roof replacement", "£60–£120 per m²", "Felt is cheapest; EPDM rubber and fibreglass cost more"],
  ["Gutter clearing", "£75–£180", "Depends on house size, number of storeys and access"],
  ["Full re-roof, terraced house", "£5,000–£9,000", "Natural slate and scaffolding push costs up; semi-detached houses often cost £7,000–£14,000"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a reliable roofer in Reading?", "Post your job on Trade Pilot with your postcode and any photos, and up to 3 vetted roofers covering Reading can quote. Ask for photos of the problem, a written quote and details of any guarantee."],
  ["How much does a roof repair cost in Reading?", "Replacing a few slipped slates or tiles typically costs £150 to £500. The top end usually means scaffolding is needed. Chimney and flashing repairs are often £250 to £1,200."],
  ["Why do slates keep slipping on my Victorian roof?", "Usually because the original nails have corroded. The occasional slipped slate can be refixed, but if it keeps happening across the roof, re-slating may be better value than repeated repairs."],
  ["Do I need planning permission to replace my roof in Reading?", "Usually not, if you use similar materials. In a conservation area, or on a street with an Article 4 direction, changing the roof covering may need permission. Check with the council first."],
  ["How long does a flat roof last?", "Traditional felt often lasts 15 to 20 years. EPDM rubber and fibreglass roofs can last longer if they’re well installed."],
  ["When should I get my gutters cleaned?", "Late autumn, once most leaves have fallen, and again in spring if you have trees nearby. Overflowing gutters can cause damp in walls."],
];

// Service pages go live in two waves. Flip each flag to true once those pages are deployed.
// The links always show on the local dev server so they can be previewed.
const SERVICE_WAVE_1_LIVE = import.meta.env.DEV || false; // w/c 12 Oct
const SERVICE_WAVE_2_LIVE = import.meta.env.DEV || false; // w/c 19 Oct
const SERVICES = [
  { label: "Roof repair in Reading", href: "/roofers/reading/roof-repair", live: SERVICE_WAVE_1_LIVE },
  { label: "Gutter cleaning and repair in Reading", href: "/roofers/reading/gutter-repair", live: SERVICE_WAVE_1_LIVE },
  { label: "Flat roof repair in Reading", href: "/roofers/reading/flat-roof-repair", live: SERVICE_WAVE_2_LIVE },
].filter((service) => service.live);

// Suburb pages go live w/c 2 Nov. Flip the flag to true once those pages are deployed.
const SUBURB_WAVE_2_LIVE = false;
const SUBURBS = [
  { label: "Roofers in Caversham", href: "/roofers/caversham" },
  { label: "Roofers in Tilehurst", href: "/roofers/tilehurst" },
  { label: "Roofers in Earley", href: "/roofers/earley" },
  { label: "Roofers in Woodley", href: "/roofers/woodley" },
];

const META_DESCRIPTION = "Compare up to 3 vetted roofers in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const RoofersReading = () => {
  useEffect(() => {
    document.title = "Roofers in Reading | Compare up to 3 Quotes | Trade Pilot";

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
    postJobs({ postcode, job_trade: "Roofers", trade: "roofer", description: "Roofing work requested from the Roofers in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/roofers" className="hover:underline">Roofers</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-roofers-reading-hero.jpg"
          imageAlt="Red brick semi-detached house with a tiled roof, two chimneys and a glass extension, seen from the back garden"
          imageFit="cover"
          imagePosition="50% 25%"
          tradeName="Roofers"
          heading="Roofers in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local roofers in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a roofer in Reading</h2>
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
            <p>Look up along almost any Victorian street in Reading and you’ll see slate. The council’s appraisal of the Redlands conservation area describes low-pitched slate roofs, some with patterned fishscale slates. It also notes distinctive red clay tiles on the Old English Revival houses nearby. With about a quarter of the borough’s homes built before 1919, many Reading roofs are well over a century old. Their original slates, nails and battens are reaching the end of their life.</p>
            <p>On older slate roofs, the most common problem is nail sickness. The nails holding each slate corrode, and slates slip one by one, often after autumn winds. A single slipped slate is a quick repair, but lots of them suggest the roof needs re-slating. Chimney stacks are another frequent job on period terraces. Look out for worn mortar joints, cracked flaunching and failed lead flashing where the stack meets the roof, all of which let water in. On 1930s homes around the suburbs, clay or concrete tiles, ridge tiles that need rebedding, and bay window roofs are more typical. Flat roofs on rear extensions, dormers and garages are common across Reading, and older felt roofs often start to leak after 15 to 20 years.</p>
            <p>If you live in one of Reading’s 15 conservation areas, check with the council before you replace a roof covering with a different material, such as swapping natural slate for concrete tiles. It may need planning permission. On streets covered by Article 4 directions, including several patterned brickwork terraces, the rules are tighter.</p>
            <p>Scaffolding is often the biggest single cost in a roofing quote, so ask whether it’s included and how long it will be up. Check that the roofer will send photos of the problem from the roof, as many do. If you’re getting a new roof, ask what membrane and battens they’ll use and what guarantee comes with the work. Reviews on Trade Pilot come from real, invoiced jobs, so you can see which roofers have finished similar work for other homeowners.</p>
            <p>Autumn is a good time to have gutters cleared and a roof checked, before winter storms find any weak points.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every roofer before they can quote. Always ask for proof of insurance before work starts." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        {(SERVICES.length > 0 || SUBURB_WAVE_2_LIVE) && (
          <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">More roofing help</h2>
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
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Roofer?</h2><p className="mt-4 text-white/80">Get matched with vetted roofers in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default RoofersReading;
