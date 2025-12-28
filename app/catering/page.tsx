"use client";

import { useState } from "react";
import { PartyPopper, Briefcase, Heart, Phone, Mail } from "lucide-react";
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
    const [isError, setIsError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Format event details for WhatsApp
    const formatEventForWhatsApp = () => {
        const eventTypeLabels: Record<string, string> = {
            party: "Party",
            corporate: "Corporate Event",
            wedding: "Wedding",
            other: "Other"
        };

        const eventTypeLabel = eventTypeLabels[formData.eventType] || formData.eventType;

        const message = `*Catering Inquiry from Adipoli Affairs*

*Customer Details:*
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

*Event Details:*
Event Type: ${eventTypeLabel}
Event Date: ${formData.eventDate}
Guest Count: ${formData.guestCount}

*Additional Information:*
${formData.eventDetails}

Thank you for your inquiry!`;

        return encodeURIComponent(message);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
            !formData.eventType || !formData.eventDate || !formData.guestCount || !formData.eventDetails.trim()) {
            setIsError(true);
            setSubmitMessage("Please fill in all required fields.");
            return;
        }

        setIsError(false);

        setIsSubmitting(true);
        setSubmitMessage("");

        // Format and send to WhatsApp
        const whatsappNumber = '+64226340628';
        const message = formatEventForWhatsApp();
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear form and show success message
        setTimeout(() => {
            setIsSubmitting(false);
            setIsError(false);
            setSubmitMessage("Thank you! Your inquiry has been sent. We'll contact you soon to discuss your catering needs.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                eventType: "",
                eventDate: "",
                guestCount: "",
                eventDetails: "",
            });
        }, 500);
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
                                <div className={isError ? styles.errorMessage : styles.successMessage}>
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
