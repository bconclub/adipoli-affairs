"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, Settings, X, RotateCcw, Clock
} from "lucide-react";
import { loadFeaturedItems, type FeaturedItem } from "@/lib/menuData";
import styles from "./Featured.module.css";

export default function FeaturedPage() {
    const [items, setItems] = useState<FeaturedItem[]>([]);
    
    useEffect(() => {
        const loadItems = async () => {
            try {
                const items = await loadFeaturedItems();
                setItems(items);
            } catch (error) {
                console.error('Error loading featured items:', error);
            }
        };
        loadItems();
    }, []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [duration, setDuration] = useState(5000); // ms
    const [showAdmin, setShowAdmin] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fullScreen, setFullScreen] = useState(true);

    const handleNext = useCallback(() => {
        if (items.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const handlePrev = () => {
        if (items.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    // Auto-play Logic - cycle through all products
    useEffect(() => {
        if (!isPlaying || items.length === 0) return;

        const interval = setInterval(() => {
            handleNext();
        }, duration);

        return () => {
            clearInterval(interval);
        };
    }, [isPlaying, duration, handleNext, items.length]);

    // Progress bar update - resets when slide changes
    useEffect(() => {
        setProgress(0); // Reset progress when slide changes
        
        if (!isPlaying || items.length === 0) {
            return;
        }

        const step = 50; // Update every 50ms
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + (step / duration) * 100;
            });
        }, step);

        return () => {
            clearInterval(progressInterval);
        };
    }, [isPlaying, duration, currentIndex, items.length]);

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

    if (items.length === 0) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <h2>No featured items</h2>
                    <p style={{ marginTop: '1rem' }}>Please add featured items from the admin panel.</p>
                    <Link href="/admin" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Admin Panel</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Progress Bar */}
            {isPlaying && <div className={styles.progressBar} style={{ width: `${progress}%`, transition: 'width 0.05s linear' }} />}

            {/* Top Controls */}
            <div className={styles.topControls}>
                <button
                    className={styles.smallBtn}
                    onClick={() => setShowAdmin(!showAdmin)}
                    title="Admin Settings"
                >
                    <Settings size={20} />
                </button>
                <button
                    className={styles.smallBtn}
                    onClick={toggleFullScreen}
                    title="Toggle Fullscreen"
                >
                    {fullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
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
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={styles.slide}
                >
                    <div className={styles.imageOverlay} />
                    <Image
                        src={items[currentIndex].image}
                        alt={items[currentIndex].name}
                        fill
                        className={styles.image}
                        priority
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className={styles.content}
                    >
                        <div className={styles.info}>
                            <div className={styles.priceTag}>
                                <span className={styles.price}>{items[currentIndex].price}</span>
                                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>| {items[currentIndex].calories}</span>
                            </div>
                            <h1 className={styles.title}>{items[currentIndex].name}</h1>
                            <p className={styles.description}>{items[currentIndex].description}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-primary">Order Now</button>
                                <button className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>View Details</button>
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
            </AnimatePresence>
        </div>
    );
}
