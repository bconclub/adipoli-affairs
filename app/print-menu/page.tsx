"use client";

import { useEffect, useRef, useState } from 'react';
import { menuData } from '@/data/menu';
import { CATEGORY_HEADINGS, loadMenuItems, type MenuItem } from '@/lib/menuData';
import { formatTimeRestriction } from '@/lib/utils';
import styles from './page.module.css';

const MAIN_COURSE = "Main Course";

const MAIN_SUBGROUPS: Record<string, string> = {
    "MAIN COURSE - VEG": "Veg",
    "MAIN COURSE - EGG": "Egg",
    "MAIN COURSE - CHICKEN": "Chicken",
    "MAIN COURSE - BEEF": "Beef",
    "MAIN COURSE - MUTTON (bone in)": "Mutton",
    "Seafood - FISH": "Seafood",
    "Seafood - PRAWNS": "Seafood",
    "Seafood - SQUID": "Seafood",
};

const OTHER_MAINS = "More Mains";

// Which sub-group each main belongs to, taken from the original menu
const mainSubgroupOf = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('vizhinjam')) return "Chicken";
    for (const category of menuData) {
        const subgroup = MAIN_SUBGROUPS[category.name];
        if (subgroup && category.items.some(item => item.name.toLowerCase() === lowerName)) {
            return subgroup;
        }
    }
    return OTHER_MAINS;
};

type Block = { title: string; note?: string; items: MenuItem[] };
type Page = { heading: string; blocks: Block[] };

const formatPrice = (price: MenuItem['price']): string => {
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    return [price.half, price.full].filter(Boolean).map(p => `$${p!.toFixed(2)}`).join(' / ');
};

const capitalize = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

const buildPages = (items: MenuItem[]): Page[] => {
    const categoryBlock = (category: string): Block | null => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;
        const restriction = categoryItems[0].timeRestriction;
        const heading = CATEGORY_HEADINGS[category];
        return {
            title: heading || category,
            note: !heading && restriction ? formatTimeRestriction(restriction) : undefined,
            items: categoryItems,
        };
    };
    const mainBlock = (subgroup: string): Block | null => {
        const mains = items.filter(item => item.category === MAIN_COURSE && mainSubgroupOf(item.name) === subgroup);
        return mains.length > 0 ? { title: `Mains: ${subgroup}`, items: mains } : null;
    };
    const present = (blocks: (Block | null)[]): Block[] => blocks.filter((block): block is Block => block !== null);

    return [
        { heading: "Lunch Menu", blocks: present(["Kerala Meals", "South Specials", "Combo Specials", "Biryani"].map(categoryBlock)) },
        { heading: "Dinner Menu", blocks: present([categoryBlock("Breads"), ...["Veg", "Egg", "Chicken"].map(mainBlock)]) },
        { heading: "Dinner Menu", blocks: present([...["Beef", "Mutton", "Seafood", OTHER_MAINS].map(mainBlock), categoryBlock("Sides")]) },
        { heading: "All Day Menu", blocks: present(["Kids Corner", "Desserts", "Hot Drinks", "Cool Drinks", "Juice", "Milkshake"].map(categoryBlock)) },
    ];
};

export default function PrintMenuPage() {
    const [items, setItems] = useState<MenuItem[] | null>(null);
    const [hasOverflow, setHasOverflow] = useState(false);
    const pagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMenuItems().then(setItems);
    }, []);

    // Warn if a page has too many dishes to fit on the paper
    useEffect(() => {
        if (!items || !pagesRef.current) return;
        const contents = pagesRef.current.querySelectorAll<HTMLElement>('[data-page-content]');
        setHasOverflow(Array.from(contents).some(el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1));
    }, [items]);

    if (!items) {
        return <p className={styles.loading}>Loading menu...</p>;
    }

    const pages = buildPages(items);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <div>
                    <strong>Menu book: 5 A4 pages</strong>
                    <p>Always shows the latest prices from the admin panel.</p>
                    {hasOverflow && <p className={styles.warning}>A page has too many dishes to fit. Please check before printing.</p>}
                </div>
                <button onClick={() => window.print()} className={styles.printButton}>Print or save as PDF</button>
            </div>

            <div ref={pagesRef}>
                <section className={`${styles.page} ${styles.cover}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Adipoli Logo V1.png" alt="Adipoli Affairs" className={styles.logo} />
                    <h1>Menu</h1>
                    <div className={styles.coverDetails}>
                        <p><strong>Open</strong> Mon, Wed to Sun: 12pm to 9pm</p>
                        <p>Closed Tuesdays</p>
                        <p className={styles.coverGap}>378a Ferry Road, Woolston, Christchurch</p>
                        <p>Mobile: 022 634 0628</p>
                        <p>Landline: +64 3 926 3805</p>
                        <p>indianfusionck@gmail.com</p>
                    </div>
                </section>

                {pages.map((page, index) => (
                    <section key={index} className={styles.page}>
                        <h2 className={styles.pageHeading}>{page.heading}</h2>
                        <div className={styles.columns} data-page-content>
                            {page.blocks.map(block => (
                                <div key={block.title} className={styles.block}>
                                    <h3>
                                        {block.title}
                                        {block.note && <span className={styles.note}> {block.note}</span>}
                                    </h3>
                                    <ul>
                                        {block.items.map(item => (
                                            <li key={item.id}>
                                                <span>{capitalize(item.name)}</span>
                                                <span className={styles.price}>{formatPrice(item.price)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {page.blocks.some(block => block.title.startsWith('Mains')) && (
                            <p className={styles.footnote}>Complimentary rice not included with mains.</p>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
