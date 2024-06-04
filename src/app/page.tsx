"use client";

import { useLoadState } from "./loadState";
import { useEffect } from "react";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import BrowserIcons from "./components/BrowserIcons";
export default function Home() {
  const { setLoading } = useLoadState();


  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [setLoading]);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Web Vitals Demos</h1>

      <div className="flex flex-wrap gap-4">
        <Link className="flex-grow basis-1/3" href="/demos/lcp">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Largest Contentful Paint (LCP)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Largest Contentful Paint (LCP) measures the time it takes for the largest text or image element to render on a webpage.</p>
              <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false }} />
            </CardContent>
          </Card>
        </Link>

        <Link className="flex-grow basis-1/3" href="/demos/fcp">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">First Contentful Paint (FCP)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                First Contentful Paint (FCP) measures the time from when a page starts loading to when any part of the page&apos;s content is first displayed.
              </p>
              <BrowserIcons width={48} height={48} />
            </CardContent>
          </Card>
        </Link>

        <Link className="flex-grow basis-1/3" href="/demos/ttfb">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Time to First Byte (TTFB)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Time to First Byte (TTFB) measures the duration from when a page starts loading to when the first byte of content is received from the server.</p>
              <BrowserIcons width={48} height={48} />
            </CardContent>
          </Card>
        </Link>

        <Link className="flex-grow basis-1/3" href="/demos/cls">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cumulative Layout Shift (CLS)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Cumulative Layout Shift (CLS) measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.</p>
              <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false, firefox: false }} />
            </CardContent>
          </Card>
        </Link>


        <Link className="flex-grow basis-1/3" href="/demos/inp">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Interaction to Next Paint (INP)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Interaction to Next Paint (INP) measures the time from when a user interacts with a page to when the browser renders the visual response to that interaction.</p>
              <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false, firefox: false }} />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
