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
  ChevronDown,
  Star,
  Zap,
  Award
} from "lucide-react";
import Luxe1 from './assets/Luxe1.png';
import Luxe2 from './assets/Luxe2.png';
import Luxe3 from './assets/Luxe3.png';
import Luxe4 from './assets/Luxe4.png';
import Luxe5 from './assets/Luxe5.png';

import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./components/ui/carousel";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component with Fixed Mobile Menu
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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-4' : 'py-6 bg-roshka-bg/80 backdrop-blur-sm'
        }`}
        data-testid="navbar"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
            className="flex items-center gap-2 z-50"
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
            className="md:hidden text-roshka-text p-2 z-50 relative"
            data-testid="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X size={28} className="text-roshka-gold" /> : <Menu size={28} />}
            </motion.div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay - FIXED */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
            data-testid="mobile-menu"
          >
            {/* Background overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-roshka-bg/98 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
              {/* Decorative elements */}
              <div className="absolute top-20 left-10 w-32 h-32 bg-roshka-gold/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-roshka-gold/5 rounded-full blur-3xl" />
              
              <nav className="flex flex-col items-center gap-6">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className={`font-heading text-3xl sm:text-4xl transition-all duration-300 ${
                      activeSection === link.href.slice(1)
                        ? 'text-roshka-gold'
                        : 'text-roshka-text hover:text-roshka-gold'
                    }`}
                    data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </motion.a>
                ))}
                
                <motion.a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: navLinks.length * 0.08 }}
                  className="btn-gold text-lg mt-8 px-10 py-4"
                  data-testid="mobile-start-project"
                >
                  Start Your Project
                </motion.a>
              </nav>
              
              {/* Bottom decoration */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 text-center"
              >
                <p className="font-mono text-xs text-roshka-gold/50 tracking-widest">
                  SILVER SPRING, MD
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Enhanced Hero Section
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
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
      data-testid="hero-section"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-roshka-bg" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-roshka-gold/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-roshka-gold/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-roshka-gold/3 rounded-full blur-[150px]" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-8 px-4 py-2 rounded-full border border-roshka-gold/20 bg-roshka-gold/5"
          >
            <Star size={12} className="fill-roshka-gold" />
            Silver Spring, MD
            <Star size={12} className="fill-roshka-gold" />
          </motion.span>
          
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-[1.1]">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-roshka-text block"
            >
              Crafting
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gold-gradient block"
            >
              Digital Legacies
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="font-body text-roshka-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            We design and develop modern websites that elevate your brand 
            and transform visitors into loyal clients.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={scrollToPortfolio}
              className="group btn-outline flex items-center gap-2 hover:bg-roshka-gold/10"
              data-testid="hero-view-work"
            >
              View Our Work
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={scrollToContact}
              className="group btn-gold flex items-center gap-2"
              data-testid="hero-start-project"
            >
              <Sparkles size={18} />
              Start Your Project
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-mono text-[10px] text-roshka-gold/50 tracking-widest">SCROLL</span>
            <ChevronDown size={24} className="text-roshka-gold/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Services Section
const ServicesSection = () => {
  const services = [
    {
      icon: Globe,
      title: "Business Website",
      description: "Custom-designed professional websites that elevate your brand and convert visitors into clients.",
      features: ["Custom Design", "Mobile Responsive", "SEO Optimized"],
      gradient: "from-blue-500/20 to-purple-500/20"
    },

    {
      icon: Palette,
      title: "Landing Page",
      description: "High-converting landing pages designed to capture leads and drive specific actions.",
      features: ["Conversion Focused", "A/B Testing Ready", "Fast Loading"],
      gradient: "from-pink-500/20 to-orange-500/20"
    },
    {
      icon: ShoppingCart,
      title: "E-commerce",
      description: "Full-featured online stores with secure payments and inventory management.",
      features: ["Product Catalog", "Secure Checkout", "Order Management"],
      gradient: "from-green-500/20 to-teal-500/20"
    },
    {
      icon: RefreshCw,
      title: "Website Redesign",
      description: "Transform your outdated website into a modern, high-performing digital experience.",
      features: ["UX Audit", "Modern Design", "Performance Boost"],
      gradient: "from-yellow-500/20 to-red-500/20"
    },
    {
      icon: Code,
      title: "Custom Project",
      description: "Unique digital solutions tailored to your specific business needs and goals.",
      features: ["Custom Features", "API Integration", "Full Support"],
      gradient: "from-indigo-500/20 to-cyan-500/20"
    }
  ];

  return (
    <section id="services" className="py-24 md:py-32 relative" data-testid="services-section">
      {/* Background decoration */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-96 bg-roshka-gold/3 blur-[150px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 px-4 py-2 rounded-full border border-roshka-gold/20 bg-roshka-gold/5">
            <Zap size={12} />
            What We Create
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-roshka-text mb-6">
            Our <span className="text-gold-gradient">Services</span>
          </h2>
          <p className="font-body text-roshka-text-secondary max-w-2xl mx-auto text-lg">
            From sleek business websites to complex e-commerce platforms, 
            we deliver digital solutions that drive results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
              data-testid={`service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="service-card glass rounded-2xl p-8 h-full relative overflow-hidden">
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-roshka-gold/10 flex items-center justify-center mb-6 group-hover:bg-roshka-gold/20 group-hover:scale-110 transition-all duration-500">
                    <service.icon size={32} className="text-roshka-gold" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-roshka-text mb-4">
                    {service.title}
                  </h3>
                  <p className="font-body text-roshka-text-secondary mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span 
                        key={feature}
                        className="text-xs font-body text-roshka-gold bg-roshka-gold/10 px-3 py-1.5 rounded-full group-hover:bg-roshka-gold/20 transition-colors"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced About Section
