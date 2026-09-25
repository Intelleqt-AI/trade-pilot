import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Leaks and urgent repairs", "Burst and leaking pipes, dripping taps, running toilets, blocked sinks and drains, and low water pressure.", FileCheck2],
  ["Bathrooms and fittings", "Bathroom and shower room installations, new taps, toilets and basins, outside taps and appliance connections.", ShieldCheck],
  ["Hot water and heating pipework", "Radiator replacements, power flushes, hot water cylinders and immersion heaters. Gas boiler work needs a Gas Safe registered engineer.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a reliable plumber near me?", "Post your job on Trade Pilot with your postcode. Up to 3 vetted plumbers who cover your area can quote, and you can read reviews from their real, invoiced jobs. Ask for a written quote before work starts."],
  ["How much does a plumber cost?", "Most plumbers charge by the hour, often with a one-hour minimum, or a fixed price for small jobs such as replacing a tap. Out-of-hours call-outs cost more. Prices vary by area, so compare quotes for your job."],
  ["Can a plumber work on my gas boiler?", "Only if they’re Gas Safe registered. By law, anyone working on gas appliances must be on the Gas Safe Register. Check the ID card, including the back, which lists the gas work they’re qualified to do."],
  ["What should I do if a pipe bursts?", "Turn off the water at the stop tap, switch off electrics near the leak if it’s safe, open the cold taps to drain the system, and call a plumber."],
  ["What should a plumber’s quote include?", "The work to be done, parts, labour, any call-out charge, how extra time is charged and how long the work is guaranteed for. If anything is missing, ask before you accept."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const Plumbers = () => {
  useEffect(() => { document.title = "Find Local Plumbers Near You | Trade Pilot"; }, []);

  const submitQuoteRequest = (postcode: string) =>
    postJobs({ postcode, job_trade: "Plumbers", trade: "plumber", description: "Plumbing work requested from the plumbers landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-plumbers-hero-v2.jpg"
          imageAlt="Modern bathroom with a stone basin, illuminated mirror and wall lights"
          imageFit="cover"
          imagePosition="50% 100%"
          tradeName="Plumbers"
          heading="Find Local Plumbers Near You"
          description="Tell us about the job and compare quotes from up to 3 vetted local plumbers."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a plumber near you</h2>
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
            <p>Most plumbing problems start small: a dripping tap, a toilet that won’t stop running, or a damp patch under the sink. Fixing them early is usually quick and cheap. Leaving them can mean water damage, higher bills and a bigger repair later.</p>
            <p>Trade Pilot helps you find a plumber near you without phoning round. Describe the job once, and up to 3 vetted plumbers who cover your postcode can quote. Reviews on Trade Pilot are tied to real, invoiced jobs, so you’re reading about work that was actually done and paid for.</p>
            <p>To get useful quotes, say what’s wrong, where it is and how long it’s been happening. A photo of the leak, tap or pipework helps. For a new bathroom or a bigger job, give rough room sizes and say whether you’ve already bought the fittings.</p>
            <p>When quotes arrive, check whether there’s a call-out fee or a minimum charge, whether parts are included and how extra time is charged. For larger jobs, ask how long the work is guaranteed for.</p>
            <p>Plumbing and gas are different trades. Any work on a gas boiler, cooker or fire must be done by a Gas Safe registered engineer, so don’t DIY it, and check the engineer’s Gas Safe ID card before they start. If you need boiler work, post it under gas and boiler engineers instead.</p>
            <p>It’s worth knowing where your stop tap is before you need it. It’s often under the kitchen sink or near where the water pipe comes into the house.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every plumber before they can quote. For any gas work, always ask to see a Gas Safe ID card.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local plumbers, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="whitespace-nowrap text-3xl font-bold text-white">Ready to Find Your Local Plumber?</h2><p className="mt-4 text-white/80">Get matched with local plumbers in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default Plumbers;
