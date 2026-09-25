import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Extensions", "Single-storey and double-storey rear and side extensions, side-return kitchen extensions and wrap-around extensions.", FileCheck2],
  ["Loft and garage conversions", "Roof-window and dormer loft conversions, and turning a garage into a room, office or annexe.", ShieldCheck],
  ["Renovations and structural work", "Knocking through walls with steel beams, internal alterations, brickwork, repointing and general building repairs.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a good builder near me?", "Post your project on Trade Pilot with your postcode, drawings and photos. Up to 3 vetted builders who cover your area can quote, and you can read reviews from their real, invoiced jobs. Compare itemised quotes on the same drawings before you choose."],
  ["Do I need planning permission for an extension?", "Many single-storey extensions fall under permitted development, but it depends on the size, your property type and where you live. Conservation areas, listed buildings, flats and some streets with extra controls have tighter rules. Check with your local council’s planning team before you commit."],
  ["How long does a house extension take?", "A single-storey extension often takes around two to three months on site, and a double-storey one longer. Planning, drawings and building control approval come before that and can add several months."],
  ["What should a builder’s quote include?", "An itemised breakdown of labour and materials, what is and isn’t included, who deals with building control, the payment stages and the expected timings. Skips, scaffolding, plastering and decorating are common extras, so check each one."],
  ["Should I pay a builder upfront?", "Avoid large upfront payments. Agree stage payments tied to finished work, and get a written contract that sets out the scope, price and timings."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const Builders = () => {
  useEffect(() => { document.title = "Find Local Builders Near You | Trade Pilot"; }, []);

  const submitQuoteRequest = (postcode: string) =>
    postJobs({ postcode, job_trade: "Builders", trade: "builder", description: "Building work requested from the builders landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-builders-hero-v2.jpg"
          imageAlt="Modern kitchen with wood cabinetry, pendant lighting and a large island"
          imagePosition="50% 65%"
          tradeName="Builders"
          heading="Find Local Builders Near You"
          description="Tell us about the project and compare quotes from up to 3 vetted local builders."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a builder near you</h2>
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
            <p>Building work is usually the biggest spend on a home, so it pays to get the preparation right before you ask for quotes. Builders can only price accurately what they can see, so drawings, photos and a clear description of what you want will get you quotes you can actually compare.</p>
            <p>Trade Pilot helps you find a builder near you without phoning round. Describe your project once, and up to 3 vetted builders who cover your postcode can quote. Reviews on Trade Pilot are tied to real, invoiced jobs, so you’re reading about work that was actually done and paid for.</p>
            <p>Before you start, check what permissions you need. Many single-storey extensions and some loft conversions fall under permitted development, but conservation areas, listed buildings and flats have tighter rules, and some streets have extra planning controls. Your local council’s planning team can confirm.</p>
            <p>Almost all structural work needs building regulations approval, and work on or near a shared wall often needs a party wall agreement with your neighbours.</p>
            <p>When quotes arrive, ask for them itemised against the same drawings. Check who deals with building control, what the payment stages are, and what isn’t included, such as skips, scaffolding, plastering, decorating or kitchen fit-out.</p>
            <p>Avoid paying large sums upfront, and agree a written contract that sets out the scope, price and timings.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every builder before they can quote. Always ask for proof of insurance before work starts.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local builders, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="whitespace-nowrap text-3xl font-bold text-white">Ready to Find Your Local Builder?</h2><p className="mt-4 text-white/80">Get matched with local builders in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default Builders;
