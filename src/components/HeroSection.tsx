'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  // Text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  // Client logos data
  const clients = [
    { name: "Central Bank of Kenya", logo: "/images/clients/cbk_loho.png" },
    { name: "Kenya Development Corporation", logo: "/images/clients/kdc_logo.png" },
    { name: "ICPAK", logo: "/images/clients/icpak_logo.png" },
    { name: "KeNIC", logo: "/images/clients/KeNIC_Logo.png" },
    { name: "KEBS", logo: "/images/clients/KEBS_Logo.png" },
    { name: "Consolidated Bank", logo: "/images/clients/consolidated_logo.webp" },
    { name: "Kenya Re", logo: "/images/clients/kenyare_logo.png" },
    { name: "TARDA", logo: "/images/clients/tarda_logo.png" },
    { name: "Pacida", logo: "/images/clients/Pacida Logo.png" },
    { name: "WSUP", logo: "/images/clients/WSUP_logo.png" },
    { name: "CMA", logo: "/images/clients/cma_logo.png" },
    { name: "Kimisitu", logo: "/images/clients/kimisitu_logo.png" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
          style={{
            backgroundImage: 'url(/images/hero/Reception_comp.webp)'
          }}
        />
        {/* White Overlay */}
        <div className="absolute inset-0 bg-white/50" />
      </div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center min-h-screen">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 bg-primary-100 backdrop-blur-sm rounded-full text-sm font-medium text-primary-800 mb-8"
          >
            <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2 animate-pulse"></span>
            Leading HR Excellence in Kenya
          </motion.div>
          
          {/* Main Heading */}
          <motion.div
            variants={textVariants}
            className="space-y-6 mb-8"
          >
            <motion.h1 
              variants={textVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium leading-tight text-primary-900"
            >
              Transforming Your
              <motion.span 
                variants={textVariants}
                className="block text-secondary-500 mt-2"
              >
                Human Resources
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={textVariants}
              className="text-lg md:text-xl text-primary-700 max-w-3xl mx-auto leading-relaxed"
            >
              Building stronger organizations through tailored HR solutions and workforce transformation.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/contact"
                className="group bg-secondary-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-secondary-600 hover:shadow-lg transform transition-all duration-300 flex items-center justify-center"
              >
                Partner With Us
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/services"
                className="group border-2 border-primary-300 text-primary-800 px-8 py-4 rounded-lg font-medium text-lg hover:bg-primary-50 hover:border-primary-400 transition-all duration-300 flex items-center justify-center"
              >
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Client Logos Ticker - Integrated into Hero */}
        <div className="absolute bottom-8 left-0 right-0">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center text-sm font-medium text-primary-600 mb-6"
          >
            Trusted by leading organizations across Kenya and beyond
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="relative overflow-hidden"
          >
            {/* Infinite scrolling ticker */}
            <div className="flex animate-scroll">
              {/* First set of logos */}
              {clients.map((client, index) => (
                <motion.div
                  key={`first-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                  className="flex-shrink-0 mx-8 flex items-center justify-center h-16"
                >
                  <img 
                    src={client.logo} 
                    alt={client.name}
                    className={`${client.name === 'WSUP' ? 'h-16 w-40' : client.name === 'KEBS' ? 'h-16 w-auto' : client.name === 'Consolidated Bank' ? 'h-16 w-auto' : client.name === 'Kenya Development Corporation' ? 'h-16 w-auto' : client.name === 'TARDA' ? 'h-14 w-auto' : client.name === 'Pacida' ? 'h-8 w-auto' : client.name === 'CMA' ? 'h-8 w-auto' : client.name === 'ICPAK' ? 'h-8 w-auto' : 'h-12 w-auto'} object-contain filter brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-300 opacity-60 hover:opacity-100`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-primary-600 font-medium text-xs hidden">{client.name}</span>
                </motion.div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {clients.map((client, index) => (
                <motion.div
                  key={`second-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                  className="flex-shrink-0 mx-8 flex items-center justify-center h-16"
                >
                  <img 
                    src={client.logo} 
                    alt={client.name}
                    className={`${client.name === 'WSUP' ? 'h-16 w-40' : client.name === 'KEBS' ? 'h-16 w-auto' : client.name === 'Consolidated Bank' ? 'h-16 w-auto' : client.name === 'Kenya Development Corporation' ? 'h-16 w-auto' : client.name === 'TARDA' ? 'h-14 w-auto' : client.name === 'Pacida' ? 'h-8 w-auto' : client.name === 'CMA' ? 'h-8 w-auto' : client.name === 'ICPAK' ? 'h-8 w-auto' : 'h-12 w-auto'} object-contain filter brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-300 opacity-60 hover:opacity-100`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-primary-600 font-medium text-xs hidden">{client.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>


      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-20 w-20 h-20 bg-secondary-500/20 rounded-full blur-xl"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-40 left-20 w-32 h-32 bg-primary-500/20 rounded-full blur-xl"
      />

    </section>
  );
};

export default HeroSection;