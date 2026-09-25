import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { getAppsQrUrl } from "@/lib/siteNav";

const Apps = () => {
  useEffect(() => { document.title = "Get the Trade Pilot App | Trade Pilot"; }, []);

  return (
    <div className="min-h-screen bg-white text-[#001F3D]">
      <SiteHeader />
      <main>
        <section className="bg-[#f7f9fa] px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">Get the Trade Pilot app</h1>
            <p className="mt-4 text-[#4d626f]">Scan the code with your phone’s camera, or use the store buttons below.</p>
            <div className="mx-auto mt-8 w-fit rounded-2xl border border-[#e4eaed] bg-white p-5 shadow-sm">
              <QRCodeSVG value={getAppsQrUrl()} size={200} fgColor="#001F3D" bgColor="#ffffff" />
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#" className="inline-block">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-11 hover:opacity-80 transition-opacity" />
              </a>
              <a href="#" className="inline-block">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-11 hover:opacity-80 transition-opacity" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Apps;
