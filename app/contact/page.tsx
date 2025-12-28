"use client";

import { MapPin, Clock, Mail, Phone } from "lucide-react";

export default function Contact() {
    return (
        <div className="container section">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="text-primary">Contact Us</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    Visit us or get in touch - we'd love to hear from you!
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {/* Address */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            background: 'rgba(242, 127, 36, 0.2)', 
                            padding: '1rem', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MapPin size={32} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h2 style={{ margin: 0 }}>Address</h2>
                    </div>
                    <address style={{ fontStyle: 'normal', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>378a Ferry Road</p>
                        <p style={{ margin: '0.5rem 0' }}>Woolston</p>
                        <p style={{ margin: '0.5rem 0' }}>Christchurch</p>
                        <p style={{ margin: '0.5rem 0' }}>New Zealand</p>
                    </address>
                </div>

                {/* Opening Hours */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            background: 'rgba(242, 127, 36, 0.2)', 
                            padding: '1rem', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={32} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h2 style={{ margin: 0 }}>Opening Hours</h2>
                    </div>
                    <div style={{ lineHeight: '2', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Monday:</span>
                            <strong style={{ color: 'var(--text-main)' }}>12:00 PM - 10:00 PM</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tuesday:</span>
                            <strong style={{ color: '#ef4444' }}>Closed</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Wednesday:</span>
                            <strong style={{ color: 'var(--text-main)' }}>12:00 PM - 10:00 PM</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Thursday:</span>
                            <strong style={{ color: 'var(--text-main)' }}>12:00 PM - 10:00 PM</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Friday:</span>
                            <strong style={{ color: 'var(--text-main)' }}>12:00 PM - 10:00 PM</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Saturday:</span>
                            <strong style={{ color: 'var(--text-main)' }}>12:00 PM - 10:00 PM</strong>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Sunday:</span>
                            <strong style={{ color: 'var(--text-main)' }}>12:00 PM - 10:00 PM</strong>
                        </p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            background: 'rgba(242, 127, 36, 0.2)', 
                            padding: '1rem', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Phone size={32} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h2 style={{ margin: 0 }}>Get in Touch</h2>
                    </div>
                    <div style={{ lineHeight: '2', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Phone size={20} style={{ color: 'var(--primary)' }} />
                            <span>Draft Phone: +64 3 123 4567</span>
                        </p>
                        <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Mail size={20} style={{ color: 'var(--primary)' }} />
                            <span>hello@adipoliaffairs.nz</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Map placeholder or embed */}
            <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Find Us</h3>
                <div style={{ 
                    width: '100%', 
                    height: '400px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    <p>Map integration can be added here</p>
                </div>
            </div>
        </div>
    );
}
