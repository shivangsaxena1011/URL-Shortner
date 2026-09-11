import { UAParser } from "ua-parser-js";
import { NextRequest } from "next/server";

export interface ParsedAnalytics {
  referrer: string;
  userAgent: string;
  country: string;
  device: string;
  browser: string;
  operatingSystem: string;
}

export function parseRequestAnalytics(req: NextRequest): ParsedAnalytics {
  const userAgentString = req.headers.get("user-agent") || "";
  const rawReferrer = req.headers.get("referer") || req.headers.get("referrer") || "";
  const countryHeader =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code");

  // Parse user agent
  const parser = new UAParser(userAgentString);
  const browserResult = parser.getBrowser();
  const osResult = parser.getOS();
  const deviceResult = parser.getDevice();

  // Normalize device
  let device = deviceResult.type || "desktop";
  if (device !== "mobile" && device !== "tablet") {
    device = "desktop";
  }

  // Normalize browser
  const browser = browserResult.name || "Unknown";

  // Normalize OS
  const operatingSystem = osResult.name || "Unknown";

  // Clean referrer
  let referrer = "Direct";
  if (rawReferrer) {
    try {
      const url = new URL(rawReferrer);
      referrer = url.hostname.replace(/^www\./, "");
      if (referrer.includes("google.")) referrer = "Google";
      else if (referrer.includes("twitter.com") || referrer.includes("x.com")) referrer = "X (Twitter)";
      else if (referrer.includes("facebook.com")) referrer = "Facebook";
      else if (referrer.includes("instagram.com")) referrer = "Instagram";
      else if (referrer.includes("linkedin.com")) referrer = "LinkedIn";
      else if (referrer.includes("reddit.com")) referrer = "Reddit";
      else if (referrer.includes("youtube.com")) referrer = "YouTube";
      else if (referrer.includes("github.com")) referrer = "GitHub";
      else if (referrer.includes("t.co")) referrer = "X (Twitter)";
    } catch {
      referrer = "Unknown";
    }
  }

  const country = countryHeader ? countryHeader.toUpperCase() : "Unknown";

  return {
    referrer,
    userAgent: userAgentString.slice(0, 500),
    country,
    device,
    browser,
    operatingSystem,
  };
}
