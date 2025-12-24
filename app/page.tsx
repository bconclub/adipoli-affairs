"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Clock, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const { addItem } = useCart();
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    let player: any;

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      if (videoRef.current) {
        // @ts-ignore
        player = new window.YT.Player(videoRef.current, {
          videoId: 'WW0SLuX8HsI',
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: 8,
            end: 15
          },
          events: {
            onReady: (event: any) => {
              event.target.seekTo(8, true);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              // Check current time and loop between 8-15 seconds
              const checkTime = () => {
                if (player && player.getCurrentTime) {
                  const currentTime = player.getCurrentTime();
                  if (currentTime >= 15) {
                    player.seekTo(8, true);
                    player.playVideo();
                  }
                }
              };
              
              // Check time every 100ms when playing
              if (event.data === 1) { // 1 = playing
                const interval = setInterval(() => {
                  if (player && player.getCurrentTime) {
                    const currentTime = player.getCurrentTime();
                    if (currentTime >= 15) {
                      player.seekTo(8, true);
                      player.playVideo();
                    }
                  }
                }, 100);
                
                // Store interval to clear later
                // @ts-ignore
                player._loopInterval = interval;
              } else if (event.data === 2) { // 2 = paused
                // @ts-ignore
                if (player._loopInterval) {
                  // @ts-ignore
                  clearInterval(player._loopInterval);
                }
              }
            }
          }
        });
      }
    };

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  const handleAddToOrder = (item: { name: string; price: string; img: string }) => {
    const price = parseFloat(item.price.replace('$', ''));
    addItem({
      id: Date.now(), // Simple ID generation for demo
      name: item.name,
      price: price,
      image: item.img,
    });
  };

  return (
    <div className={styles.homeWrapper} style={{ marginTop: '-80px' }}>
      {/* Hero Section - Full Screen */}
      <section className={styles.heroSection}>
        {/* YouTube Video Background */}
        <div className={styles.videoContainer}>
          <div
            ref={videoRef}
            className={styles.videoWrapper}
          />
          {/* Dark overlay for text readability */}
          <div className={styles.overlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroInner}>
            <span className={`text-primary ${styles.heroWelcome}`}>
              Welcome to Adipoli Affairs
            </span>
            <h1 className={styles.heroTitle}>
              Authentic <span className="text-primary">Kerala Cuisine</span><br />
              in Christchurch
            </h1>
            <p className={styles.heroDescription}>
              Experience the vibrant spices, coconut-rich curries, and traditional recipes
              from God's Own Country in a premium dining atmosphere.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/menu" className="btn btn-primary">
                Order Now <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Link>
              <Link href="/featured" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                View Specials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className={`glass ${styles.quickInfo}`}>
        <div className={styles.quickInfoItem}>
          <Clock size={32} className={`text-primary ${styles.quickInfoIcon}`} />
          <div className={styles.quickInfoContent}>
            <h4>Opening Hours</h4>
            <p>Mon-Sun: 11am - 10pm</p>
          </div>
        </div>
        <div className={styles.quickInfoDivider} />
        <div className={styles.quickInfoItem}>
          <MapPin size={32} className={`text-primary ${styles.quickInfoIcon}`} />
          <div className={styles.quickInfoContent}>
            <h4>Location</h4>
            <p>123 Riccarton Rd, CHCH</p>
          </div>
        </div>
        <div className={styles.quickInfoDivider} />
        <div className={styles.quickInfoItem}>
          <Star size={32} className={`text-primary ${styles.quickInfoIcon}`} />
          <div className={styles.quickInfoContent}>
            <h4>4.9/5 Rating</h4>
            <p>Based on 500+ reviews</p>
          </div>
        </div>
      </section>

      {/* Featured Dishes Preview */}
      <section className={`section container ${styles.featuredSection}`}>
        <div className={styles.featuredHeader}>
          <div>
            <h2 className="text-primary">Signature Dishes</h2>
            <p>Our chef's most recommended authentic delicacies.</p>
          </div>
          <Link href="/menu" className="btn btn-outline">View Full Menu</Link>
        </div>

        <div className={styles.featuredGrid}>
          {[
            { name: "Kerala Beef Fry", img: "/images/beef.png", price: "$22.00", desc: "Spicy roasted beef with coconut slices." },
            { name: "Chatti Biryani", img: "/images/biryani.png", price: "$28.50", desc: "Layered rice and meat cooked in clay pot." },
            { name: "Nidhi Chicken", img: "/images/chicken.png", price: "$24.99", desc: "Creamy roasted chicken curry." }
          ].map((item, idx) => (
            <div key={idx} className={`glass-card ${styles.featuredCard}`}>
              <div className={styles.featuredImage}>
                <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className={styles.featuredCardContent}>
                <div className={styles.featuredCardHeader}>
                  <h3>{item.name}</h3>
                  <span className={`text-primary ${styles.featuredCardPrice}`}>{item.price}</span>
                </div>
                <p>{item.desc}</p>
                <button 
                  className={`btn btn-primary ${styles.featuredCardButton}`}
                  onClick={() => handleAddToOrder(item)}
                >
                  Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Snippet */}
      <section className={`section ${styles.aboutSection}`}>
        <div className={`container ${styles.aboutGrid}`}>
          <div className={styles.aboutImage}>
            <Image src="/images/hero.png" alt="Chef" fill style={{ objectFit: 'cover' }} />
          </div>
          <div className={styles.aboutContent}>
            <h2 className="text-primary">Our Heritage</h2>
            <h3 className={styles.aboutTitle}>Bringing Kerala to Your Plate</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Adipoli Affairs started with a simple mission: to serve the most authentic Kerala cuisine
              using traditional recipes passed down through generations. Our chefs use only the
              freshest local ingredients combined with spices imported directly from the spice gardens of Kerala.
            </p>
            <ul className={styles.aboutList}>
              {['Halal Certified', 'Authentic Spices', 'Fresh Ingredients', 'Traditional Recipes'].map(tag => (
                <li key={tag} className={styles.aboutListItem}>
                  <div className={styles.aboutListDot} />
                  {tag}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn btn-outline">Read Our Story</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
