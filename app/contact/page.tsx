"use client";

import { useState } from "react";
import { MapPin, Clock, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import styles from "./page.module.css";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage("");

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitMessage("Thank you! We'll get back to you soon.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                message: "",
            });
        }, 1500);
    };

    const handleWhatsAppClick = () => {
        const phoneNumber = "0226340628";
        const message = encodeURIComponent("Hello! I'd like to place an order.");
        window.open(`https://wa.me/64${phoneNumber.replace(/\s/g, "")}?text=${message}`, "_blank");
    };

    return (
        <div className={styles.contactWrapper}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Contact Us</h1>
                        <p className={styles.heroSubtitle}>
                            Visit us or get in touch - we'd love to hear from you!
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className={`container ${styles.section}`}>
                <div className={styles.contactGrid}>
                    {/* Address */}
                    <div className={styles.contactCard}>
                        <div className={styles.cardIcon}>
                            <MapPin size={32} />
                        </div>
                        <h2>Address</h2>
                        <address className={styles.address}>
                            <p>378A Ferry Road</p>
                            <p>Woolston</p>
                            <p>Christchurch</p>
                        </address>
                    </div>

                    {/* Hours */}
                    <div className={styles.contactCard}>
                        <div className={styles.cardIcon}>
                            <Clock size={32} />
                        </div>
                        <h2>Opening Hours</h2>
                        <div className={styles.hours}>
                            <p>
                                <span className={styles.day}>Monday - Sunday:</span>
                                <span className={styles.time}>12pm - 10pm</span>
                            </p>
                            <p>
                                <span className={styles.day}>Tuesday:</span>
                                <span className={styles.closed}>Closed</span>
                            </p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.contactCard}>
                        <div className={styles.cardIcon}>
                            <Phone size={32} />
                        </div>
                        <h2>Contact</h2>
                        <div className={styles.contactInfo}>
                            <p>
                                <Phone size={18} className={styles.infoIcon} />
                                <a href="tel:0226340628">022 634 0628</a>
                            </p>
                            <p>
                                <MessageCircle size={18} className={styles.infoIcon} />
                                <a href="tel:0226340628" onClick={(e) => {
                                    e.preventDefault();
                                    handleWhatsAppClick();
                                }}>
                                    WhatsApp Order: 0226340628
                                </a>
                            </p>
                            <p>
                                <Mail size={18} className={styles.infoIcon} />
                                <a href="mailto:indianfusionck@gmail.com">indianfusionck@gmail.com</a>
                            </p>
                            <p>
                                <Globe size={18} className={styles.infoIcon} />
                                <a href="https://bconclub.com" target="_blank" rel="noopener noreferrer">
                                    bconclub.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.mapSection}>
                    <h2 className={styles.sectionTitle}>Find Us</h2>
                    <div className={styles.mapWrapper}>
                        <iframe
                            src="https://www.google.com/maps?q=378A+Ferry+Road+Woolston+Christchurch+New+Zealand&output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: "16px" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Adipoli Affairs Location - 378A Ferry Road, Woolston, Christchurch"
                        ></iframe>
                    </div>
                    <p className={styles.mapNote}>
                        We're located at 378A Ferry Road, Woolston, Christchurch. 
                        Plenty of parking available nearby.
                    </p>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Send Us a Message</h2>
                    <p className={styles.sectionSubtitle}>
                        Have a question or feedback? Fill out the form below and we'll get back to you.
                    </p>
                    <div className={styles.formWrapper}>
                        <form onSubmit={handleSubmit} className={styles.contactForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="022 634 0628"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    placeholder="Your message..."
                                />
                            </div>
                            {submitMessage && (
                                <div className={styles.successMessage}>
                                    {submitMessage}
                                </div>
                            )}
                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.submitButton}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* WhatsApp Button */}
            <div className={styles.whatsappButton} onClick={handleWhatsAppClick}>
                <MessageCircle size={24} />
                <span>Order via WhatsApp</span>
            </div>
        </div>
    );
}
