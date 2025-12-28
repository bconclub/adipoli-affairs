"use client";

import Image from "next/image";
import { Heart, MapPin, Users, Award, Sparkles } from "lucide-react";
import styles from "./page.module.css";

export default function About() {
    return (
        <div className={styles.aboutWrapper}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroImageContainer}>
                    <Image
                        src="/Heritage.webp"
                        alt="Kerala Heritage"
                        fill
                        className={styles.heroImage}
                        priority
                        quality={90}
                    />
                    <div className={styles.heroOverlay}></div>
                </div>
                <div className="container">
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Our Story</h1>
                        <p className={styles.heroSubtitle}>Adipoli Affairs</p>
                        <div className={styles.heroDescription}>
                            <p>
                                Born from a deep love for authentic Kerala cuisine and a dream to share the rich flavors 
                                of South India with New Zealand, Adipoli Affairs brings the warmth and tradition of 
                                Kerala to Christchurch. Our journey began with a simple mission: to serve food that 
                                tastes like home, using time-honored recipes passed down through generations.
                            </p>
                            <p>
                                Every dish we create is a celebration of Kerala's culinary heritage—from the aromatic 
                                spices that fill our kitchen to the traditional cooking methods that bring out the 
                                authentic flavors. We believe that great food brings people together, and we're 
                                honored to be part of your special moments.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.missionWrapper}>
                    <div className={styles.missionImageContainer}>
                        <Image
                            src="/images/featured/chicken-curry.png"
                            alt="Authentic Kerala Cuisine"
                            width={600}
                            height={400}
                            className={styles.missionImage}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/hero.png";
                            }}
                        />
                    </div>
                    <div className={styles.missionCard}>
                        <div className={styles.missionIcon}>
                            <Heart size={48} />
                        </div>
                        <h2 className={styles.sectionTitle}>Our Mission</h2>
                        <p className={styles.missionText}>
                            To bring authentic Kerala cuisine to New Zealand, preserving traditional recipes and 
                            cooking methods while creating memorable dining experiences. We're committed to using 
                            fresh, quality ingredients and authentic spices to deliver the true taste of Kerala 
                            in every bite.
                        </p>
                    </div>
                </div>
            </section>

            {/* New Location Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.locationWrapper}>
                    <div className={styles.locationCard}>
                        <div className={styles.locationHeader}>
                            <MapPin size={40} className={styles.locationIcon} />
                            <div>
                                <h2 className={styles.sectionTitle}>New Location</h2>
                                <p className={styles.locationSubtitle}>We're excited to welcome you!</p>
                            </div>
                        </div>
                        <div className={styles.locationContent}>
                            <p>
                                We're thrilled to announce our new location at <strong>378A Ferry Road, Woolston, Christchurch</strong>. 
                                This beautiful new space allows us to serve you better with more seating, an enhanced dining 
                                experience, and the same authentic flavors you love.
                            </p>
                            <p>
                                Our new location is designed to bring the warmth and hospitality of Kerala to your table, 
                                creating the perfect atmosphere for family dinners, celebrations, and special occasions.
                            </p>
                        </div>
                    </div>
                    <div className={styles.locationImageContainer}>
                        <Image
                            src="/images/featured/palappam-3pcs.png"
                            alt="Our Restaurant"
                            width={600}
                            height={400}
                            className={styles.locationImage}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/hero.png";
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.teamSection}>
                    <h2 className={styles.sectionTitle}>Meet Our Team</h2>
                    <p className={styles.sectionSubtitle}>
                        Passionate chefs and culinary experts dedicated to bringing you authentic Kerala flavors
                    </p>
                    <div className={styles.teamGrid}>
                        <div className={styles.teamImageContainer}>
                            <Image
                                src="/images/featured/butter-chicken.png"
                                alt="Our Chefs"
                                width={500}
                                height={400}
                                className={styles.teamImage}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/hero.png";
                                }}
                            />
                        </div>
                        <div className={styles.teamCard}>
                            <div className={styles.teamIcon}>
                                <Users size={48} />
                            </div>
                            <p>
                                Our team consists of experienced chefs from Kerala who bring years of traditional 
                                cooking expertise to every dish. With a deep understanding of authentic spices, 
                                regional recipes, and time-honored techniques, we ensure that every meal is a 
                                true representation of Kerala's rich culinary heritage.
                            </p>
                            <p>
                                From our head chef's mastery of traditional biryanis to our team's expertise in 
                                crafting perfect appams and curries, every member of Adipoli Affairs is committed 
                                to excellence and authenticity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality Promise Section */}
            <section className={`container ${styles.section}`}>
                <div className={styles.qualitySection}>
                    <h2 className={styles.sectionTitle}>Our Quality Promise</h2>
                    <div className={styles.qualityGrid}>
                        <div className={styles.qualityCard}>
                            <div className={styles.qualityImageWrapper}>
                                <Image
                                    src="/images/featured/dragon-beef.png"
                                    alt="Authentic Ingredients"
                                    fill
                                    className={styles.qualityImage}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/hero.png";
                                    }}
                                />
                            </div>
                            <div className={styles.qualityContent}>
                                <div className={styles.qualityIcon}>
                                    <Award size={32} />
                                </div>
                                <h3>Authentic Ingredients</h3>
                                <p>
                                    We source authentic spices and ingredients, ensuring every dish maintains 
                                    the true flavors of Kerala cuisine.
                                </p>
                            </div>
                        </div>
                        <div className={styles.qualityCard}>
                            <div className={styles.qualityImageWrapper}>
                                <Image
                                    src="/images/featured/kappa-fish.png"
                                    alt="Traditional Recipes"
                                    fill
                                    className={styles.qualityImage}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/hero.png";
                                    }}
                                />
                            </div>
                            <div className={styles.qualityContent}>
                                <div className={styles.qualityIcon}>
                                    <Sparkles size={32} />
                                </div>
                                <h3>Traditional Recipes</h3>
                                <p>
                                    Our recipes are passed down through generations, preserving the authentic 
                                    taste and cooking methods of Kerala.
                                </p>
                            </div>
                        </div>
                        <div className={styles.qualityCard}>
                            <div className={styles.qualityImageWrapper}>
                                <Image
                                    src="/images/main-course/chicken-biryani.png"
                                    alt="Made with Love"
                                    fill
                                    className={styles.qualityImage}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/hero.png";
                                    }}
                                />
                            </div>
                            <div className={styles.qualityContent}>
                                <div className={styles.qualityIcon}>
                                    <Heart size={32} />
                                </div>
                                <h3>Made with Love</h3>
                                <p>
                                    Every dish is prepared with care and passion, bringing the warmth of 
                                    home-cooked meals to your table.
                                </p>
                            </div>
                        </div>
                        <div className={styles.qualityCard}>
                            <div className={styles.qualityImageWrapper}>
                                <Image
                                    src="/images/south-specials/masala-dosa.png"
                                    alt="Fresh Daily"
                                    fill
                                    className={styles.qualityImage}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/images/hero.png";
                                    }}
                                />
                            </div>
                            <div className={styles.qualityContent}>
                                <div className={styles.qualityIcon}>
                                    <Users size={32} />
                                </div>
                                <h3>Fresh Daily</h3>
                                <p>
                                    We prepare our dishes fresh daily, using quality ingredients to ensure 
                                    the best taste and nutrition.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
