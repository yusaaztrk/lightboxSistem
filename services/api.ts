import axios from 'axios';
import { PricingFactors, Order, ConfigOptions, CalculationBreakdown, ProfileCost, BackingCost, AdapterPrice, ProfileColor, SpinWheelItem, CustomerLead } from '../types';

const API_URL = 'http://localhost:5000/api';

// Shape of data from Backend
interface SystemSettings {
  id: number;
  cableFixedCost: number;
  cornerPiecePrice: number;
  printCostPerM2: number;
  laborRatePercentage: number;
  profitMarginPercentage: number;
  amperesPerMeter: number;
  defaultLedSpacingCm?: number;
  ledIndoorPricePerMeter: number;
  ledOutdoorPricePerMeter: number;
}

export const api = {
  // --- Legacy / Partial Support ---
  async getSettings(): Promise<PricingFactors> {
    const response = await axios.get<SystemSettings>(`${API_URL}/settings`);
    const data = response.data;

    // Construct PricingFactors for legacy components
    return {
      framePrices: {},
      backplatePrices: {} as any,
      ledPrices: { 'INNER': data.ledIndoorPricePerMeter, 'OUTER': data.ledOutdoorPricePerMeter },
      adapterPrices: [],
      ledSpacingOptions: [],
      pricePerSqMeterPrinting: data.printCostPerM2,
      cornerPiecePrice: data.cornerPiecePrice,
      cablePrice: data.cableFixedCost,
      fabricProfitMarginPercentage: 30, // Default for type compatibility
      standPrice: 0 // Default
    };
  },

  // Method to get raw SystemSettings
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await axios.get<SystemSettings>(`${API_URL}/settings`);
    return response.data;
  },

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await axios.post<SystemSettings>(`${API_URL}/settings`, settings);
    return response.data;
  },

  async updateSettings(factors: PricingFactors): Promise<void> {
    // Legacy support: Try to update global settings from factors
    const payload = {
      id: 1,
      ledIndoorPricePerMeter: factors.ledPrices['INNER'],
      ledOutdoorPricePerMeter: factors.ledPrices['OUTER'],
      printCostPerM2: factors.pricePerSqMeterPrinting,
      cornerPiecePrice: factors.cornerPiecePrice,
      cableFixedCost: factors.cablePrice
    };
    await axios.post(`${API_URL}/settings`, payload);
  },

  async getOrders(): Promise<Order[]> {
    const response = await axios.get<Order[]>(`${API_URL}/orders`);
    return response.data;
  },

  async getOrder(id: number | string): Promise<Order> {
    const response = await axios.get<Order>(`${API_URL}/orders/${id}`);
    return response.data;
  },

  async createOrder(order: any): Promise<Order> {
    const response = await axios.post<Order>(`${API_URL}/orders`, order);
    return response.data;
  },

  async updateOrder(id: number | string, order: Order): Promise<void> {
    await axios.put(`${API_URL}/orders/${id}`, order);
  },

  async deleteOrder(id: number | string): Promise<void> {
    await axios.delete(`${API_URL}/orders/${id}`);
  },

  async calculateDetails(config: ConfigOptions): Promise<CalculationBreakdown> {
    const payload = {
      width: config.width,
      height: config.height,
      depth: config.depth,
      profile: config.profile,
      ledType: config.ledType,
      backplate: config.backplate,
      profileId: config.profileId,
      hasFeet: !!config.hasFeet
    };
    const response = await axios.post<CalculationBreakdown>(`${API_URL}/calculation`, payload);
    return response.data;
  },

  // --- CRUD Methods ---

  // Profile Costs
  async getProfileCosts(): Promise<ProfileCost[]> {
    const response = await axios.get<ProfileCost[]>(`${API_URL}/profilecosts`);
    return response.data;
  },
  async createProfileCost(cost: Omit<ProfileCost, 'id'>): Promise<ProfileCost> {
    const response = await axios.post<ProfileCost>(`${API_URL}/profilecosts`, cost);
    return response.data;
  },
  async updateProfileCost(id: number, cost: ProfileCost): Promise<void> {
    await axios.put(`${API_URL}/profilecosts/${id}`, cost);
  },
  async deleteProfileCost(id: number): Promise<void> {
    await axios.delete(`${API_URL}/profilecosts/${id}`);
  },

  // Backing Costs
  async getBackingCosts(): Promise<BackingCost[]> {
    const response = await axios.get<BackingCost[]>(`${API_URL}/backingcosts`);
    return response.data;
  },
  async updateBackingCost(id: number, cost: BackingCost): Promise<void> {
    await axios.put(`${API_URL}/backingcosts/${id}`, cost);
  },
  async createBackingCost(cost: Omit<BackingCost, 'id'>): Promise<BackingCost> {
    const response = await axios.post<BackingCost>(`${API_URL}/backingcosts`, cost);
    return response.data;
  },
  async deleteBackingCost(id: number): Promise<void> {
    await axios.delete(`${API_URL}/backingcosts/${id}`);
  },

  // Adapter Prices
  async getAdapterPrices(): Promise<AdapterPrice[]> {
    const response = await axios.get<AdapterPrice[]>(`${API_URL}/adapterprices`);
    return response.data;
  },
  async createAdapterPrice(price: Omit<AdapterPrice, 'id'>): Promise<AdapterPrice> {
    const response = await axios.post<AdapterPrice>(`${API_URL}/adapterprices`, price);
    return response.data;
  },
  async updateAdapterPrice(id: number, price: AdapterPrice): Promise<void> {
    await axios.put(`${API_URL}/adapterprices/${id}`, price);
  },
  async deleteAdapterPrice(id: number): Promise<void> {
    await axios.delete(`${API_URL}/adapterprices/${id}`);
  },
  async getProfileColors() {
    try {
      const res = await axios.get<ProfileColor[]>(`${API_URL}/profilecolors`);
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  async addProfileColor(color: ProfileColor) {
    return axios.post(`${API_URL}/profilecolors`, color);
  },
  async deleteProfileColor(id: number) {
    return axios.delete(`${API_URL}/profilecolors/${id}`);
  },

  // --- Spin Wheel ---
  async getWheelConfig() {
    return (await axios.get<SpinWheelItem[]>(`${API_URL}/spinwheel/config`)).data;
  },
  async addWheelItem(item: Partial<SpinWheelItem>) {
    return (await axios.post<SpinWheelItem>(`${API_URL}/spinwheel/config`, item)).data;
  },
  async deleteWheelItem(id: number) {
    return axios.delete(`${API_URL}/spinwheel/config/${id}`);
  },
  async spinWheel(phoneNumber: string) {
    return (await axios.post(`${API_URL}/spinwheel/spin`, { phoneNumber })).data;
  },
  async getLeads() {
    return (await axios.get<CustomerLead[]>(`${API_URL}/spinwheel/leads`)).data;
  },
  async validateCode(code: string, phoneNumber: string) {
    return (await axios.post<{ percentage: number, owner: string }>(`${API_URL}/spinwheel/validate`, { code, phoneNumber })).data;
  },

  // --- Membership ---
  async registerMember(data: any) {
    return axios.post(`${API_URL}/membership/register`, data);
  },
  async getMembers() {
    return (await axios.get<any[]>(`${API_URL}/membership/members`)).data;
  },
  async getMembershipTypes() {
    return (await axios.get<any[]>(`${API_URL}/membership/types`)).data;
  },
  async createMembershipType(type: any) {
    return (await axios.post(`${API_URL}/membership/types`, type)).data;
  },
  async updateMembershipType(id: number, type: any) {
    return axios.put(`${API_URL}/membership/types/${id}`, type);
  },
  async deleteMembershipType(id: number) {
    return axios.delete(`${API_URL}/membership/types/${id}`);
  },
  async approveMember(id: number) {
    return axios.post(`${API_URL}/membership/approve/${id}`);
  },
  async deleteMember(id: number) {
    return axios.delete(`${API_URL}/membership/${id}`);
  },
  async checkMembership(phoneNumber: string) {
    return (await axios.get<{ hasMembership: boolean, discount: number, typeName: string, memberName: string }>(`${API_URL}/membership/check/${phoneNumber}`)).data;
  },
  async deleteLead(id: number) {
    return axios.delete(`${API_URL}/spinwheel/lead/${id}`);
  },

  // Auth
  async adminLogin(credentials: { username: string, password: string }) {
    return axios.post(`${API_URL}/auth/admin-login`, credentials);
  }
};
