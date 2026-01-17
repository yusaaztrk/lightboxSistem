
export enum ShapeType {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE'
}

export enum ProfileType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE'
}

export type BackplateType = 'MDF_4MM' | 'DEKOTA_4_5MM' | 'KOMPOZIT_4MM';
export type LedType = 'INNER' | 'OUTER';

export interface ConfigOptions {
  shape: ShapeType;
  width: number;
  height: number;
  quantity: number;
  sheetWidth: number;
  sheetHeight: number;
  depth: number;
  profile: ProfileType;
  ledType: LedType;
  backplate: BackplateType;
  title: string;
  userImageUrl?: string | null;
  viewMode: 'finish' | 'technical';
  isLightOn?: boolean;
}

export interface PricingFactors {
  framePrices: { [key: string]: number };
  backplatePrices: { [key in BackplateType]: number };
  ledPrices: { [key in LedType]: number };
  adapterPrices: { amps: number; price: number; watt: number }[];
  pricePerSqMeterPrinting: number;
  cornerPiecePrice: number;
  cablePrice: number;
  ledSpacingOptions: number[]; // Adminin belirlediği seçenekler (örn: [10, 15, 20])
}

export interface CalculationResult {
  totalPrice: number;
  ledMetres: number;
  frameLength: number;
  surfaceArea: number;
  adapterNeeded: string;
  totalWattage: number;
}

export interface MockupScene {
  id: string;
  title: string;
  url: string;
}

export interface Order {
  id: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  dimensions: string;
  price: number;
  configurationDetails: string;
  status: string;
  createdAt: string;
}

