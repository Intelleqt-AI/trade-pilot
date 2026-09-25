import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Kitchen fitting", "Fitting units, worktops, sinks, taps and appliances, whether you’ve bought the kitchen or want it supplied.", FileCheck2],
  ["Worktops and refreshes", "New worktops in laminate, wood or stone, and replacement doors and drawer fronts for a quicker update.", ShieldCheck],
  ["Full kitchen refits", "Strip-out, layout changes, plumbing and electrics, tiling, plastering and finishing.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a reliable kitchen fitter near me?", "Post your job on Trade Pilot with your postcode, say whether you’ve bought the kitchen, and add photos or a plan if you have them. Up to 3 vetted local fitters can quote, and you can read reviews from their real, invoiced jobs."],
  ["Can a kitchen fitter do the plumbing, electrics and gas?", "Many fitters do the basic plumbing themselves. Electrical work should be done and certified by a registered electrician, and any gas connection must be made by a Gas Safe registered engineer. Ask each fitter who will do these parts."],
  ["How long does it take to fit a kitchen?", "A straightforward like-for-like fit usually takes one to two weeks. Moving services, knocking through walls, stone worktops that need templating, and plastering all add time."],
  ["Should I buy the kitchen myself or let the fitter supply it?", "Buying it yourself gives you more choice. A supplied-and-fitted kitchen puts one person in charge of missing or damaged parts. Tell fitters which you prefer so the quotes are comparable."],
  ["Do I need permission to replace the kitchen in my flat?", "Check your lease. Many leases need consent from the freeholder or management company, especially if you’re moving plumbing or changing the layout."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const META_DESCRIPTION = "Compare up to 3 vetted kitchen fitters near you. Reviews from real, invoiced jobs and free quotes in 60 seconds.";

const KitchenFitters = () => {
  useEffect(() => {
    document.title = "Kitchen Fitters Near You | Compare Quotes";
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
    postJobs({ postcode, job_trade: "Kitchen Fitters", trade: "kitchen_fitter", description: "Kitchen fitting work requested from the kitchen fitters landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-kitchen-fitters-hero.jpg"
          imageAlt="Modern kitchen with white handleless cabinets, a stone worktop and splashback, a gas hob and a stainless steel tap"
          imageFit="cover"
          imagePosition="50% 60%"
          tradeName="Kitchen Fitters"
          heading="Find Trusted Kitchen Fitters"
          description="Tell us about the job and compare quotes from up to 3 vetted local kitchen fitters."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a kitchen fitter near you</h2>
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
            <p>A new kitchen brings several trades into one room. Units and worktops are carpentry, but most jobs also involve plumbing, electrics and often gas, plus tiling and plastering. A good kitchen fitter either handles these or brings in the right people, and tells you clearly who is doing what.</p>
            <p>Trade Pilot helps you find a kitchen fitter near you without phoning round. Describe your job once, including whether you’ve already bought the kitchen, and up to 3 vetted fitters who cover your postcode can quote. Reviews on Trade Pilot come from real, invoiced jobs, so you can see how a fitter has handled work like yours.</p>
            <p>To get useful quotes, share the kitchen plan or supplier’s drawings if you have them, photos of the room as it is now, and whether the sink, cooker or boiler will move. Moving services and knocking through walls add time and cost, so it helps to say early.</p>
            <p>When quotes arrive, check they’re pricing the same thing. Fitting only, with you supplying units and appliances, is priced very differently from a supplied-and-fitted kitchen. Ask whether removing the old kitchen, disposal, worktop templating, tiling, plastering and decorating are included. If you’re knocking through a wall to open up the kitchen, find out whether it’s load-bearing before anything else is agreed.</p>
            <p>In a flat, check your lease before you start, as many need the freeholder’s consent for a new kitchen.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every kitchen fitter before they can quote. Ask who will do the gas and electrical parts of your job.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local kitchen fitters, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white sm:whitespace-nowrap">Ready to Find Your Kitchen Fitter?</h2><p className="mt-4 text-white/80">Get matched with local kitchen fitters in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default KitchenFitters;
