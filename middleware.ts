// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export default function adaptHostnameToCookie(host = "") {
  const commonDomainPattern = /^[a-zA-Z0-9]+\.[a-zA-Z]{2,7}\.[a-zA-Z]{2}$/;
  const hostWithoutPort = host.split(":")[0];

  if (commonDomainPattern.test(hostWithoutPort)) {
    return `.${hostWithoutPort}`;
  }

  const levels = hostWithoutPort.split(".");

  if (levels.length === 1) {
    return hostWithoutPort;
  }

  if (levels.length > 2) {
    levels.shift();
    return `.${levels.join(".")}`;
  }

  return `.${hostWithoutPort}`;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const utmMedium = request.nextUrl.searchParams.get("utm_medium");
  // console.log("🫥", utmMedium);

  if (utmMedium === "ref_link" || utmMedium === "widget") {
    const utmSource = request.nextUrl.searchParams.get("utm_source");
    const utmCampaign = request.nextUrl.searchParams.get("utm_campaign");

    const referralData = {
      vendorName: utmSource,
      campaign: utmCampaign,
      medium: utmMedium,
    };

    const domain = adaptHostnameToCookie(request.nextUrl.host);

    response.cookies.set("marketplace-referral", JSON.stringify(referralData), {
      domain,
    });
  }

  return response;
}

export const config = { matcher: "/((?!.*\\.|api\\/).*)" };
