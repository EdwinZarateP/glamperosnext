import { NextResponse } from "next/server";

export function GET() {
  const robots = `
    User-agent: *
    Disallow: /api/
    Allow: /
    Sitemap: https://glamperos.com/sitemap.xml
  `;

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
