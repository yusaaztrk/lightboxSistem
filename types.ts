
export enum ShapeType {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE'
}

export enum ProfileType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE'
}

export type BackplateType = 'MDF_3MM' | 'MDF_5MM' | 'DEKOTA_4_5MM' | 'KOMPOZIT_4MM';
export type LedType = 'INNER' | 'OUTER';

export interface ConfigOptions {
  shape: ShapeType;
  width: number;
  height: number;
  quantity: number;
  sheetWidth: number;
  sheetHeight: number;
  depth: number;
  ledSpacing?: number;
  profile: ProfileType;
  ledType: LedType;
  backplate: BackplateType;
  title: string;
  userImageUrl?: string | null;
  backImageUrl?: string | null;
  viewMode: 'finish' | 'technical';
  isLightOn?: boolean;
  hasFeet?: boolean;
  profileId?: number;
  frameColor?: string; // Hex code for 3D
  profileColorId?: number;
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
  fabricProfitMarginPercentage: number;
  standPrice: number;
}

export interface LedLayoutResult {
  direction: 'Horizontal' | 'Vertical';
  stripCount: number;
  stripLength: number;
  totalLedMeters: number;
  totalCost: number;
}

export interface CalculationBreakdown {
  profileCost: number;
  backingCost: number;
  printCost: number;
  ledCost: number;
  adapterCost: number;
  cableCost: number;
  cornerPieceCost: number;
  standCost: number;
  rawMaterialTotal: number;
  laborCost: number;
  laboredTotal: number;
  profitMargin: number;
  finalPrice: number;
  selectedLayout: LedLayoutResult;
  alternativeLayout: LedLayoutResult;
  adapterName: string;
  requiredAmperes: number;
  selectedAmperes: number;
  perimeter: number;
  areaM2: number;
}

export interface ProfileColor {
  id: number;
  name: string;
  hexCode: string;
  cmykCode: string;
}

export interface CalculationResult {
  totalPrice: number;
  ledMetres: number;
  frameLength: number;
  surfaceArea: number;
  adapterNeeded: string;
  totalWattage: number;
  breakdown?: CalculationBreakdown; // Optional for now
}

export interface MockupScene {
  id: string;
  title: string;
  url: string;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  dimensions: string;
  price: number;
  configurationDetails: string;
  costDetails: string; // New field
  status: string;
  createdAt: string;
}

export interface ProfileCost {
  id: number;
  name: string;
  depthCm: number;
  isDoubleSided: boolean;
  pricePerMeter: number;
  displayName?: string;
}

export interface BackingCost {
  id: number;
  materialType: string;
  displayName: string;
  pricePerM2: number;
  ledSpacingCm?: number | null;
}
// Renaming existing adapterPrices in PricingFactors might be confusing, but here we define the model
export interface AdapterPrice {
  id: number;
  name: string;
  amperage: number;
  wattage: number;
  price: number;
}

export interface SpinWheelItem {
  id: number;
  label: string;
  discountPercentage: number;
  probability: number;
  colorHex: string;
  isLoss: boolean;
}

export interface CustomerLead {
  id: number;
  phoneNumber: string;
  wonPrizeLabel: string;
  discountCode: string;
  createdAt: string;
}

