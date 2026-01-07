"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, X, Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuData } from '@/data/menu';
import { useCart } from '@/contexts/CartContext';
import { formatProductName, type TimeRestriction, isItemAvailableNow, formatTimeRestriction } from '@/lib/utils';
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

// Helper function to generate description (same as admin panel)
const getDescription = (item: { name: string; description?: string }): string => {
    if (item.description) return item.description;
    return `Delicious ${item.name.toLowerCase()} prepared with authentic Kerala spices and traditional cooking methods.`;
};

// Transform menu data to MenuItem format
const transformMenuData = (): MenuItem[] => {
    let id = 1;
    const items: MenuItem[] = [];
    
    // Define time restrictions by category name (from menu data)
    const timeRestrictionsByCategory: Record<string, TimeRestriction> = {
        "Idly & DOSA": { start: "12:00", end: "17:00" }, // South Specials: 12pm-5pm
        "Kerala Meals (12pm to 3pm)": { start: "12:00", end: "15:00" }, // Kerala Meals: 12pm-3pm
        "SNACKS": { start: "16:00", end: "22:00" }, // Snacks: 4pm-10pm
        "INDO CHINESE - VEG": { start: "17:00", end: "22:00" }, // Indo-Chinese: 5pm-10pm
        "INDO CHINESE - NON VEG": { start: "17:00", end: "22:00" }, // Indo-Chinese: 5pm-10pm
    };
    
    menuData.forEach(category => {
        const displayCategory = CATEGORY_MAP[category.name] || category.name;
        const timeRestriction = timeRestrictionsByCategory[category.name];
        
        category.items.forEach(item => {
            // Handle special pricing for Vizhinjam Chicken Fry - split into half and full
            if (item.name.toLowerCase().includes('vizhinjam chicken fry')) {
                items.push({
                    id: id++,
                    name: "Vizhinjam Chicken Fry (Bone-in) half",
                    price: 16.99,
                    category: displayCategory,
                    image: getImageForItem(item.name, displayCategory),
                    desc: getDescription(item),
                    timeRestriction: timeRestriction,
                });
                items.push({
                    id: id++,
                    name: "Vizhinjam Chicken Fry (Bone-in) full",
                    price: 29.99,
                    category: displayCategory,
                    image: getImageForItem(item.name, displayCategory),
                    desc: getDescription(item),
                    timeRestriction: timeRestriction,
                });
                return;
            }
            
            items.push({
                id: id++,
                name: item.name,
                price: item.price,
                category: displayCategory,
                image: getImageForItem(item.name, displayCategory),
                desc: getDescription(item),
                timeRestriction: timeRestriction,
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
    const [categoryScrollPositions, setCategoryScrollPositions] = useState<Record<string, number>>({});
    const [currentTime, setCurrentTime] = useState<Date>(new Date()); // For real-time updates
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
                const finalItems = Array.isArray(items) && items.length > 0 
                    ? items 
                    : (Array.isArray(initializedItems) && initializedItems.length > 0 
                        ? initializedItems 
                        : transformedItems);
                
                setMenuItems(finalItems);
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

    // Real-time time updates every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

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

    const filteredItems = menuItems
        .filter(item => {
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
        })
        .sort((a, b) => {
            // Sort by price (low to high) when a category is selected
            if (activeCategory !== "All" || selectedCategories.length > 0) {
                const priceA = getPriceValue(a.price);
                const priceB = getPriceValue(b.price);
                return priceA - priceB;
            }
            // Keep original order when "All" is selected
            return 0;
        });


    const handleAddToOrder = (item: MenuItem) => {
        // Prevent adding unavailable items
        if (!isItemAvailableNow(item.timeRestriction)) {
            return;
        }

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

    // Group items by category
    const itemsByCategory = useMemo(() => {
        const grouped: Record<string, MenuItem[]> = {};
        filteredItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        return grouped;
    }, [filteredItems]);

    // Scroll category carousel
    const scrollCategory = (category: string, direction: 'left' | 'right') => {
        const container = document.getElementById(`category-${category}`);
        if (!container) return;
        
        const scrollAmount = 400;
        const newPosition = direction === 'left' 
            ? container.scrollLeft - scrollAmount 
            : container.scrollLeft + scrollAmount;
        
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
        setCategoryScrollPositions(prev => ({ ...prev, [category]: newPosition }));
    };

    return (
        <div className="container section">
                <div className="text-center mb-8">
                    <h1 className="text-primary">Our Menu</h1>
                    <p>Explore the diverse flavors of Kerala cuisine.</p>
                </div>

            {/* Controls */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '3rem' }}>
                {/* Row 1: Category Buttons Only */}
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
                </div>

                {/* Row 2: Filter and Search Bar */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className={`btn ${selectedCategories.length > 0 ? 'btn-primary' : 'btn-outline'}`}
                        style={{ 
                            borderRadius: '50px', 
                            whiteSpace: 'nowrap', 
                            fontSize: '0.9rem', 
                            padding: '0.5rem 1rem',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Filter size={16} />
                        <span style={{ display: 'inline' }}>Filter</span>
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

                    {/* Search Bar */}
                    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
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
                                fontSize: '0.95rem',
                                minWidth: 0
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Category Sections with Carousels */}
            {filteredItems.length > 0 ? (
                activeCategory === "All" && selectedCategories.length === 0 && searchQuery === "" ? (
                    // Show all categories as carousels
                    Object.entries(itemsByCategory).map(([category, items]) => (
                        <section key={category} style={{ marginBottom: '4rem' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                    {category}
                                </h2>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => scrollCategory(category, 'left')}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--primary)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => scrollCategory(category, 'right')}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--primary)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                        }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                            <div
                                id={`category-${category}`}
                                style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    overflowX: 'auto',
                                    overflowY: 'hidden',
                                    paddingBottom: '1rem',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--primary) transparent',
                                    WebkitOverflowScrolling: 'touch',
                                    scrollBehavior: 'smooth'
                                }}
                            >
                                {items.map(item => {
                                    const imagePath = item?.image?.startsWith('data:image/') 
                                        ? item.image 
                                        : (getImagePathFromPublic(item?.name, item?.category) || '/images/hero.png');
                                    
                                    const isAvailable = isItemAvailableNow(item.timeRestriction);
                                    const timeRange = item.timeRestriction ? formatTimeRestriction(item.timeRestriction) : '';
                                    
                                    return (
                                        <motion.div
                                            key={item.id}
                                            whileHover={isAvailable ? { scale: 1.05, y: -8 } : {}}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                minWidth: '320px',
                                                maxWidth: '320px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.3s',
                                                opacity: isAvailable ? 1 : 0.5,
                                                position: 'relative'
                                            }}
                                            onClick={() => isAvailable && handleAddToOrder(item)}
                                            title={!isAvailable && timeRange ? `Available ${timeRange} only (NZ time)` : undefined}
                                        >
                                            <div style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '240px',
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    src={imagePath}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'center'
                                                    }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        if (!target.src.startsWith('data:image/') && target.src !== new URL(getFallbackImage(item.name), window.location.origin).href) {
                                                            target.src = getFallbackImage(item.name);
                                                        }
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    fontSize: '1rem'
                                                }}>
                                                    {formatPrice(item.price)}
                                                </div>
                                                {!isAvailable && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '1rem',
                                                        left: '1rem',
                                                        background: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        padding: '0.5rem',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backdropFilter: 'blur(4px)'
                                                    }}
                                                    title={`Available ${timeRange} only (NZ time)`}
                                                    >
                                                        <Clock size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ 
                                                        fontSize: '1.25rem', 
                                                        margin: 0,
                                                        fontWeight: '600',
                                                        color: 'var(--text-main)'
                                                    }}>
                                                        {formatProductName(item.name)}
                                                    </h3>
                                                    {!isAvailable && (
                                                        <Clock 
                                                            size={16} 
                                                            style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
                                                            title={`Available ${timeRange} only (NZ time)`}
                                                        />
                                                    )}
                                                </div>
                                                <p style={{ 
                                                    fontSize: '0.9rem', 
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '1rem',
                                                    flex: 1,
                                                    lineHeight: '1.5',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {item.desc}
                                                </p>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ 
                                                        width: '100%',
                                                        opacity: isAvailable ? 1 : 0.5,
                                                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                        pointerEvents: isAvailable ? 'auto' : 'none'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isAvailable) {
                                                            handleAddToOrder(item);
                                                        }
                                                    }}
                                                    disabled={!isAvailable}
                                                    title={!isAvailable && timeRange ? `Available ${timeRange} only (NZ time)` : undefined}
                                                >
                                                    {isAvailable ? 'Add to Order' : `Available ${timeRange} only`}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    ))
                ) : (
                    // Show filtered items in grid
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filteredItems.map(item => {
                            const imagePath = item?.image?.startsWith('data:image/') 
                                ? item.image 
                                : (getImagePathFromPublic(item?.name, item?.category) || '/images/hero.png');
                            
                            const isAvailable = isItemAvailableNow(item.timeRestriction);
                            const timeRange = item.timeRestriction ? formatTimeRestriction(item.timeRestriction) : '';
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    whileHover={isAvailable ? { scale: 1.03, y: -5 } : {}}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                                        opacity: isAvailable ? 1 : 0.5,
                                        position: 'relative'
                                    }}
                                    onClick={() => isAvailable && handleAddToOrder(item)}
                                    title={!isAvailable && timeRange ? `Available ${timeRange} only (NZ time)` : undefined}
                                >
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '240px',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            src={imagePath}
                                            alt={item.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center'
                                            }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (!target.src.startsWith('data:image/') && target.src !== new URL(getFallbackImage(item.name), window.location.origin).href) {
                                                    target.src = getFallbackImage(item.name);
                                                }
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            fontSize: '1rem'
                                        }}>
                                            {formatPrice(item.price)}
                                        </div>
                                        {!isAvailable && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                left: '1rem',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                color: 'white',
                                                padding: '0.5rem',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                            title={`Available ${timeRange} only (NZ time)`}
                                            >
                                                <Clock size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                margin: 0,
                                                fontWeight: '600',
                                                color: 'var(--text-main)'
                                            }}>
                                                {formatProductName(item.name)}
                                            </h3>
                                            {!isAvailable && (
                                                <Clock 
                                                    size={16} 
                                                    style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
                                                    title={`Available ${timeRange} only (NZ time)`}
                                                />
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '1rem',
                                            flex: 1,
                                            lineHeight: '1.5'
                                        }}>
                                            {item.desc}
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            style={{ 
                                                width: '100%',
                                                opacity: isAvailable ? 1 : 0.5,
                                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                pointerEvents: isAvailable ? 'auto' : 'none'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isAvailable) {
                                                    handleAddToOrder(item);
                                                }
                                            }}
                                            disabled={!isAvailable}
                                            title={!isAvailable && timeRange ? `Available ${timeRange} only (NZ time)` : undefined}
                                        >
                                            {isAvailable ? 'Add to Order' : `Available ${timeRange} only`}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
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
                            className="filter-modal"
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
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                margin: 0
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
