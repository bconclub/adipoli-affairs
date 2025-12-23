"use client";

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, X, Check, GripVertical, Star, Image as ImageIcon, Upload, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { 
    loadMenuItems, 
    saveMenuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    loadFeaturedItems,
    saveFeaturedItems,
    addFeaturedItem,
    updateFeaturedItem,
    deleteFeaturedItem,
    reorderFeaturedItems,
    initializeMenuItems,
    uploadImage,
    type MenuItem,
    type FeaturedItem
} from '@/lib/menuData';
import { menuData } from '@/data/menu';
import { formatProductName } from '@/lib/utils';
import ImageCropper from '@/components/ImageCropper';

// Standard 16:9 image dimensions for cropping
const IMAGE_DIMENSIONS = {
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
};

// Category mapping from menu data to display categories
const CATEGORY_MAP: Record<string, string> = {
    "SOUP": "Soups",
    "STARTERS": "Starters",
    "Idly & DOSA": "South Specials",
    "BREADS": "Breads",
    "Adipoli Special BIRYANI": "Biryani",
    "COMBO": "Combo Specials",
    "Kerala Meals (12pm to 3pm)": "Kerala Meals",
    "MAIN COURSE - VEG": "Main Course",
    "MAIN COURSE - EGG": "Main Course",
    "MAIN COURSE - CHICKEN": "Main Course",
    "MAIN COURSE - BEEF": "Main Course",
    "MAIN COURSE - MUTTON (bone in)": "Main Course",
    "Seafood - FISH": "Main Course",
    "Seafood - PRAWNS": "Main Course",
    "Seafood - SQUID": "Main Course",
    "INDO CHINESE - VEG": "Indo-Chinese",
    "INDO CHINESE - NON VEG": "Indo-Chinese",
    "Fried RICE": "Fried Rice",
    "NOODLES": "Noodles",
    "SALAD": "Salad",
    "Kids corner": "Kids Corner",
    "Dessert": "Desserts",
    "SIDES": "Sides",
    "SNACKS": "Snacks",
    "HOT DRINKS": "Hot Drinks",
    "Cooldrinks": "Cool Drinks",
    "JUICE": "Juice",
    "MILK SHAKE": "Milkshake",
};

const CATEGORIES = [
    "Soups", "Starters", "South Specials", "Breads", "Biryani", 
    "Combo Specials", "Kerala Meals", "Main Course", "Indo-Chinese",
    "Fried Rice", "Noodles", "Salad", "Kids Corner", "Desserts",
    "Sides", "Snacks", "Hot Drinks", "Cool Drinks", "Juice",
    "Milkshake"
];

// Helper function to get image based on item name
const getImageForItem = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken')) return "/images/chicken.png";
    if (lowerName.includes('beef')) return "/images/beef.png";
    if (lowerName.includes('biryani')) return "/images/biryani.png";
    return "/images/hero.png";
};

// Helper function to generate description
const getDescription = (item: { name: string; description?: string }): string => {
    if (item.description) return item.description;
    return `Delicious ${item.name.toLowerCase()} prepared with authentic Kerala spices and traditional cooking methods.`;
};

