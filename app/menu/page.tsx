"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuData } from '@/data/menu';
import { useCart } from '@/contexts/CartContext';
import { formatProductName } from '@/lib/utils';
import { loadMenuItems, initializeMenuItems, type MenuItem as MenuItemType } from '@/lib/menuData';

// Use the MenuItem type from menuData
type MenuItem = MenuItemType;

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
    "All", 
    "Soups", 
    "Starters", 
    "South Specials", 
    "Breads", 
    "Biryani", 
    "Combo Specials", 
    "Kerala Meals",
    "Main Course",
    "Indo-Chinese",
    "Fried Rice",
    "Noodles",
    "Salad",
    "Kids Corner",
    "Desserts",
    "Sides",
    "Snacks",
    "Hot Drinks",
    "Cool Drinks",
    "Juice",
    "Milkshake",
];

// Sanitize name for file path (same as upload API)
const sanitizeName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Get image path from public folder based on product name and category
const getImagePathFromPublic = (name: string | undefined | null, category: string | undefined | null): string => {
    if (!name || !category) return '/images/hero.png';
    const sanitizedCategory = sanitizeName(category);
    const sanitizedProductName = sanitizeName(name);
    
    if (!sanitizedCategory || !sanitizedProductName) return '/images/hero.png';
    
    // Return the expected path (png is most common, browser will try to load it)
    // If it doesn't exist, we'll fall back in the component
    return `/images/${sanitizedCategory}/${sanitizedProductName}.png`;
};

// Fallback image based on item name
const getFallbackImage = (name: string | undefined | null): string => {
    if (!name) return '/images/hero.png';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken')) return "/images/chicken.png";
    if (lowerName.includes('beef')) return "/images/beef.png";
    if (lowerName.includes('biryani')) return "/images/biryani.png";
    return "/images/hero.png";
};

// Helper function to get image - checks public folder first, then defaults
const getImageForItem = (name: string | undefined | null, category: string | undefined | null): string => {
    if (!name || !category) return '/images/hero.png';
    
    // First try to get from public folder based on name and category
    const publicPath = getImagePathFromPublic(name, category);
    
    // Fallback to default images if needed
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken') && !publicPath.includes('soup')) return "/images/chicken.png";
    if (lowerName.includes('beef') && !publicPath.includes('soup')) return "/images/beef.png";
    if (lowerName.includes('biryani')) return "/images/biryani.png";
    
    // Return the public folder path (browser will handle 404)
    return publicPath;
};

