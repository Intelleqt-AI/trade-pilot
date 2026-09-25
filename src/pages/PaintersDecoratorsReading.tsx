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
  ["Interior painting", "Walls, ceilings and woodwork in single rooms or whole houses, including hallways, stairs and landings.", FileCheck2],
  ["Wallpapering and preparation", "Stripping old paper, filling and lining walls, and hanging wallpaper and feature walls.", ShieldCheck],
  ["Exterior painting", "Windows, doors, fascias, bargeboards and masonry, including sash windows on older homes.", FileCheck2],
] as const;

const PRICES = [
  ["Paint one room, walls and ceiling", "£300–£650", "Large living rooms can be up to about £1,000"],
  ["Decorator day rate", "£200–£350", "Berkshire rates tend to be in the upper half"],
  ["Hall, stairs and landing", "£900–£1,800", "Height, spindles and access towers add time"],
  ["Paint a sash window", "£200–£500 per window", "Depends on stripping, putty repairs and upper-floor access"],
  ["Exterior of a terraced house", "£1,200–£3,000", "Semi-detached houses are often £2,000–£5,000; scaffolding can be extra"],
  ["Hang wallpaper, one room", "£300–£650", "Labour only; stripping old paper adds time"],
] as const;

const STEPS = [
  ["Tell us about the job", "Check your Reading postcode and describe what you need. Photos help."],
  ["Get up to 3 quotes", "Up to 3 vetted local trades who cover your part of Reading can quote."],
  ["Compare and choose", "Read reviews from their real, invoiced jobs, compare the quotes, and choose who to invite round. Or choose no one."],
] as const;

const faqs = [
  ["How do I find a good painter and decorator in Reading?", "Post your job on Trade Pilot with your postcode and photos, and up to 3 vetted decorators covering Reading can quote. Compare what preparation each quote includes, and read reviews from real, invoiced jobs."],
  ["How much does a decorator charge in Reading?", "Day rates are typically £200 to £350. Painting one room usually costs £300 to £650, depending on size and preparation."],
  ["Can I paint the brick front of my house in Reading?", "Think carefully first, as it’s hard to reverse. On streets with Article 4 directions, and in conservation areas, check with Reading Borough Council before painting or rendering the front of the house."],
  ["How much does it cost to paint sash windows?", "Typically £200 to £500 per window, depending on how much stripping and repair is needed and whether it’s on an upper floor."],
  ["Is old paint in my Victorian house dangerous?", "Paint applied before the 1960s may contain lead. Don’t dry-sand it. A good decorator will test it and use safe methods, such as wet sanding or chemical strippers."],
  ["How long does it take to decorate a room?", "One to two days for most bedrooms and living rooms, including preparation and two coats. Wallpaper removal and plaster repairs take longer."],
];

const OTHER_TRADES = [
  { label: "Plumbers in Reading", href: "/plumbers/reading" },
  { label: "Electricians in Reading", href: "/electricians/reading" },
  { label: "Gas and boiler engineers in Reading", href: "/gas-engineers/reading" },
  { label: "Builders in Reading", href: "/builders/reading" },
  { label: "Roofers in Reading", href: "/roofers/reading" },
  { label: "Kitchen fitters in Reading", href: "/kitchen-fitters/reading" },
  { label: "Carpenters and joiners in Reading", href: "/carpenters/reading" },
];

const UP_LINKS = [
  { label: "All trades in Reading", href: "/areas/reading" },
  { label: "Painters and decorators near you", href: "/painters-decorators" },
];

const pill = "inline-flex items-center rounded-full border border-[#e4eaed] bg-white px-5 py-2.5 text-sm font-medium text-[#001F3D] shadow-sm transition hover:border-[#16aaa5] hover:text-[#16aaa5]";

const META_DESCRIPTION = "Compare up to 3 vetted painters and decorators in Reading. Reviews from real, invoiced jobs, typical local prices and free quotes in 60 seconds.";

