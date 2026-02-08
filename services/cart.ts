export type CartItemType = 'lightbox' | 'fabric';

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  createdAt: string;
  price: number;
  configurationDetails: string;
  costDetails?: string;
  previewImageUrl?: string;
  note?: string;
}

const STORAGE_KEY = 'lightbox_cart_v1';

type Listener = () => void;
const listeners = new Set<Listener>();

const readCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const writeCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    listeners.forEach(l => l());
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Removing preview images...');
      // Remove preview images to save space
      const itemsWithoutImages = items.map(item => ({
        ...item,
        previewImageUrl: undefined
      }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsWithoutImages));
        listeners.forEach(l => l());
        alert('Sepete eklendi! (Görsel önizleme kaydedilemedi - depolama alanı dolu)');
      } catch (retryError) {
        console.error('Failed to save cart even without images:', retryError);
        alert('Sepete eklenemedi - depolama alanı dolu. Lütfen tarayıcı önbelleğinizi temizleyin.');
      }
    } else {
      console.error('Failed to save cart:', error);
      alert('Sepete eklenirken bir hata oluştu.');
    }
  }
};

export const getCartItems = () => readCart();

export const getCartCount = () => readCart().length;

export const addCartItem = (item: Omit<CartItem, 'id' | 'createdAt'>) => {
  const items = readCart();
  const next: CartItem = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  items.unshift(next);
  writeCart(items);
  return next;
};

export const removeCartItem = (id: string) => {
  const items = readCart().filter(i => i.id !== id);
  writeCart(items);
};

export const updateCartItemNote = (id: string, note: string) => {
  const items = readCart().map(i => (i.id === id ? { ...i, note } : i));
  writeCart(items);
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    listeners.forEach(l => l());
  } catch {
    // fallback
    writeCart([]);
  }
};

export const subscribeCart = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
