import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  ArrowRight, 
  Mail, 
  MapPin, 
  Github,
  Globe,
  Palette,
  ShoppingCart,
  RefreshCw,
  Code,
  CheckCircle,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navbar = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#process", label: "Process" },
    { href: "#contact", label: "Contact" },
  ];

  const scrollToSection = (href) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-4' : 'py-6'
        }`}
        data-testid="navbar"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
            className="flex items-center gap-2"
            data-testid="logo"
          >
            <span className="font-heading text-2xl font-bold text-roshka-gold">ROSHKA</span>
            <span className="font-heading text-2xl font-light text-roshka-text">STUDIO</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className={`font-body text-sm tracking-wide transition-colors duration-300 ${
                  activeSection === link.href.slice(1) 
                    ? 'text-roshka-gold' 
                    : 'text-roshka-text-secondary hover:text-roshka-gold'
                }`}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}
              className="btn-gold text-sm px-6 py-3"
              data-testid="nav-start-project"
            >
              Start Project
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-roshka-text p-2"
            data-testid="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay"
            data-testid="mobile-menu"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-roshka-text p-2"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="font-heading text-3xl text-roshka-text hover:text-roshka-gold transition-colors"
                  data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="btn-gold text-lg mt-4"
                data-testid="mobile-start-project"
              >
                Start Project
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hero Section
const HeroSection = () => {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 hero-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80')`
        }}
      />
      
      {/* Abstract shapes */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-roshka-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-roshka-gold/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-6 block">
            Silver Spring, MD
          </span>
          
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight">
            <span className="text-roshka-text">Crafting</span>
            <br />
            <span className="text-gold-gradient">Digital Legacies</span>
          </h1>
          
          <p className="font-body text-roshka-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            We design and develop modern websites that elevate your brand 
            and transform visitors into loyal clients.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={scrollToPortfolio}
              className="btn-outline flex items-center gap-2"
              data-testid="hero-view-work"
            >
              View Our Work
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={scrollToContact}
              className="btn-gold flex items-center gap-2"
              data-testid="hero-start-project"
            >
              Start Your Project
              <Sparkles size={18} />
            </button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={32} className="text-roshka-gold/50" />
        </motion.div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const services = [
    {
      icon: Globe,
      title: "Business Website",
      description: "Custom-designed professional websites that elevate your brand and convert visitors into clients.",
      features: ["Custom Design", "Mobile Responsive", "SEO Optimized"]
    },
    {
      icon: Palette,
      title: "Landing Page",
      description: "High-converting landing pages designed to capture leads and drive specific actions.",
      features: ["Conversion Focused", "A/B Testing Ready", "Fast Loading"]
    },
    {
      icon: ShoppingCart,
      title: "E-commerce",
      description: "Full-featured online stores with secure payments and inventory management.",
      features: ["Product Catalog", "Secure Checkout", "Order Management"]
    },
    {
      icon: RefreshCw,
      title: "Website Redesign",
      description: "Transform your outdated website into a modern, high-performing digital experience.",
      features: ["UX Audit", "Modern Design", "Performance Boost"]
    },
    {
      icon: Code,
      title: "Custom Project",
      description: "Unique digital solutions tailored to your specific business needs and goals.",
      features: ["Custom Features", "API Integration", "Full Support"]
    }
  ];

  return (
    <section id="services" className="py-24 md:py-32 relative" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 block">
            What We Create
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-roshka-text mb-6">
            Our Services
          </h2>
          <p className="font-body text-roshka-text-secondary max-w-2xl mx-auto">
            From sleek business websites to complex e-commerce platforms, 
            we deliver digital solutions that drive results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="service-card glass rounded-xl p-8 group"
              data-testid={`service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-14 h-14 rounded-lg bg-roshka-gold/10 flex items-center justify-center mb-6 group-hover:bg-roshka-gold/20 transition-colors">
                <service.icon size={28} className="text-roshka-gold" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-roshka-text mb-3">
                {service.title}
              </h3>
              <p className="font-body text-roshka-text-secondary text-sm mb-6 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature) => (
                  <span 
                    key={feature}
                    className="text-xs font-body text-roshka-gold bg-roshka-gold/10 px-3 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 relative" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 block">
              About Us
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-roshka-text mb-6">
              We Build Digital <span className="text-gold-gradient">Experiences</span>
            </h2>
            <p className="font-body text-roshka-text-secondary mb-6 leading-relaxed">
              ROSHKA STUDIO is a creative web studio based in Silver Spring, MD. 
              We specialize in designing and developing modern websites that help 
              businesses stand out in the digital landscape.
            </p>
            <p className="font-body text-roshka-text-secondary mb-8 leading-relaxed">
              Our approach combines innovative design thinking with cutting-edge 
              technology to create websites that are not just beautiful, but also 
              highly functional and conversion-focused.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: "50+", label: "Projects Completed" },
                { number: "100%", label: "Client Satisfaction" },
                { number: "5+", label: "Years Experience" },
                { number: "24/7", label: "Support Available" }
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-lg p-4">
                  <div className="font-heading text-3xl font-bold text-roshka-gold mb-1">
                    {stat.number}
                  </div>
                  <div className="font-body text-sm text-roshka-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                alt="Modern creative studio workspace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 glass rounded-xl p-6 max-w-xs">
              <Sparkles size={24} className="text-roshka-gold mb-2" />
              <p className="font-body text-sm text-roshka-text">
                "Innovation and creativity drive every project we undertake."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Portfolio Section
const PortfolioSection = () => {
  const portfolioItems = [
    {
      title: "Your Project Here",
      category: "Business Website",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
    },
    {
      title: "Your Project Here",
      category: "E-commerce",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
    },
    {
      title: "Your Project Here",
      category: "Landing Page",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80"
    },
    {
      title: "Your Project Here",
      category: "Custom Project",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80"
    }
  ];

  return (
    <section id="portfolio" className="py-24 md:py-32 relative" data-testid="portfolio-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 block">
            Our Work
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-roshka-text mb-6">
            Portfolio
          </h2>
          <p className="font-body text-roshka-text-secondary max-w-2xl mx-auto">
            Explore our latest projects. Your project could be featured here next.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer"
              data-testid={`portfolio-item-${index}`}
            >
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-roshka-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <span className="font-mono text-xs text-roshka-gold uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="font-heading text-xl text-roshka-text mt-2">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="font-body text-roshka-text-secondary mb-4">
            Want your project featured here?
          </p>
          <a
            href="#contact"
            onClick={(e) => { 
              e.preventDefault(); 
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-gold inline-flex items-center gap-2"
            data-testid="portfolio-start-project"
          >
            Start Your Project
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// Process Section
const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Discovery",
      description: "We start by understanding your business, goals, and target audience to create a tailored strategy."
    },
    {
      number: "02",
      title: "Design",
      description: "Our designers create stunning mockups that capture your brand essence and user experience."
    },
    {
      number: "03",
      title: "Development",
      description: "We build your website using modern technologies ensuring speed, security, and scalability."
    },
    {
      number: "04",
      title: "Launch",
      description: "After thorough testing, we launch your website and provide ongoing support and maintenance."
    }
  ];

  return (
    <section id="process" className="py-24 md:py-32 relative" data-testid="process-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 block">
            How We Work
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-roshka-text mb-6">
            Our Process
          </h2>
          <p className="font-body text-roshka-text-secondary max-w-2xl mx-auto">
            A streamlined approach to bringing your digital vision to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
              data-testid={`process-step-${index + 1}`}
            >
              <div className="glass rounded-xl p-8 h-full relative z-10">
                <span className="font-mono text-4xl font-bold text-roshka-gold/20 mb-4 block">
                  {step.number}
                </span>
                <h3 className="font-heading text-xl font-semibold text-roshka-text mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-roshka-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-roshka-gold/30 z-0" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section with Form
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service_type: '',
    project_description: '',
    budget: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/inquiries`, formData);
      setSubmitted(true);
      toast.success('Your inquiry has been submitted successfully!');
      setFormData({
        name: '',
        email: '',
        service_type: '',
        project_description: '',
        budget: '',
        timeline: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 block">
              Get In Touch
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-roshka-text mb-6">
              Let's Create Something <span className="text-gold-gradient">Amazing</span>
            </h2>
            <p className="font-body text-roshka-text-secondary mb-8 leading-relaxed">
              Ready to transform your digital presence? Fill out the form and we'll 
              get back to you within 24 hours to discuss your project.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-roshka-gold/10 flex items-center justify-center">
                  <Mail size={20} className="text-roshka-gold" />
                </div>
                <div>
                  <div className="font-body text-sm text-roshka-text-secondary">Email</div>
                  <a 
                    href="mailto:ogrisko54@gmail.com" 
                    className="font-body text-roshka-text hover:text-roshka-gold transition-colors"
                    data-testid="contact-email"
                  >
                    ogrisko54@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-roshka-gold/10 flex items-center justify-center">
                  <MapPin size={20} className="text-roshka-gold" />
                </div>
                <div>
                  <div className="font-body text-sm text-roshka-text-secondary">Location</div>
                  <span className="font-body text-roshka-text">Silver Spring, MD</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {submitted ? (
              <div className="glass rounded-xl p-12 text-center">
                <CheckCircle size={64} className="text-roshka-gold mx-auto mb-6" />
                <h3 className="font-heading text-2xl font-bold text-roshka-text mb-4">
                  Thank You!
                </h3>
                <p className="font-body text-roshka-text-secondary mb-6">
                  Your inquiry has been received. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline"
                  data-testid="submit-another"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-xl p-8" data-testid="contact-form">
                <div className="grid gap-6">
                  <div>
                    <label className="font-body text-sm text-roshka-text-secondary mb-2 block">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="John Doe"
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm text-roshka-text-secondary mb-2 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="john@example.com"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm text-roshka-text-secondary mb-2 block">
                      Service Type *
                    </label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      required
                      className="form-input"
                      data-testid="select-service"
                    >
                      <option value="">Select a service</option>
                      <option value="Business Website">Business Website</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Redesign">Website Redesign</option>
                      <option value="Custom Project">Custom Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-body text-sm text-roshka-text-secondary mb-2 block">
                      Project Description *
                    </label>
                    <textarea
                      name="project_description"
                      value={formData.project_description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="form-input resize-none"
                      placeholder="Tell us about your project..."
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-sm text-roshka-text-secondary mb-2 block">
                        Budget Range
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="form-input"
                        data-testid="select-budget"
                      >
                        <option value="">Select budget</option>
                        <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                        <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000+">$10,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-body text-sm text-roshka-text-secondary mb-2 block">
                        Timeline
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="form-input"
                        data-testid="select-timeline"
                      >
                        <option value="">Select timeline</option>
                        <option value="ASAP">ASAP</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="1 month">1 month</option>
                        <option value="2-3 months">2-3 months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">
                          <RefreshCw size={18} />
                        </span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-white/5" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-roshka-gold">ROSHKA</span>
            <span className="font-heading text-xl font-light text-roshka-text">STUDIO</span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-roshka-text-secondary hover:text-roshka-gold transition-colors"
              data-testid="footer-github"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a 
              href="mailto:ogrisko54@gmail.com"
              className="text-roshka-text-secondary hover:text-roshka-gold transition-colors"
              data-testid="footer-email"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>

          <p className="font-body text-sm text-roshka-text-secondary">
            &copy; {currentYear} ROSHKA STUDIO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'about', 'portfolio', 'process', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-roshka-bg">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0A0A0A',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#F5F5F5',
          },
        }}
      />
      <Navbar activeSection={activeSection} />
      <main>
        <HeroSection />
        <div className="section-divider" />
        <ServicesSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <PortfolioSection />
        <div className="section-divider" />
        <ProcessSection />
        <div className="section-divider" />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
