import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/ui/heading";
import BrowserIcons from "./BrowserIcons";

interface DemoHeaderProps {
  children: React.ReactNode;
  vitalName: string;
  vitalDesc: string;
  vitalColor: string;
  isCore?: boolean;
  supportedBrowsers?: Record<string, boolean>;
}

export default function DemoHeader({
  children,
  vitalName,
  vitalDesc,
  vitalColor,
  isCore = false,
  supportedBrowsers,
}: DemoHeaderProps) {
  return (
    <section className="mb-8">
      <nav className="mb-4 text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </nav>

      <div className="border-b border-border pb-4 mb-6 relative">
        <Heading
          level={1}
          size="2xl"
          className="mb-1"
          style={{ color: vitalColor }}
        >
          {vitalName}
        </Heading>
        <Heading level={2} size="base" className="text-muted-foreground mb-2">
          {vitalDesc}
        </Heading>

        <div className="absolute top-0 right-0">
          <BrowserIcons
            width={32}
            height={32}
            supportedBrowsers={supportedBrowsers}
          />
          <div className="mt-2 text-right">
            <Badge variant={isCore ? "default" : "secondary"}>
              {isCore ? "Core Web Vital" : "Other Vital"}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed max-w-3xl text-sm">
        {children}
      </p>
    </section>
  );
}