const PaintersDecoratorsReading = () => {
  useEffect(() => {
    document.title = "Painters & Decorators in Reading | Compare up to 3 Quotes";

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
    postJobs({ postcode, job_trade: "Painters & Decorators", trade: "decorator", description: "Painting or decorating work requested from the Painters & Decorators in Reading page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <nav aria-label="Breadcrumb" className="border-b border-[#E5E7EB] bg-white">
        <ol className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-1 px-4 py-3 text-sm text-[#657680] lg:px-8 xl:px-0">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link to="/painters-decorators" className="hover:underline">Painters &amp; Decorators</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="font-medium text-[#001F3D]">Reading</li>
        </ol>
      </nav>
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-painters-reading-hero.jpg"
          imageAlt="Loft bedroom with painted sloping ceilings, two roof windows and a double bed with navy and white bedding"
          imageFit="cover"
          imagePosition="50% 45%"
          tradeName="Painters & Decorators"
          heading="Painters & Decorators in Reading"
          description="Tell us about the job and compare quotes from up to 3 vetted local painters and decorators in Reading."
          initialPostcode="RG1"
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a painter and decorator in Reading</h2>
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
            <p>Reading’s brick is part of its character. The local clay made a distinctive red brick, and with added chalk the town’s brickworks produced the silver-grey bricks often used on house fronts. Many Victorian terraces combine the two in decorative patterns. Painting over facing brick is hard to undo, and it traps moisture if the wrong paint is used. On the patterned brickwork terraces covered by the council’s Article 4 directions, such as School Terrace and Jesse Terrace, check with Reading Borough Council before painting or rendering the front. The same applies in the town’s 15 conservation areas.</p>
            <p>For most Reading homes, exterior decorating means woodwork rather than walls: sash windows, fascias, bargeboards, front doors and bay windows. The Redlands conservation area appraisal notes timber sashes with nine and twelve panes, and many period houses across the town still have them. Painting a sash properly is slow work. Old flaking paint has to come off, joints and putty need repairing, and the sashes need to be left free to slide rather than painted shut. Paint applied before the 1960s may contain lead, so a careful decorator will test and use wet sanding or chemical strippers rather than dry-sanding it into dust.</p>
            <p>Inside, older homes often have lath and plaster ceilings, picture rails and deep skirtings. Hairline cracks and uneven walls mean more filling and lining paper before painting. Newer flats around Kennet Island and the town centre are usually quicker to decorate, but may have rules from the building’s management company about what you can do to balconies and front doors.</p>
            <p>Rental turnover also drives a lot of decorating in Reading. Around a third of households rent privately, and landlords often need rooms refreshed quickly between tenancies.</p>
            <p>When you compare quotes, check how many coats are included, who supplies the paint, and exactly what preparation is covered, such as filling, sanding, caulking and stripping wallpaper. For outside work, ask whether scaffolding or towers are included. Reviews on Trade Pilot come from real, invoiced jobs, so you can see how a decorator’s work has held up for other homeowners.</p>
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
        <WhyTradePilot heading="How Trade Pilot helps you hire in Reading" vettedText="We check every decorator before they can quote. Ask to see photos of their recent work before they start." />
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-[#001F3D] sm:text-3xl">Other trades in Reading</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {OTHER_TRADES.map(({ label, href }) => (
                <li key={href}><Link to={href} className={pill}>{label}</Link></li>
              ))}
            </ul>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {UP_LINKS.map(({ label, href }) => (
                <li key={href}><Link to={href} className="text-base font-medium text-[#16aaa5] underline underline-offset-4 hover:text-[#0f7f7a]">{label}</Link></li>
              ))}
            </ul>
          </div>
        </section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white">Ready to Find Your Reading Decorator?</h2><p className="mt-4 text-white/80">Get matched with vetted painters and decorators in Reading. Compare quotes and book today.</p><a href="#trade-hero-title" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default PaintersDecoratorsReading;
