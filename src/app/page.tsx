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
        <Link className="flex-grow lg:basis-1/3 basis-full" href="/demos/lcp">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl">
                <div className="text-5xl mb-2 text-teal-500">
                  LCP
                </div>
                <div className="text-xl font-normal">Largest Contentful Paint</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Measures the time it takes for the largest text or image element to render on a webpage.</p>
              <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false }} />
            </CardContent>
          </Card>
        </Link>

        <Link className="flex-grow lg:basis-1/3 basis-full" href="/demos/fcp">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl">
                <div className="text-5xl mb-2 text-amber-600">
                  FCP
                </div>
                <div className="text-xl font-normal">First Contentful Paint</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>
                Measures the time from when a page starts loading to when <span className="italic">any</span> part of the page&apos;s content is first displayed.
              </p>
              <BrowserIcons width={48} height={48} />
            </CardContent>
          </Card>
        </Link>

        <Link className="flex-grow lg:basis-1/3 basis-full" href="/demos/ttfb">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl">
                <div className="text-5xl mb-2 text-blue-600">
                  TTFB
                </div>
                <div className="text-xl font-normal">Time to First Byte</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Measures the duration from when a page starts loading to when the first byte of content is received from the server.</p>
              <BrowserIcons width={48} height={48} />
            </CardContent>
          </Card>
        </Link>

        <Link className="flex-grow lg:basis-1/3 basis-full" href="/demos/cls">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl">
                <div className="text-5xl mb-2 text-purple-600">
                  CLS
                </div>
                <div className="text-xl font-normal">Cumulative Layout Shift</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.</p>
              <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false, firefox: false }} />
            </CardContent>
          </Card>
        </Link>


        <Link className="flex-grow lg:basis-1/3 basis-full" href="/demos/inp">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl">
                <div className="text-5xl mb-2 text-yellow-600">
                  INP
                </div>
                <div className="text-xl font-normal">Interaction to Next Paint</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Interaction to Next Paint (INP) measures the time from when a user interacts with a page to when the browser renders the visual response to that interaction.</p>
              <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false, firefox: false }} />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