// Helper function to generate description
const getDescription = (name: string | undefined | null): string => {
    if (!name) return 'Delicious dish prepared with authentic Kerala spices and traditional cooking methods.';
    return `Delicious ${name.toLowerCase()} prepared with authentic Kerala spices and traditional cooking methods.`;
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
                    image: getImageForItem(item.name, displayCategory),
                    desc: getDescription(item.name),
                });
                items.push({
                    id: id++,
                    name: "Vizhinjam Chicken Fry (Bone-in) full",
                    price: 29.99,
                    category: displayCategory,
                    image: getImageForItem(item.name, displayCategory),
                    desc: getDescription(item.name),
                });
                return;
            }
            
            items.push({
                id: id++,
                name: item.name,
                price: item.price,
                category: displayCategory,
                image: getImageForItem(item.name, displayCategory),
                desc: getDescription(item.name),
            });
        });
    });
    
    return items;
};

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const { addItem } = useCart();

    // Load menu items from localStorage (same as admin panel uses)
    useEffect(() => {
        const loadItems = async () => {
            try {
                // First ensure localStorage is initialized with default data if empty
                const transformedItems = transformMenuData();
                const initializedItems = await initializeMenuItems(transformedItems);
                
                // Then load the actual data (which admin panel updates)
                const items = await loadMenuItems();
                
                // Ensure we have an array
                if (Array.isArray(items) && items.length > 0) {
                    setMenuItems(items);
                } else if (Array.isArray(initializedItems) && initializedItems.length > 0) {
                    // Fallback to initialized items if loadMenuItems returns empty
                    setMenuItems(initializedItems);
                } else {
                    // Last resort: use transformed items
                    setMenuItems(transformedItems);
                }
            } catch (error) {
                console.error('Error loading menu items:', error);
                // Fallback to transformed items on error
                const transformedItems = transformMenuData();
                setMenuItems(transformedItems);
            }
        };
        
        loadItems();
        
        // Reload when page becomes visible (in case localStorage was updated)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadItems();
            }
        };
        
        // Also reload on focus (when switching back to tab)
        const handleFocus = () => {
            loadItems();
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const filteredItems = menuItems.filter(item => {
        let matchesCategory = false;
        if (activeCategory === "All" && selectedCategories.length === 0) {
            matchesCategory = true;
        } else if (activeCategory !== "All") {
            matchesCategory = item.category === activeCategory;
        } else if (selectedCategories.length > 0) {
            matchesCategory = selectedCategories.includes(item.category);
        }
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCategoryToggle = (category: string) => {
        if (category === "All") return;
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
        setActiveCategory("All");
    };

    const handleFilterApply = () => {
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setActiveCategory("All");
    };

    const formatPrice = (price: number | { half?: number; full?: number }): string => {
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }
        if (price.half && price.full) {
            return `$${price.half.toFixed(2)} / $${price.full.toFixed(2)}`;
        }
        if (price.half) {
            return `$${price.half.toFixed(2)}`;
        }
        if (price.full) {
            return `$${price.full.toFixed(2)}`;
        }
        return '';
    };

    const getPriceValue = (price: number | { half?: number; full?: number }): number => {
        if (typeof price === 'number') {
            return price;
        }
        // Default to full price if available, otherwise half
        return price.full || price.half || 0;
    };


    const handleAddToOrder = (item: MenuItem) => {
        const price = getPriceValue(item.price);
        // Use the same image path logic as displayed on menu
        const imagePath = getImagePathFromPublic(item.name, item.category);
        addItem({
            id: item.id,
            name: item.name,
            price: price,
            image: imagePath,
        });
    };

    return (
        <div className="container section">
            <div className="text-center mb-8">
                <h1 className="text-primary">Our Menu</h1>
                <p>Explore the diverse flavors of Kerala cuisine.</p>
            </div>

            {/* Controls */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '3rem' }}>
                {/* Category Buttons - Horizontal Scrolling */}
                <div 
                    style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        overflowX: 'auto', 
                        overflowY: 'hidden',
                        paddingBottom: '1rem',
                        marginBottom: '1rem',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--primary) transparent',
                        WebkitOverflowScrolling: 'touch'
                    }}
                    className="category-scroll"
                >
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                if (cat === "All") {
                                    handleClearFilters();
                                } else {
                                    setActiveCategory(cat);
                                    setSelectedCategories([]);
                                }
                            }}
                            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                            style={{ 
                                borderRadius: '50px', 
                                whiteSpace: 'nowrap', 
                                fontSize: '0.9rem', 
                                padding: '0.5rem 1.25rem',
                                flexShrink: 0
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className={`btn ${selectedCategories.length > 0 ? 'btn-primary' : 'btn-outline'}`}
                        style={{ 
                            borderRadius: '50px', 
                            whiteSpace: 'nowrap', 
                            fontSize: '0.9rem', 
                            padding: '0.5rem 1.25rem',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Filter size={16} />
                        Filter
                        {selectedCategories.length > 0 && (
                            <span style={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {selectedCategories.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', zIndex: 1 }} size={20} />
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem', 
                            borderRadius: '50px',
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredItems.length > 0 ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {filteredItems.map(item => {
                    // Check if image is a base64 data URL, otherwise use public folder path
                    const imagePath = item?.image?.startsWith('data:image/') 
                        ? item.image 
                        : (getImagePathFromPublic(item?.name, item?.category) || '/images/hero.png');
                    
                    return (
                    <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            aspectRatio: '16/9',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }}>
                            <img 
                                src={imagePath} 
                                alt={item.name} 
                                style={{ 
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center center'
                                }}
                                onError={(e) => {
                                    // If image from public folder doesn't exist and it's not a base64, use fallback
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.startsWith('data:image/') && target.src !== new URL(getFallbackImage(item.name), window.location.origin).href) {
                                        target.src = getFallbackImage(item.name);
                                    }
                                }}
                            />
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', lineHeight: '1.3', textTransform: 'none' }}>{formatProductName(item.name)}</h3>
                                    <span className="text-primary" style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                        {formatPrice(item.price)}
                                    </span>
                            </div>
                                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', flex: 1, color: 'var(--text-secondary)' }}>{item.desc}</p>
                            <button 
                              className="btn btn-primary" 
                              style={{ width: '100%' }}
                              onClick={() => handleAddToOrder(item)}
                            >
                                Add to Order
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p>No items found matching your search.</p>
                </div>
            )}

            {/* Category Filter Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                zIndex: 1000,
                                backdropFilter: 'blur(4px)'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFilterModal(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'var(--surface)',
                                borderRadius: '16px',
                                padding: '2rem',
                                maxWidth: '90vw',
                                width: '500px',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                zIndex: 1001,
                                border: '1px solid var(--glass-border)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                            }}
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '1.5rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid var(--glass-border)'
                            }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Filter Categories</h2>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-main)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Categories List */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: '0.75rem',
                                marginBottom: '1.5rem'
                            }}>
                                {CATEGORIES.filter(cat => cat !== "All").map(category => {
                                    const isSelected = selectedCategories.includes(category);
                                    return (
                                        <button
                                            key={category}
                                            onClick={() => handleCategoryToggle(category)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '8px',
                                                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--glass-border)'}`,
                                                background: isSelected ? 'rgba(242, 127, 36, 0.2)' : 'rgba(255,255,255,0.05)',
                                                color: 'var(--text-main)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s',
                                                fontSize: '0.9rem'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                                }
                                            }}
                                        >
                                            <span>{category}</span>
                                            {isSelected && <Check size={18} style={{ color: 'var(--primary)' }} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer Actions */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem',
                                justifyContent: 'flex-end',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--glass-border)'
                            }}>
                                <button
                                    onClick={handleClearFilters}
                                    className="btn btn-outline"
                                    style={{ minWidth: '100px' }}
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleFilterApply}
                                    className="btn btn-primary"
                                    style={{ minWidth: '100px' }}
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
