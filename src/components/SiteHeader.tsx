import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User, X } from "lucide-react";

const focusRing =
  "rounded-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#001F3D]";

const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const links = [
    ["Homeowners", "/"],
    ["Trades", "/trades"],
    ["Your account", "/login"],
  ] as const;

  return (
    <header className="border-b border-[#E5E7EB] bg-white font-sans">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:h-[72px] lg:px-8 xl:px-0">
        <Link to="/" aria-label="Trade Pilot home" className={focusRing}>
          <span className="relative block h-9 w-[150px] overflow-hidden md:h-11 md:w-[180px]">
            <img
              src="/site-assets/7a0926c1-fceb-4602-bd62-9abc593c1b6a.png"
              alt="Trade Pilot"
              className="absolute left-[-35px] top-[-54px] w-[220px] max-w-none md:left-[-60px] md:top-[-65px] md:w-[265px]"
            />
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
          <div className="flex items-center gap-3">
            <Link to="/" className={`px-1.5 py-3 text-[15px] font-medium text-[#212121] hover:underline hover:underline-offset-[5px] ${focusRing}`}>Homeowners</Link>
            <span aria-hidden="true" className="h-5 w-px bg-[#D1D5DB]" />
            <Link to="/trades" className={`px-1.5 py-3 text-[15px] font-medium text-[#212121] hover:underline hover:underline-offset-[5px] ${focusRing}`}>Trades</Link>
          </div>
          <Link to="/trades/join" className={`inline-flex h-11 items-center bg-[#001F3D] px-5 text-[15px] font-semibold text-white hover:bg-[#0A3157] ${focusRing}`}>Join as a trade</Link>
          <Link to="/login" aria-label="Your account" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D1D5DB] text-[#001F3D] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#001F3D]">
            <User aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/trades/join" className={`inline-flex h-11 items-center bg-[#001F3D] px-3.5 text-sm font-semibold text-white ${focusRing}`}>Join as a trade</Link>
          <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)} className={`inline-flex h-11 w-11 items-center justify-center border border-[#D1D5DB] text-[#001F3D] ${focusRing}`}>
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-[#E5E7EB] px-4 py-2 md:hidden">
          {links.map(([label, href]) => <Link key={label} to={href} onClick={() => setOpen(false)} className={`flex min-h-11 items-center text-base font-medium text-[#212121] ${focusRing}`}>{label}</Link>)}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
