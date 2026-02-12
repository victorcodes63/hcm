'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserSearch,
  Building2,
  BookOpen,
  ShieldCheck,
  TrendingUp, 
  Globe2,
  Brain,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const AccordionServicesSection = () => {
  const services = [
    {
      id: '1',
      title: 'Recruitment & Executive Search',
      icon: UserSearch,
      link: '/services/recruitment',
      image: '/images/about/main_1.jpeg',
      span: 'md:col-span-2 md:row-span-2',
    },
    {
      id: '2',
      title: 'HR Outsourcing',
      icon: Building2,
      link: '/services/hr-outsourcing',
      image: '/images/about/pic_1.jpeg',
      span: 'md:col-span-2',
    },
    {
      id: '3',
      title: 'Training & Development',
      icon: BookOpen,
      link: '/services/training-development',
      image: '/images/about/pic_3.jpeg',
      span: 'md:col-span-1',
    },
    {
      id: '4',
      title: 'HR Compliance & Legal',
      icon: ShieldCheck,
      link: '/services/hr-compliance',
      image: '/images/about/pic_4.jpeg',
      span: 'md:col-span-1',
    },
    {
      id: '5',
      title: 'Salary Surveys',
      icon: TrendingUp,
      link: '/services/salary-surveys',
      image: '/images/about/C1DA58D7-86D6-4B35-B90C-C3C981540240_1_201_a.jpeg',
      span: 'md:col-span-2',
    },
    {
      id: '6',
      title: 'EOR Services',
      icon: Globe2,
      link: '/services/eor-services',
      image: '/images/about/5C73B2CE-5185-43B1-A31D-E554865181F1_1_201_a.jpeg',
      span: 'md:col-span-1',
    },
    {
      id: '7',
      title: 'Psychometric Assessments',
      icon: Brain,
      link: '/services/psychometric-assessments',
      image: '/images/about/pic_1.jpeg',
      span: 'md:col-span-1',
    },
  ];

  return (
    <section className="mt-8 py-16 md:py-20 bg-gradient-to-br from-neutral-50 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements - Brand Orange Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Orange Blob - Top Left */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-secondary-500/15 rounded-full blur-3xl"
        />
        
        {/* Medium Orange Blob - Top Right */}
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.1, 1, 1.1],
            x: [0, -25, 0],
            y: [0, 15, 0]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-10 w-60 h-60 bg-secondary-400/20 rounded-full blur-2xl"
        />
        
        {/* Small Orange Blob - Middle Left */}
        <motion.div
          animate={{ 
            rotate: 180,
            scale: [1, 1.3, 1],
            x: [0, 40, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-10 w-40 h-40 bg-secondary-600/10 rounded-full blur-xl"
        />
        
        {/* Medium Orange Blob - Bottom Right */}
        <motion.div
          animate={{ 
            rotate: -180,
            scale: [1.2, 1, 1.2],
            x: [0, -35, 0],
            y: [0, 25, 0]
          }}
          transition={{ 
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-20 w-70 h-70 bg-secondary-500/12 rounded-full blur-2xl"
        />
        
        {/* Small Orange Blob - Bottom Left */}
        <motion.div
          animate={{ 
            rotate: 90,
            scale: [1, 1.4, 1],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-20 w-50 h-50 bg-secondary-400/15 rounded-full blur-xl"
        />
        
        {/* Tiny Orange Blob - Center */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.5, 1],
            x: [0, 15, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/2 w-30 h-30 bg-secondary-600/20 rounded-full blur-lg"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-full text-sm font-semibold mb-6 shadow-lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Our Services
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-900 mb-6">
            Comprehensive HR Solutions
            <span className="block text-secondary-500 mt-2">Tailored to Your Needs</span>
          </h2>
          
          <p className="text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
            We offer a full spectrum of HR services designed to help your organization 
            thrive in today&apos;s competitive business environment.
          </p>
        </motion.div>

        {/* Bento Masonry Services Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[260px] md:auto-rows-[250px] gap-5 md:gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isHeroCard = service.span.includes('row-span-2');
              const isWideCard = service.span.includes('col-span-2');

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`group relative min-h-[320px] md:min-h-0 overflow-hidden rounded-[22px] border border-white/35 shadow-[0_10px_35px_rgba(10,25,47,0.16)] ${service.span}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-900/25 via-primary-800/15 to-secondary-700/20" />
                  <div className="absolute inset-0">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      onError={(e) => {
                        e.currentTarget.src = '/images/about/pic_1.jpeg';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-white/70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/35 via-primary-900/8 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.14),transparent_35%)]" />

                  <div className={`relative z-10 flex h-full flex-col justify-between text-white ${isHeroCard ? 'p-6 md:p-7' : 'p-5 md:p-6'}`}>
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/70 bg-white/90 backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                        <Icon className="h-5 w-5 text-secondary-500" />
                    </div>

                    <div className="space-y-2">
                      <h3 className={`font-heading font-semibold leading-tight tracking-tight ${isHeroCard ? 'text-2xl md:text-[1.85rem]' : isWideCard ? 'text-xl md:text-2xl' : 'text-xl'}`}>
                        {service.title}
                      </h3>
                      <Link
                        href={service.link}
                        className="inline-flex items-center text-sm md:text-base font-semibold text-white/95 hover:text-secondary-200 transition-colors"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA - With Professional Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative h-48 md:h-64 lg:h-auto lg:min-h-[400px]"
              >
                <Image
                  src="/images/about/cta_image.webp"
                  alt="Professional HR consultation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </motion.div>
              
              {/* Right Side - Content */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 md:p-8 lg:p-12 flex flex-col justify-center"
              >
                
                <h3 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-primary-900 mb-3 md:mb-4">
                  Ready to Transform Your HR?
                </h3>
                <p className="text-base md:text-lg text-neutral-700 mb-6 md:mb-8 leading-relaxed">
                  Discover how our comprehensive HR services can drive your organization&apos;s success. 
                  Let&apos;s discuss your specific needs and create a tailored solution.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link
                    href="/services"
                    className="group bg-primary-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center border-2 border-primary-900"
                  >
                    View All Services
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  
                  <Link
                    href="/contact"
                    className="group border-2 border-primary-900 text-primary-900 px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-primary-900 hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    Get Started Today
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AccordionServicesSection;
