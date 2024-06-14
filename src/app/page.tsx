"use client";

import { useLoadState } from "./loadState";
import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import BrowserIcons from "./components/BrowserIcons";
import { Badge } from "@/components/ui/badge";
export default function Home() {
  const { setLoading } = useLoadState();


  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [setLoading]);

  return (
    <div>
      <h1 className="mb-8 text-5xl font-md tracking-tighter text-gray-500">Web Vitals Playground</h1>


      <div className="flex flex-wrap gap-4">

        <a href="/lcp" className="flex-grow lg:basis-1/3 basis-full">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl relative">
                <div className="text-5xl mb-2 text-teal-500">
                  LCP
                </div>
                <div className="text-xl font-normal">Largest Contentful Paint</div>
                <div className="top-0 right-0 absolute">
                  <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false }} />
                  <div className="text-right" style={{ marginTop: "6px" }}>
                    <div className="inline-block">
                      <Badge variant="secondary">Core Web Vital</Badge>
                    </div>
                  </div>
                </div>

              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>
                Measures the time it takes for the largest text or image element to render on a webpage.
              </p>
            </CardContent>
          </Card>
        </a>

        <a href="/inp" className="flex-grow lg:basis-1/3 basis-full">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl relative">
                <div className="text-5xl mb-2 text-yellow-600">
                  INP
                </div>
                <div className="text-xl font-normal">Interaction to Next Paint</div>
                <div className="top-0 right-0 absolute">
                  <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false, firefox: false }} />
                  <div className="text-right" style={{ marginTop: "6px" }}>
                    <div className="inline-block">
                      <Badge variant="secondary">Core Web Vital</Badge>
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Interaction to Next Paint (INP) measures the time from when a user interacts with a page to when the browser renders the visual response to that interaction.</p>

            </CardContent>
          </Card>
        </a>


        <a href="/cls" className="flex-grow lg:basis-1/3 basis-full">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl relative">
                <div className="text-5xl mb-2 text-purple-600">
                  CLS
                </div>
                <div className="text-xl font-normal">Cumulative Layout Shift</div>
                <div className="top-0 right-0 absolute">
                  <BrowserIcons width={48} height={48} supportedBrowsers={{ safari: false, firefox: false }} />
                  <div className="text-right" style={{ marginTop: "6px" }}>
                    <div className="inline-block">
                      <Badge variant="secondary">Core Web Vital</Badge>
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Measures the total amount of unexpected layout shifts that occur during the entire lifespan of a webpage.</p>
            </CardContent>
          </Card>
        </a>

        <a href="/fcp" className="flex-grow lg:basis-1/3 basis-full">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl relative">
                <div className="text-5xl mb-2 text-amber-600">
                  FCP
                </div>
                <div className="text-xl font-normal">First Contentful Paint</div>
                <div className="top-0 right-0 absolute">
                  <BrowserIcons width={48} height={48} />
                  <div className="text-right" style={{ marginTop: "6px" }}>
                    <div className="inline-block">
                      <Badge variant="secondary">Other Vital</Badge>
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>
                Measures the time from when a page starts loading to when <span className="italic">any</span> part of the page&apos;s content is first displayed.
              </p>
            </CardContent>
          </Card>
        </a>

        <a href="/ttfb" className="flex-grow lg:basis-1/3 basis-full">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle className="text-xl relative">
                <div className="text-5xl mb-2 text-blue-600">
                  TTFB
                </div>
                <div className="text-xl font-normal">Time to First Byte</div>
                <div className="top-0 right-0 absolute">
                  <BrowserIcons width={48} height={48} />
                  <div className="text-right" style={{ marginTop: "6px" }}>
                    <div className="inline-block">
                      <Badge variant="secondary">Other Vital</Badge>
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-rows-[4lh,auto] gap-y-4">
              <p>Measures the duration from when a page starts loading to when the first byte of content is received from the server.</p>
            </CardContent>
          </Card>
        </a>


      </div>
    </div>
  );
}
