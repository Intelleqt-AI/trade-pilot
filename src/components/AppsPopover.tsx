import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { APPS_PATH, getAppsQrUrl } from "@/lib/siteNav";

/** Wraps a header button so it opens a pop-out with a QR code. */
const AppsPopover = ({ children }: { children: ReactNode }) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent align="end" className="w-64 bg-white p-5 text-center text-[#001F3D]">
      <p className="text-base font-semibold">Get the Trade Pilot app</p>
      <p className="mt-1 text-sm text-[#657680]">Scan with your phone’s camera.</p>
      <div className="mx-auto mt-4 w-fit rounded-lg border border-[#e4eaed] bg-white p-3">
        <QRCodeSVG value={getAppsQrUrl()} size={152} fgColor="#001F3D" bgColor="#ffffff" />
      </div>
      <Link to={APPS_PATH} className="mt-4 inline-block text-sm font-medium text-[#001F3D] underline underline-offset-4 hover:text-[#0A3157]">
        Open the apps page
      </Link>
    </PopoverContent>
  </Popover>
);

export default AppsPopover;
