"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Clock, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Home() {
  const { addItem } = useCart();

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
    <div className="home-wrapper" style={{ marginTop: '-80px' }}>
      {/* Hero Section - Full Screen */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        paddingTop: '80px' // Navbar height to prevent content from hiding
      }}>
        <Image
          src="/images/hero.png"
          alt="Kerala Sadhya Feast"
          fill
          style={{ 
            objectFit: 'cover', 
            zIndex: -1, 
            filter: 'brightness(0.4)', 
            top: 0,
            left: 0
          }}
          priority
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px' }}>
            <span className="text-primary" style={{ fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
              Welcome to Adipoli Affairs
            </span>
            <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Authentic <span className="text-primary">Kerala Cuisine</span><br />
              in Christchurch
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2.5rem', maxWidth: '600px' }}>
              Experience the vibrant spices, coconut-rich curries, and traditional recipes
              from God's Own Country in a premium dining atmosphere.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
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
      <section className="glass" style={{ transform: 'translateY(-50%)', maxWidth: '1000px', margin: '0 auto', padding: '2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <Clock size={32} className="text-primary" />
          <div>
            <h4 style={{ marginBottom: '0.2rem' }}>Opening Hours</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Mon-Sun: 11am - 10pm</p>
          </div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex-center" style={{ gap: '1rem' }}>
          <MapPin size={32} className="text-primary" />
          <div>
            <h4 style={{ marginBottom: '0.2rem' }}>Location</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>123 Riccarton Rd, CHCH</p>
          </div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex-center" style={{ gap: '1rem' }}>
          <Star size={32} className="text-primary" />
          <div>
            <h4 style={{ marginBottom: '0.2rem' }}>4.9/5 Rating</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Based on 500+ reviews</p>
          </div>
        </div>
      </section>

      {/* Featured Dishes Preview */}
      <section className="section container">
        <div className="flex-between mb-8">
          <div>
            <h2 className="text-primary">Signature Dishes</h2>
            <p>Our chef's most recommended authentic delicacies.</p>
          </div>
          <Link href="/menu" className="btn btn-outline">View Full Menu</Link>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            { name: "Kerala Beef Fry", img: "/images/beef.png", price: "$22.00", desc: "Spicy roasted beef with coconut slices." },
            { name: "Chatti Biryani", img: "/images/biryani.png", price: "$28.50", desc: "Layered rice and meat cooked in clay pot." },
            { name: "Nidhi Chicken", img: "/images/chicken.png", price: "$24.99", desc: "Creamy roasted chicken curry." }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '250px' }}>
                <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <h3>{item.name}</h3>
                  <span className="text-primary" style={{ fontWeight: '700' }}>{item.price}</span>
                </div>
                <p>{item.desc}</p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
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
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
          <div style={{ position: 'relative', height: '500px', borderRadius: '24px', overflow: 'hidden' }}>
            <Image src="/images/hero.png" alt="Chef" fill style={{ objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '2rem' }}>
            <h2 className="text-primary">Our Heritage</h2>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Bringing Kerala to Your Plate</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Adipoli Affairs started with a simple mission: to serve the most authentic Kerala cuisine
              using traditional recipes passed down through generations. Our chefs use only the
              freshest local ingredients combined with spices imported directly from the spice gardens of Kerala.
            </p>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {['Halal Certified', 'Authentic Spices', 'Fresh Ingredients', 'Traditional Recipes'].map(tag => (
                <li key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
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
