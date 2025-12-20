"use client";

import { useCart } from '@/contexts/CartContext';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatProductName } from '@/lib/utils';
import styles from './Toast.module.css';

export default function Toast() {
    const { toast } = useCart();

    return (
        <AnimatePresence>
            {toast?.visible && (
                <motion.div
                    className={styles.toast}
                    initial={{ opacity: 0, y: 100, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 100, x: '-50%' }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                    <CheckCircle2 size={20} className={styles.toastIcon} />
                    <div className={styles.toastContent}>
                        <p className={styles.toastMessage}>{toast.message}</p>
                        <p className={styles.toastItemName}>{formatProductName(toast.itemName)}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

