"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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
                    <a
                        href="https://order.sipocloudpos.com/adipoli-affairs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem 1.5rem',
                            fontSize: '0.95rem'
                        }}
                    >
                        Order Now
                    </a>
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
                    <a
                        href="https://order.sipocloudpos.com/adipoli-affairs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                            width: "100%",
                            marginTop: "1rem",
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.75rem 1.5rem'
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        Order Now
                    </a>
                </div>
            </div>
        </header>
    );
}
