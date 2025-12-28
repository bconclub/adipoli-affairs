"use client";

import { useState } from "react";
import { PartyPopper, Briefcase, Heart, ChefHat, Phone, Mail } from "lucide-react";
import styles from "./page.module.css";

export default function Catering() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: "",
        guestCount: "",
        eventDetails: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            setSubmitMessage("Thank you! We'll contact you soon to discuss your catering needs.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                eventType: "",
                eventDate: "",
                guestCount: "",
                eventDetails: "",
            });
        }, 1500);
    };

    return (
        <div className={styles.cateringWrapper}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Catering Services</h1>
                        <p className={styles.heroSubtitle}>
                            Bring authentic Kerala cuisine to your special event
                        </p>
                        <p className={styles.heroDescription}>
                            From intimate gatherings to grand celebrations, we create memorable dining experiences 
                            with our authentic Kerala cuisine. Let us bring the flavors of South India to your event.
                        </p>
                    </div>
                </div>
            </section>

            {/* Event Types Section */}
            <section className={`container ${styles.section}`}>
                <h2 className={styles.sectionTitle}>Event Types</h2>
                <p className={styles.sectionSubtitle}>
                    We cater to a variety of events, each customized to your needs
                </p>
                <div className={styles.eventTypesGrid}>
                    <div className={styles.eventCard}>
                        <div className={styles.eventIcon}>
                            <PartyPopper size={40} />
                        </div>
                        <h3>Parties</h3>
                        <p>
                            Birthday celebrations, anniversaries, or any special occasion. We'll create 
                            a menu that makes your party unforgettable with authentic Kerala flavors.
                        </p>
                    </div>
                    <div className={styles.eventCard}>
                        <div className={styles.eventIcon}>
                            <Briefcase size={40} />
                        </div>
                        <h3>Corporate Events</h3>
                        <p>
                            Impress your clients and colleagues with our professional catering services. 
                            Perfect for meetings, conferences, and corporate gatherings.
                        </p>
                    </div>
                    <div className={styles.eventCard}>
                        <div className={styles.eventIcon}>
                            <Heart size={40} />
                        </div>
                        <h3>Weddings</h3>
                        <p>
                            Make your special day even more memorable with our wedding catering. We offer 
                            comprehensive packages for ceremonies, receptions, and celebrations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sample Menus Section */}
            <section className={`container ${styles.section}`}>
                <h2 className={styles.sectionTitle}>Sample Menus & Packages</h2>
                <div className={styles.menusGrid}>
                    <div className={styles.menuCard}>
                        <div className={styles.menuHeader}>
                            <ChefHat size={32} />
                            <h3>Essential Package</h3>
                        </div>
                        <ul className={styles.menuList}>
                            <li>Biryani (Chicken/Mutton/Vegetable)</li>
                            <li>2 Curry Options</li>
                            <li>Rice & Bread Selection</li>
                            <li>Raita & Pickles</li>
                            <li>Dessert</li>
                        </ul>
                        <p className={styles.menuNote}>Perfect for small gatherings (20-50 guests)</p>
                    </div>
                    <div className={styles.menuCard}>
                        <div className={styles.menuHeader}>
                            <ChefHat size={32} />
                            <h3>Premium Package</h3>
                        </div>
                        <ul className={styles.menuList}>
                            <li>Biryani (Multiple Options)</li>
                            <li>4-5 Curry Options</li>
                            <li>Appetizers & Starters</li>
                            <li>Full Bread Selection</li>
                            <li>Rice Varieties</li>
                            <li>Salads & Sides</li>
                            <li>Dessert Selection</li>
                        </ul>
                        <p className={styles.menuNote}>Ideal for medium events (50-100 guests)</p>
                    </div>
                    <div className={styles.menuCard}>
                        <div className={styles.menuHeader}>
                            <ChefHat size={32} />
                            <h3>Deluxe Package</h3>
                        </div>
                        <ul className={styles.menuList}>
                            <li>Full Biryani Selection</li>
                            <li>6-8 Curry Options</li>
                            <li>Premium Starters</li>
                            <li>Complete Bread & Rice Menu</li>
                            <li>Specialty Dishes</li>
                            <li>Extensive Sides & Salads</li>
                            <li>Premium Dessert Selection</li>
                            <li>Beverage Options</li>
                        </ul>
                        <p className={styles.menuNote}>Perfect for large celebrations (100+ guests)</p>
                    </div>
                </div>
                <div className={styles.customNote}>
                    <p>
                        <strong>All packages can be customized</strong> to suit your preferences, dietary 
                        requirements, and budget. We work with you to create the perfect menu for your event.
                    </p>
                </div>
            </section>

            {/* Custom Catering Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.customSection}>
                    <h2 className={styles.sectionTitle}>Custom Catering Options</h2>
                    <div className={styles.customCard}>
                        <p>
                            We understand that every event is unique. That's why we offer fully customizable 
                            catering options tailored to your specific needs:
                        </p>
                        <ul className={styles.customList}>
                            <li>Menu customization based on your preferences</li>
                            <li>Dietary requirement accommodations (vegetarian, vegan, gluten-free, etc.)</li>
                            <li>Flexible serving styles (buffet, plated, family-style)</li>
                            <li>On-site cooking and serving options</li>
                            <li>Specialty dishes and regional variations</li>
                            <li>Beverage packages and bar services</li>
                            <li>Setup, serving, and cleanup services</li>
                        </ul>
                        <p>
                            Contact us to discuss your vision, and we'll create a catering package that 
                            perfectly matches your event and budget.
                        </p>
                    </div>
                </div>
            </section>

            {/* Inquiry Form Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Request a Quote</h2>
                    <p className={styles.sectionSubtitle}>
                        Fill out the form below, and we'll get back to you with a customized quote
                    </p>
                    <div className={styles.formWrapper}>
                        <form onSubmit={handleSubmit} className={styles.cateringForm}>
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
                                        placeholder="Your full name"
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
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">Phone *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="022 634 0628"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="eventType">Event Type *</label>
                                    <select
                                        id="eventType"
                                        name="eventType"
                                        value={formData.eventType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select event type</option>
                                        <option value="party">Party</option>
                                        <option value="corporate">Corporate Event</option>
                                        <option value="wedding">Wedding</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="eventDate">Event Date *</label>
                                    <input
                                        type="date"
                                        id="eventDate"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="guestCount">Guest Count *</label>
                                    <input
                                        type="number"
                                        id="guestCount"
                                        name="guestCount"
                                        value={formData.guestCount}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        placeholder="Number of guests"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="eventDetails">Event Details *</label>
                                <textarea
                                    id="eventDetails"
                                    name="eventDetails"
                                    value={formData.eventDetails}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Tell us about your event, dietary requirements, preferred menu items, and any special requests..."
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
                                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.contactSection}>
                    <h2 className={styles.sectionTitle}>Get in Touch</h2>
                    <p className={styles.sectionSubtitle}>
                        Prefer to speak directly? Contact us for immediate assistance
                    </p>
                    <div className={styles.contactCards}>
                        <div className={styles.contactCard}>
                            <Phone size={32} />
                            <h3>Phone</h3>
                            <a href="tel:0226340628" className={styles.contactLink}>
                                022 634 0628
                            </a>
                        </div>
                        <div className={styles.contactCard}>
                            <Mail size={32} />
                            <h3>Email</h3>
                            <a href="mailto:indianfusionck@gmail.com" className={styles.contactLink}>
                                indianfusionck@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
