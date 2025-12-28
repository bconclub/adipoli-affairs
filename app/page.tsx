"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadMenuItems, type MenuItem } from "@/lib/menuData";

interface FeaturedItem {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
}

export default function Home() {
  const { addItem } = useCart();
  const videoRef = useRef<HTMLDivElement>(null);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const heritageImageRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Helper function to get fallback image
  const getFallbackImage = (name: string): string => {
    if (!name) return '/images/hero.png';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken')) return "/images/chicken.png";
    if (lowerName.includes('beef')) return "/images/beef.png";
    if (lowerName.includes('biryani')) return "/images/biryani.png";
    return "/images/hero.png";
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax scroll effect for heritage section
  useEffect(() => {
    const handleScroll = () => {
      if (heritageImageRef.current) {
        const rect = heritageImageRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate when element enters viewport
        const elementCenter = elementTop + elementHeight / 2;
        const viewportCenter = windowHeight / 2;
        
        // Calculate scroll progress (0 when element is above viewport, 1 when below)
        // As we scroll down, the image should move up (negative translateY)
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
        
        // Move image upward as we scroll down (negative translateY)
        // Max movement: 20% of image height upward
        const maxMovement = elementHeight * 0.2;
        setScrollY(-scrollProgress * maxMovement);
      }
    };
    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load featured items
  useEffect(() => {
    const loadFeaturedItems = async () => {
      try {
        const menuItems = await loadMenuItems();
        const featured = menuItems
          .filter(item => item.featured === true)
          .map(item => {
            const priceStr = typeof item.price === 'number' 
              ? `$${item.price.toFixed(2)}`
              : item.price.half && item.price.full
              ? `$${item.price.half.toFixed(2)} / $${item.price.full.toFixed(2)}`
              : `$${(item.price.half || item.price.full || 0).toFixed(2)}`;
            
            // Use featuredImage if available, otherwise use regular image
            let imagePath = item.featuredImage || item.image;
            
            // If no image, try to construct from category and name
            if (!imagePath || imagePath === '/images/hero.png' || (!imagePath.startsWith('/') && !imagePath.startsWith('http'))) {
              const sanitizeName = (str: string) => {
                if (!str) return '';
                return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
              };
              
              const sanitizedCategory = sanitizeName(item.category);
              const sanitizedProductName = sanitizeName(item.name);
              
              if (sanitizedCategory && sanitizedProductName) {
                imagePath = `/images/${sanitizedCategory}/${sanitizedProductName}.png`;
              } else {
                imagePath = getFallbackImage(item.name);
              }
            }
            
            // Ensure it starts with / or http
            if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
              imagePath = getFallbackImage(item.name);
            }
            
            return {
              id: item.id,
              name: item.name,
              price: priceStr,
              image: imagePath,
              description: item.desc || ''
            };
          });
        
        if (featured.length > 0) {
          setFeaturedItems(featured);
        }
      } catch (error) {
        console.error('Error loading featured items:', error);
      }
    };

    loadFeaturedItems();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredItems.length <= 1) return;
    
    const interval = setInterval(() => {
      if (isMobile) {
        // Mobile: Loop through all items
        setCurrentCarouselIndex((prev) => (prev + 1) % featuredItems.length);
      } else {
        // Desktop: Move forward, reset when reaching the end
        const maxIndex = Math.max(0, featuredItems.length - 3);
        setCurrentCarouselIndex((prev) => {
          if (prev >= maxIndex) {
            return 0; // Reset to start
          }
          return prev + 1;
        });
      }
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredItems.length, isMobile]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    if (isMobile) {
      setCurrentCarouselIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
    } else {
      // Desktop: Move by 1, but don't go below 0
      setCurrentCarouselIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    if (isMobile) {
      setCurrentCarouselIndex((prev) => (prev + 1) % featuredItems.length);
    } else {
      // Desktop: Move by 1, but don't exceed max (items.length - 3)
      const maxIndex = Math.max(0, featuredItems.length - 3);
      setCurrentCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
    }
  };

  const handleAddToOrder = (item: FeaturedItem) => {
    const priceMatch = item.price.match(/\$?([\d.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    addItem({
      id: item.id,
      name: item.name,
      price: price,
      image: item.image,
    });
  };

  return (
    <div className="home-wrapper" style={{ marginTop: '-80px' }}>
      {/* Hero Section - Full Screen */}
      <section style={{ 
        position: 'relative', 
        height: isMobile ? 'auto' : '100vh', 
        minHeight: isMobile ? 'calc(100vh - 80px)' : '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        paddingTop: '80px', // Navbar height to prevent content from hiding
        paddingBottom: isMobile ? '2rem' : '0',
        overflow: 'hidden'
      }}>
        {/* YouTube Video Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          overflow: 'hidden'
        }}>
          <div
            ref={videoRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              minHeight: '100vh',
              minWidth: '177.77vh', // 16:9 aspect ratio
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
          {/* Dark overlay for text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 2, padding: isMobile ? '1rem' : '0' }}>
          <div style={{ maxWidth: '800px', padding: isMobile ? '0 1rem' : '0' }}>
            <span className="text-primary" style={{ 
              fontWeight: 600, 
              letterSpacing: isMobile ? '1px' : '2px', 
              textTransform: 'uppercase', 
              marginBottom: isMobile ? '0.75rem' : '1rem', 
              display: 'block',
              fontSize: isMobile ? '0.75rem' : '1rem'
            }}>
              Welcome to Adipoli Affairs
            </span>
            <h1 style={{ 
              fontSize: isMobile ? '2.4rem' : '4rem', 
              marginBottom: isMobile ? '1rem' : '1.5rem', 
              lineHeight: 1.1,
              padding: isMobile ? '0' : '0'
            }}>
              Taste of <span className="text-primary" style={{ fontSize: isMobile ? '2.88rem' : '4.8rem' }}>God's Own Country</span>
            </h1>
            <p style={{ 
              fontSize: isMobile ? '0.95rem' : '1.25rem', 
              color: '#cbd5e1', 
              marginBottom: isMobile ? '1.5rem' : '2.5rem', 
              maxWidth: '600px',
              lineHeight: isMobile ? 1.5 : 1.6
            }}>
              Experience the vibrant spices, coconut-rich curries, and traditional recipes
              from God's Own Country in a premium dining atmosphere.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '0.75rem' : '1rem',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Link href="/menu" className="btn btn-primary" style={{ 
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                padding: isMobile ? '0.75rem 1.5rem' : undefined
              }}>
                Order Now <ArrowRight size={isMobile ? 18 : 20} style={{ marginLeft: '0.5rem' }} />
              </Link>
              <Link href="/featured" className="btn btn-outline" style={{ 
                color: 'white', 
                borderColor: 'white',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                padding: isMobile ? '0.75rem 1.5rem' : undefined
              }}>
                View Specials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="glass" style={{ 
        transform: isMobile ? 'translateY(0)' : 'translateY(-50%)', 
        maxWidth: '1000px', 
        margin: isMobile ? '2rem auto' : '0 auto', 
        padding: isMobile ? '1.5rem' : '2rem', 
        borderRadius: '16px', 
        display: 'flex', 
        justifyContent: isMobile ? 'flex-start' : 'space-around', 
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '1.5rem' : '0'
      }}>
        <div className="flex-center" style={{ 
          gap: isMobile ? '0.75rem' : '1rem',
          width: isMobile ? '100%' : 'auto',
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <Clock size={isMobile ? 24 : 32} className="text-primary" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              marginBottom: '0.2rem',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>Opening Hours</h4>
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              lineHeight: 1.4
            }}>Mon, Wed-Sun: 12pm - 10pm</p>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: isMobile ? '0.85rem' : '0.9rem', 
              color: 'var(--primary)',
              lineHeight: 1.4
            }}>Tuesday: Closed</p>
          </div>
        </div>
        {!isMobile && <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }} />}
        <div className="flex-center" style={{ 
          gap: isMobile ? '0.75rem' : '1rem',
          width: isMobile ? '100%' : 'auto',
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <MapPin size={isMobile ? 24 : 32} className="text-primary" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              marginBottom: '0.2rem',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>Location</h4>
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              lineHeight: 1.4
            }}>378a Ferry Road</p>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              lineHeight: 1.4
            }}>Woolston, Christchurch</p>
          </div>
        </div>
        {!isMobile && <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }} />}
        <div className="flex-center" style={{ 
          gap: isMobile ? '0.75rem' : '1rem',
          width: isMobile ? '100%' : 'auto',
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <Star size={isMobile ? 24 : 32} className="text-primary" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              marginBottom: '0.2rem',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>4.9/5 Rating</h4>
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              lineHeight: 1.4
            }}>Based on 500+ reviews</p>
          </div>
        </div>
      </section>

      {/* Featured Dishes Preview - Carousel */}
      <section className="section container" style={{ padding: isMobile ? '2rem 1rem' : undefined }}>
        <div className="flex-between mb-8" style={{ 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '1rem' : '0'
        }}>
          <div>
            <h2 className="text-primary" style={{ fontSize: isMobile ? '1.75rem' : undefined }}>Signature Dishes</h2>
            <p style={{ fontSize: isMobile ? '0.9rem' : undefined }}>Our chef's most recommended authentic delicacies.</p>
          </div>
          <Link href="/menu" className="btn btn-outline" style={{ 
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center'
          }}>View Full Menu</Link>
        </div>

        {featuredItems.length > 0 ? (
          <div style={{ position: 'relative', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Desktop: Multiple Cards Carousel */}
            {!isMobile ? (
              <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
                <motion.div
                  animate={{
                    x: `-${currentCarouselIndex * (100 / 3)}%`
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    width: '100%'
                  }}
                >
                  {featuredItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="glass-card"
                      style={{
                        flex: `0 0 calc(33.333% - 1rem)`,
                        minWidth: 0,
                        overflow: 'hidden',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '400px'
                      }}
                    >
                      {/* Image */}
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '250px',
                        overflow: 'hidden',
                        borderRadius: '12px 12px 0 0'
                      }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = getFallbackImage(item.name);
                            if (target.src !== new URL(fallback, window.location.origin).href) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1
                      }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          marginBottom: '0.75rem',
                          color: 'var(--primary)',
                          fontWeight: '600'
                        }}>
                          {item.name}
                        </h3>
                        <p style={{
                          fontSize: '0.95rem',
                          marginBottom: '1rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          flex: 1
                        }}>
                          {item.description}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem'
                        }}>
                          <span className="text-primary" style={{
                            fontSize: '1.5rem',
                            fontWeight: '700'
                          }}>
                            {item.price}
                          </span>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '0.75rem 1.5rem'
                          }}
                          onClick={() => handleAddToOrder(item)}
                        >
                          Add to Order <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Navigation Buttons - Desktop */}
                {featuredItems.length > 3 && (
                  <>
                    <button
                      onClick={handlePrev}
                      disabled={currentCarouselIndex === 0}
                      style={{
                        position: 'absolute',
                        left: '-100px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: currentCarouselIndex === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentCarouselIndex === 0 ? 'not-allowed' : 'pointer',
                        color: 'white',
                        zIndex: 10,
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentCarouselIndex !== 0) {
                          e.currentTarget.style.background = 'rgba(242, 127, 36, 0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentCarouselIndex === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)';
                      }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentCarouselIndex >= featuredItems.length - 3}
                      style={{
                        position: 'absolute',
                        right: '-100px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: currentCarouselIndex >= featuredItems.length - 3 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentCarouselIndex >= featuredItems.length - 3 ? 'not-allowed' : 'pointer',
                        color: 'white',
                        zIndex: 10,
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentCarouselIndex < featuredItems.length - 3) {
                          e.currentTarget.style.background = 'rgba(242, 127, 36, 0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentCarouselIndex >= featuredItems.length - 3 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.5)';
                      }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Mobile: Single Card Carousel */
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCarouselIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card"
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '250px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={featuredItems[currentCarouselIndex]?.image}
                        alt={featuredItems[currentCarouselIndex]?.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallback = getFallbackImage(featuredItems[currentCarouselIndex]?.name);
                          if (target.src !== new URL(fallback, window.location.origin).href) {
                            target.src = fallback;
                          }
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <h3 style={{
                        fontSize: '1.5rem',
                        marginBottom: '0.75rem',
                        color: 'var(--primary)',
                        fontWeight: '600'
                      }}>
                        {featuredItems[currentCarouselIndex]?.name}
                      </h3>
                      <p style={{
                        fontSize: '0.95rem',
                        marginBottom: '1rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}>
                        {featuredItems[currentCarouselIndex]?.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                      }}>
                        <span className="text-primary" style={{
                          fontSize: '1.5rem',
                          fontWeight: '700'
                        }}>
                          {featuredItems[currentCarouselIndex]?.price}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1.5rem'
                        }}
                        onClick={() => handleAddToOrder(featuredItems[currentCarouselIndex])}
                      >
                        Add to Order <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons - Mobile */}
                {featuredItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        zIndex: 10,
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(242, 127, 36, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNext}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        zIndex: 10,
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(242, 127, 36, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Dots Indicator - Mobile */}
                {featuredItems.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '0.5rem',
                    zIndex: 10
                  }}>
                    {featuredItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setCurrentCarouselIndex(idx);
                        }}
                        style={{
                          width: idx === currentCarouselIndex ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: idx === currentCarouselIndex ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No featured dishes available at the moment.
            </p>
            <Link href="/admin" className="btn btn-outline">Manage Featured Items</Link>
          </div>
        )}
      </section>

      {/* About Snippet */}
      <section className="section" style={{ background: 'var(--surface)', padding: isMobile ? '2rem 1rem' : undefined, position: 'relative', overflow: 'visible' }}>
        <div className="container grid" style={{ 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          alignItems: 'center',
          gap: isMobile ? '2rem' : '0',
          position: 'relative',
          zIndex: 2
        }}>
          <div 
            ref={heritageImageRef}
            style={{ 
              position: 'relative', 
              height: isMobile ? '400px' : '600px', 
              borderRadius: '24px', 
              overflow: 'hidden',
              order: isMobile ? -1 : 0,
              background: 'rgba(0,0,0,0.1)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '120%', // Extra height for parallax effect
                transform: `translateY(${scrollY}px)`,
                willChange: 'transform',
                transition: 'transform 0.1s ease-out'
              }}
            >
              <Image 
                src="/Heritage.webp" 
                alt="Our Heritage" 
                fill 
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center top'
                }} 
              />
            </div>
          </div>
          <div style={{ padding: isMobile ? '0' : '2rem' }}>
            <h2 className="text-primary" style={{ fontSize: isMobile ? '1.5rem' : undefined }}>Our Heritage</h2>
            <h3 style={{ 
              marginBottom: '1.5rem', 
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              lineHeight: 1.2
            }}>Bringing Kerala to Your Plate</h3>
            <p style={{ 
              marginBottom: '1.5rem',
              fontSize: isMobile ? '0.95rem' : undefined,
              lineHeight: 1.6
            }}>
              Adipoli Affairs started with a simple mission: to serve the most authentic Kerala cuisine
              using traditional recipes passed down through generations. Our chefs use only the
              freshest local ingredients combined with spices imported directly from the spice gardens of Kerala.
            </p>
            <ul style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: isMobile ? '0.75rem' : '1rem', 
              marginBottom: '2rem' 
            }}>
              {['Halal Certified', 'Authentic Spices', 'Fresh Ingredients', 'Traditional Recipes'].map(tag => (
                <li key={tag} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: isMobile ? '0.9rem' : undefined
                }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', flexShrink: 0 }} />
                  {tag}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn btn-outline" style={{ 
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}>Read Our Story</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
