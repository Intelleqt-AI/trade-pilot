import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Roof repairs", "Slipped or broken tiles and slates, leaks, ridge tiles, chimney flashing and storm damage.", FileCheck2],
  ["Flat roofs and new roofs", "Flat roof repairs and replacements in felt, rubber or fibreglass, and full re-roofs.", ShieldCheck],
  ["Gutters, fascias and soffits", "Gutter clearing and repairs, replacement guttering and downpipes, fascias and soffits.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a reliable roofer near me?", "Post your job on Trade Pilot with your postcode and any photos. Up to 3 vetted roofers who cover your area can quote, and you can read reviews from their real, invoiced jobs. Ask for photos of the problem and a written quote before work starts."],
  ["How much does a roof repair cost?", "Small repairs, like replacing a few slipped tiles, are often a few hundred pounds. Scaffolding, chimney work and larger areas push the price up. Compare quotes for your job, and check whether scaffolding is included."],
  ["Do I need scaffolding for a roof repair?", "Not always. Some small repairs can be done safely from a ladder or roof ladder, but many jobs, especially on two- and three-storey houses and around chimneys, need scaffolding. Your roofer will tell you which it is."],
  ["How long does a flat roof last?", "Traditional felt often lasts 15 to 20 years. Rubber (EPDM) and fibreglass roofs can last longer if they’re well installed."],
  ["Do I need planning permission to replace my roof?", "Usually not, if you use similar materials. In a conservation area, on a listed building, or where a council has added extra planning controls, changing the roof covering may need permission. Check with your council first."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const META_DESCRIPTION = "Compare up to 3 vetted roofers near you. Reviews from real, invoiced jobs and free quotes in 60 seconds.";

const Roofers = () => {
  useEffect(() => {
    document.title = "Find Local Roofers Near You | Trade Pilot";
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
    postJobs({ postcode, job_trade: "Roofers", trade: "roofer", description: "Roofing work requested from the roofers landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-roofers-hero.jpg"
          imageAlt="Red brick house with a tiled roof and two chimneys, and a glass extension, seen from the back garden"
          imageFit="cover"
          imagePosition="50% 20%"
          tradeName="Roofers"
          heading="Find Local Roofers Near You"
          description="Tell us about the job and compare quotes from up to 3 vetted local roofers."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a roofer near you</h2>
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
            <p>Most roof problems start small: a slipped slate, cracked mortar on the ridge, or a gutter that overflows every time it rains. Caught early, these are usually quick repairs. Left through a wet winter, they can let water into the loft, ceilings and walls, and the bill grows.</p>
            <p>Trade Pilot helps you find a roofer near you without phoning round. Describe the job once, and up to 3 vetted roofers who cover your postcode can quote. Reviews on Trade Pilot are tied to real, invoiced jobs, so you’re reading about work that was actually done and paid for.</p>
            <p>Photos help roofers quote accurately. You can often see the problem from the ground or through a loft hatch: slipped tiles, damp patches on the ceiling, daylight through the roof or water stains on rafters. Don’t climb onto the roof yourself. Say what type of roof you have, such as tiles, slate or a flat roof on an extension, and whether the house has one, two or three storeys.</p>
            <p>Scaffolding is often the biggest single cost on a roofing job, so check each quote says whether it’s included and how long it will be up. Ask the roofer to send photos of the problem from the roof, and for bigger jobs, what materials they’ll use and what guarantee comes with the work. If you live in a conservation area or a listed building, check with your council before changing the roof covering.</p>
            <p>Autumn is a good time to have gutters cleared and the roof checked, before winter storms find the weak spots.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every roofer before they can quote. Always ask for proof of insurance before work starts.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local roofers, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white sm:whitespace-nowrap">Ready to Find Your Local Roofer?</h2><p className="mt-4 text-white/80">Get matched with local roofers in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default Roofers;
