export type DeviceStatus = 'Warranty Expired' | 'Warranty Active' | 'In Stock' | 'Sold' | 'Reserved' | 'Repair' | 'Returned';
export type DeviceGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'Ungraded';

export interface Device {
  id: string;
  manufacturer: string;
  model: string;
  variant?: string;
  network?: string;
  capacity?: string;
  color?: string;
  imei?: string;
  quantity: number;
  grade?: DeviceGrade;
  damages?: string;
  notes?: string;
  pricePaid?: number;
  expectedSalePrice?: number; // Added for Offer Analysis
  status: DeviceStatus;
  location?: string;
  battery?: string;
  createdAt: string;
  updatedAt: string;
  // For relationships
  orderId?: string;
  invoiceId?: string;
}

export type CustomerType = 'Retail Customer' | 'Wholesale Buyer' | 'Supplier' | 'Partner';

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  companyName?: string;
  billingAddress: string;
  shippingAddress?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  type: CustomerType;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms?: string;
  shippingMethods?: string;
  averageLeadTime?: string;
  rating?: number; // 1-5
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'Draft' | 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
export type OrderType = 'Purchase Order' | 'Sales Order' | 'Internal Transfer' | 'Return/RMA';

export interface OrderItem {
  deviceId: string; // Link to specific device in inventory
  deviceSnapshot: Partial<Device>; // Snapshot in case device is deleted/changed
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string; // Human readable ID
  type: OrderType;
  customerId?: string; // For Sales Order
  supplierId?: string; // For Purchase Order
  status: OrderStatus;
  date: string;
  expectedDeliveryDate?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  deviceId?: string; // Optional link
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferAnalysisItem {
  id: string;
  manufacturer: string;
  model: string;
  capacity: string;
  grade: string;
  offeredPrice: number;
  marketValue: number;
  historicalPrice?: number;
  profitMargin: number;
  recommendation: 'Accept' | 'Reject' | 'Negotiate';
  riskScore: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface OfferAnalysis {
  id: string;
  supplierName?: string;
  date: string;
  items: OfferAnalysisItem[];
  totalValue: number;
  totalExpectedProfit: number;
  status: 'Draft' | 'Processed' | 'Archived';
}
