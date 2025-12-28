"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatProductName } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Cart.module.css';

// Sanitize name for file path (same as menu page)
const sanitizeName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Get image path from public folder based on product name, or use base64 data URL if present
const getImagePathFromPublic = (name: string, currentImage: string): string => {
    // If image is a base64 data URL, use it directly
    if (currentImage && currentImage.startsWith('data:image/')) {
        return currentImage;
    }
    
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
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const total = getTotal();
    const tax = total * 0.15;
    const finalTotal = total + tax;

    // Cancel auto-close when user interacts with cart
    const handleCartInteraction = () => {
        cancelAutoClose();
    };

    // Format order details for WhatsApp
    const formatOrderForWhatsApp = (name: string, phone: string) => {
        const orderItems = items.map(item => {
            return `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
        }).join('\n');

        const message = `*New Order from Adipoli Affairs*

*Customer Details:*
Name: ${name}
Phone: ${phone}

*Order Details:*
${orderItems}

*Pricing:*
Subtotal: $${total.toFixed(2)}
Tax (15%): $${tax.toFixed(2)}
*Total: $${finalTotal.toFixed(2)}*

Thank you for your order!`;

        return encodeURIComponent(message);
    };

    // Handle checkout
    const handleCheckout = () => {
        if (items.length === 0) return;
        setShowCheckoutForm(true);
    };

    // Submit order to WhatsApp
    const submitOrderToWhatsApp = () => {
        if (!customerName.trim() || !customerPhone.trim()) {
            alert('Please fill in both name and phone number');
            return;
        }

        const whatsappNumber = '+64226340628';
        const message = formatOrderForWhatsApp(customerName.trim(), customerPhone.trim());
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear form and cart
        setCustomerName('');
        setCustomerPhone('');
        setShowCheckoutForm(false);
        clearCart();
        closeCart();
    };

    return (
        <>
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
                                                        // Don't try to fallback if it's a base64 data URL (shouldn't fail)
                                                        if (!target.src.startsWith('data:image/') && !target.src.endsWith('/images/hero.png')) {
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
                                        <button className="btn btn-primary" onClick={handleCheckout}>
                                            Order on WhatsApp
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.actionButtons}>
                                    <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                        Order on WhatsApp
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
            </AnimatePresence>

            {/* Checkout Form Modal - Rendered via Portal */}
            {mounted && createPortal(
                <AnimatePresence mode="wait">
                    {showCheckoutForm && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="backdrop"
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(0, 0, 0, 0.75)',
                                    zIndex: 10001,
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    msBackdropFilter: 'blur(12px)'
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setShowCheckoutForm(false)}
                            />

                            {/* Form Modal */}
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10002,
                                    pointerEvents: 'none'
                                }}
                            >
                                <motion.div
                                    key="modal"
                                    style={{
                                        background: 'var(--surface)',
                                        borderRadius: '16px',
                                        padding: '2rem',
                                        width: 'calc(100vw - 2rem)',
                                        maxWidth: '500px',
                                        maxHeight: '90vh',
                                        overflowY: 'auto',
                                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                        pointerEvents: 'auto'
                                    }}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Order Details</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Please provide your details to complete your order
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '500',
                                        fontSize: '0.9rem',
                                        textAlign: 'left'
                                    }}>
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter your full name"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            textAlign: 'left'
                                        }}
                                        autoFocus
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '500',
                                        fontSize: '0.9rem',
                                        textAlign: 'left'
                                    }}>
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="e.g., +64 21 123 4567"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            textAlign: 'left'
                                        }}
                                    />
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    gap: '1rem',
                                    justifyContent: 'space-between',
                                    width: '100%'
                                }}>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setShowCheckoutForm(false);
                                            setCustomerName('');
                                            setCustomerPhone('');
                                        }}
                                        style={{ 
                                            padding: '0.75rem 1.5rem',
                                            flex: 1
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={submitOrderToWhatsApp}
                                        disabled={!customerName.trim() || !customerPhone.trim()}
                                        style={{ 
                                            padding: '0.75rem 1.5rem',
                                            flex: 1,
                                            opacity: (!customerName.trim() || !customerPhone.trim()) ? 0.5 : 1,
                                            cursor: (!customerName.trim() || !customerPhone.trim()) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Send to WhatsApp
                                    </button>
                                </div>
                            </motion.div>
                            </div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