const AboutSection = () => {
  const stats = [
    { number: "50+", label: "Projects Completed", icon: Award },
    { number: "100%", label: "Client Satisfaction", icon: Star },
    { number: "5+", label: "Years Experience", icon: Zap },
    { number: "24/7", label: "Support Available", icon: CheckCircle }
  ];

  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden" data-testid="about-section">
      {/* Background elements */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-roshka-gold/3 blur-[200px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 px-4 py-2 rounded-full border border-roshka-gold/20 bg-roshka-gold/5">
              <Sparkles size={12} />
              About Us
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-roshka-text mb-8 leading-tight">
              We Build Digital <span className="text-gold-gradient">Experiences</span>
            </h2>
            <p className="font-body text-roshka-text-secondary mb-6 text-lg leading-relaxed">
              ROSHKA STUDIO is a creative web studio based in Silver Spring, MD. 
              We specialize in designing and developing modern websites that help 
              businesses stand out in the digital landscape.
            </p>
            <p className="font-body text-roshka-text-secondary mb-10 text-lg leading-relaxed">
              Our approach combines innovative design thinking with cutting-edge 
              technology to create websites that are not just beautiful, but also 
              highly functional and conversion-focused.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-5 group hover:bg-roshka-gold/5 transition-colors"
                >
                  <stat.icon size={20} className="text-roshka-gold mb-2" />
                  <div className="font-heading text-3xl font-bold text-roshka-gold mb-1">
                    {stat.number}
                  </div>
                  <div className="font-body text-sm text-roshka-text-secondary">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main image */}
              <div className="aspect-[4/5] rounded-3xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Modern creative studio workspace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-roshka-bg via-transparent to-transparent" />
              </div>
              
              {/* Floating card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-6 -left-6 glass rounded-2xl p-6 max-w-xs shadow-glow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-roshka-gold/20 flex items-center justify-center">
                    <Sparkles size={20} className="text-roshka-gold" />
                  </div>
                  <span className="font-mono text-xs text-roshka-gold tracking-wider">OUR PHILOSOPHY</span>
                </div>
                <p className="font-body text-sm text-roshka-text leading-relaxed">
                  "Innovation and creativity drive every project we undertake."
                </p>
              </motion.div>
              
              {/* Decorative border */}
              <div className="absolute -inset-4 border border-roshka-gold/10 rounded-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Portfolio Section
const PortfolioSection = () => {
  const portfolioItems = [
    /*{
      title: "Your Project Here",
      category: "Business Website",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
      size: "large"
    },*/

    {
      title: "Luxe Lash Studio",
      category: "Business Website",
      size: "large",
      content: (
        <div className="relative group w-full h-[450px] md:h-[600px] bg-neutral-900 rounded-xl overflow-hidden">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
              }),
            ]}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Мы добавляем min-h-full, чтобы контент не мог стать меньше родителя */}
            <CarouselContent className="flex m-0 p-0 h-full" style={{ height: '100%', display: 'flex' }}>
              {[Luxe1, Luxe2, Luxe3, Luxe4, Luxe5].map((imgVar, index) => (
                <CarouselItem 
                  key={index} 
                  className="p-0 m-0"
                  style={{ 
                    minWidth: '100%', 
                    height: '100%',
                    flex: '0 0 100%' 
                  }}
                >
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img 
                      src={imgVar} 
                      alt={`Luxe ${index + 1}`} 
                      className="w-full h-full object-cover block"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Кнопки навигации */}
      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <CarouselPrevious className="pointer-events-auto static translate-x-0 bg-black/50 text-white border-none w-10 h-10 flex items-center justify-center rounded-full" />
        <CarouselNext className="pointer-events-auto static translate-x-0 bg-black/50 text-white border-none w-10 h-10 flex items-center justify-center rounded-full" />
      </div>
    </Carousel>
  </div>
)
    },

    {
      title: "Your Project Here",
      category: "E-commerce",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      size: "small"
    },
    {
      title: "Your Project Here",
      category: "Landing Page",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80",
      size: "small"
    },
    {
      title: "Your Project Here",
      category: "Custom Project",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80",
      size: "large"
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
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 px-4 py-2 rounded-full border border-roshka-gold/20 bg-roshka-gold/5">
            <Award size={12} />
            Our Work
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-roshka-text mb-6">
            <span className="text-gold-gradient">Portfolio</span>
          </h2>
          <p className="font-body text-roshka-text-secondary max-w-2xl mx-auto text-lg">
            Explore our latest projects. Your project could be featured here next.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                index === 0 ? 'md:col-span-2 aspect-[16/9]' : 
                index === 3 ? 'lg:col-span-2 aspect-[16/9]' : 
                'aspect-square'
              }`}
              data-testid={`portfolio-item-${index}`}
            >
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-roshka-bg via-roshka-bg/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="inline-block font-mono text-xs text-roshka-gold uppercase tracking-wider mb-2 px-3 py-1 rounded-full bg-roshka-gold/20">
                    {item.category}
                  </span>
                  <h3 className="font-heading text-2xl text-roshka-text">
                    {item.title}
                  </h3>
                </div>
              </div>
              
              {/* Hover border */}
              <div className="absolute inset-0 border-2 border-roshka-gold/0 group-hover:border-roshka-gold/30 rounded-2xl transition-colors duration-500" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="font-body text-roshka-text-secondary mb-6 text-lg">
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

// Enhanced Process Section
const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Discovery",
      description: "We start by understanding your business, goals, and target audience to create a tailored strategy.",
      icon: "🔍"
    },
    {
      number: "02",
      title: "Design",
      description: "Our designers create stunning mockups that capture your brand essence and user experience.",
      icon: "🎨"
    },
    {
      number: "03",
      title: "Development",
      description: "We build your website using modern technologies ensuring speed, security, and scalability.",
      icon: "⚡"
    },
    {
      number: "04",
      title: "Launch",
      description: "After thorough testing, we launch your website and provide ongoing support and maintenance.",
      icon: "🚀"
    }
  ];

  return (
    <section id="process" className="py-24 md:py-32 relative overflow-hidden" data-testid="process-section">
      {/* Background */}
      <div className="absolute inset-0 bg-roshka-surface/50" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-roshka-gold/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 px-4 py-2 rounded-full border border-roshka-gold/20 bg-roshka-gold/5">
            <Zap size={12} />
            How We Work
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-roshka-text mb-6">
            Our <span className="text-gold-gradient">Process</span>
          </h2>
          <p className="font-body text-roshka-text-secondary max-w-2xl mx-auto text-lg">
            A streamlined approach to bringing your digital vision to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-roshka-gold/20 via-roshka-gold/40 to-roshka-gold/20" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
              data-testid={`process-step-${index + 1}`}
            >
              <div className="glass rounded-2xl p-8 h-full relative group hover:bg-roshka-gold/5 transition-colors duration-500">
                {/* Step number circle */}
                <div className="w-12 h-12 rounded-full bg-roshka-gold/20 flex items-center justify-center mb-6 mx-auto lg:mx-0 group-hover:bg-roshka-gold group-hover:text-roshka-bg transition-all duration-500">
                  <span className="font-mono text-lg font-bold text-roshka-gold group-hover:text-roshka-bg">{step.number}</span>
                </div>
                
                <h3 className="font-heading text-2xl font-semibold text-roshka-text mb-4 text-center lg:text-left">
                  {step.title}
                </h3>
                <p className="font-body text-roshka-text-secondary leading-relaxed text-center lg:text-left">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Contact Section
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
      {/* Background */}
      <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-roshka-gold/5 blur-[200px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 font-mono text-xs text-roshka-gold tracking-[0.3em] uppercase mb-4 px-4 py-2 rounded-full border border-roshka-gold/20 bg-roshka-gold/5">
              <Mail size={12} />
              Get In Touch
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-roshka-text mb-8 leading-tight">
              Let's Create Something <span className="text-gold-gradient">Amazing</span>
            </h2>
            <p className="font-body text-roshka-text-secondary mb-10 text-lg leading-relaxed">
              Ready to transform your digital presence? Fill out the form and we'll 
              get back to you within 24 hours to discuss your project.
            </p>

            <div className="space-y-6">
              <motion.a 
                href="mailto:ogrisko54@gmail.com"
                className="flex items-center gap-4 group"
                whileHover={{ x: 5 }}
                data-testid="contact-email"
              >
                <div className="w-14 h-14 rounded-xl bg-roshka-gold/10 flex items-center justify-center group-hover:bg-roshka-gold/20 transition-colors">
                  <Mail size={24} className="text-roshka-gold" />
                </div>
                <div>
                  <div className="font-body text-sm text-roshka-text-secondary mb-1">Email</div>
                  <span className="font-body text-lg text-roshka-text group-hover:text-roshka-gold transition-colors">
                    ogrisko54@gmail.com
                  </span>
                </div>
              </motion.a>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-roshka-gold/10 flex items-center justify-center">
                  <MapPin size={24} className="text-roshka-gold" />
                </div>
                <div>
                  <div className="font-body text-sm text-roshka-text-secondary mb-1">Location</div>
                  <span className="font-body text-lg text-roshka-text">Silver Spring, MD</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {submitted ? (
              <div className="glass rounded-3xl p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle size={80} className="text-roshka-gold mx-auto mb-6" />
                </motion.div>
                <h3 className="font-heading text-3xl font-bold text-roshka-text mb-4">
                  Thank You!
                </h3>
                <p className="font-body text-roshka-text-secondary mb-8 text-lg">
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
              <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 md:p-10" data-testid="contact-form">
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
                    className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
                    data-testid="submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw size={20} />
                        </motion.span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight size={20} />
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

// Enhanced Footer
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 border-t border-white/5 relative" data-testid="footer">
      <div className="absolute inset-0 bg-roshka-surface/30" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold text-roshka-gold">ROSHKA</span>
            <span className="font-heading text-2xl font-light text-roshka-text">STUDIO</span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-roshka-gold/10 flex items-center justify-center hover:bg-roshka-gold/20 transition-colors"
              data-testid="footer-github"
              aria-label="GitHub"
            >
              <Github size={20} className="text-roshka-gold" />
            </a>
            <a 
              href="mailto:ogrisko54@gmail.com"
              className="w-12 h-12 rounded-full bg-roshka-gold/10 flex items-center justify-center hover:bg-roshka-gold/20 transition-colors"
              data-testid="footer-email"
              aria-label="Email"
            >
              <Mail size={20} className="text-roshka-gold" />
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
