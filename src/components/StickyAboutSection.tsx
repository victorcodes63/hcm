'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Target, Eye, Heart, Users, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const StickyAboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end start"]
  });

  // Images for flipbook effect - using your uploaded images
  const aboutImages = [
    '/images/about/main_1.jpeg', // Main image
    '/images/about/pic_1.jpeg', // Image 1
    '/images/about/pic_3.jpeg', // Image 2
    '/images/about/pic_4.jpeg', // Image 3
    '/images/about/5C73B2CE-5185-43B1-A31D-E554865181F1_1_201_a.jpeg', // Image 4
    '/images/about/C1DA58D7-86D6-4B35-B90C-C3C981540240_1_201_a.jpeg' // Image 5
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Calculate which image should be shown based on scroll progress (desktop only)
  useEffect(() => {
    if (isMobile) return;
    
    const unsubscribe = scrollYProgress.onChange((latest) => {
      const totalImages = aboutImages.length;
      
      // Ensure we see all images including the first and last
      let imageIndex;
      
      if (latest <= 0.1) {
        imageIndex = 0; // First image (0-10% scroll)
      } else if (latest <= 0.25) {
        imageIndex = 1; // Second image (10-25% scroll)
      } else if (latest <= 0.4) {
        imageIndex = 2; // Third image (25-40% scroll)
      } else if (latest <= 0.55) {
        imageIndex = 3; // Fourth image (40-55% scroll)
      } else if (latest <= 0.7) {
        imageIndex = 4; // Fifth image (55-70% scroll)
      } else {
        imageIndex = 5; // Last image (70-100% scroll) - Shows much earlier!
      }
      
      setCurrentImageIndex(imageIndex);
    });

    return unsubscribe;
  }, [scrollYProgress, aboutImages.length, isMobile]);

  // Mobile slider navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);
  };

  const values = [
    {
      icon: Target,
      title: 'Mission',
      description: 'To deliver exceptional HR solutions that empower organizations to achieve their full potential through their greatest asset - their people.'
    },
    {
      icon: Eye,
      title: 'Vision',
      description: 'To be the leading HR consulting firm in East Africa, recognized for excellence, innovation, and transformative impact.'
    },
    {
      icon: Heart,
      title: 'Values',
      description: 'Integrity, excellence, innovation, and client-centricity guide everything we do in our commitment to HR excellence.'
    }
  ];

  const achievements = [
    '7+ Years of HR Excellence',
    '500+ Companies Served',
    '2000+ Successful Placements',
    '98% Client Satisfaction Rate'
  ];

  return (
    <section ref={containerRef} className={`relative ${isMobile ? 'min-h-auto' : 'min-h-[300vh]'} bg-gradient-to-b from-white via-neutral-50 to-white`}>
      {/* Desktop Sticky Container */}
      {!isMobile && (
        <div className="sticky top-0 h-screen flex items-center z-10 bg-gradient-to-b from-white/70 via-white/55 to-white/70 backdrop-blur-sm overflow-hidden">
          {/* Desktop blob layer */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -18, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-24 -top-16 h-[24rem] w-[24rem] rounded-full bg-secondary-500/35 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -26, 0], y: [0, 14, 0], scale: [1.1, 1, 1.1] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-10 top-8 h-72 w-72 rounded-full bg-primary-300/35 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -16, 0], y: [0, 20, 0], scale: [1.05, 1.2, 1.05] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[-3rem] right-20 h-64 w-64 rounded-full bg-secondary-400/28 blur-3xl"
            />
          </div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
          {/* Centered Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-full text-sm font-semibold shadow-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              About Eagle HR
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Left Content - Flipbook Images (Larger) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 lg:col-span-2"
            >
              <div className="relative h-[350px] md:h-[450px] lg:h-[500px] w-full overflow-hidden rounded-xl">
                {/* Flipbook Images */}
                {aboutImages.map((image, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: currentImageIndex === index ? 1 : 0,
                      scale: currentImageIndex === index ? 1 : 1.05
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Eagle HR ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  </motion.div>
                ))}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary-900">
                  {currentImageIndex + 1} / {aboutImages.length}
                </div>

                {/* Scroll Progress Indicator */}
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3">
                  <div className="w-4 h-4 md:w-6 md:h-6 border-2 border-primary-900 rounded-full flex items-center justify-center">
                    <motion.div 
                      className="w-1 h-1 md:w-2 md:h-2 bg-primary-900 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Minimal Text */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 lg:col-span-1 flex flex-col justify-center h-auto lg:h-[500px]"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-primary-900 mb-4">
                    <span className="block">Your Partner</span>
                    <span className="block text-secondary-500 mt-2">in HR Excellence</span>
                  </h2>
                  
                  <div className="space-y-3 mb-6">
                    <p className="text-sm md:text-base lg:text-lg text-neutral-700 leading-relaxed">
                      Founded in 2017, Eagle HR Consultants emerged as a response to the growing need for professional HR services in Kenya&apos;s rapidly expanding business landscape.
                    </p>
                    
                    <p className="text-sm md:text-base lg:text-lg text-neutral-700 leading-relaxed">
                      Starting with a small team of HR experts, we quickly established ourselves as trusted partners for organizations seeking to optimize their human capital.
                    </p>
                    
                    <p className="text-sm md:text-base lg:text-lg text-neutral-700 leading-relaxed">
                      Today, we serve over 100 companies across diverse industries, combining deep local market knowledge with international best practices to deliver transformative HR solutions.
                    </p>
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href="/about"
                    className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm md:text-base"
                  >
                    Learn More About Us
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
      )}

      {/* Mobile/Tablet Layout */}
      {isMobile && (
        <div className="py-16 bg-gradient-to-b from-white/75 via-white/60 to-white/75 backdrop-blur-sm relative overflow-hidden">
          {/* Mobile blob layer */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <motion.div
              animate={{ x: [0, 16, 0], y: [0, -12, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-secondary-500/30 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -14, 0], y: [0, 10, 0], scale: [1.1, 1, 1.1] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-[-3rem] bottom-8 h-52 w-52 rounded-full bg-primary-300/30 blur-3xl"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Centered Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-full text-sm font-semibold shadow-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                About Eagle HR
              </motion.div>
            </motion.div>

            <div className="grid gap-8">
              {/* Mobile Image Slider */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-xl">
                  {/* Current Image */}
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={aboutImages[currentImageIndex]}
                      alt={`Eagle HR ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      priority={currentImageIndex === 0}
                    />
                    
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  </motion.div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary-900" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
                  >
                    <ChevronRight className="w-5 h-5 text-primary-900" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary-900">
                    {currentImageIndex + 1} / {aboutImages.length}
                  </div>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {aboutImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mobile Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">
                  <span className="block">Your Partner</span>
                  <span className="block text-secondary-500 mt-2">in HR Excellence</span>
                </h2>
                
                <div className="space-y-4 mb-8">
                  <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
                    Founded in 2017, Eagle HR Consultants emerged as a response to the growing need for professional HR services in Kenya&apos;s rapidly expanding business landscape.
                  </p>
                  
                  <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
                    Starting with a small team of HR experts, we quickly established ourselves as trusted partners for organizations seeking to optimize their human capital.
                  </p>
                  
                  <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
                    Today, we serve over 100 companies across diverse industries, combining deep local market knowledge with international best practices to deliver transformative HR solutions.
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href="/about"
                  className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Learn More About Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      )}
      
      {/* Section Boundary - Prevents overflow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
    </section>
  );
};

export default StickyAboutSection;
