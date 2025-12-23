"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatProductName } from '@/lib/utils';
import styles from './Cart.module.css';

// Sanitize name for file path (same as menu page)
const sanitizeName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Get image path from public folder based on product name
const getImagePathFromPublic = (name: string, currentImage: string): string => {
    // If the image path already looks like it's from public folder with category structure, use it
    if (currentImage && currentImage.startsWith('/images/')) {
        const pathParts = currentImage.split('/');
        // Path format: /images/{category}/{product-name}.png or /images/{product-name}.png
        if (pathParts.length >= 3 && pathParts[2] !== '') {
            // Has category structure, use it
            return currentImage;
        }
    }
    
    // Fallback: try to construct path from name by inferring category
    const sanitizedProductName = sanitizeName(name);
    if (!sanitizedProductName) return currentImage || '/images/hero.png';
    
    const lowerName = name.toLowerCase();
    
    // Try to match categories based on product name patterns
    if (lowerName.includes('soup')) {
        return `/images/soups/${sanitizedProductName}.png`;
    }
    if (lowerName.includes('starter') || lowerName.includes('fry') || lowerName.includes('65') || 
        lowerName.includes('prawn') || lowerName.includes('squid') || lowerName.includes('dragon')) {
        return `/images/starters/${sanitizedProductName}.png`;
    }
    if (lowerName.includes('combo') || lowerName.includes('nidhi')) {
        return `/images/combo-specials/${sanitizedProductName}.png`;
    }
    if (lowerName.includes('biryani')) {
        return `/images/biryani.png`;
    }
    if (lowerName.includes('chicken') && !lowerName.includes('soup')) {
        return `/images/chicken.png`;
    }
    if (lowerName.includes('beef') && !lowerName.includes('soup')) {
        return `/images/beef.png`;
    }
    
    // Return original image if we can't determine, or fallback to hero
    return currentImage || '/images/hero.png';
};

export default function Cart() {
    const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal, clearCart, cancelAutoClose } = useCart();

    const total = getTotal();

    // Cancel auto-close when user interacts with cart
    const handleCartInteraction = () => {
        cancelAutoClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        onClick={closeCart}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />

                    {/* Cart Panel */}
                    <motion.div
                        className={styles.cartPanel}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        onMouseEnter={handleCartInteraction}
                        onMouseMove={handleCartInteraction}
                        onClick={handleCartInteraction}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <h2>Your Order</h2>
                            <button className={styles.closeBtn} onClick={closeCart}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div 
                            className={styles.itemsList} 
                            onClick={handleCartInteraction}
                            onScroll={handleCartInteraction}
                            onWheel={handleCartInteraction}
                        >
                            {items.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>Your cart is empty</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        Add items from the menu to get started
                                    </p>
                                </div>
                            ) : (
                                items.map(item => {
                                    // Use the same image path logic as menu page
                                    const imagePath = getImagePathFromPublic(item.name, item.image);
                                    return (
                                        <div key={item.id} className={styles.cartItem}>
                                            <div className={styles.itemImage}>
                                                <img
                                                    src={imagePath}
                                                    alt={item.name}
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
                                            </div>
                                            <div className={styles.itemDetails}>
                                                <h3>{formatProductName(item.name)}</h3>
                                                <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                                                <div className={styles.quantityControls}>
                                                    <button
                                                        className={styles.quantityBtn}
                                                        onClick={() => {
                                                            updateQuantity(item.id, item.quantity - 1);
                                                            handleCartInteraction();
                                                        }}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className={styles.quantity}>{item.quantity}</span>
                                                    <button
                                                        className={styles.quantityBtn}
                                                        onClick={() => {
                                                            updateQuantity(item.id, item.quantity + 1);
                                                            handleCartInteraction();
                                                        }}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <p className={styles.itemTotal}>
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => {
                                                        removeItem(item.id);
                                                        handleCartInteraction();
                                                    }}
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer - Always visible */}
                        <div className={styles.footer} onClick={handleCartInteraction}>
                            {items.length > 0 ? (
                                <>
                                    <div className={styles.totalSection}>
                                        <div className={styles.totalRow}>
                                            <span>Subtotal</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                        <div className={styles.totalRow}>
                                            <span>Tax</span>
                                            <span>${(total * 0.15).toFixed(2)}</span>
                                        </div>
                                        <div className={styles.totalRow} style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <span>Total</span>
                                            <span className="text-primary">${(total * 1.15).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className={styles.actionButtons}>
                                        <button className="btn btn-outline" onClick={() => {
                                            clearCart();
                                            handleCartInteraction();
                                        }}>
                                            Clear Order
                                        </button>
                                        <button className="btn btn-primary" onClick={handleCartInteraction}>
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.actionButtons}>
                                    <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

