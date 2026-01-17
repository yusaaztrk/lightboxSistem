import axios from 'axios';
import { PricingFactors, Order } from '../types';

const API_URL = 'http://localhost:5000/api';

// Shape of data from Backend
interface SystemSettings {
  id: number;
  kasa4Single: number;
  kasa5Single: number;
  kasa8Single: number;
  kasa10Single: number;
  kasa12Single: number;
  kasa8Double: number;
  kasa10Double: number;
  kasa12Double: number;
  zeminMdf4mm: number;
  zeminDekota4mm: number;
  zeminKompozit4mm: number;
  ledIcMekan: number;
  ledDisMekan: number;
  digerBaskiM2: number;
  digerKoseAparatiAdet: number;
  digerSabitEkstraGider: number;
  adapterPricesJson: string;
  ledSpacingOptionsJson: string;
}

export const api = {
  async getSettings(): Promise<PricingFactors> {
    const response = await axios.get<SystemSettings>(`${API_URL}/settings`);
    const data = response.data;

    // Convert backend model to frontend PricingFactors
    return {
      framePrices: {
        '4_SINGLE': data.kasa4Single,
        '5_SINGLE': data.kasa5Single,
        '8_SINGLE': data.kasa8Single,
        '10_SINGLE': data.kasa10Single,
        '12_SINGLE': data.kasa12Single,
        '8_DOUBLE': data.kasa8Double,
        '10_DOUBLE': data.kasa10Double,
        '12_DOUBLE': data.kasa12Double
      },
      backplatePrices: {
        'MDF_4MM': data.zeminMdf4mm,
        'DEKOTA_4_5MM': data.zeminDekota4mm,
        'KOMPOZIT_4MM': data.zeminKompozit4mm
      },
      ledPrices: {
        'INNER': data.ledIcMekan,
        'OUTER': data.ledDisMekan
      },
      // Parse JSON strings
      adapterPrices: JSON.parse(data.adapterPricesJson || '[]'),
      ledSpacingOptions: JSON.parse(data.ledSpacingOptionsJson || '[]'),

      pricePerSqMeterPrinting: data.digerBaskiM2,
      cornerPiecePrice: data.digerKoseAparatiAdet,
      cablePrice: data.digerSabitEkstraGider
    };
  },

  async updateSettings(factors: PricingFactors): Promise<void> {
    // Convert frontend PricingFactors to backend SystemSettings
    const payload: Partial<SystemSettings> = {
      id: 1, // Singleton ID
      kasa4Single: factors.framePrices['4_SINGLE'],
      kasa5Single: factors.framePrices['5_SINGLE'],
      kasa8Single: factors.framePrices['8_SINGLE'],
      kasa10Single: factors.framePrices['10_SINGLE'],
      kasa12Single: factors.framePrices['12_SINGLE'],
      kasa8Double: factors.framePrices['8_DOUBLE'],
      kasa10Double: factors.framePrices['10_DOUBLE'],
      kasa12Double: factors.framePrices['12_DOUBLE'],

      zeminMdf4mm: factors.backplatePrices['MDF_4MM'],
      zeminDekota4mm: factors.backplatePrices['DEKOTA_4_5MM'],
      zeminKompozit4mm: factors.backplatePrices['KOMPOZİT_4MM'],

      ledIcMekan: factors.ledPrices['INNER'],
      ledDisMekan: factors.ledPrices['OUTER'],

      digerBaskiM2: factors.pricePerSqMeterPrinting,
      digerKoseAparatiAdet: factors.cornerPiecePrice,
      digerSabitEkstraGider: factors.cablePrice,

      adapterPricesJson: JSON.stringify(factors.adapterPrices),
      ledSpacingOptionsJson: JSON.stringify(factors.ledSpacingOptions)
    };

    await axios.post(`${API_URL}/settings`, payload);
  },

  async createOrder(order: any): Promise<Order> {
    const response = await axios.post<Order>(`${API_URL}/orders`, order);
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await axios.get<Order[]>(`${API_URL}/orders`);
    return response.data;
  }
};
