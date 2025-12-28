// Menu data management with server-side file storage via PHP API

export interface MenuItem {
    id: number;
    name: string;
    price: number | { half?: number; full?: number };
    category: string;
    image: string;
    desc: string;
    featured?: boolean;
    featuredImage?: string; // Optional featured image for TV/display boards
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

// Check if we're in development mode (no PHP server)
const isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Load menu items from server or localStorage
export async function loadMenuItems(): Promise<MenuItem[]> {
    try {
        // Try to load from API first
        const response = await fetch(`${API_BASE}/get-menu.php`);
        if (response.ok) {
            const responseText = await response.text();
            
            // Check if response is PHP code (development mode - PHP not executing)
            if (responseText.trim().startsWith('<?php') || responseText.trim().startsWith('<!')) {
                console.log('PHP file returned as text (development mode), using localStorage');
                throw new Error('PHP not executing - development mode');
            }
            
            try {
                const data = JSON.parse(responseText);
                if (Array.isArray(data) && data.length > 0) {
                    // Save to localStorage as backup
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('menuItems', JSON.stringify(data));
                    }
                    return data;
                }
            } catch (parseError) {
                console.warn('Failed to parse API response as JSON, trying localStorage');
                throw parseError;
            }
        }
        
        // If API fails, try localStorage (for development)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('menuItems');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log('Loaded menu items from localStorage');
                        return parsed;
                    }
                } catch (e) {
                    console.error('Failed to parse stored menu items:', e);
                }
            }
        }
        
        return [];
    } catch (error) {
        console.log('API load failed, trying localStorage:', error);
        
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('menuItems');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        console.log('Loaded menu items from localStorage (fallback)');
                        return parsed;
                    }
                } catch (e) {
                    console.error('Failed to parse stored menu items:', e);
                }
            }
        }
        
        return [];
    }
}

// Save menu items to server or localStorage
export async function saveMenuItems(items: MenuItem[]): Promise<boolean> {
    try {
        const url = `${API_BASE}/save-menu.php`;
        console.log('Saving menu items to:', url);
        console.log('Items count:', items.length);
        
        // Always save to localStorage as backup
        if (typeof window !== 'undefined') {
            localStorage.setItem('menuItems', JSON.stringify(items));
            console.log('Saved to localStorage as backup');
        }
        
        // Try to save to API
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });
            
            console.log('Response status:', response.status, response.statusText);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Save successful:', result);
                return true;
            } else {
                const responseText = await response.text();
                let error;
                try {
                    error = JSON.parse(responseText);
                } catch (e) {
                    error = { message: `HTTP ${response.status}: ${response.statusText}`, responseText };
                }
                console.warn('API save failed, but saved to localStorage:', error);
                
                // In development, return true if localStorage save worked
                if (isDevelopment) {
                    console.log('Development mode: Using localStorage save');
                    return true;
                }
                
                return false;
            }
        } catch (fetchError) {
            console.warn('API request failed, but saved to localStorage:', fetchError);
            
            // In development, return true if localStorage save worked
            if (isDevelopment) {
                console.log('Development mode: Using localStorage save');
                return true;
            }
            
            return false;
        }
    } catch (error) {
        console.error('Error saving menu items:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
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
        const responseText = await response.text();
        
        // Check if response is PHP code (development mode - PHP not executing)
        if (responseText.trim().startsWith('<?php') || responseText.trim().startsWith('<!')) {
            console.log('PHP file returned as text (development mode), returning empty array');
            return [];
        }
        
        try {
            const data = JSON.parse(responseText);
            return Array.isArray(data) ? data : [];
        } catch (parseError) {
            console.warn('Failed to parse featured items response as JSON');
            return [];
        }
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

// Initialize menu items (loads from server, initializes if empty or updates descriptions)
export async function initializeMenuItems(fullMenuItems: MenuItem[]): Promise<MenuItem[]> {
    const items = await loadMenuItems();
    
    // If no items exist, initialize with defaults
    if (items.length === 0 && fullMenuItems.length > 0) {
        console.log('Initializing menu items (first time setup)');
        const saved = await saveMenuItems(fullMenuItems);
        if (saved) {
            return fullMenuItems;
        } else {
            // Even if API save failed, return the items (they're in localStorage)
            return fullMenuItems;
        }
    }
    
    // If items exist, update descriptions from source only if missing or generic (preserve admin edits)
    if (items.length > 0 && fullMenuItems.length > 0) {
        const sourceMap = new Map(fullMenuItems.map(item => [item.name.toLowerCase(), item]));
        
        // Check if description is generic (starts with "Delicious" and ends with "traditional cooking methods")
        const isGenericDescription = (desc: string): boolean => {
            return desc.toLowerCase().includes('delicious') && 
                   desc.toLowerCase().includes('prepared with authentic kerala spices and traditional cooking methods');
        };
        
        // Update descriptions from source code if missing or generic (preserves custom admin edits)
        let needsUpdate = false;
        items.forEach(item => {
            const sourceItem = sourceMap.get(item.name.toLowerCase());
            if (sourceItem && sourceItem.desc) {
                // Update description if it's missing, empty, or generic (don't overwrite custom admin edits)
                if (!item.desc || item.desc.trim() === '' || isGenericDescription(item.desc)) {
                    item.desc = sourceItem.desc;
                    needsUpdate = true;
                }
            }
        });
        
        if (needsUpdate) {
            await saveMenuItems(items);
        }
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
    try {
        const items = await loadMenuItems();
        const index = items.findIndex(i => i.id === id);
        
        if (index === -1) {
            console.error(`Item with id ${id} not found`);
            return null;
        }
        
        console.log(`Updating item at index ${index}:`, items[index]);
        console.log('Updates to apply:', updates);
        
        items[index] = { ...items[index], ...updates };
        console.log('Item after update:', items[index]);
        
        const success = await saveMenuItems(items);
        
        if (!success) {
            console.error('saveMenuItems returned false');
            return null;
        }
        
        return items[index];
    } catch (error) {
        console.error('Error in updateMenuItem:', error);
        return null;
    }
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

