import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Circle, Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  [
    "Faults and urgent repairs",
    "Power cuts to part of the house, a trip switch that keeps going off, sockets or switches that spark or feel warm, and fault finding.",
    [],
    FileCheck2,
  ],
  [
    "Rewiring and fuse box upgrades",
    "Full and partial rewires, consumer unit replacements with modern RCD protection, extra sockets, new lighting circuits and EV chargers.",
    [],
    ShieldCheck,
  ],
  [
    "Safety checks and certificates",
    "Electrical Installation Condition Reports (EICRs) for homeowners, buyers and landlords, and certificates for new work.",
    [],
    FileCheck2,
  ],
] as const;

const faqs = [
  ["How do I find a registered electrician near me?", "Post your job on Trade Pilot with your postcode. Up to 3 vetted electricians who cover your area can quote, and you can read reviews from their real, invoiced jobs. Before work starts, check their registration on the Electrical Competent Person register."],
  ["Does my electrical work need to be certified?", "Most new circuits, consumer unit replacements and work in bathrooms are notifiable under Part P of the Building Regulations. A registered electrician can self-certify the work and give you a certificate. Keep it, as buyers’ solicitors will ask for it when you sell."],
  ["How often should my electrics be checked?", "For homes you own and live in, an Electrical Installation Condition Report is usually recommended every 10 years, and when you buy a home. Landlords in England must have one at least every 5 years and give tenants a copy."],
  ["What is an EICR?", "An Electrical Installation Condition Report is a safety check of your wiring, sockets, lights and consumer unit. The electrician tests each circuit and grades anything that needs attention by how urgent it is."],
  ["Do I need a new fuse box?", "If you still have rewirable fuses, or your board has no RCD protection, an upgrade is usually recommended. An EICR will tell you if it’s needed."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const Electricians = () => {
  useEffect(() => { document.title = "Find Local Electricians Near You | Trade Pilot"; }, []);

  const submitQuoteRequest = (postcode: string) =>
    postJobs({ postcode, job_trade: "Electricians", trade: "electrician", description: "Electrical work requested from the electricians landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero onSubmit={submitQuoteRequest} />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find an electrician near you</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {services.map(([title, description, items, Icon]) => (
                <article key={title} className="flex flex-col rounded-xl border border-[#e4eaed] bg-white p-6 shadow-[0_2px_8px_rgba(0,43,73,0.04)]">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f5f4] text-[#16aaa5]"><Icon className="h-6 w-6" /></div>
                  <h3 className="text-xl font-semibold text-[#001F3D]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#657680]">{description}</p>
                  {items.length > 0 && <ul className="mt-5 space-y-3 text-sm text-[#193f54]">{items.map((item) => <li key={item} className="flex items-start gap-2"><Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-[#16aaa5] text-[#16aaa5]" />{item}</li>)}</ul>}
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto space-y-5 text-[16px] leading-7 text-[#4d626f]">
            <p>
              Electrical work is one job you shouldn’t DIY. Use a registered electrician who can test what they’ve done and give you a certificate. Most new circuits, consumer unit replacements and work in bathrooms have to be notified under Part P of the Building Regulations. An electrician registered with a competent person scheme can do this for you, and you can check their registration on the Electrical Competent Person register before they start.
            </p>
            <p>
              Trade Pilot helps you find an electrician near you without phoning round. Describe the job once, and up to 3 vetted electricians who cover your postcode can quote. Reviews on Trade Pilot are tied to real, invoiced jobs, so you’re reading about work that was actually done and paid for.
            </p>
            <p>
              To get useful quotes, say what you need and roughly how old your wiring or fuse box is. A photo of the consumer unit helps. For a rewire, give the number of bedrooms and say whether you’ll be living in the house during the work.
            </p>
            <p>
              When quotes arrive, check they include testing and the certificate. Ask how the electrician will price any extra faults they find once they start, and, for bigger jobs, who does the plastering and making good afterwards.
            </p>
            <p>
              Posting a job is free, and you don’t have to accept any quote.
            </p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every electrician before they can quote. Always ask to see their registration before work starts.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you're reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#657680]">
              Choose your area to see local electricians, typical prices and answers to common questions.
            </p>
          </div>
        </section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="whitespace-nowrap text-3xl font-bold text-white">Ready to Find Your Local Electrician?</h2><p className="mt-4 text-white/80">Get matched with local electricians in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default Electricians;
