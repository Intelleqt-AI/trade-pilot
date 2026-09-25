import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AppsPopover from "@/components/AppsPopover";
import { APPS_PATH, AREAS_HREF, SHOW_AREAS_LINK, TRADE_PAGES } from "@/lib/siteNav";

const focusRing =
  "rounded-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#001F3D]";

const navLink = `px-1.5 py-3 text-[15px] font-medium text-[#212121] hover:underline hover:underline-offset-[5px] ${focusRing}`;
const mobileLink = `flex min-h-11 items-center text-base font-medium text-[#212121] ${focusRing}`;

const SiteHeader = () => {
  const [open, setOpen] = useState(false);

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
            <DropdownMenu>
              <DropdownMenuTrigger className={`inline-flex items-center gap-1 ${navLink}`}>
                Trades
                <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {TRADE_PAGES.map(({ label, href }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link to={href}>{label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {SHOW_AREAS_LINK && <Link to={AREAS_HREF} className={navLink}>Areas</Link>}
            <Link to="/login" className={navLink}>Sign in</Link>
            <AppsPopover>
              <button type="button" className={`inline-flex h-11 items-center border border-[#D1D5DB] px-5 text-[15px] font-semibold text-[#001F3D] hover:bg-[#F3F4F6] ${focusRing}`}>Apps</button>
            </AppsPopover>
          </div>
          <Link to="/trades/join" className={`inline-flex h-11 items-center bg-[#001F3D] px-5 text-[15px] font-semibold text-white hover:bg-[#0A3157] ${focusRing}`}>Join as a trade</Link>
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
          <p className={mobileLink}>Trades</p>
          {TRADE_PAGES.map(({ label, href }) => (
            <Link key={href} to={href} onClick={() => setOpen(false)} className={`${mobileLink} pl-4 font-normal`}>{label}</Link>
          ))}
          {SHOW_AREAS_LINK && <Link to={AREAS_HREF} onClick={() => setOpen(false)} className={mobileLink}>Areas</Link>}
          <Link to="/login" onClick={() => setOpen(false)} className={mobileLink}>Sign in</Link>
          <Link to={APPS_PATH} onClick={() => setOpen(false)} className={mobileLink}>Apps</Link>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
