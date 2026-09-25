import { Clock3, ShieldCheck } from "lucide-react";

const DEFAULT_VETTED_TEXT = "We check every trade before they can quote on Trade Pilot. For gas work, always ask to see a Gas Safe ID card.";

type WhyTradePilotProps = {
  heading?: string;
  /** Text for the "Vetted local trades" card, so a page can name its own trade. */
  vettedText?: string;
};

/** The "Why use Trade Pilot" three-card block used on the landing pages. */
const WhyTradePilot = ({ heading = "How Trade Pilot helps you hire", vettedText = DEFAULT_VETTED_TEXT }: WhyTradePilotProps) => {
  const cards = [
    { title: "Vetted local trades", description: vettedText, Icon: ShieldCheck },
    { title: "Reviews from real jobs", description: "Reviews on Trade Pilot are tied to invoiced jobs, so you’re reading about work that was actually done and paid for.", Icon: ShieldCheck },
    { title: "Free, with no obligation", description: "Posting a job and getting up to 3 quotes is free for homeowners. You choose who to invite round, or no one at all.", Icon: Clock3 },
  ];

  return (
    <section className="bg-[#f7f9fa] px-4 py-16">
      <div className="container mx-auto">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16aaa5]">Why use Trade Pilot</p>
          <h2 className="mt-3 text-3xl font-bold text-[#001F3D]">{heading}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(({ title, description, Icon }) => (
            <div key={title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <Icon className="mx-auto h-9 w-9 text-[#16aaa5]" />
              <h3 className="mt-4 text-xl font-semibold text-[#001F3D]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#657680]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTradePilot;
