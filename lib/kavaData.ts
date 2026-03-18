export interface KavaCountry {
  name: string;
  lat: number;
  lng: number;
  role: string;
  varieties: string[];
  topVariety: string;
  annualProduction: string;
  exportMarkets: string[];
  culturalNote: string;
  qualityGrade: string;
  coraRelevant: boolean;
  color: string;
  productionTonnes: number;
}

export interface GlobalMarket {
  totalValue: string;
  growthRate: string;
  topImporter: string;
  trend: string;
}

export const kavaCountries: KavaCountry[] = [
  {
    name: "Vanuatu",
    lat: -15.3767,
    lng: 166.9592,
    role: "Origin + largest producer",
    varieties: ["Borogu", "Palarasul", "Melomelo", "Ahouia", "Pia", "Kelai"],
    topVariety: "Borogu",
    annualProduction: "2000 tonnes",
    productionTonnes: 2000,
    exportMarkets: ["Australia", "New Caledonia", "USA", "EU"],
    culturalNote: "Nakamal (kava bar) culture. Daily ceremonial and social use. Noble kava varieties required for export.",
    qualityGrade: "Noble — highest quality, low tudei content",
    coraRelevant: true,
    color: "#2D6A4F",
  },
  {
    name: "Fiji",
    lat: -17.7134,
    lng: 178.065,
    role: "Major producer + ceremonial hub",
    varieties: ["Qila Balavu", "Matakaro", "Loa Kasa Balavu", "Dokobana Vula"],
    topVariety: "Qila Balavu",
    annualProduction: "1500 tonnes",
    productionTonnes: 1500,
    exportMarkets: ["USA", "Australia", "Pacific diaspora"],
    culturalNote: "Yaqona ceremony central to Fijian society. Used in welcoming ceremonies, marriages, funerals.",
    qualityGrade: "Noble",
    coraRelevant: false,
    color: "#1B4332",
  },
  {
    name: "Tonga",
    lat: -21.1789,
    lng: -175.1982,
    role: "Ceremonial + growing export",
    varieties: ["Lekahina", "Leka Tefito", "Tonga Lekahina"],
    topVariety: "Lekahina",
    annualProduction: "400 tonnes",
    productionTonnes: 400,
    exportMarkets: ["New Zealand", "USA", "Australia"],
    culturalNote: "Called awa. Deep ceremonial use in royal and community contexts.",
    qualityGrade: "Noble",
    coraRelevant: false,
    color: "#40916C",
  },
  {
    name: "Samoa",
    lat: -13.759,
    lng: -172.1046,
    role: "Ceremonial + small export",
    varieties: ["Aisa", "Aisa Ula", "Fita"],
    topVariety: "Aisa",
    annualProduction: "300 tonnes",
    productionTonnes: 300,
    exportMarkets: ["New Zealand", "USA"],
    culturalNote: "Called ava. Central to ifoga (apology ceremony) and all formal occasions.",
    qualityGrade: "Noble",
    coraRelevant: false,
    color: "#52B788",
  },
  {
    name: "Papua New Guinea",
    lat: -6.314993,
    lng: 143.95555,
    role: "Emerging producer",
    varieties: ["Melo Melo", "PNG varieties"],
    topVariety: "Melo Melo",
    annualProduction: "200 tonnes",
    productionTonnes: 200,
    exportMarkets: ["Australia", "Regional"],
    culturalNote: "Used in coastal and island communities. Growing commercial interest.",
    qualityGrade: "Mixed",
    coraRelevant: true,
    color: "#74C69D",
  },
  {
    name: "Hawaii (USA)",
    lat: 19.8968,
    lng: -155.5828,
    role: "Premium craft market",
    varieties: ["Mahakea", "Hiwa", "Nene", "Mo'i", "Pana'ewa"],
    topVariety: "Mo'i",
    annualProduction: "100 tonnes",
    productionTonnes: 100,
    exportMarkets: ["Continental USA", "Premium wellness market"],
    culturalNote: "Called awa. Sacred in Hawaiian culture. Premium craft market with heritage varieties.",
    qualityGrade: "Noble — premium prices",
    coraRelevant: false,
    color: "#95D5B2",
  },
];

export const globalMarket: GlobalMarket = {
  totalValue: "$130M USD annually",
  growthRate: "15% YoY",
  topImporter: "USA ($45M)",
  trend: "Wellness/beverage market booming — kava bars growing 40% annually in USA",
};

