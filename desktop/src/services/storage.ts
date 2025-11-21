import type { Device, Customer, Order, Invoice, Supplier, OfferAnalysis } from '../types';
import * as api from './api';

// ============================================
// Devices - Now using API
// ============================================

export async function getDevices(): Promise<Device[]> {
  try {
    return await api.fetchDevices();
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    throw error;
  }
}

export async function saveDevice(device: Device): Promise<Device> {
  try {
    // Determine if this is a create or update operation
    // Check if device has a valid createdAt date from the backend (not a new ISO string)
    const now = new Date();
    const deviceCreatedDate = device.createdAt ? new Date(device.createdAt) : null;

    // If createdAt exists and is in the past (more than 5 seconds ago), it's an update
    const isUpdate = deviceCreatedDate &&
                     (now.getTime() - deviceCreatedDate.getTime()) > 5000;

    if (isUpdate) {
      // Update existing device
      return await api.updateDevice(device.id, device);
    } else {
      // Create new device
      const { id, createdAt, updatedAt, ...deviceData } = device;
      return await api.createDevice(deviceData as api.DeviceCreateData);
    }
  } catch (error) {
    console.error('Failed to save device:', error);
    throw error;
  }
}

export async function deleteDevice(id: string): Promise<boolean> {
  try {
    await api.deleteDevice(id);
    return true;
  } catch (error) {
    console.error('Failed to delete device:', error);
    return false;
  }
}

// ============================================
// Customers - Placeholder (local storage for now)
// ============================================

const STORAGE_KEYS = {
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  INVOICES: 'invoices',
  SUPPLIERS: 'suppliers',
  OFFERS: 'offers',
};

// Helper for localStorage operations
function getFromLocalStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage:`, error);
    return [];
  }
}

function saveToLocalStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to write ${key} to localStorage:`, error);
    throw error;
  }
}

function saveItemToLocalStorage<T extends { id: string }>(key: string, item: T): T {
  const list = getFromLocalStorage<T>(key);
  const index = list.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    list[index] = item;
  } else {
    list.push(item);
  }
  saveToLocalStorage(key, list);
  return item;
}

function deleteItemFromLocalStorage<T extends { id: string }>(key: string, id: string): boolean {
  const list = getFromLocalStorage<T>(key);
  const filtered = list.filter((i) => i.id !== id);
  if (filtered.length === list.length) return false;
  saveToLocalStorage(key, filtered);
  return true;
}

// --- Customers ---
export const getCustomers = () => getFromLocalStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
export const saveCustomer = (customer: Customer) => saveItemToLocalStorage(STORAGE_KEYS.CUSTOMERS, customer);
export const deleteCustomer = (id: string) => deleteItemFromLocalStorage(STORAGE_KEYS.CUSTOMERS, id);

// --- Suppliers ---
export const getSuppliers = () => getFromLocalStorage<Supplier>(STORAGE_KEYS.SUPPLIERS);
export const saveSupplier = (supplier: Supplier) => saveItemToLocalStorage(STORAGE_KEYS.SUPPLIERS, supplier);
export const deleteSupplier = (id: string) => deleteItemFromLocalStorage(STORAGE_KEYS.SUPPLIERS, id);

// --- Orders ---
export const getOrders = () => getFromLocalStorage<Order>(STORAGE_KEYS.ORDERS);
export const saveOrder = (order: Order) => saveItemToLocalStorage(STORAGE_KEYS.ORDERS, order);
export const deleteOrder = (id: string) => deleteItemFromLocalStorage(STORAGE_KEYS.ORDERS, id);

// --- Invoices ---
export const getInvoices = () => getFromLocalStorage<Invoice>(STORAGE_KEYS.INVOICES);
export const saveInvoice = (invoice: Invoice) => saveItemToLocalStorage(STORAGE_KEYS.INVOICES, invoice);
export const deleteInvoice = (id: string) => deleteItemFromLocalStorage(STORAGE_KEYS.INVOICES, id);

// --- Offers ---
export const getOffers = () => getFromLocalStorage<OfferAnalysis>(STORAGE_KEYS.OFFERS);
export const saveOffer = (offer: OfferAnalysis) => saveItemToLocalStorage(STORAGE_KEYS.OFFERS, offer);
export const deleteOffer = (id: string) => deleteItemFromLocalStorage(STORAGE_KEYS.OFFERS, id);
