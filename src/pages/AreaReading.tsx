import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import WhyTradePilot from "@/components/WhyTradePilot";
import { postJobs } from "@/lib/api";

const TRADE_PAGES = [
  { label: "Plumbers", href: "/plumbers" },
  { label: "Electricians", href: "/electricians" },
  { label: "Gas & Boiler Engineers", href: "/gas-engineers" },
  { label: "Builders", href: "/builders" },
  { label: "Roofers", href: "/roofers" },
  { label: "Painters & Decorators", href: "/painters-decorators" },
  { label: "Kitchen Fitters", href: "/kitchen-fitters" },
  { label: "Carpenters & Joiners", href: "/carpenters" },
] as const;

const faqs = [
  ["How do I find trusted tradesmen in Reading?", "Post your job on Trade Pilot with your Reading postcode. Up to 3 vetted local trades can quote, and reviews come from real, invoiced jobs. Before you choose, check the right registration, such as Gas Safe for gas work."],
  ["Which trades can I find on Trade Pilot in Reading?", "Plumbers, electricians, builders, roofers, gas and boiler engineers, painters and decorators, kitchen fitters, and carpenters and joiners."],
  ["Is Reading water hard?", "Yes. Thames Water classes water in the Reading area as hard to very hard. Limescale builds up in taps, showers and boilers, so scale protection is worth discussing when you fit a new boiler or water heater."],
  ["Do I need planning permission for work on my Reading home?", "It depends on the work and where you live. Reading has 15 conservation areas and some streets with extra controls. Replacing windows, doors or roof coverings with different materials may need permission there. Check with Reading Borough Council, or with Wokingham or West Berkshire council if your home is in their area."],
  ["Is it free to get quotes?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
  ["Do tradespeople on Trade Pilot cover Caversham, Tilehurst, Earley and Woodley?", "Trades choose the postcodes they cover. Enter your postcode when you post your job, and we’ll match you with trades that cover your area."],
];

const PRICES = [
  ["Annual boiler service","£80–£150","Often cheaper when booked with a landlord gas safety check"],
  ["Plumber, per hour","£45–£75","Many plumbers charge a minimum of one hour"],
  ["EICR electrical safety check, 2–3 bed house","£150–£300","Any repairs found are quoted separately"],
  ["Replace a few slipped roof tiles","£150–£500","The top end usually means scaffolding is needed"],
  ["Paint one room, walls and ceiling","£300–£650","Depends on room size and how much preparation is needed"],
  ["Kitchen fitting, labour only","£2,000–£5,000","Depends on the number of units, worktops and moving services"],
] as const;

const STEPS = [
  ["Tell us about the job","Choose the trade, check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes","Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose","Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

// Trade pages for Reading. These go live w/c 5 Oct.
const READING_TRADE_LINKS = [
  ["Plumbers in Reading","/plumbers/reading"],
  ["Electricians in Reading","/electricians/reading"],
  ["Builders in Reading","/builders/reading"],
  ["Roofers in Reading","/roofers/reading"],
  ["Gas and boiler engineers in Reading","/gas-engineers/reading"],
  ["Painters and decorators in Reading","/painters-decorators/reading"],
  ["Kitchen fitters in Reading","/kitchen-fitters/reading"],
  ["Carpenters and joiners in Reading","/carpenters/reading"],
] as const;

// Suburb pages go live in two waves. Flip each flag to true once those pages are deployed.
const SUBURB_WAVE_1_LIVE = false; // plumbers and gas engineers, w/c 26 Oct
const SUBURB_WAVE_2_LIVE = false; // electricians and roofers, w/c 2 Nov

const suburbLinks = (name: string, slug: string) => [
  { label: `Plumbers in ${name}`, href: `/plumbers/${slug}`, live: SUBURB_WAVE_1_LIVE },
  { label: `Gas engineers in ${name}`, href: `/gas-engineers/${slug}`, live: SUBURB_WAVE_1_LIVE },
  { label: `Electricians in ${name}`, href: `/electricians/${slug}`, live: SUBURB_WAVE_2_LIVE },
  { label: `Roofers in ${name}`, href: `/roofers/${slug}`, live: SUBURB_WAVE_2_LIVE },
];

const SUBURBS = [
  { name: "Caversham", links: suburbLinks("Caversham", "caversham") },
  { name: "Tilehurst", links: suburbLinks("Tilehurst", "tilehurst") },
  { name: "Earley", links: suburbLinks("Earley", "earley") },
  { name: "Woodley", links: suburbLinks("Woodley", "woodley") },
]
  .map((suburb) => ({ ...suburb, links: suburb.links.filter((link) => link.live) }))
  .filter((suburb) => suburb.links.length > 0);

const RELATED_GUIDES = [
  ["How much does a plumber cost?","/blog/how-much-does-a-plumber-cost-hourly-rates-call-out-fees-and-typical-jobs"],
  ["New boiler costs explained","/blog/new-boiler-cost-combi-system-and-regular-boiler-prices-explained"],
  ["Burst pipe: what to do first","/blog/burst-pipe-what-to-do-in-the-first-30-minutes-and-what-a-plumber-will-charge"],
  ["How to choose a plumber","/blog/how-to-choose-a-plumber-9-checks-before-you-let-anyone-in"],
] as const;

const META_DESCRIPTION = "Compare up to 3 vetted tradesmen in Reading. Reviews from real, invoiced jobs and free quotes in 60 seconds.";

const AreaReading = () => {
  useEffect(() => {
    document.title = "Tradesmen in Reading | Compare Quotes";
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
    postJobs({ postcode, job_trade: "Any trade", trade: "general", description: "Work requested from the Reading town hub page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li>Areas</li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-reading-hero.jpg"
          imageAlt="Kitchen with dark wood cabinets, a marble island, chrome pendant lights and a black extractor hood"
          imageFit="cover"
          imagePosition="50% 50%"
          tradeName="Tradespeople"
          heading="Find Trusted Tradesmen in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local trades in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a tradesperson in Reading</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TRADE_PAGES.map(({ label, href }) => (
                <Link key={href} to={href} className="group flex items-center justify-between rounded-xl border border-[#e4eaed] bg-white p-5 shadow-[0_2px_8px_rgba(0,43,73,0.04)] transition hover:border-[#16aaa5]">
                  <span className="text-base font-semibold text-[#001F3D]">{label}</span>
                  <ArrowRight aria-hidden="true" className="h-5 w-5 text-[#16aaa5] transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-white px-4 pb-12 sm:pb-16">
          <div className="container mx-auto space-y-5 text-[16px] leading-7 text-[#4d626f]">
            <p>Reading has an older housing stock than most of England. About a quarter of homes in the borough were built before 1919, compared with around a fifth nationally, according to Valuation Office Agency figures. Walk through Katesgrove, Newtown or Redlands and you’ll see why: long Victorian terraces in the town’s own red brick, often patterned with silver-grey bricks made in local brickworks. Alongside them are inter-war semis in the suburbs, post-war estates, and newer flats and houses at Kennet Island and Green Park Village.</p>
            <p>That mix shapes the work Reading homes need. According to the 2021 Census, terraced houses and purpose-built flats each make up just over a quarter of Reading’s homes. Older terraces tend to need roof, chimney, window and rewiring work, while newer homes are more likely to need boiler servicing, fault-finding and upgrades.</p>
            <p>A few local points are worth knowing before you hire:</p>
            <ul className="list-disc space-y-3 pl-6">
              <li><strong className="font-semibold text-[#001F3D]">Hard water.</strong> Reading’s tap water is classed as hard to very hard. Limescale shortens the life of taps, showers, kettles and the hot water side of combi boilers, so ask your plumber or heating engineer about scale protection.</li>
              <li><strong className="font-semibold text-[#001F3D]">Conservation areas.</strong> Reading Borough Council has 15 conservation areas, including Redlands, Eldon Square, Castle Hill/Russell Street/Oxford Road and St Peter’s in Caversham. Some patterned brick terraces also have extra planning controls. Check with the council before changing windows, doors or roofs at the front of the house.</li>
              <li><strong className="font-semibold text-[#001F3D]">Renting.</strong> Around a third of Reading households rent privately, and the council has run borough-wide additional HMO licensing since March 2026. Landlords need regular gas and electrical safety checks.</li>
              <li><strong className="font-semibold text-[#001F3D]">Flooding.</strong> Low-lying parts of Caversham and Southcote flooded when the Thames rose in January 2024. If you’re near the rivers, you can sign up for Environment Agency flood warnings.</li>
              <li><strong className="font-semibold text-[#001F3D]">Council boundaries.</strong> Earley and Woodley are in Wokingham Borough, and part of Tilehurst is in West Berkshire. Planning and building control questions go to the council for your address.</li>
            </ul>
            <p>To find a good tradesperson in Reading, get more than one quote, ask for it in writing, and check the right registration for the job: the Gas Safe Register for gas work, and a registered electrician for electrical work. Reviews on Trade Pilot are tied to real, invoiced jobs, so you can see what a trade has actually done for other homeowners.</p>
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
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-[#001F3D]">{range}</td>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">Trades in Reading</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {READING_TRADE_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]">{label}</Link>
                </li>
              ))}
            </ul>
            {SUBURBS.length > 0 && (
              <div className="mt-10 grid gap-8 text-left sm:grid-cols-2">
                {SUBURBS.map(({ name, links }) => (
                  <div key={name}>
                    <h3 className="text-lg font-semibold text-[#001F3D]">{name}</h3>
                    <ul className="mt-3 space-y-2">
                      {links.map(({ label, href }) => (
                        <li key={href}><Link to={href} className="text-[#16aaa5] underline underline-offset-4 hover:text-[#0f7f7a]">{label}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">Related guides</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {RELATED_GUIDES.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Local Tradesperson?</h2><p className="mt-4 text-white/80">Get matched with vetted trades in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default AreaReading;