export const varietyDetails: Record<string, { effects: string; flavor: string; exportStatus: string; classification: string }> = {
  Borogu: { effects: "Balanced relaxation, sociable, mild euphoria", flavor: "earthy", exportStatus: "Widely exported", classification: "noble" },
  Palarasul: { effects: "Heavy body relaxation, sedating", flavor: "earthy", exportStatus: "Limited export", classification: "noble" },
  Melomelo: { effects: "Heady, uplifting, social", flavor: "peppery", exportStatus: "Exported", classification: "noble" },
  Ahouia: { effects: "Balanced, ceremonial grade", flavor: "earthy", exportStatus: "Limited", classification: "noble" },
  Pia: { effects: "Mild, good for beginners", flavor: "sweet", exportStatus: "Local mainly", classification: "noble" },
  Kelai: { effects: "Strong heady effect", flavor: "peppery", exportStatus: "Specialty export", classification: "noble" },
  "Qila Balavu": { effects: "Strong, ceremonial, balanced", flavor: "earthy", exportStatus: "Exported", classification: "noble" },
  Matakaro: { effects: "Relaxing, mild sedation", flavor: "earthy", exportStatus: "Limited", classification: "noble" },
  "Loa Kasa Balavu": { effects: "Heady, social, uplifting", flavor: "peppery", exportStatus: "Specialty", classification: "noble" },
  "Dokobana Vula": { effects: "Heavy, night-time relaxation", flavor: "earthy", exportStatus: "Limited", classification: "noble" },
  Lekahina: { effects: "Strong, ceremonial, balanced", flavor: "earthy", exportStatus: "Exported", classification: "noble" },
  "Leka Tefito": { effects: "Moderate, social", flavor: "sweet", exportStatus: "Limited", classification: "noble" },
  "Tonga Lekahina": { effects: "Ceremonial strength, relaxing", flavor: "earthy", exportStatus: "Regional", classification: "noble" },
  Aisa: { effects: "Ceremonial, strong, balanced", flavor: "earthy", exportStatus: "Limited", classification: "noble" },
  "Aisa Ula": { effects: "Red-stem variety, potent", flavor: "peppery", exportStatus: "Specialty", classification: "noble" },
  Fita: { effects: "Milder, social use", flavor: "sweet", exportStatus: "Local", classification: "noble" },
  "Melo Melo": { effects: "Balanced, emerging commercial grade", flavor: "earthy", exportStatus: "Growing", classification: "mixed" },
  "PNG varieties": { effects: "Variable, local traditional use", flavor: "earthy", exportStatus: "Emerging", classification: "mixed" },
  Mahakea: { effects: "Relaxing, mild, great for beginners", flavor: "sweet", exportStatus: "Local premium", classification: "noble" },
  Hiwa: { effects: "Black-stemmed, potent, ceremonial", flavor: "earthy", exportStatus: "Limited", classification: "noble" },
  Nene: { effects: "Balanced, daytime use", flavor: "sweet", exportStatus: "Specialty", classification: "noble" },
  "Mo'i": { effects: "Premium heady effect, royal variety", flavor: "peppery", exportStatus: "Premium export", classification: "noble" },
  "Pana'ewa": { effects: "Strong body effect, relaxing", flavor: "earthy", exportStatus: "Craft market", classification: "noble" },
};

export const kavaBarTrendData = [
  { year: "2019", bars: 120 },
  { year: "2020", bars: 145 },
  { year: "2021", bars: 210 },
  { year: "2022", bars: 340 },
  { year: "2023", bars: 520 },
  { year: "2024", bars: 728 },
];

export const tradeFlows = [
  { exporter: "Vanuatu", importer: "Australia", volume: "~600 tonnes", value: "$18M" },
  { exporter: "Vanuatu", importer: "USA", volume: "~400 tonnes", value: "$14M" },
  { exporter: "Vanuatu", importer: "EU", volume: "~300 tonnes", value: "$10M" },
  { exporter: "Fiji", importer: "USA", volume: "~350 tonnes", value: "$12M" },
  { exporter: "Fiji", importer: "Australia", volume: "~250 tonnes", value: "$8M" },
  { exporter: "Tonga", importer: "New Zealand", volume: "~150 tonnes", value: "$5M" },
  { exporter: "Samoa", importer: "New Zealand", volume: "~100 tonnes", value: "$3M" },
];
