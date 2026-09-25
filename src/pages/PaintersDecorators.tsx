import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import ElectriciansHero from "@/components/ElectriciansHero";
import SiteHeader from "@/components/SiteHeader";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { postJobs } from "@/lib/api";

const services = [
  ["Interior painting", "Walls, ceilings and woodwork in single rooms or whole houses, including hallways, stairs and landings.", FileCheck2],
  ["Wallpapering and preparation", "Stripping old paper, filling and lining walls, and hanging wallpaper and feature walls.", ShieldCheck],
  ["Exterior painting", "Windows, doors, fascias, bargeboards and masonry, including sash windows on older homes.", FileCheck2],
] as const;

const faqs = [
  ["How do I find a good painter and decorator near me?", "Post your job on Trade Pilot with your postcode and photos. Up to 3 vetted local decorators can quote, and you can read reviews from their real, invoiced jobs before you choose."],
  ["What should a decorating quote include?", "The rooms and surfaces covered, the number of coats, who supplies the paint, the preparation work, how long the job will take and how payment works. If any of these are missing, ask before you accept."],
  ["Do I need to buy the paint myself?", "Either works. Many decorators buy trade paint and include it in the price. If you want a particular brand or colour, say so when you post the job so every quote is priced the same way."],
  ["How long does it take to paint a room?", "A typical bedroom or living room takes one to two days, including preparation and two coats. Rooms with a lot of woodwork, wallpaper to strip or damaged plaster take longer."],
  ["Is old paint in my house dangerous?", "Paint applied before the 1960s may contain lead. It’s safe left alone, but dry-sanding it creates harmful dust. A good decorator will test it and use safe methods, such as wet sanding or chemical strippers."],
  ["Is it free to get quotes through Trade Pilot?", "Yes. Posting a job and receiving quotes is free for homeowners, and you don’t have to accept any quote."],
];

const META_DESCRIPTION = "Compare up to 3 vetted painters and decorators near you. Reviews from real, invoiced jobs and free quotes in 60 seconds.";

const PaintersDecorators = () => {
  useEffect(() => {
    document.title = "Painters & Decorators Near You | Compare Quotes";
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
    postJobs({ postcode, job_trade: "Painters & Decorators", trade: "decorator", description: "Painting or decorating work requested from the painters and decorators landing page." });

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <ElectriciansHero
          imageSrc="/trade-pilot-painters-decorators-hero.jpg"
          imageAlt="Modern kitchen with dark grey cabinets, white walls and a large black-framed window overlooking trees"
          imageFit="cover"
          imagePosition="50% 45%"
          tradeName="Painters & Decorators"
          heading="Find Trusted Painters & Decorators"
          description="Tell us about the job and compare quotes from up to 3 vetted local painters and decorators."
          onSubmit={submitQuoteRequest}
        />
        <section className="bg-white px-4 py-12 sm:py-16">
          <div className="container mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3D] sm:text-[32px]">Find a painter and decorator near you</h2>
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
            <p>A good decorator is judged by the work you never see: filling, sanding, sealing and masking before a drop of colour goes on. That preparation is usually most of the job, and it’s where cheaper quotes tend to cut corners.</p>
            <p>Trade Pilot helps you find a painter and decorator near you without phoning round. Describe the job once, and up to 3 vetted decorators who cover your postcode can quote. Reviews on Trade Pilot are tied to real, invoiced jobs, so you’re reading about work that was actually done and paid for.</p>
            <p>To get useful quotes, say which rooms or surfaces you want done, whether walls, ceilings, woodwork or all three, and roughly how big the rooms are. Photos help decorators see the condition of the walls, any cracks or damp stains, and how much woodwork there is. For outside work, say how many storeys the house has.</p>
            <p>When quotes arrive, check what each one includes: how many coats, who supplies the paint, and what preparation is covered, such as filling cracks, sanding woodwork or stripping wallpaper. For outside work, ask whether scaffolding or access towers are included. In older homes, ask how the decorator deals with old paint on woodwork, as paint applied before the 1960s can contain lead and needs careful preparation.</p>
            <p>Posting a job is free, and you don’t have to accept any quote.</p>
          </div>
        </section>
        <section className="bg-[#f7f9fa] px-4 py-16">
          <div className="container mx-auto">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot?</p><h2 className="mt-3 text-3xl font-bold text-[#001F3D]">How Trade Pilot helps you hire</h2></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[["Vetted local trades", "We check every decorator before they can quote. Ask to see photos of their recent work before they start.", ShieldCheck], ["Reviews from real jobs", "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", ShieldCheck], ["Free, with no obligation", "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Clock3]].map(([title, description, Icon]) => <div key={title as string} className="rounded-2xl bg-white p-6 text-center shadow-sm"><Icon className="mx-auto h-9 w-9 text-[#16aaa5]" /><h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#657680]">{description as string}</p></div>)}
            </div>
          </div>
        </section>
        <section className="px-4 py-16"><div className="container mx-auto max-w-3xl"><h2 className="text-center text-3xl font-bold text-[#001F3D]">Frequently Asked Questions</h2><Accordion type="single" collapsible className="mt-8">{faqs.map(([question, answer], index) => <AccordionItem value={`faq-${index}`} key={question}><AccordionTrigger className="text-left">{question}</AccordionTrigger><AccordionContent className="text-[#657680]">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
        <section className="bg-[#f7f9fa] px-4 py-12 sm:py-16"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-3xl font-bold text-[#001F3D]">Areas We Cover</h2><p className="mx-auto mt-4 max-w-2xl text-[#657680]">Choose your area to see local painters and decorators, typical prices and answers to common questions.</p></div></section>
        <section className="bg-[#001F3D] px-4 py-16 text-center text-white"><div className="container mx-auto max-w-2xl"><h2 className="text-3xl font-bold text-white sm:whitespace-nowrap">Ready to Find Your Local Painter?</h2><p className="mt-4 text-white/80">Get matched with local painters and decorators in your area. Compare quotes and book today.</p><a href="/find-tradespeople" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#1DAFA1] px-6 font-bold text-white hover:bg-[#159b95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started Now</a></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default PaintersDecorators;
