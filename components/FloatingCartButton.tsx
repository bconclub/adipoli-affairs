"use client";

import { useCart } from '@/contexts/CartContext';
import { UtensilsCrossed } from 'lucide-react';
import styles from './FloatingCartButton.module.css';

export default function FloatingCartButton() {
    const { openCart, getItemCount } = useCart();
    const itemCount = getItemCount();

    return (
        <button 
            className={styles.floatingCartButton}
            onClick={openCart}
            aria-label="Open order"
        >
            <UtensilsCrossed size={24} />
            {itemCount > 0 && (
                <span className={styles.badge}>{itemCount}</span>
            )}
            <span className={styles.label}>Order</span>
        </button>
    );
}


