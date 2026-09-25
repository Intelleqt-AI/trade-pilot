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
  ["Kitchen fitting", "Fitting units, worktops, sinks, taps and appliances, whether you’ve bought the kitchen or want it supplied.", FileCheck2],
  ["Worktops and refreshes", "New worktops in laminate, wood or stone, and replacement doors and drawer fronts for a quicker update.", ShieldCheck],
  ["Full kitchen refits", "Strip-out, layout changes, plumbing and electrics, tiling, plastering and finishing.", FileCheck2],
] as const;

const PRICES = [
  ["Kitchen fitting, labour only", "£2,000–£5,000", "Depends on the number of units, worktops and moving services"],
  ["New kitchen, supplied and fitted, budget to mid-range", "£6,000–£15,000", "Unit quality, worktops and appliances make the biggest difference"],
  ["Laminate worktop, supplied and fitted", "£300–£900", "Depends on run length and cut-outs"],
  ["Quartz worktop, supplied and fitted", "£1,500–£4,000", "Includes templating; more with extra cut-outs and upstands"],
  ["Replace kitchen doors and drawer fronts", "£800–£2,500", "For a whole kitchen; depends on the number of doors and the style"],
  ["Tile a splashback", "£200–£600", "Herringbone or small tiles take longer"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a good kitchen fitter in Reading?", "Post your job on Trade Pilot with your postcode, a plan or photos, and whether you’ve bought the kitchen. Up to 3 vetted fitters covering Reading can quote, and you can read reviews from real, invoiced jobs."],
  ["How much does it cost to fit a kitchen in Reading?", "Labour-only fitting typically costs £2,000 to £5,000. Budget to mid-range kitchens supplied and fitted are often £6,000 to £15,000. Berkshire prices tend to be in the upper half of UK ranges."],
  ["Can I knock through to make a kitchen-diner in my terraced house?", "Often yes, but the wall is usually load-bearing. You’ll need a structural engineer’s calculations for a steel beam and building control approval before the work starts."],
  ["Do I need permission to replace the kitchen in my flat?", "Check your lease. Many leases require consent from the freeholder or management company, especially if you’re moving plumbing or changing the layout."],
  ["Who connects the gas hob?", "A Gas Safe registered engineer must connect or move any gas appliance. Don’t DIY it, and ask your fitter who will do this part of the job."],
  ["How long does a kitchen fit take?", "One to two weeks for a straightforward refit. Structural work, moving services and stone worktops, which need templating, add time."],
];

const OTHER_TRADES = [
  { label: "Plumbers in Reading", href: "/plumbers/reading" },
  { label: "Electricians in Reading", href: "/electricians/reading" },
  { label: "Gas and boiler engineers in Reading", href: "/gas-engineers/reading" },
  { label: "Builders in Reading", href: "/builders/reading" },
  { label: "Roofers in Reading", href: "/roofers/reading" },
  { label: "Painters and decorators in Reading", href: "/painters-decorators/reading" },
  { label: "Carpenters and joiners in Reading", href: "/carpenters/reading" },
];

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const META_DESCRIPTION = "Compare up to 3 vetted kitchen fitters in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const KitchenFittersReading = () => {
  useEffect(() => {
    document.title = "Kitchen Fitters in Reading | Compare up to 3 Quotes";

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
    postJobs({ postcode, job_trade: "Kitchen Fitters", trade: "kitchen_fitter", description: "Kitchen fitting work requested from the Kitchen Fitters in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/kitchen-fitters" className="hover:underline">Kitchen Fitters</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-kitchen-fitters-hero.jpg"
          imageAlt="Modern kitchen with white handleless cabinets, a stone worktop and splashback, a gas hob and a stainless steel tap"
          imageFit="cover"
          imagePosition="50% 60%"
          tradeName="Kitchen Fitters"
          heading="Kitchen Fitters in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local kitchen fitters in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a kitchen fitter in Reading</h2>
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
            <p>The shape of your kitchen in Reading often depends on when your house was built. According to the 2021 Census, terraced houses and purpose-built flats each make up just over a quarter of Reading’s homes, and semi-detached houses about the same. Each type brings its own kitchen challenges.</p>
            <p>In the town’s Victorian terraces, the kitchen is often a narrow room at the back of the house, with a dining room in front of it. Many owners open the two up or build into the side return. That usually means removing a load-bearing wall, which needs a structural engineer’s calculations and building control approval. Sort that out before the kitchen is ordered. Uneven floors and walls that aren’t square are normal in older houses, so ask how the fitter will level the units and scribe worktops to fit.</p>
            <p>In flats, including the newer blocks at Kennet Island, Green Park Village and the town centre, check your lease before you start. Many need the freeholder’s or management company’s consent for a new kitchen. Moving the sink can be limited by where the waste pipes can run. Deliveries, parking and lift bookings are worth planning too.</p>
            <p>Reading’s hard water is worth thinking about when you choose finishes. Limescale marks show quickly on dark sinks, black taps and glossy worktops, so a filter tap or water softener may be worth adding while the plumbing is exposed.</p>
            <p>A kitchen job usually involves more than one trade. Any work on a gas hob or cooker must be done by a Gas Safe registered engineer, and new electrical circuits by a registered electrician who can certify them, so don’t DIY either. Ask each fitter which parts they do themselves and who they bring in for the rest.</p>
            <p>When comparing quotes, make sure they cover the same scope: fitting only or supplied and fitted, removal and disposal of the old kitchen, worktop templating, tiling, plastering and decorating. Reviews on Trade Pilot are tied to real, invoiced jobs, so you can see finished kitchens a fitter has actually been paid for.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every kitchen fitter before they can quote. Ask who will do the gas and electrical parts of your job." />
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
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Kitchen Fitter?</h2><p className="mt-4 text-white/80">Get matched with vetted kitchen fitters in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default KitchenFittersReading;