// Transform menu data to MenuItem format
const transformMenuData = (): MenuItem[] => {
    let id = 1;
    const items: MenuItem[] = [];
    
    menuData.forEach(category => {
        const displayCategory = CATEGORY_MAP[category.name] || category.name;
        
        category.items.forEach(item => {
            // Handle special pricing for Vizhinjam Chicken Fry - split into half and full
            if (item.name.toLowerCase().includes('vizhinjam chicken fry')) {
                items.push({
                    id: id++,
                    name: "Vizhinjam Chicken Fry (Bone-in) half",
                    price: 16.99,
                    category: displayCategory,
                    image: getImageForItem(item.name),
                    desc: getDescription(item),
                });
                items.push({
                    id: id++,
                    name: "Vizhinjam Chicken Fry (Bone-in) full",
                    price: 29.99,
                    category: displayCategory,
                    image: getImageForItem(item.name),
                    desc: getDescription(item),
                });
                return;
            }
            
            items.push({
                id: id++,
                name: item.name,
                price: item.price,
                category: displayCategory,
                image: getImageForItem(item.name),
                desc: getDescription(item),
            });
        });
    });
    
    return items;
};

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState<'menu' | 'featured'>('menu');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [editingFeatured, setEditingFeatured] = useState<FeaturedItem | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isAddingFeatured, setIsAddingFeatured] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        loadData();
    }, []);

    // Scroll to form when editing
    useEffect(() => {
        if (editingItem || isAddingNew) {
            setTimeout(() => {
                const formElement = document.getElementById('menu-item-form');
                if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [editingItem, isAddingNew]);

    const loadData = async () => {
        try {
            // Initialize menu items from data/menu.ts if not already initialized
            const transformedItems = transformMenuData();
            const initializedItems = await initializeMenuItems(transformedItems);
            setMenuItems(initializedItems);
            const featured = await loadFeaturedItems();
            setFeaturedItems(featured);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data. Please refresh the page.');
        }
    };

    const handleSaveMenuItem = async (itemData: Partial<MenuItem>) => {
        try {
            if (editingItem) {
                await updateMenuItem(editingItem.id, itemData);
            } else {
                await addMenuItem(itemData as Omit<MenuItem, 'id'>);
            }
            await loadData();
            setEditingItem(null);
            setIsAddingNew(false);
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Failed to save menu item. Please check the console for details.');
        }
    };

    const handleDeleteMenuItem = async (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteMenuItem(id);
            await loadData();
        }
    };

    const handleSaveFeatured = async (itemData: Partial<FeaturedItem>) => {
        try {
            if (editingFeatured) {
                await updateFeaturedItem(editingFeatured.id, itemData);
            } else {
                await addFeaturedItem(itemData as Omit<FeaturedItem, 'id'>);
            }
            await loadData();
            setEditingFeatured(null);
            setIsAddingFeatured(false);
        } catch (error) {
            console.error('Error saving featured item:', error);
            alert('Failed to save featured item. Please check the console for details.');
        }
    };

    const handleDeleteFeatured = async (id: number) => {
        if (confirm('Are you sure you want to delete this featured item?')) {
            await deleteFeaturedItem(id);
            await loadData();
        }
    };

    const handleAddFromMenu = (menuItem: MenuItem) => {
        const priceStr = typeof menuItem.price === 'number' 
            ? `$${menuItem.price.toFixed(2)}`
            : menuItem.price.half && menuItem.price.full
            ? `$${menuItem.price.half.toFixed(2)} / $${menuItem.price.full.toFixed(2)}`
            : `$${(menuItem.price.half || menuItem.price.full || 0).toFixed(2)}`;

        addFeaturedItem({
            name: menuItem.name,
            price: priceStr,
            image: menuItem.image,
            description: menuItem.desc,
            calories: "450 cal",
            prepTime: "25 min",
            menuItemId: menuItem.id
        });
        loadData();
    };

    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="container section" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-primary">Admin Panel</h1>
                <p>Manage menu items and featured products</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
                >
                    Menu Items
                </button>
                <button
                    onClick={() => setActiveTab('featured')}
                    className={`btn ${activeTab === 'featured' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
                >
                    Featured Products
                </button>
            </div>

            {/* Menu Items Tab */}
            {activeTab === 'menu' && (
                <div>
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2>Menu Items</h2>
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsAddingNew(true);
                                }}
                                className="btn btn-primary"
                            >
                                <Plus size={20} style={{ marginRight: '0.5rem' }} />
                                Add New Item
                            </button>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    minWidth: '180px',
                                    zIndex: 10,
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    paddingRight: '2.5rem'
                                }}
                            >
                                <option value="All" style={{ background: '#1a1a1a', color: 'white' }}>All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} style={{ background: '#1a1a1a', color: 'white' }}>{cat}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: '200px',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>
                    </div>

                    {/* Add/Edit Form */}
                    {(isAddingNew || editingItem) && (
                        <div id="menu-item-form" style={{ position: 'relative', zIndex: 10 }}>
                            <MenuItemForm
                                item={editingItem || undefined}
                                categories={CATEGORIES}
                                onSave={handleSaveMenuItem}
                                onCancel={() => {
                                    setEditingItem(null);
                                    setIsAddingNew(false);
                                }}
                            />
                        </div>
                    )}

                    {/* Menu Items List */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {filteredMenuItems.map(item => (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                onEdit={() => setEditingItem(item)}
                                onDelete={() => handleDeleteMenuItem(item.id)}
                            />
                        ))}
                    </div>

                    {filteredMenuItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <p>No menu items found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Featured Products Tab */}
            {activeTab === 'featured' && (
                <div>
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2>Featured Products</h2>
                            <button
                                onClick={() => {
                                    setEditingFeatured(null);
                                    setIsAddingFeatured(true);
                                }}
                                className="btn btn-primary"
                            >
                                <Plus size={20} style={{ marginRight: '0.5rem' }} />
                                Add Featured Item
                            </button>
                        </div>
                    </div>

                    {/* Add/Edit Featured Form */}
                    {(isAddingFeatured || editingFeatured) && (
                        <FeaturedItemForm
                            item={editingFeatured || undefined}
                            menuItems={menuItems}
                            onSave={handleSaveFeatured}
                            onCancel={() => {
                                setEditingFeatured(null);
                                setIsAddingFeatured(false);
                            }}
                        />
                    )}

                    {/* Quick Add from Menu */}
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Quick Add from Menu</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {menuItems.filter(item => !featuredItems.some(f => f.menuItemId === item.id)).slice(0, 6).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleAddFromMenu(item)}
                                    className="btn btn-outline"
                                    style={{ textAlign: 'left', padding: '1rem' }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{formatProductName(item.name)}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Items List */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {featuredItems.map((item, index) => (
                            <FeaturedItemCard
                                key={item.id}
                                item={item}
                                index={index}
                                onEdit={() => setEditingFeatured(item)}
                                onDelete={() => handleDeleteFeatured(item.id)}
                                onMoveUp={index > 0 ? async () => {
                                    const newOrder = [...featuredItems];
                                    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                    await reorderFeaturedItems(newOrder);
                                    await loadData();
                                } : undefined}
                                onMoveDown={index < featuredItems.length - 1 ? async () => {
                                    const newOrder = [...featuredItems];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    await reorderFeaturedItems(newOrder);
                                    await loadData();
                                } : undefined}
                            />
                        ))}
                    </div>

                    {featuredItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <p>No featured items. Add some to display on the featured page.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Menu Item Card Component
function MenuItemCard({ item, onEdit, onDelete }: { item: MenuItem; onEdit: () => void; onDelete: () => void }) {
    const formatPrice = (price: number | { half?: number; full?: number }): string => {
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }
        if (price.half && price.full) {
            return `$${price.half.toFixed(2)} / $${price.full.toFixed(2)}`;
        }
        return '';
    };

    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0 }}>{formatProductName(item.name)}</h3>
                        {item.featured && <Star size={16} style={{ color: 'var(--primary)' }} fill="var(--primary)" />}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {item.category} • {formatPrice(item.price)}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {item.desc.substring(0, 100)}...
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={onEdit} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}>
                    <Edit2 size={16} style={{ marginRight: '0.25rem' }} />
                    Edit
                </button>
                <button onClick={onDelete} className="btn btn-outline" style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#ef4444' }}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// Featured Item Card Component
function FeaturedItemCard({ 
    item, 
    index, 
    onEdit, 
    onDelete, 
    onMoveUp, 
    onMoveDown 
}: { 
    item: FeaturedItem; 
    index: number;
    onEdit: () => void; 
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}) {
    return (
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    #{index + 1}
                </span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{formatProductName(item.name)}</h3>
                <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {item.price}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                    {item.description}
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.calories} • {item.prepTime}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(onMoveUp || onMoveDown) && (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {onMoveUp && (
                            <button onClick={onMoveUp} className="btn btn-outline" style={{ padding: '0.5rem' }} title="Move up">
                                ↑
                            </button>
                        )}
                        {onMoveDown && (
                            <button onClick={onMoveDown} className="btn btn-outline" style={{ padding: '0.5rem' }} title="Move down">
                                ↓
                            </button>
                        )}
                    </div>
                )}
                <button onClick={onEdit} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}>
                    <Edit2 size={16} style={{ marginRight: '0.25rem' }} />
                    Edit
                </button>
                <button onClick={onDelete} className="btn btn-outline" style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#ef4444' }}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// Menu Item Form Component
function MenuItemForm({ 
    item, 
    categories, 
    onSave, 
    onCancel 
}: { 
    item?: MenuItem; 
    categories: string[]; 
    onSave: (data: Partial<MenuItem>) => void; 
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || categories[0],
        image: item?.image || '/images/hero.png',
        desc: item?.desc || '',
        priceType: (item?.price && typeof item.price === 'object') ? 'range' : 'single',
        price: typeof item?.price === 'number' ? item.price : (item?.price?.half || item?.price?.full || 0),
        priceHalf: typeof item?.price === 'object' ? item.price.half : undefined,
        priceFull: typeof item?.price === 'object' ? item.price.full : undefined,
        featured: item?.featured || false,
    });
    const [isUploading, setIsUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    // Update form data when item prop changes
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                category: item.category,
                image: item.image,
                desc: item.desc,
                priceType: (item.price && typeof item.price === 'object') ? 'range' : 'single',
                price: typeof item.price === 'number' ? item.price : (item.price?.half || item.price?.full || 0),
                priceHalf: typeof item.price === 'object' ? item.price.half : undefined,
                priceFull: typeof item.price === 'object' ? item.price.full : undefined,
                featured: item.featured || false,
            });
        } else {
            setFormData({
                name: '',
                category: categories[0],
                image: '/images/hero.png',
                desc: '',
                priceType: 'single',
                price: 0,
                priceHalf: undefined,
                priceFull: undefined,
                featured: false,
            });
        }
    }, [item, categories]);

    const handleCropComplete = async (croppedImageDataUrl: string) => {
        if (!originalFile || !formData.category) return;
        
        setShowCropper(false);
        setIsUploading(true);
        
        try {
            // Convert data URL to File
            const response = await fetch(croppedImageDataUrl);
            const blob = await response.blob();
            const croppedFile = new File([blob], originalFile.name, { type: 'image/jpeg' });
            
            const productName = formData.name || originalFile.name.split('.')[0];
            
            // Upload to server via PHP endpoint (no compression)
            const imagePath = await uploadImage(croppedFile, formData.category, productName);
            
            if (imagePath) {
                // Update form with the image path
                setFormData({ ...formData, image: imagePath });
            } else {
                alert('Failed to upload image. Please try again.');
            }
            
            setIsUploading(false);
            setImageToCrop(null);
            setOriginalFile(null);
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image. Please try again.');
            setIsUploading(false);
            setImageToCrop(null);
            setOriginalFile(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceData = formData.priceType === 'range' && formData.priceHalf && formData.priceFull
            ? { half: formData.priceHalf, full: formData.priceFull }
            : formData.price;

        onSave({
            name: formData.name,
            category: formData.category,
            image: formData.image,
            desc: formData.desc,
            price: priceData as number | { half: number; full: number },
            featured: formData.featured,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                <button type="button" onClick={onCancel} className="btn btn-outline">
                    <X size={20} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category *</label>
                    <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            background: 'rgba(0,0,0,0.6)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            color: 'white',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            paddingRight: '2.5rem'
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat} style={{ background: '#1a1a1a', color: 'white' }}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Image *</label>
                    
                    {/* Image Preview */}
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                            position: 'relative', 
                            width: '200px', 
                            height: '150px', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0
                        }}>
                            {formData.image ? (
                                <>
                                    <img 
                                        src={formData.image.startsWith('/') ? formData.image : `/${formData.image}`}
                                        alt="Preview" 
                                        style={{ 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.src.endsWith('/images/hero.png')) {
                                                target.src = '/images/hero.png';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '/images/hero.png' })}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white',
                                            transition: 'all 0.2s',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        title="Remove image"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '100%',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <ImageIcon size={32} />
                                </div>
                            )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        required
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="/images/item.png"
                                        style={{ 
                                            width: '100%',
                                            padding: '0.75rem', 
                                            borderRadius: '8px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            color: 'white'
                                        }}
                                    />
                                    {formData.image && (
                                        <div style={{ 
                                            fontSize: '0.85rem', 
                                            color: 'var(--text-secondary)',
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '6px',
                                            wordBreak: 'break-all'
                                        }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Image:</strong> {
                                                formData.image
                                            }
                                        </div>
                                    )}
                                </div>
                                <label className="btn btn-outline" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', opacity: isUploading ? 0.6 : 1 }}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Choose File
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file && formData.category) {
                                                // Read file as data URL for cropping
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImageToCrop(reader.result as string);
                                                    setOriginalFile(file);
                                                    setShowCropper(true);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                                Enter image path/URL or choose a file from your computer
                            </p>
                            
                            {/* Quick Image Select */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick select:</span>
                                {['/images/chicken.png', '/images/beef.png', '/images/biryani.png', '/images/hero.png'].map(img => (
                                    <button
                                        key={img}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: img })}
                                        style={{
                                            position: 'relative',
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            border: formData.image === img ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                        title={img}
                                    >
                                        <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price Type</label>
                    <select
                        value={formData.priceType}
                        onChange={(e) => setFormData({ ...formData, priceType: e.target.value as 'single' | 'range' })}
                        style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
                            background: 'rgba(0,0,0,0.6)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            color: 'white',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            paddingRight: '2.5rem'
                        }}
                    >
                        <option value="single" style={{ background: '#1a1a1a', color: 'white' }}>Single Price</option>
                        <option value="range" style={{ background: '#1a1a1a', color: 'white' }}>Half / Full Price</option>
                    </select>
                </div>

                {formData.priceType === 'single' ? (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                    </div>
                ) : (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Half Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.priceHalf || ''}
                                onChange={(e) => setFormData({ ...formData, priceHalf: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.priceFull || ''}
                                onChange={(e) => setFormData({ ...formData, priceFull: parseFloat(e.target.value) })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        id="featured-check"
                    />
                    <label htmlFor="featured-check" style={{ cursor: 'pointer' }}>Featured Item</label>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description *</label>
                <textarea
                    required
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    rows={4}
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'white', 
                        resize: 'vertical',
                        pointerEvents: 'auto',
                        cursor: 'text'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                    <Save size={20} style={{ marginRight: '0.5rem' }} />
                    Save Item
                </button>
                <button type="button" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </button>
            </div>
            
            {showCropper && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    aspectRatio={IMAGE_DIMENSIONS.aspectRatio}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setImageToCrop(null);
                        setOriginalFile(null);
                    }}
                />
            )}
        </form>
    );
}

// Featured Item Form Component
function FeaturedItemForm({ 
    item, 
    menuItems, 
    onSave, 
    onCancel 
}: { 
    item?: FeaturedItem; 
    menuItems: MenuItem[]; 
    onSave: (data: Partial<FeaturedItem>) => void; 
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        price: item?.price || '',
        image: item?.image || '/images/hero.png',
        description: item?.description || '',
        calories: item?.calories || '450 cal',
        prepTime: item?.prepTime || '25 min',
        menuItemId: item?.menuItemId,
    });
    const [isUploading, setIsUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    // Update form data when item prop changes
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                price: item.price,
                image: item.image,
                description: item.description,
                calories: item.calories,
                prepTime: item.prepTime,
                menuItemId: item.menuItemId,
            });
        } else {
            setFormData({
                name: '',
                price: '',
                image: '/images/hero.png',
                description: '',
                calories: '450 cal',
                prepTime: '25 min',
                menuItemId: undefined,
            });
        }
    }, [item]);

    const handleCropComplete = async (croppedImageDataUrl: string) => {
        if (!originalFile) return;
        
        setShowCropper(false);
        setIsUploading(true);
        
        try {
            // Convert data URL to File
            const response = await fetch(croppedImageDataUrl);
            const blob = await response.blob();
            const croppedFile = new File([blob], originalFile.name, { type: 'image/jpeg' });
            
            const productName = formData.name || originalFile.name.split('.')[0];
            
            // Upload to server via PHP endpoint (no compression)
            // Use a default category for featured items if needed
            const category = 'featured';
            const imagePath = await uploadImage(croppedFile, category, productName);
            
            if (imagePath) {
                // Update form with the image path
                setFormData({ ...formData, image: imagePath });
            } else {
                alert('Failed to upload image. Please try again.');
            }
            
            setIsUploading(false);
            setImageToCrop(null);
            setOriginalFile(null);
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image. Please try again.');
            setIsUploading(false);
            setImageToCrop(null);
            setOriginalFile(null);
        }
    };

    const handleMenuSelect = (menuItemId: number) => {
        const menuItem = menuItems.find(m => m.id === menuItemId);
        if (menuItem) {
            const priceStr = typeof menuItem.price === 'number' 
                ? `$${menuItem.price.toFixed(2)}`
                : menuItem.price.half && menuItem.price.full
                ? `$${menuItem.price.half.toFixed(2)} / $${menuItem.price.full.toFixed(2)}`
                : `$${(menuItem.price.half || menuItem.price.full || 0).toFixed(2)}`;

            setFormData({
                name: menuItem.name,
                price: priceStr,
                image: formData.image || '/images/hero.png', // Keep current featured image, don't copy menu image
                description: menuItem.desc,
                calories: formData.calories,
                prepTime: formData.prepTime,
                menuItemId: menuItem.id,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{item ? 'Edit Featured Item' : 'Add Featured Item'}</h2>
                <button type="button" onClick={onCancel} className="btn btn-outline">
                    <X size={20} />
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quick Fill from Menu Item</label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                    Select a menu item to auto-fill details. Note: You must upload a separate high-quality image for TV display.
                </p>
                <select
                    value={formData.menuItemId || ''}
                    onChange={(e) => {
                        const id = parseInt(e.target.value);
                        if (id) handleMenuSelect(id);
                    }}
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        background: 'rgba(0,0,0,0.6)', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        color: 'white',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        paddingRight: '2.5rem'
                    }}
                >
                    <option value="" style={{ background: '#1a1a1a', color: 'white' }}>Select a menu item to auto-fill...</option>
                    {menuItems.map(mi => (
                        <option key={mi.id} value={mi.id} style={{ background: '#1a1a1a', color: 'white' }}>{mi.name} ({mi.category})</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price *</label>
                    <input
                        type="text"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="$24.99 or $16.99 / $29.99"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Image *</label>
                    
                    {/* Image Preview */}
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                            position: 'relative', 
                            width: '200px', 
                            height: '150px', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0
                        }}>
                            {formData.image ? (
                                <>
                                    <img 
                                        src={formData.image.startsWith('/') ? formData.image : `/${formData.image}`}
                                        alt="Preview" 
                                        style={{ 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.src.endsWith('/images/hero.png')) {
                                                target.src = '/images/hero.png';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '/images/hero.png' })}
                                        style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white',
                                            transition: 'all 0.2s',
                                            zIndex: 10
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        title="Remove image"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </>
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '100%',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <ImageIcon size={32} />
                                </div>
                            )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    required
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="/images/item.png"
                                    style={{ 
                                        flex: 1,
                                        padding: '0.75rem', 
                                        borderRadius: '8px', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        color: 'white'
                                    }}
                                />
                                <label className="btn btn-outline" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', opacity: isUploading ? 0.6 : 1 }}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Choose File
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Read file as data URL for cropping
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImageToCrop(reader.result as string);
                                                    setOriginalFile(file);
                                                    setShowCropper(true);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                                <strong style={{ color: 'var(--primary)' }}>High-Quality Image Required for TV Display</strong><br/>
                                Upload a high-resolution image (up to 2MB). This image will be displayed on TV screens, so quality is important.
                            </p>
                            
                            {/* Quick Image Select */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quick select:</span>
                                {['/images/chicken.png', '/images/beef.png', '/images/biryani.png', '/images/hero.png'].map(img => (
                                    <button
                                        key={img}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: img })}
                                        style={{
                                            position: 'relative',
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            border: formData.image === img ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                        title={img}
                                    >
                                        <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Calories</label>
                    <input
                        type="text"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        placeholder="450 cal"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Prep Time</label>
                    <input
                        type="text"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                        placeholder="25 min"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description *</label>
                <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                    <Save size={20} style={{ marginRight: '0.5rem' }} />
                    Save Featured Item
                </button>
                <button type="button" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </button>
            </div>
            
            {showCropper && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    aspectRatio={IMAGE_DIMENSIONS.aspectRatio}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setImageToCrop(null);
                        setOriginalFile(null);
                    }}
                />
            )}
        </form>
    );
}

