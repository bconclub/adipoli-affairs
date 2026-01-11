"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, Settings, X, RotateCcw, Clock
} from "lucide-react";
import { loadMenuItems, type MenuItem } from "@/lib/menuData";
import styles from "./Featured.module.css";

interface FeaturedItem {
    id: number;
    name: string;
    price: string;
    image: string;
    description: string;
}

export default function FeaturedPage() {
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(5000); // ms
    const [showAdmin, setShowAdmin] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fullScreen, setFullScreen] = useState(true);

    // Helper function to get fallback image
    const getFallbackImage = (name: string): string => {
        if (!name) return '/images/hero.png';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('chicken')) return "/images/chicken.png";
        if (lowerName.includes('beef')) return "/images/beef.png";
        if (lowerName.includes('biryani')) return "/images/biryani.png";
        return "/images/hero.png";
    };

    // Load featured menu items
    useEffect(() => {
        const loadFeaturedItems = async () => {
            try {
                const menuItems = await loadMenuItems();
                console.log('Loaded menu items:', menuItems.length);
                const featuredItems = menuItems
                    .filter(item => item.featured === true)
                    .map(item => {
                        const priceStr = typeof item.price === 'number' 
                            ? `$${item.price.toFixed(2)}`
                            : item.price.half && item.price.full
                            ? `$${item.price.half.toFixed(2)} / $${item.price.full.toFixed(2)}`
                            : `$${(item.price.half || item.price.full || 0).toFixed(2)}`;
                        
                        // Use featuredImage if available, otherwise use regular image
                        let imagePath = item.featuredImage || item.image;
                        
                        // If no featured image and regular image is empty or invalid, try to construct from category/name
                        if (!imagePath || imagePath === '/images/hero.png' || (!imagePath.startsWith('/') && !imagePath.startsWith('http'))) {
                            // Try to construct path from category and name (like menu page does)
                            const sanitizeName = (str: string) => {
                                if (!str) return '';
                                return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                            };
                            
                            const sanitizedCategory = sanitizeName(item.category);
                            const sanitizedProductName = sanitizeName(item.name);
                            
                            if (sanitizedCategory && sanitizedProductName) {
                                imagePath = `/images/${sanitizedCategory}/${sanitizedProductName}.png`;
                            } else {
                                imagePath = getFallbackImage(item.name);
                            }
                        }
                        
                        // Ensure it starts with / or http
                        if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                            imagePath = getFallbackImage(item.name);
                        }
                        
                        return {
                            id: item.id,
                            name: item.name,
                            price: priceStr,
                            image: imagePath,
                            description: item.desc || ''
                        };
                    });
                
                console.log('Featured items:', featuredItems.length, featuredItems);
                
                if (featuredItems.length > 0) {
                    setItems(featuredItems);
                    setCurrentIndex(0); // Reset to first item
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error('Error loading featured items:', error);
            }
        };
        
        loadFeaturedItems();
        
        // Reload when page becomes visible (in case items were updated)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadFeaturedItems();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Auto-play Logic
    useEffect(() => {
        if (items.length === 0) return;
        
        let interval: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isPlaying && items.length > 0) {
            const step = 50; // Update every 50ms
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
            }, duration);

            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) return 0;
                    return prev + (step / duration) * 100;
                });
            }, step);
        } else {
            setProgress(0);
        }

        return () => {
            if (interval) clearInterval(interval);
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [isPlaying, duration, items.length]); // Use items.length instead of currentIndex

    // Reset progress when index changes manually
    useEffect(() => {
        setProgress(0);
    }, [currentIndex]);

    const handleNext = useCallback(() => {
        if (items.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % items.length);
            setProgress(0); // Reset progress when manually changing
        }
    }, [items.length]);

    const handlePrev = () => {
        if (items.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => console.log(e));
            setFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setFullScreen(false);
            }
        }
    };

    // Check if mobile device
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (items.length === 0) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Featured Items</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Please mark some menu items as featured in the admin panel.
                    </p>
                    <Link href="/admin" className="btn btn-primary">
                        Go to Admin Panel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Progress Bar */}
            {isPlaying && items.length > 0 && <div className={styles.progressBar} style={{ width: `${progress}%`, transition: 'width 0.05s linear' }} />}

            {/* Top Controls */}
            <div className={styles.topControls}>
                <button
                    className={styles.smallBtn}
                    onClick={() => setShowAdmin(!showAdmin)}
                    title="Admin Settings"
                >
                    <Settings size={20} />
                </button>
                {!isMobile && (
                    <button
                        className={styles.smallBtn}
                        onClick={toggleFullScreen}
                        title="Toggle Fullscreen"
                    >
                        {fullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                )}
                <Link href="/" className={styles.smallBtn} title="Close">
                    <X size={20} />
                </Link>
            </div>

            {/* Admin Panel */}
            <AnimatePresence>
                {showAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.adminPanel}
                    >
                        <h3>Presentation Settings</h3>
                        <div className={styles.adminRow} style={{ marginTop: '1rem' }}>
                            <label className={styles.adminLabel}>Slide Duration ({duration / 1000}s)</label>
                            <input
                                type="range"
                                min="2000"
                                max="15000"
                                step="1000"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className={styles.adminRow}>
                            <label className={styles.adminLabel}>Current Slide Order</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {items.map((item, idx) => (
                                    <div key={item.id} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        {idx + 1}. {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            * Admin overlay allows remote configuration of the display board.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Slideshow */}
            {items.length > 0 && (
                <AnimatePresence mode="wait">
                    {isMobile ? (
                        // Mobile Layout: Image on top, details card on bottom
                        <motion.div
                            key={`mobile-${currentIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'auto'
                            }}
                        >
                            {/* Image Header */}
                            <div style={{ 
                                position: 'relative',
                                width: '100%',
                                height: '40vh',
                                minHeight: '300px',
                                flexShrink: 0
                            }}>
                                {items[currentIndex]?.image && (
                                    <img
                                        src={items[currentIndex].image}
                                        alt={items[currentIndex].name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center'
                                        }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            const fallback = getFallbackImage(items[currentIndex]?.name);
                                            const fallbackUrl = new URL(fallback, window.location.origin).href;
                                            if (target.src !== fallbackUrl) {
                                                target.src = fallback;
                                            }
                                        }}
                                    />
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '60%',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                }} />
                            </div>

                            {/* Details Card */}
                            <div style={{
                                flex: 1,
                                background: 'var(--surface)',
                                borderRadius: '24px 24px 0 0',
                                padding: '2rem',
                                marginTop: '-24px',
                                position: 'relative',
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem'
                            }}>
                                <div>
                                    <div style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        background: 'rgba(242, 127, 36, 0.2)',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '50px',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                            {items[currentIndex]?.price || ''}
                                        </span>
                                    </div>
                                    <h1 style={{ 
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        marginBottom: '1rem',
                                        lineHeight: 1.2,
                                        color: 'var(--text-main)'
                                    }}>
                                        {items[currentIndex]?.name || ''}
                                    </h1>
                                    <p style={{ 
                                        fontSize: '1.1rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.6,
                                        marginBottom: '2rem'
                                    }}>
                                        {items[currentIndex]?.description || ''}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                    <a 
                                        href="https://order.sipocloudpos.com/adipoli-affairs" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-primary" 
                                        style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        Order Now
                                    </a>
                                </div>

                                {/* Mobile Controls */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    marginTop: '1rem'
                                }}>
                                    <button 
                                        className={styles.controlBtn} 
                                        onClick={handlePrev}
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        className={styles.controlBtn} 
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                    </button>
                                    <button 
                                        className={styles.controlBtn} 
                                        onClick={handleNext}
                                        style={{ width: '50px', height: '50px' }}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // Desktop/TV Layout: Fullscreen
                        <motion.div
                            key={`desktop-${currentIndex}`}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className={styles.slide}
                        >
                            <div className={styles.imageOverlay} />
                            {items[currentIndex]?.image && (
                                <img
                                    src={items[currentIndex].image}
                                    alt={items[currentIndex].name}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        const fallback = getFallbackImage(items[currentIndex]?.name);
                                        const fallbackUrl = new URL(fallback, window.location.origin).href;
                                        if (target.src !== fallbackUrl) {
                                            console.log(`Image failed to load: ${target.src}, using fallback: ${fallback}`);
                                            target.src = fallback;
                                        }
                                    }}
                                    onLoad={() => {
                                        console.log(`Image loaded successfully: ${items[currentIndex]?.image}`);
                                    }}
                                />
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className={styles.content}
                            >
                                <div className={styles.info}>
                                    <div className={styles.priceTag}>
                                        <span className={styles.price}>{items[currentIndex]?.price || ''}</span>
                                    </div>
                                    <h1 className={styles.title}>{items[currentIndex]?.name || ''}</h1>
                                    <p className={styles.description}>{items[currentIndex]?.description || ''}</p>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <a 
                                            href="https://order.sipocloudpos.com/adipoli-affairs" 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn btn-primary"
                                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            Order Now
                                        </a>
                                    </div>
                                </div>

                                <div className={styles.controls}>
                                    <button className={styles.controlBtn} onClick={handlePrev}>
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button className={styles.controlBtn} onClick={() => setIsPlaying(!isPlaying)}>
                                        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                                    </button>
                                    <button className={styles.controlBtn} onClick={handleNext}>
                                        <ChevronRight size={32} />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
