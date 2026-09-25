import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Doors, floors and fittings", "Hanging internal doors, fire doors, skirting, architrave, laminate and wood floors.", FileCheck2],
  ["Fitted storage", "Alcove cupboards, fitted wardrobes, shelving and understairs storage.", ShieldCheck],
  ["Joinery and repairs", "Sash window overhauls, staircases and balustrades, and repairs to original features.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a good carpenter near me?", "Post your job on Trade Pilot with your postcode, a description and photos. Up to 3 vetted local carpenters can quote, and you can read reviews from their real, invoiced jobs before choosing."],
  ["What’s the difference between a carpenter and a joiner?", "A joiner usually makes items such as doors, windows and stairs, often in a workshop. A carpenter usually builds and fits on site. Many tradespeople do both."],
  ["Do carpenters charge by the day or by the job?", "Both are common. Small jobs such as hanging a door are often priced per item, and bigger jobs by the day or as a fixed price. A fixed quote with a clear description is easiest to compare."],
  ["Can a carpenter repair old sash windows?", "Yes, many joiners overhaul sash windows by replacing cords, easing sticking sashes, repairing rot and adding draught-proofing. It’s often cheaper than replacement and may avoid planning issues in conservation areas."],
  ["How much do fitted wardrobes or alcove cupboards cost?", "It depends on the size, materials and finish. Simple alcove cupboards cost much less than full-height bespoke wardrobes. Measurements and photos help carpenters give you an accurate price."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const META_DESCRIPTION = "Compare up to 3 vetted carpenters and joiners near you. Reviews from real, invoiced jobs and free quotes in 60 seconds.";

const Carpenters = () => {
  useEffect(() => {
    document.title = "Carpenters & Joiners Near You | Compare Quotes";
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
    postJobs({ postcode, job_trade: "Carpenters & Joiners", trade: "carpenter", description: "Carpentry or joinery work requested from the carpenters landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-carpenters-hero.jpg"
          imageAlt="Kitchen with oak veneer tall units, open timber shelves against grey tiles and white handleless cabinets"
          imageFit="cover"
          imagePosition="50% 40%"
          tradeName="Carpenters & Joiners"
          heading="Find Trusted Carpenters & Joiners"
          description="Tell us about the job and compare quotes from up to 3 vetted local carpenters and joiners."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a carpenter near you</h2>
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
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto space-y-5 text-[16px] leading-7 text-[#4d626f]">
            <p>Carpenters and joiners cover a wide range of jobs. Joiners usually make items such as doors, windows, staircases and bespoke cupboards, often in a workshop. Carpenters usually fit and build on site, from hanging doors and fitting skirting to building stud walls and laying floors. Many tradespeople do both, so describe your job and let them tell you whether it suits them.</p>
            <p>Trade Pilot helps you find a carpenter near you without phoning round. Post your job once and up to 3 vetted carpenters who cover your postcode can quote. Reviews on Trade Pilot come from real, invoiced jobs, so you can see what past customers actually paid for.</p>
            <p>For bespoke work such as alcove cupboards, fitted wardrobes or a new balustrade, rough measurements and a photo help carpenters give you a realistic quote. Say what finish you want, such as painted MDF, oak or ready to paint, and whether you’d like them to paint it too.</p>
            <p>In older homes, ask whether original features such as sash windows, panelled doors or staircases can be repaired rather than replaced. Repair is often cheaper and keeps the character of the house. If you live in a listed building or a conservation area, check with your council before replacing windows or external doors.</p>
            <p>If you let a shared house, you may need fire doors fitted. Check your council’s licensing requirements, then ask a carpenter to quote for certified fire doors, fitted correctly.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every carpenter before they can quote. Ask to see photos of similar work they’ve completed.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local carpenters and joiners, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white sm:whitespace-nowrap">Ready to Find Your Local Carpenter?</h2><p className="mt-4 text-white/80">Get matched with local carpenters and joiners in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default Carpenters;
