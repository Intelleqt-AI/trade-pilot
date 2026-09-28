import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <img 
              src="/tradepilot-darkmood-icon.jpg"
              alt="Trade Pilot logo" 
              className="h-24 w-auto"
            />
            <p className="text-secondary-foreground/80 text-sm">
              Connecting trusted trades with homeowners across the UK.
            </p>
            
            {/* Social Media Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-secondary-foreground text-sm">FIND US ON SOCIALS</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* App Download Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-secondary-foreground text-sm">DOWNLOAD THE APP</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#" className="inline-block">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                    alt="Download on the App Store" 
                    className="h-10 hover:opacity-80 transition-opacity"
                  />
                </a>
                <a href="#" className="inline-block">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Get it on Google Play" 
                    className="h-10 hover:opacity-80 transition-opacity"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Homeowners Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-foreground">Homeowners</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/find-tradespeople" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Find a tradesperson
                </a>
              </li>
              <li>
                <a href="/homeowners/join-free" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Join free
                </a>
              </li>
              <li>
                <a href="/homeowners/review-trade" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Review a trade
                </a>
              </li>
              <li>
                <a href="/blog" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Trades Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-foreground">Trades</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/trades/join" className="text-secondary-foreground/80 hover:text-white transition-colors duration-150">
                  Join free
                </Link>
              </li>
              <li>
                <a href="/trades/premium" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Premium plans
                </a>
              </li>
              <li>
                <a href="/trades/advice-centre" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Advice centre
                </a>
              </li>
              <li>
                <a href="/trades/login" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-foreground">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/contact" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Contact us
                </a>
              </li>
              <li>
                <a href="/t-and-cs" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Terms & conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="/trades-crm" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-150">
                  Trades CRM
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/60 text-sm">
            © 2025 Trade Pilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;