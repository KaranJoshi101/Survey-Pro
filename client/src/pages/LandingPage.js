import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Sample data — replace with real admin / research data
    const researchAreas = [
        {
            icon: '\u{1F4CA}',
            title: 'Health Survey Research',
            description: 'Designing and conducting large-scale health surveys to assess community well-being and inform public health policy.',
        },
        {
            icon: '\u{1F9EC}',
            title: 'Biomedical Data Analytics',
            description: 'Applying statistical and machine learning methods to biomedical datasets for pattern discovery and clinical insight.',
        },
        {
            icon: '\u{1F4BB}',
            title: 'Digital Health Platforms',
            description: 'Developing web-based tools and platforms for remote data collection, patient monitoring, and healthcare delivery.',
        },
        {
            icon: '\u{1F30D}',
            title: 'Global Health Informatics',
            description: 'Leveraging information systems and technology to improve health outcomes in low-resource settings worldwide.',
        },
    ];

    const publications = [
        {
            title: 'A Comprehensive Framework for Community Health Assessment via Digital Surveys',
            journal: 'Journal of Public Health Informatics',
            year: '2025',
            tags: ['Health Survey', 'Digital Tools'],
            featured: true,
        },
        {
            title: 'Machine Learning Approaches for Predicting Patient Outcomes in Rural Healthcare',
            journal: 'International Conference on Biomedical Engineering',
            year: '2024',
            tags: ['Machine Learning', 'Healthcare'],
            featured: false,
        },
        {
            title: 'Evaluating the Effectiveness of Mobile-based Health Interventions in Sub-Saharan Africa',
            journal: 'The Lancet Digital Health',
            year: '2024',
            tags: ['Mobile Health', 'Global Health'],
            featured: false,
        },
        {
            title: 'Privacy-Preserving Methods for Large-Scale Medical Survey Data',
            journal: 'IEEE Transactions on Information Forensics and Security',
            year: '2023',
            tags: ['Privacy', 'Data Security'],
            featured: false,
        },
    ];

    const mediaTalks = [
        {
            title: 'Keynote: The Future of Digital Health Surveys',
            type: 'Conference Talk',
            description: 'Annual Global Health Informatics Summit 2025',
        },
        {
            title: 'Interview: AI in Community Health Research',
            type: 'Interview',
            description: 'Featured on HealthTech Today podcast',
        },
        {
            title: 'Workshop: Building Scalable Survey Platforms',
            type: 'Workshop',
            description: 'IEEE International Workshop on Digital Health',
        },
    ];

    const galleryItems = [
        { label: 'International Health Conference 2025', placeholder: '\u{1F3DB}' },
        { label: 'Research Lab Team', placeholder: '\u{1F468}\u{200D}\u{1F52C}' },
        { label: 'Best Paper Award 2024', placeholder: '\u{1F3C6}' },
        { label: 'Community Health Fieldwork', placeholder: '\u{1F3E5}' },
        { label: 'Digital Health Workshop', placeholder: '\u{1F4BB}' },
        { label: 'Global Health Summit Panel', placeholder: '\u{1F30D}' },
    ];

    return (
        <div className="academic-landing">
            {/* ===== NAVBAR ===== */}
            <nav className="acad-navbar">
                <button
                    type="button"
                    className="acad-navbar-brand"
                    onClick={() => scrollToSection('hero')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    Survey<span className="brand-accent">Pro</span>
                </button>

                <ul className={`acad-navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <li><button type="button" onClick={() => scrollToSection('hero')}>Home</button></li>
                    <li><button type="button" onClick={() => scrollToSection('about')}>About</button></li>
                    <li><button type="button" onClick={() => scrollToSection('research')}>Research</button></li>
                    <li><button type="button" onClick={() => scrollToSection('publications')}>Publications</button></li>
                    <li><button type="button" onClick={() => scrollToSection('media')}>Media</button></li>
                    <li><button type="button" onClick={() => scrollToSection('gallery')}>Gallery</button></li>
                    <li><button type="button" onClick={() => scrollToSection('contact')}>Contact</button></li>
                    <li>
                        <Link
                            to="/login"
                            style={{
                                color: '#FFB81C',
                                fontWeight: '700',
                                padding: '20px 16px',
                                display: 'block',
                                textDecoration: 'none',
                                fontSize: '0.92rem',
                                letterSpacing: '0.3px',
                            }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                    </li>
                </ul>

                <button
                    type="button"
                    className="acad-hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </nav>

            {/* ===== HERO ===== */}
            <section className="acad-hero" id="hero">
                <div className="acad-hero-content">
                    <p className="hero-role">Professor of Health Informatics</p>
                    <h1>Dr. Admin Name</h1>
                    <p className="hero-institution">Department of Health Sciences &mdash; University of Research Excellence</p>
                    <p className="hero-tagline">
                        Advancing health outcomes through innovative digital survey platforms,
                        data-driven research, and community-centered technology solutions.
                    </p>
                    <div className="hero-buttons">
                        <button
                            type="button"
                            className="acad-btn acad-btn-gold"
                            onClick={() => scrollToSection('research')}
                        >
                            View Research
                        </button>
                        <button
                            type="button"
                            className="acad-btn acad-btn-outline"
                            onClick={() => scrollToSection('contact')}
                        >
                            Get in Touch
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== ABOUT THE ADMIN ===== */}
            <section className="acad-section acad-section-white" id="about">
                <div className="acad-container">
                    <div className="acad-about-grid">
                        <div className="acad-about-photo">
                            <div className="photo-placeholder">{'\u{1F464}'}</div>
                        </div>
                        <div className="acad-about-info">
                            <h2>Dr. Admin Name</h2>
                            <p className="about-role">Professor of Health Informatics</p>
                            <p className="about-institution">University of Research Excellence</p>
                            <hr className="acad-gold-divider" />
                            <p className="about-bio">
                                Dr. Admin Name is a distinguished researcher and academic with over 15 years of
                                experience in health informatics, digital survey design, and community health assessment.
                                Their work focuses on leveraging technology to bridge gaps in healthcare delivery
                                and empower communities through data-driven insights.
                            </p>
                            <p className="about-bio">
                                With a portfolio of peer-reviewed publications and international collaborations,
                                Dr. Name has been recognized for pioneering digital health survey methodologies
                                that have been adopted by organizations across three continents.
                            </p>
                            <ul className="about-details">
                                <li>
                                    <span className="detail-icon">{'\u{2726}'}</span>
                                    <span>15+ Years of Research Experience</span>
                                </li>
                                <li>
                                    <span className="detail-icon">{'\u{2726}'}</span>
                                    <span>50+ Peer-Reviewed Publications</span>
                                </li>
                                <li>
                                    <span className="detail-icon">{'\u{2726}'}</span>
                                    <span>Best Paper Award, GHIS 2024</span>
                                </li>
                                <li>
                                    <span className="detail-icon">{'\u{2726}'}</span>
                                    <span>WHO Digital Health Advisor</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== RESEARCH / WORK ===== */}
            <section className="acad-section acad-section-grey" id="research">
                <div className="acad-container">
                    <div className="acad-section-header">
                        <h2>Research &amp; Work</h2>
                        <p>
                            Exploring the intersection of technology, health, and community to create
                            impactful, scalable, and human-centered solutions.
                        </p>
                    </div>
                    <div className="acad-cards-grid">
                        {researchAreas.map((area, i) => (
                            <div className="acad-card" key={i}>
                                <div className="acad-card-icon">{area.icon}</div>
                                <h3>{area.title}</h3>
                                <p>{area.description}</p>
                                <span className="acad-card-link">
                                    Learn More &rarr;
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PUBLICATIONS ===== */}
            <section className="acad-section acad-section-white" id="publications">
                <div className="acad-container">
                    <div className="acad-section-header">
                        <h2>Publications</h2>
                        <p>
                            Selected peer-reviewed articles, conference papers, and book chapters
                            contributing to the fields of health informatics and digital health.
                        </p>
                    </div>
                    <div className="acad-pub-list">
                        {publications.map((pub, i) => (
                            <div
                                className={`acad-pub-item ${pub.featured ? 'featured' : ''}`}
                                key={i}
                            >
                                <div className="pub-title">{pub.title}</div>
                                <div className="pub-meta">
                                    <span>{pub.journal}</span>
                                    <span>&bull; {pub.year}</span>
                                </div>
                                <div className="acad-pub-tags">
                                    {pub.featured && (
                                        <span className="acad-pub-tag featured-tag">Featured</span>
                                    )}
                                    {pub.tags.map((tag, j) => (
                                        <span className="acad-pub-tag" key={j}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== MEDIA / TALKS ===== */}
            <section className="acad-section acad-section-grey" id="media">
                <div className="acad-container">
                    <div className="acad-section-header">
                        <h2>Media &amp; Talks</h2>
                        <p>
                            Conference keynotes, invited talks, interviews, and workshop presentations.
                        </p>
                    </div>
                    <div className="acad-media-grid">
                        {mediaTalks.map((item, i) => (
                            <div className="acad-media-card" key={i}>
                                <div className="acad-media-thumbnail">
                                    <span className="media-type-badge">{item.type}</span>
                                    <div className="play-icon" />
                                </div>
                                <div className="acad-media-body">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== GALLERY ===== */}
            <section className="acad-section acad-section-white" id="gallery">
                <div className="acad-container">
                    <div className="acad-section-header">
                        <h2>Gallery</h2>
                        <p>
                            Highlights from conferences, research activities, awards, and academic events.
                        </p>
                    </div>
                    <div className="acad-gallery-grid">
                        {galleryItems.map((item, i) => (
                            <div className="acad-gallery-item" key={i}>
                                <div className="gallery-placeholder">{item.placeholder}</div>
                                <div className="gallery-overlay">
                                    <p>{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CONTACT ===== */}
            <section className="acad-section acad-section-grey" id="contact">
                <div className="acad-container">
                    <div className="acad-section-header">
                        <h2>Contact</h2>
                        <p>
                            For collaborations, speaking engagements, or research inquiries.
                        </p>
                    </div>
                    <div className="acad-contact-grid">
                        <div className="acad-contact-info">
                            <div className="acad-contact-item">
                                <div className="contact-icon">{'\u{2709}'}</div>
                                <div className="contact-text">
                                    <h3>Email</h3>
                                    <p>
                                        <a href="mailto:admin@university.edu">admin@university.edu</a>
                                    </p>
                                </div>
                            </div>
                            <div className="acad-contact-item">
                                <div className="contact-icon">{'\u{1F3E2}'}</div>
                                <div className="contact-text">
                                    <h3>Institution</h3>
                                    <p>University of Research Excellence</p>
                                </div>
                            </div>
                            <div className="acad-contact-item">
                                <div className="contact-icon">{'\u{1F4CD}'}</div>
                                <div className="contact-text">
                                    <h3>Office</h3>
                                    <p>Room 412, Health Sciences Building<br />123 Academic Drive, Research City</p>
                                </div>
                            </div>
                            <div className="acad-contact-item">
                                <div className="contact-icon">{'\u{260E}'}</div>
                                <div className="contact-text">
                                    <h3>Phone</h3>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>

                        <div className="acad-contact-links">
                            <h2>Professional Profiles</h2>
                            <a
                                href="https://scholar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="acad-link-btn"
                            >
                                <span className="link-icon">{'\u{1F393}'}</span>
                                Google Scholar
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="acad-link-btn"
                            >
                                <span className="link-icon">{'\u{1F517}'}</span>
                                LinkedIn
                            </a>
                            <a
                                href="https://orcid.org"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="acad-link-btn"
                            >
                                <span className="link-icon">{'\u{1F194}'}</span>
                                ORCID
                            </a>
                            <a
                                href="https://researchgate.net"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="acad-link-btn"
                            >
                                <span className="link-icon">{'\u{1F52C}'}</span>
                                ResearchGate
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="acad-footer">
                <div className="acad-container">
                    <div className="acad-footer-grid">
                        <div>
                            <div className="acad-footer-brand">
                                Survey<span className="brand-accent">Pro</span>
                            </div>
                            <p>
                                A professional academic research and survey platform dedicated to
                                advancing knowledge through innovative digital tools and data-driven insight.
                            </p>
                        </div>
                        <div>
                            <h4>Quick Links</h4>
                            <ul className="acad-footer-links">
                                <li><button type="button" onClick={() => scrollToSection('hero')}>Home</button></li>
                                <li><button type="button" onClick={() => scrollToSection('about')}>About</button></li>
                                <li><button type="button" onClick={() => scrollToSection('research')}>Research</button></li>
                                <li><button type="button" onClick={() => scrollToSection('publications')}>Publications</button></li>
                                <li><button type="button" onClick={() => scrollToSection('gallery')}>Gallery</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Contact</h4>
                            <ul className="acad-footer-links">
                                <li><a href="mailto:admin@university.edu">admin@university.edu</a></li>
                                <li><button type="button" onClick={() => scrollToSection('media')}>Media &amp; Talks</button></li>
                                <li><button type="button" onClick={() => scrollToSection('contact')}>Contact Info</button></li>
                                <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="acad-footer-bottom">
                        <p>&copy; {new Date().getFullYear()} SurveyPro &mdash; Academic Research Platform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
