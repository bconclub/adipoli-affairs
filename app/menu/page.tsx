"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, X, ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { menuData } from '@/data/menu';
import { formatProductName, type TimeRestriction, isItemAvailableNow, formatTimeRestriction } from '@/lib/utils';
import { loadMenuItems, initializeMenuItems, getItemImage, getDishTypes, MENU_GROUPS, CATEGORY_HEADINGS, DISH_TYPES, type DishType, type MenuItem as MenuItemType } from '@/lib/menuData';
import DishTypeBadge, { DishTypeMark } from '@/components/DishTypeBadge';

const DISH_TYPE_STORAGE_KEY = 'menuDishType';

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

const CATEGORIES = ["All", ...MENU_GROUPS.flatMap(group => group.categories)];


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
    if (!name || !category) return PLACEHOLDER_IMAGE;
    const sanitizedCategory = sanitizeName(category);
    const sanitizedProductName = sanitizeName(name);

    if (!sanitizedCategory || !sanitizedProductName) return PLACEHOLDER_IMAGE;

    return `/images/${sanitizedCategory}/${sanitizedProductName}.png`;
};

// Placeholder SVG data URL for missing images
const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="#1a1a1a" width="400" height="240"/><g transform="translate(200,100)" fill="none" stroke="#555" stroke-width="2"><rect x="-30" y="-25" width="60" height="50" rx="4"/><circle cx="-15" cy="-10" r="5"/><polyline points="-25,20 -5,-5 10,10 25,-5 30,10"/></g><text x="200" y="160" text-anchor="middle" fill="#666" font-family="sans-serif" font-size="14">Image coming soon</text></svg>`)}`;

