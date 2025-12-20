"use client";

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatProductName } from '@/lib/utils';
import styles from './Cart.module.css';

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
                                items.map(item => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
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
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className={styles.footer} onClick={handleCartInteraction}>
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
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

