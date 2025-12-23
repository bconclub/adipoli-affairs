// Menu data management with server-side file storage via PHP API

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

const API_BASE = '/api';

// Load menu items from server
export async function loadMenuItems(): Promise<MenuItem[]> {
    try {
        const response = await fetch(`${API_BASE}/get-menu.php`);
        if (!response.ok) {
            console.error('Failed to load menu items');
            return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error loading menu items:', error);
        return [];
    }
}

// Save menu items to server
export async function saveMenuItems(items: MenuItem[]): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/save-menu.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to save menu items:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error saving menu items:', error);
        return false;
    }
}

// Load featured items from server
export async function loadFeaturedItems(): Promise<FeaturedItem[]> {
    try {
        const response = await fetch(`${API_BASE}/get-featured.php`);
        if (!response.ok) {
            console.error('Failed to load featured items');
            return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error loading featured items:', error);
        return [];
    }
}

// Save featured items to server
export async function saveFeaturedItems(items: FeaturedItem[]): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/save-featured.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to save featured items:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error saving featured items:', error);
        return false;
    }
}

// Initialize menu items (loads from server, initializes if empty)
export async function initializeMenuItems(fullMenuItems: MenuItem[]): Promise<MenuItem[]> {
    const items = await loadMenuItems();
    
    // If no items exist, initialize with defaults
    if (items.length === 0 && fullMenuItems.length > 0) {
        await saveMenuItems(fullMenuItems);
        return fullMenuItems;
    }
    
    return items;
}

// Menu item operations
export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
    const items = await loadMenuItems();
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id), 0) + 1 : 1;
    const newItem = { ...item, id: newId };
    items.push(newItem);
    
    const success = await saveMenuItems(items);
    return success ? newItem : null;
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const items = await loadMenuItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    const success = await saveMenuItems(items);
    return success ? items[index] : null;
}

export async function deleteMenuItem(id: number): Promise<boolean> {
    const items = await loadMenuItems();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    
    return await saveMenuItems(filtered);
}

// Featured item operations
export async function addFeaturedItem(item: Omit<FeaturedItem, 'id'>): Promise<FeaturedItem | null> {
    const items = await loadFeaturedItems();
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id), 0) + 1 : 1;
    const newItem = { ...item, id: newId };
    items.push(newItem);
    
    const success = await saveFeaturedItems(items);
    return success ? newItem : null;
}

export async function updateFeaturedItem(id: number, updates: Partial<FeaturedItem>): Promise<FeaturedItem | null> {
    const items = await loadFeaturedItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    const success = await saveFeaturedItems(items);
    return success ? items[index] : null;
}

export async function deleteFeaturedItem(id: number): Promise<boolean> {
    const items = await loadFeaturedItems();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    
    return await saveFeaturedItems(filtered);
}

export async function reorderFeaturedItems(newOrder: FeaturedItem[]): Promise<boolean> {
    return await saveFeaturedItems(newOrder);
}

// Upload image to server
export async function uploadImage(file: File, category: string, productName: string): Promise<string | null> {
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', category);
        formData.append('productName', productName);
        
        const response = await fetch(`${API_BASE}/upload-image.php`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to upload image:', error);
            return null;
        }
        
        const result = await response.json();
        return result.success ? result.path : null;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}