// Helper function to get image - checks public folder first, then placeholder
const getImageForItem = (name: string | undefined | null, category: string | undefined | null): string => {
    if (!name || !category) return PLACEHOLDER_IMAGE;
    return getImagePathFromPublic(name, category);
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
    const [searchQuery, setSearchQuery] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categoryScrollPositions, setCategoryScrollPositions] = useState<Record<string, number>>({});
    const [currentTime, setCurrentTime] = useState<Date>(new Date()); // For real-time updates
    const [dishType, setDishType] = useState<'all' | DishType>('all');

    // Remember the chosen dish type on this device
    useEffect(() => {
        try {
            const saved = localStorage.getItem(DISH_TYPE_STORAGE_KEY);
            if (saved && DISH_TYPES.some(type => type.id === saved)) setDishType(saved as DishType);
        } catch {
            // Storage blocked (e.g. private mode): start from All
        }
    }, []);

    const handleDishTypeChange = (type: 'all' | DishType) => {
        setDishType(type);
        try {
            localStorage.setItem(DISH_TYPE_STORAGE_KEY, type);
        } catch {
            // Storage blocked: the choice still applies for this visit
        }
    };

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

    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const filteredItems = menuItems
        .filter(item => {
            const matchesCategory = activeCategory === "All" || item.category === activeCategory;
            // Every word typed must appear in the name, description or category
            const haystack = `${item.name} ${item.desc ?? ''} ${item.category}`.toLowerCase();
            const matchesSearch = searchWords.every(word => haystack.includes(word));
            const matchesType = dishType === 'all' || getDishTypes(item).includes(dishType);
            return matchesCategory && matchesSearch && matchesType;
        })
        .sort((a, b) => {
            // Sort by price (low to high) when a category is selected
            if (activeCategory !== "All") {
                const priceA = getPriceValue(a.price);
                const priceB = getPriceValue(b.price);
                return priceA - priceB;
            }
            // Keep original order when "All" is selected
            return 0;
        });


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

            {/* Controls: search first, then categories, then dish type */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div role="search" style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Search
                        aria-hidden="true"
                        size={22}
                        style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', pointerEvents: 'none' }}
                    />
                    <input
                        type="search"
                        inputMode="search"
                        enterKeyHint="search"
                        aria-label="Search the menu"
                        placeholder="Search dishes"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setSearchQuery(''); }}
                        className="menu-search"
                        style={{
                            width: '100%',
                            minHeight: '56px',
                            padding: '0 3.5rem 0 3.25rem',
                            borderRadius: '50px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1.5px solid rgba(242, 127, 36, 0.45)',
                            color: 'white',
                            fontSize: '17px',
                            outline: 'none',
                        }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                            style={{
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'rgba(255,255,255,0.12)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Categories */}
                <div
                    role="group"
                    aria-label="Menu sections"
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        paddingBottom: '0.5rem',
                        marginBottom: '0.5rem',
                        WebkitOverflowScrolling: 'touch'
                    }}
                    className="category-scroll menu-row"
                >
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            aria-pressed={activeCategory === cat}
                            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                            style={{
                                borderRadius: '50px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.9rem',
                                padding: '0.5rem 1.1rem',
                                minHeight: '42px',
                                flexShrink: 0
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Dish type: a lighter row */}
                <div
                    role="group"
                    aria-label="Show dishes by type"
                    style={{
                        display: 'flex',
                        gap: '0.25rem',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        WebkitOverflowScrolling: 'touch'
                    }}
                    className="category-scroll menu-row"
                >
                    {[{ id: 'all' as const, label: 'All types', color: '' }, ...DISH_TYPES].map(type => {
                        const isActive = dishType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleDishTypeChange(type.id)}
                                aria-pressed={isActive}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    minHeight: '36px',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '50px',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.82rem',
                                    fontWeight: isActive ? 700 : 500,
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(255,255,255,0.35)' : 'transparent'}`,
                                    transition: 'background 0.2s, color 0.2s'
                                }}
                            >
                                {type.color && <DishTypeMark color={type.color} size={11} />}
                                {type.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Category Sections with Carousels */}
            {filteredItems.length > 0 ? (
                activeCategory === "All" && searchWords.length === 0 ? (
                    // Show all categories as carousels
                    MENU_GROUPS.filter(group => group.categories.some(category => itemsByCategory[category])).map(group => (
                    <div key={group.title}>
                        <h2 className="text-primary" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                            {group.title}
                        </h2>
                    {group.categories.filter(category => itemsByCategory[category]).map(category => {
                        const items = itemsByCategory[category];
                        return (
                        <section key={category} style={{ marginBottom: '4rem' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                    {CATEGORY_HEADINGS[category] || category}
                                </h3>
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
                                    const imagePath = getItemImage(item, PLACEHOLDER_IMAGE);
                                    
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
                                                transition: 'all 0.3s',
                                                opacity: isAvailable ? 1 : 0.5,
                                                position: 'relative'
                                            }}
                                            title={!isAvailable && timeRange ? `Available ${timeRange} only (NZ time)` : undefined}
                                        >
                                            <div style={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '240px',
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    loading="lazy"
                                                    decoding="async"
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
                                                        if (target.src.endsWith('.png')) {
                                                            target.src = target.src.replace('.png', '.jpg');
                                                        } else if (!target.src.startsWith('data:image/')) {
                                                            target.src = PLACEHOLDER_IMAGE;
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
                                                <DishTypeBadge item={item} />
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
                                                        <span title={`Available ${timeRange} only (NZ time)`}>
                                                            <Clock 
                                                                size={16} 
                                                                style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
                                                            />
                                                        </span>
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
                                                {item.category === 'Main Course' && (
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--primary)',
                                                        marginBottom: '0.5rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem'
                                                    }}>
                                                        <Star size={12} fill="var(--primary)" /> Complimentary rice not included
                                                    </p>
                                                )}
                                                <a
                                                    href="https://order.sipocloudpos.com/adipoli-affairs"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary"
                                                    style={{
                                                        width: '100%',
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    Add to Order
                                                </a>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                        );
                    })}
                    </div>
                    ))
                ) : (
                    // Show filtered items in grid
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filteredItems.map(item => {
                            const imagePath = getItemImage(item, PLACEHOLDER_IMAGE);
                            
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
                                        opacity: isAvailable ? 1 : 0.5,
                                        position: 'relative'
                                    }}
                                    title={!isAvailable && timeRange ? `Available ${timeRange} only (NZ time)` : undefined}
                                >
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '240px',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            loading="lazy"
                                            decoding="async"
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
                                                if (target.src.endsWith('.png')) {
                                                    target.src = target.src.replace('.png', '.jpg');
                                                } else if (!target.src.startsWith('data:image/')) {
                                                    target.src = PLACEHOLDER_IMAGE;
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
                                        <DishTypeBadge item={item} />
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
                                                <span title={`Available ${timeRange} only (NZ time)`}>
                                                    <Clock 
                                                        size={16} 
                                                        style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
                                                    />
                                                </span>
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
                                        {item.category === 'Main Course' && (
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--primary)',
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}>
                                                <Star size={12} fill="var(--primary)" /> Complimentary rice not included
                                            </p>
                                        )}
                                        <a
                                            href="https://order.sipocloudpos.com/adipoli-affairs"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            Add to Order
                                        </a>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {searchQuery.trim()
                            ? `No dishes match "${searchQuery.trim()}".`
                            : `No ${DISH_TYPES.find(type => type.id === dishType)?.label.toLowerCase() ?? ''} dishes here.`}
                    </p>
                    <p style={{ marginBottom: '1.25rem' }}>Try another word, or see the whole menu.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="btn btn-primary">
                                Clear search
                            </button>
                        )}
                        {(dishType !== 'all' || activeCategory !== 'All') && (
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('All'); handleDishTypeChange('all'); }}
                                className="btn btn-outline"
                            >
                                Show all dishes
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
