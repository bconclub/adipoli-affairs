"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
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

// Helper function to get image based on item name
const getImageForItem = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken')) return "/images/chicken.png";
    if (lowerName.includes('beef')) return "/images/beef.png";
    if (lowerName.includes('biryani')) return "/images/biryani.png";
    return "/images/hero.png";
};

// Helper function to generate description
const getDescription = (name: string): string => {
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
                    image: getImageForItem(item.name),
                    desc: getDescription(item.name),
                });
                items.push({
                    id: id++,
                    name: "Vizhinjam Chicken Fry (Bone-in) full",
                    price: 29.99,
                    category: displayCategory,
                    image: getImageForItem(item.name),
                    desc: getDescription(item.name),
                });
                return;
            }
            
            items.push({
                id: id++,
                name: item.name,
                price: item.price,
                category: displayCategory,
                image: getImageForItem(item.name),
                desc: getDescription(item.name),
            });
        });
    });
    
    return items;
};

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const { addItem } = useCart();

    // Load menu items from localStorage
    useEffect(() => {
        const transformedItems = transformMenuData();
        const initializedItems = initializeMenuItems(transformedItems);
        setMenuItems(initializedItems);
    }, []);

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
        addItem({
            id: item.id,
            name: item.name,
            price: price,
            image: item.image,
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
                            onClick={() => setActiveCategory(cat)}
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
                {filteredItems.map(item => (
                    <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            aspectRatio: '16/9',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }}>
                            <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ 
                                    objectFit: 'cover',
                                    objectPosition: 'center center'
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
                ))}
            </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <p>No items found matching your search.</p>
                </div>
            )}
        </div>
    );
}
