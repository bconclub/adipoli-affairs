import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.grid}`}>
                <div className={styles.brandSection}>
                    <Link href="/" className={styles.logo}>
                        <Image
                            src="/Adipoli Logo V1.png"
                            alt="Adipoli Affairs"
                            width={180}
                            height={60}
                            style={{ objectFit: "contain" }}
                        />
                    </Link>
                    <p className={styles.description}>
                        Experience the rich flavors of Kerala directly in Christchurch.
                        Authentic spices, traditional recipes, and a passion for food.
                    </p>
                    <div className={styles.socials}>
                        <Link href="#" className={styles.socialLink}><Facebook size={20} /></Link>
                        <Link href="#" className={styles.socialLink}><Instagram size={20} /></Link>
                        <Link href="#" className={styles.socialLink}><Twitter size={20} /></Link>
                    </div>
                </div>

                <div className={styles.linksSection}>
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/menu">Menu</Link></li>
                        <li><Link href="/featured">Specials</Link></li>
                        <li><Link href="/catering">Catering</Link></li>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className={styles.contactSection}>
                    <h4>Contact Us</h4>
                    <address>
                        <p>378a Ferry Road</p>
                        <p>Woolston, Christchurch</p>
                        <p>New Zealand</p>
                        <p className={styles.contactItem}>Draft Phone: +64 3 123 4567</p>
                        <p className={styles.contactItem}>Email: hello@adipoliaffairs.nz</p>
                    </address>
                    <div className={styles.hours}>
                        <p><strong>Opening Hours:</strong></p>
                        <p>Monday: 12:00 PM - 10:00 PM</p>
                        <p>Tuesday: Closed</p>
                        <p>Wednesday - Sunday: 12:00 PM - 10:00 PM</p>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className="container">
                    <div className={styles.bottomBarContent}>
                        <p>&copy; {new Date().getFullYear()} Adipoli Affairs. All rights reserved.</p>
                        <p className={styles.bconCredit}>
                            Built with ❤️ at <a href="https://bcon.club" target="_blank" rel="noopener noreferrer">BCON Club</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
