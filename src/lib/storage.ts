
export interface PriceListProduct {
  id: string;
  name: string;
  height: number;
  width: number;
  sqft: number;
  price: number;
}

export interface PriceList {
  id: string;
  name: string;
  products: PriceListProduct[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  priceListId: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  customerId: string;
  items: LedgerItem[];
  totalAmount: number;
  createdAt: string;
}

export interface LedgerItem {
  id: string;
  productId: string;
  description?: string;
  width: number;
  height: number;
  sqft: number;
  rate: number;
  pcRate: number;
  quantity: number;
  extraCharges: number;
  amount: number;
}

const TEMP_SELECTED_PRODUCTS_KEY = 'tempSelectedProducts';


// Price Lists
export const getPriceLists = (): PriceList[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('priceLists');
  return data ? JSON.parse(data) : [];
};

export const savePriceList = (list: PriceList) => {
  const lists = getPriceLists();
  const existing = lists.findIndex(l => l.id === list.id);
  if (existing >= 0) {
    lists[existing] = list;
  } else {
    lists.push(list);
  }
  localStorage.setItem('priceLists', JSON.stringify(lists));
};

export const deletePriceList = (id: string) => {
  const lists = getPriceLists();
  localStorage.setItem('priceLists', JSON.stringify(lists.filter(l => l.id !== id)));
};

// Customers
export const getCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('customers');
  return data ? JSON.parse(data) : [];
};

export const saveCustomer = (customer: Customer) => {
  const customers = getCustomers();
  const existing = customers.findIndex(c => c.id === customer.id);
  if (existing >= 0) {
    customers[existing] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem('customers', JSON.stringify(customers));
};

export const deleteCustomer = (id: string) => {
  const customers = getCustomers();
  localStorage.setItem('customers', JSON.stringify(customers.filter(c => c.id !== id)));
};

// Ledger Entries
export const getLedgerEntries = (): LedgerEntry[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('ledgerEntries');
  return data ? JSON.parse(data) : [];
};

export const saveLedgerEntry = (entry: LedgerEntry) => {
  const entries = getLedgerEntries();
  entries.push(entry);
  localStorage.setItem('ledgerEntries', JSON.stringify(entries));
};

export function initializeDemoData(): void {
  if (typeof window === 'undefined') return;
  
  // Only initialize if empty
  if (getPriceLists().length === 0) {
    const demoLists: PriceList[] = [
      {
        id: "1763151964485",
        name: "",
        products: [
          { id: "1", name: "E+L", height: 1, width: 1, sqft: 1, price: 100 },
          { id: "2", name: "E+L+5mm", height: 1, width: 1, sqft: 1, price: 150 },
          { id: "3", name: "Satin + Pipe", height: 1, width: 1, sqft: 1, price: 200 },
          { id: "4", name: "E+3mm", height: 1, width: 1, sqft: 1, price: 250 },
          { id: "5", name: "Eco +3mm", height: 1, width: 1, sqft: 1, price: 350 },
          { id: "6", name: "Plain flex", height: 1, width: 1, sqft: 1, price: 400 },
          { id: "7", name: "Canvas", height: 1, width: 1, sqft: 1, price: 450 },
          { id: "8", name: "Flex new stande", height: 1, width: 1, sqft: 1, price: 500 }
        ],
        createdAt: "2025-11-14T20:26:04.485Z"
      },
    ];
    //@ts-ignore
    savePriceList(demoLists);
  }

  if (getCustomers().length === 0) {
    const demoCustomers: Customer[] = [
      {
        id: "1763152005232",
        name: "Bhavish Agarwal",
        mobile: "7208618752",
        priceListId: "1763151964485",
        createdAt: "2025-11-14T20:26:45.232Z"
      }
    ];
    //@ts-ignore
    saveCustomer(demoCustomers);
  }
}

export function saveTempSelectedProducts(products: PriceListProduct[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEMP_SELECTED_PRODUCTS_KEY, JSON.stringify(products));
}

export function getTempSelectedProducts(): PriceListProduct[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TEMP_SELECTED_PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearTempSelectedProducts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TEMP_SELECTED_PRODUCTS_KEY);
}