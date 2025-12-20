"use client";

import { createContext, useContext, useState, ReactNode, useRef, useCallback, useEffect } from 'react';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface ToastNotification {
    message: string;
    itemName: string;
    visible: boolean;
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    toast: ToastNotification | null;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: Omit<CartItem, 'quantity'>, openCartAfterAdd?: boolean) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    cancelAutoClose: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [toast, setToast] = useState<ToastNotification | null>(null);
    const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const openCart = () => setIsOpen(true);
    
    const closeCart = useCallback(() => {
        setIsOpen(false);
        // Clear any pending auto-close timeout
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
            autoCloseTimeoutRef.current = null;
        }
        // Clear toast when cart closes
        setToast(null);
    }, []);

    const cancelAutoClose = useCallback(() => {
        // Cancel the auto-close timeout if user interacts with cart
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
            autoCloseTimeoutRef.current = null;
        }
    }, []);

    const addItem = (item: Omit<CartItem, 'quantity'>, openCartAfterAdd = true) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        
        // Always show toast notification
        setToast({
            message: 'Item added to order!',
            itemName: item.name,
            visible: true,
        });
        
        // Hide toast after 2 seconds
        setTimeout(() => {
            setToast(prev => prev ? { ...prev, visible: false } : null);
        }, 2000);
        
        // On mobile, don't auto-open cart - user can click the order button
        if (isMobile) {
            return;
        }
        
        // On desktop, open cart if requested
        if (openCartAfterAdd) {
            setIsOpen(true);
            
            // Clear any existing timeout
            if (autoCloseTimeoutRef.current) {
                clearTimeout(autoCloseTimeoutRef.current);
            }
            
            // Set auto-close timeout for 2 seconds
            autoCloseTimeoutRef.current = setTimeout(() => {
                closeCart();
                autoCloseTimeoutRef.current = null;
            }, 2000);
        }
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems(prev =>
            prev.map(i => (i.id === id ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotal = () => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                toast,
                openCart,
                closeCart,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getTotal,
                getItemCount,
                cancelAutoClose,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

