import { NextRequest, NextResponse } from "next/server";
import { kavaCountries } from "@/lib/kavaData";

// Chemotype profiles (kavalactone numbering system)
const chemotypeData: Record<string, string> = {
  Vanuatu: "246531",
  Fiji: "426315",
  Tonga: "246135",
  Samoa: "246315",
  "Papua New Guinea": "526431",
  "Hawaii (USA)": "423615",
};

// 5-year CAGR estimates
const cagrData: Record<string, string> = {
  Vanuatu: "+12.4%",
  Fiji: "+14.8%",
  Tonga: "+9.2%",
  Samoa: "+7.6%",
  "Papua New Guinea": "+18.3%",
  "Hawaii (USA)": "+22.1%",
};

export async function POST(req: NextRequest) {
  try {
    const { country, type } = await req.json();

    if (!country || !type) {
      return NextResponse.json({ data: "INVALID_PARAMS" }, { status: 400 });
    }

    // Simulate uplink delay
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

    const match = kavaCountries.find(
      (c) => c.name.toLowerCase() === country.toLowerCase()
    );

    if (!match) {
      return NextResponse.json({ data: "NO_DATA" });
    }

    if (type === "chemotype") {
      return NextResponse.json({
        data: chemotypeData[match.name] || "UNCLASSIFIED",
      });
    }

    if (type === "cagr") {
      return NextResponse.json({
        data: cagrData[match.name] || "N/A",
      });
    }

    return NextResponse.json({ data: "UNKNOWN_TYPE" });
  } catch {
    return NextResponse.json({ data: "ERR_UPLINK" }, { status: 500 });
  }
}
