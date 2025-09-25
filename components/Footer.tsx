import { Github, Twitter, ExternalLink } from "lucide-react";

const footerLinks = {
  resources: [
    {
      name: "Web Vitals Guide",
      href: "https://web.dev/vitals/",
      external: true,
    },
    {
      name: "Lighthouse",
      href: "https://developers.google.com/web/tools/lighthouse",
      external: true,
    },
    {
      name: "PageSpeed Insights",
      href: "https://pagespeed.web.dev/",
      external: true,
    },
    {
      name: "Core Web Vitals",
      href: "https://developers.google.com/search/docs/appearance/core-web-vitals",
      external: true,
    },
  ],
  tools: [
    {
      name: "GTmetrix",
      href: "https://gtmetrix.com/",
      external: true,
    },
    {
      name: "WebPageTest",
      href: "https://www.webpagetest.org/",
      external: true,
    },
    {
      name: "Chrome DevTools",
      href: "https://developers.google.com/web/tools/chrome-devtools",
      external: true,
    },
    {
      name: "Lighthouse CI",
      href: "https://github.com/GoogleChrome/lighthouse-ci",
      external: true,
    },
  ],
};

interface FooterLinkProps {
  name: string;
  href: string;
  external?: boolean;
}

function FooterLink({ name, href, external }: FooterLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
    >
      {name}
      {external && <ExternalLink className="w-3 h-3" />}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-4">
              WebVitals
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Unlock your website's potential with instant Web Vitals analysis
              powered by Lighthouse. Get actionable insights to improve your
              site's performance and user experience.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Tools
            </h4>
            <ul className="space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} WebVitals. Built with Next.js and
              Tailwind CSS.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}