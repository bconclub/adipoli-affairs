"use client";

import { useCart } from '@/contexts/CartContext';
import { UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FloatingCartButton.module.css';

export default function FloatingCartButton() {
    const { openCart, getItemCount, isOpen, toast } = useCart();
    const itemCount = getItemCount();

    // Only show button when there are items and cart is not open
    // Hide button when toast notification is visible to prevent overlap
    const shouldShow = itemCount > 0 && !isOpen && !toast?.visible;

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.button 
                    className={styles.floatingCartButton}
                    onClick={openCart}
                    aria-label="Open order"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                    <UtensilsCrossed size={24} />
                    {itemCount > 0 && (
                        <span className={styles.badge}>{itemCount}</span>
                    )}
                    <span className={styles.label}>Order</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}


