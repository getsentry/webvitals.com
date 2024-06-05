import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { useLoadState } from "./loadState";

import { cn } from "@/lib/utils"

import Nav from "./nav";
import Head from "next/head";
import Link from "next/link";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Web Vitals Playground",
  description: "Web Vitals Playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <div className="container p-12 mx-auto">
          <div className="flex flex-row flex-wrap gap-4">

            {/* <div className="w-full sm:basis-1/4-gap-4 bg-slate-50 p-4 rounded-lg">
              <nav className="">
                <Nav />
              </nav>
            </div> */}
            <main role="main" className="w-full">
              {children}

            </main>
          </div>
        </div>
      </body>
    </html >
  );
}
