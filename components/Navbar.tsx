"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Cart from "./Cart";
import styles from "./Navbar.module.css";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Specials", href: "/featured" },
    { name: "Catering", href: "/catering" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { openCart, getItemCount } = useCart();
    const itemCount = getItemCount();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const glassStyle = {
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(16px) saturate(180%)',
    } as React.CSSProperties;

    return (
        <header 
            className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
            style={glassStyle}
        >
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/Adipoli Logo V1.png"
                        alt="Adipoli Affairs"
                        width={180}
                        height={60}
                        style={{ objectFit: "contain" }}
                        priority
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className={styles.desktopNav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.active : ""
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <button 
                        className={styles.cartButton}
                        onClick={openCart}
                        aria-label="Open order"
                    >
                        <UtensilsCrossed size={20} />
                        {itemCount > 0 && (
                            <span className={styles.cartBadge}>{itemCount}</span>
                        )}
                    </button>
                </nav>

                {/* Mobile Menu Toggle */}
                <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>

                {/* Mobile Nav */}
                <div className={`${styles.mobileNav} ${isOpen ? styles.open : ""}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={styles.mobileLink}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <button 
                        className={styles.cartButton}
                        onClick={openCart}
                        style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
                        aria-label="Open order"
                    >
                        <UtensilsCrossed size={20} />
                        <span style={{ marginLeft: "0.5rem" }}>View Order</span>
                        {itemCount > 0 && (
                            <span className={styles.cartBadge}>{itemCount}</span>
                        )}
                    </button>
                </div>
            </div>
            <Cart />
        </header>
    );
}
