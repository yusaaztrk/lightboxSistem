
import { ConfigOptions, PricingFactors, CalculationResult, ShapeType, ProfileType } from '../types';

export const calculatePrice = (config: ConfigOptions, factors: PricingFactors): CalculationResult => {
  const q = config.quantity || 1;
  const w_cm = config.width;
  const h_cm = config.height;

  // 1. ÖLÇÜLER (M ETRETÜL VE M2)
  const w_m = w_cm / 100;
  const h_m = h_cm / 100;

  // Profil Metretül (Excel: (En+Boy)*2)
  const unitFrameLength = (w_m + h_m) * 2;
  const unitSurfaceArea = w_m * h_m;

  // 2. LED HESAPLAMA (Seçilen aralık mesafesine göre)
  // Şerit sayısı: En / Seçilen Aralık
  // Şerit sayısı: En / (Varsayılan ilk seçenek veya 10)
  const defaultSpacing = factors.ledSpacingOptions?.[0] || 10;
  const ledStrips = Math.max(1, Math.floor(w_cm / defaultSpacing));
  // Toplam LED Metresi: Şerit Sayısı * Şerit Uzunluğu (Boy)
  let unitLedMetres = ledStrips * h_m;

  if (config.profile === ProfileType.DOUBLE) {
    unitLedMetres *= 2;
  }

  // Watt Hesabı (Varsayılan 10W/metre)
  const totalWattage = unitLedMetres * 10 * q;

  // 3. ADAPTÖR SEÇİMİ
  const safetyWattage = totalWattage * 1.2;
  const adapter = factors.adapterPrices.find(a => a.watt >= safetyWattage) || factors.adapterPrices[factors.adapterPrices.length - 1];

  // 4. MALİYETLER
  // Kasa Maliyeti
  const frameKey = `${config.depth}_${config.profile}`;
  const frameCost = (unitFrameLength * q) * (factors.framePrices[frameKey] || 400);

  // Zemin Maliyeti
  const backplateCost = (unitSurfaceArea * q) * factors.backplatePrices[config.backplate];

  // LED Maliyeti
  const ledCost = (unitLedMetres * q) * factors.ledPrices[config.ledType];

  // Baskı Maliyeti (Çift taraflı ise x2)
  const printingMultiplier = config.profile === ProfileType.DOUBLE ? 2 : 1;
  const printingCost = (unitSurfaceArea * q * printingMultiplier) * factors.pricePerSqMeterPrinting;

  // Aksesuar
  const cornerCost = factors.cornerPiecePrice * 4 * q;
  const cableCost = factors.cablePrice * q;

  const totalPrice = frameCost + backplateCost + ledCost + printingCost + cornerCost + cableCost + adapter.price;

  return {
    totalPrice: Number(totalPrice.toFixed(2)),
    ledMetres: Number((unitLedMetres * q).toFixed(2)),
    frameLength: Number((unitFrameLength * q).toFixed(2)),
    surfaceArea: Number((unitSurfaceArea * q).toFixed(2)),
    adapterNeeded: `${adapter.amps}A`,
    totalWattage: Number(totalWattage.toFixed(2))
  };
};
