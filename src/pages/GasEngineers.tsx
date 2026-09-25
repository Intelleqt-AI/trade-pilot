import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Boiler repairs", "No heating or hot water, error codes, low pressure, leaks and noisy boilers.", FileCheck2],
  ["Servicing and safety checks", "Annual boiler services, and landlord gas safety certificates for every gas appliance in a rented home.", ShieldCheck],
  ["New boilers and heating", "Combi, system and regular boiler replacements, radiators, power flushes and magnetic filters.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a gas engineer near me?", "Post your job on Trade Pilot with your postcode. Up to 3 vetted, Gas Safe registered engineers who cover your area can quote, and you can read reviews from their real, invoiced jobs."],
  ["How do I check a gas engineer is Gas Safe registered?", "Ask to see their Gas Safe ID card and check the licence number on the Gas Safe Register website or by phone. The back of the card shows which types of gas work they’re qualified for, such as boilers or cookers."],
  ["How often should my boiler be serviced?", "Most manufacturers recommend a service every year, and many boiler warranties require it. Autumn is a good time, before the heating is on every day."],
  ["What is a landlord gas safety certificate?", "Landlords must have every gas appliance, fitting and flue in a rented home checked by a Gas Safe registered engineer every 12 months, and give tenants a copy of the record. It’s often called a CP12."],
  ["Should I repair or replace my boiler?", "If your boiler is more than 10 to 15 years old, breaks down often or needs an expensive part, it’s worth getting quotes for both. An engineer can tell you whether a repair is good value."],
  ["What should I do if I smell gas?", "Leave the building, turn off the gas at the meter if it’s safe, open doors and windows, and call the National Gas Emergency Service on 0800 111 999. Don’t use switches or naked flames."],
];

const META_DESCRIPTION = "Compare up to 3 vetted gas and boiler engineers near you. Reviews from real, invoiced jobs and free quotes in 60 seconds.";

const GasEngineers = () => {
  useEffect(() => {
    document.title = "Gas & Boiler Engineers Near You | Compare Quotes";
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
    postJobs({ postcode, job_trade: "Gas Engineers", trade: "gas_engineer", description: "Gas or boiler work requested from the gas engineers landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-plumbers-hero-v2.jpg"
          imageAlt="Modern home interior with heating and hot water"
          imageFit="cover"
          imagePosition="50% 100%"
          tradeName="Gas & Boiler Engineers"
          heading="Find Trusted Gas & Boiler Engineers"
          description="Tell us about the job and compare quotes from up to 3 vetted local gas and boiler engineers."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a gas engineer near you</h2>
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
            <p>Gas work is one job you must never DIY. By law, anyone working on a gas boiler, fire or cooker in your home has to be on the Gas Safe Register, so always use a Gas Safe registered engineer. Before they start, ask to see their Gas Safe ID card and check the back, which lists the types of gas work they’re qualified to do.</p>
            <p>Trade Pilot helps you find a gas engineer near you without phoning round. Describe the job once, and up to 3 vetted engineers who cover your postcode can quote. Reviews on Trade Pilot are tied to real, invoiced jobs, so you’re reading about work that was actually done and paid for.</p>
            <p>To get useful quotes for a repair, include the boiler make and model, its rough age, and any fault code on the display. For a replacement, say what type of boiler you have now, how many bedrooms and bathrooms your home has, and whether the boiler will stay in the same place. Moving a boiler or changing its type adds cost, so it helps to know early.</p>
            <p>When you compare quotes for a new boiler, check the make and model, the length of the warranty and what you need to do to keep it valid, whether the system will be flushed, and whether a magnetic filter and scale protection are included. If you live in a hard water area, scale protection matters more.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every engineer before they can quote. Always ask to see a Gas Safe ID card before work starts.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local gas and boiler engineers, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white sm:whitespace-nowrap">Ready to Find Your Local Gas Engineer?</h2><p className="mt-4 text-white/80">Get matched with local gas and boiler engineers in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default GasEngineers;
