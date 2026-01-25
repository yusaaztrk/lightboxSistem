
import { ShapeType, ProfileType, PricingFactors, BackplateType, LedType, MockupScene } from './types';

export const DEFAULT_CONFIG: any = {
  shape: ShapeType.RECTANGLE,
  width: 100,
  height: 120,
  quantity: 1,
  sheetWidth: 300,
  sheetHeight: 200,
  depth: 8,
  profile: ProfileType.SINGLE,
  ledType: 'INNER' as LedType,
  backplate: 'MDF_3MM' as BackplateType,
  title: "Yeni Proje",
  userImageUrl: null,
  viewMode: 'finish',
  isLightOn: true
};

export const INITIAL_PRICING: PricingFactors = {
  framePrices: {
    '4_SINGLE': 150,
    '5_SINGLE': 250,
    '8_SINGLE': 400,
    '10_SINGLE': 500,
    '12_SINGLE': 750,
    '8_DOUBLE': 600,
    '10_DOUBLE': 1000,
    '12_DOUBLE': 1500
  },
  backplatePrices: {
    'MDF_3MM': 200,
    'MDF_5MM': 250,
    'DEKOTA_4_5MM': 500,
    'KOMPOZIT_4MM': 600
  },
  ledPrices: {
    'INNER': 2,
    'OUTER': 4
  },
  adapterPrices: [
    { amps: 3, price: 50, watt: 36 },
    { amps: 5, price: 80, watt: 60 },
    { amps: 10, price: 150, watt: 120 },
    { amps: 12.5, price: 180, watt: 150 },
    { amps: 20, price: 250, watt: 240 },
    { amps: 30, price: 350, watt: 360 }
  ],
  pricePerSqMeterPrinting: 300,
  cornerPiecePrice: 50,
  cablePrice: 40,
  ledSpacingOptions: [10, 15] // Varsayılan seçenekler
};

export const DEPTH_OPTIONS = [4.5, 8, 10, 12];

export const MOCKUP_SCENES: MockupScene[] = [
  { id: 'ms1', title: 'Mermer Salon', url: '/mockups/mockup1.jpg' },
  { id: 'ms2', title: 'Minimal Ev', url: '/mockups/mockup2.jpg' },
  { id: 'ms3', title: 'Bekleme Alanı', url: '/mockups/mockup3.jpg' }
];
