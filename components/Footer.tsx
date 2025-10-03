import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 md:gap-0">
          <div className="text-foreground font-medium">
            WebVitals{" "}
            <span className="text-sm text-muted-foreground">
              <Link
                href="https://sentry.io/welcome?ref=webvitals.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                by Sentry
              </Link>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} WebVitals. Built with Robots, Next.js
            and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
