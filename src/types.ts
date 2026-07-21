export type TableStatus = 'empty' | 'active' | 'billing';

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  zoneId: string;
  guestCount: number;
  checkInTime?: string; // ISO string or time display
  elapsedMinutes?: number; // Calculated elapsed time for demo
  activeOrderId?: string;
}

export interface Zone {
  id: string;
  name: string;
}

export interface MenuItemIngredient {
  inventoryItemId: string; // ID of the ingredient in inventory
  quantity: number; // quantity needed per unit of menu item (e.g., 0.02 kg coffee)
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description?: string;
  isAvailable: boolean;
  recipe?: MenuItemIngredient[];
  isNew?: boolean;
  unit?: string;
}

export interface OrderItem {
  id: string; // unique for order item instance (in case of same item with different notes)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isNew?: boolean;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'active' | 'completed' | 'cancelled';
  startTime: string;
  totalAmount: number;
  isPrepared?: boolean;
}

export interface Invoice {
  id: string;
  tableName: string;
  zoneName: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: 'cash' | 'vietqr';
  paymentTime: string;
}

export interface BankConfig {
  bankId: string;
  accountNo: string;
  accountName: string;
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  announcement?: string;
  announcementSpeed?: number; // duration of animation in seconds
  fbMode?: boolean; // true = F&B Mode (with tables), false = Direct POS / Retail Mode
}

export interface InventoryItem {
  id: string;
  name: string;
  initialQuantity: number; // Tồn đầu kỳ
  quantity: number;        // Tồn cuối kỳ / Hiện tại
  unit: string;
  minThreshold: number;
  lastUpdated: string;
  importedQuantity?: number; // Số lượng nhập
  exportedQuantity?: number; // Số lượng xuất
}

export interface AuditSessionItem {
  itemId: string;
  itemName: string;
  unit: string;
  systemQty: number;
  actualQty: number;
  difference: number;
  openingQty?: number;
  importedQty?: number;
  exportedQty?: number;
  closingQty?: number;
}

export interface AuditSession {
  id: string;
  date: string;
  time: string;
  items: AuditSessionItem[];
  notes?: string;
}

