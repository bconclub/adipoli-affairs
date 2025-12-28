"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

// Static image paths from public/images/tv folder
const TV_SLIDES = [
  "/images/tv/001.jpg",
  "/images/tv/002.jpg",
  "/images/tv/003.jpg",
  "/images/tv/004.jpg",
  "/images/tv/005.jpg",
  "/images/tv/006.jpg",
  "/images/tv/007.jpg",
  "/images/tv/008.jpg",
  "/images/tv/009.jpg",
  "/images/tv/010.jpg",
  "/images/tv/011.jpg",
];

const SLIDE_DURATION = 5000; // 5 seconds per slide
const FADE_DURATION = 1; // 1 second fade transition

export default function TVSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Hide header and ensure full screen
  useEffect(() => {
    // Hide any navbar/header elements
    const navbars = document.querySelectorAll("nav, header, [class*='Navbar'], [class*='navbar']");
    navbars.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    // Ensure body and html are full screen with no padding/margin
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Cleanup on unmount (restore styles if needed)
      navbars.forEach((el) => {
        (el as HTMLElement).style.display = "";
      });
    };
  }, []);

  useEffect(() => {
    if (TV_SLIDES.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TV_SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, []);

  if (TV_SLIDES.length === 0) {
    return (
      <div className={styles.container}>
        <p>No slides configured.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION }}
          className={styles.slideWrapper}
        >
          {/* Blurred background */}
          <div className={styles.backgroundWrapper}>
            <Image
              src={TV_SLIDES[currentIndex]}
              alt={`Background ${currentIndex + 1}`}
              fill
              priority
              className={styles.backgroundImage}
              style={{ objectFit: "cover" }}
              onError={(e) => {
                console.error(`Image not found: ${TV_SLIDES[currentIndex]}`);
              }}
            />
          </div>
          
          {/* 16:9 container for main image */}
          <div className={styles.imageContainer}>
            <Image
              src={TV_SLIDES[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              fill
              priority
              className={styles.image}
              style={{ objectFit: "contain" }}
              onError={(e) => {
                console.error(`Image not found: ${TV_SLIDES[currentIndex]}`);
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

