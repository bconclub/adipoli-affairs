// Menu data management with localStorage persistence

export interface MenuItem {
    id: number;
    name: string;
    price: number | { half?: number; full?: number };
    category: string;
    image: string;
    desc: string;
    featured?: boolean;
}

export interface FeaturedItem {
    id: number;
    name: string;
    price: string;
    image: string;
    description: string;
    calories: string;
    prepTime: string;
    menuItemId?: number; // Link to menu item if applicable
}

const MENU_STORAGE_KEY = 'adipoli_menu_items';
const FEATURED_STORAGE_KEY = 'adipoli_featured_items';

// Initialize with full menu items - this will be populated on first load
export function initializeMenuItems(fullMenuItems: MenuItem[]): MenuItem[] {
    if (typeof window === 'undefined') return fullMenuItems;
    
    // Check if localStorage has items
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing stored menu items:', e);
        }
    }
    
    // Initialize with defaults if nothing stored
    if (fullMenuItems.length > 0) {
        saveMenuItems(fullMenuItems);
        return fullMenuItems;
    }
    
    return [];
}

// Get all default menu items for initialization
export function getDefaultMenuItems(): MenuItem[] {
    return DEFAULT_MENU_ITEMS;
}

// Default menu items (will be overridden by initialization)
const DEFAULT_MENU_ITEMS: MenuItem[] = [];

// Default featured items
const DEFAULT_FEATURED_ITEMS: FeaturedItem[] = [
    {
        id: 1,
        name: "Nidhi Chicken",
        price: "$24.99",
        image: "/images/chicken.png",
        description: "Our signature chicken curry, slow-cooked with roasted spices organic hen.",
        calories: "450 cal",
        prepTime: "25 min"
    },
    {
        id: 2,
        name: "Chatti Biryani",
        price: "$28.50",
        image: "/images/biryani.png",
        description: "Traditional clay-pot biryani layered with aromatic rice and tender meat.",
        calories: "600 cal",
        prepTime: "30 min"
    },
    {
        id: 3,
        name: "Kerala Beef Fry",
        price: "$22.00",
        image: "/images/beef.png",
        description: "Iconic spicy beef roast with coconut slices and curry leaves.",
        calories: "500 cal",
        prepTime: "15 min"
    },
];

// Load menu items from localStorage or return defaults
export function loadMenuItems(): MenuItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem(MENU_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error loading menu items:', e);
    }
    
    // Return empty array if nothing stored (will be initialized by initializeMenuItems)
    return [];
}

// Save menu items to localStorage
export function saveMenuItems(items: MenuItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error('Error saving menu items:', e);
    }
}

// Load featured items from localStorage or return defaults
export function loadFeaturedItems(): FeaturedItem[] {
    if (typeof window === 'undefined') return DEFAULT_FEATURED_ITEMS;
    
    try {
        const stored = localStorage.getItem(FEATURED_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading featured items:', e);
    }
    
    // Initialize with defaults if nothing stored
    saveFeaturedItems(DEFAULT_FEATURED_ITEMS);
    return DEFAULT_FEATURED_ITEMS;
}

// Save featured items to localStorage
export function saveFeaturedItems(items: FeaturedItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error('Error saving featured items:', e);
    }
}

// Menu item operations
export function addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const items = loadMenuItems();
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItem = { ...item, id: newId };
    items.push(newItem);
    saveMenuItems(items);
    return newItem;
}

export function updateMenuItem(id: number, updates: Partial<MenuItem>): MenuItem | null {
    const items = loadMenuItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    saveMenuItems(items);
    return items[index];
}

export function deleteMenuItem(id: number): boolean {
    const items = loadMenuItems();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    
    saveMenuItems(filtered);
    return true;
}

// Featured item operations
export function addFeaturedItem(item: Omit<FeaturedItem, 'id'>): FeaturedItem {
    const items = loadFeaturedItems();
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItem = { ...item, id: newId };
    items.push(newItem);
    saveFeaturedItems(items);
    return newItem;
}

export function updateFeaturedItem(id: number, updates: Partial<FeaturedItem>): FeaturedItem | null {
    const items = loadFeaturedItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    saveFeaturedItems(items);
    return items[index];
}

export function deleteFeaturedItem(id: number): boolean {
    const items = loadFeaturedItems();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    
    saveFeaturedItems(filtered);
    return true;
}

export function reorderFeaturedItems(newOrder: FeaturedItem[]): void {
    saveFeaturedItems(newOrder);
}

