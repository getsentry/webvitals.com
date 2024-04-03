import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1>Web Vitals Demos</h1>
      <ul>
        <li><a href="/demos/slow-lcp">Slow LCP (Largest Contentful Paint)</a></li>
        <li><a href="/demos/slow-fcp">Slow FCP (First Contentful Paint)</a></li>
      </ul>
    </main>
  );
}
