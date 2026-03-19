'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Phone, Mail, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  IconUsersGroup,
  IconBuildingSkyscraper,
  IconSchool,
  IconShieldCheck,
  IconChartHistogram,
  IconFileText,
  IconCalculator,
  IconBook,
  IconBrain
} from '@tabler/icons-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

const fadeIn = {
  hidden: { opacity: 0, y: -15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}


const Navbar = () => {
  const isDesktop = useIsDesktop()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentResourcesSlide, setCurrentResourcesSlide] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Services', href: '/services', hasDropdown: true },
    { name: 'Job Board', href: '/careers' },
    { name: 'Insights', href: '/insights' },
    { name: 'Resources', href: '/resources', hasDropdown: true },
  ]

  const services = [
    {
      title: 'Recruitment & Executive Search',
      description: 'Find the right talent for your organization',
      href: '/services/recruitment',
      icon: IconUsersGroup,
      features: ['Executive Search', 'Technical Recruitment', 'Talent Assessment']
    },
    {
      title: 'HR Outsourcing',
      description: 'Streamline your HR operations',
      href: '/services/hr-outsourcing',
      icon: IconBuildingSkyscraper,
      features: ['Payroll Management', 'HR Administration', 'Policy Development']
    },
    {
      title: 'Training & Development',
      description: 'Enhance your team\'s capabilities',
      href: '/services/training-development',
      icon: IconSchool,
      features: ['Leadership Development', 'Skills Training', 'Team Building']
    },
    {
      title: 'HR Compliance & Legal',
      description: 'Ensure compliance with labor laws',
      href: '/services/hr-compliance',
      icon: IconShieldCheck,
      features: ['Legal Compliance', 'Policy Review', 'Risk Assessment']
    },
    {
      title: 'Salary Surveys & Analytics',
      description: 'Data-driven compensation insights',
      href: '/services/salary-surveys',
      icon: IconChartHistogram,
      features: ['Market Analysis', 'Compensation Benchmarking', 'Salary Reports']
    },
    {
      title: 'HR Documentation & Policies',
      description: 'Comprehensive HR documentation services',
      href: '/services/hr-documentation',
      icon: IconFileText,
      features: ['Policy Development', 'Employee Handbooks', 'Legal Documentation']
    },
    {
      title: 'Psychometric Testing',
      description: 'Comprehensive psychological assessments for talent selection',
      href: '/services/psychometric-testing',
      icon: IconBrain,
      features: ['Aptitude Testing', 'Personality Assessment', 'Cognitive Ability Tests']
    }
  ]

  const resources = [
    {
      title: 'Gross Salary Calculator',
      description: 'Gross pay → take-home (net)',
      href: '/resources/gross-calculator',
      icon: IconChartHistogram,
      isNew: true
    },
    {
      title: 'Net Salary Calculator',
      description: 'Net pay → estimated gross',
      href: '/resources/net-calculator',
      icon: IconCalculator,
      isNew: false
    },
    {
      title: 'Interview Checklist - Employers',
      description: 'Guide for conducting effective interviews',
      href: '/resources/interview-checklist-employers',
      icon: IconUsersGroup,
      isNew: false
    },
    {
      title: 'Interview Checklist - Candidates',
      description: 'Prepare for job interviews successfully',
      href: '/resources/interview-checklist-candidates',
      icon: IconBook,
      isNew: false
    }
  ]

  const servicesPerSlide = 4
  const totalSlides = Math.ceil(services.length / servicesPerSlide)
  
  const resourcesPerSlide = 4
  const totalResourcesSlides = Math.ceil(resources.length / resourcesPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = (prev + 1) % totalSlides
      console.log('Next slide:', next, 'Total slides:', totalSlides)
      return next
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const prevSlide = (prev - 1 + totalSlides) % totalSlides
      console.log('Previous slide:', prevSlide, 'Total slides:', totalSlides)
      return prevSlide
    })
  }

  const nextResourcesSlide = () => {
    setCurrentResourcesSlide((prev) => {
      const next = (prev + 1) % totalResourcesSlides
      console.log('Next resources slide:', next, 'Total resources slides:', totalResourcesSlides)
      return next
    })
  }

  const prevResourcesSlide = () => {
    setCurrentResourcesSlide((prev) => {
      const prevSlide = (prev - 1 + totalResourcesSlides) % totalResourcesSlides
      console.log('Previous resources slide:', prevSlide, 'Total resources slides:', totalResourcesSlides)
      return prevSlide
    })
  }

  // Reset slide when dropdown opens
  useEffect(() => {
    if (isServicesOpen) {
      setCurrentSlide(0)
    }
  }, [isServicesOpen])

  useEffect(() => {
    if (isResourcesOpen) {
      setCurrentResourcesSlide(0)
    }
  }, [isResourcesOpen])

  const isActive = (href: string) => pathname === href

  return (
    <motion.nav
      initial={isDesktop ? { y: -80, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: isDesktop ? 0.5 : 0, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all duration-500 ${
        scrolled ? 'bg-white/80 shadow-lg' : 'bg-transparent'
      }`}
    >
        <div className="container mx-auto px-4 sm:px-6 md:px-5 max-w-full min-w-0">
          <div className="relative flex items-center justify-between h-16 md:h-20 min-w-0">
            {/* Logo - extra padding to avoid clipping on mobile */}
            <Link href="/" className="flex items-center z-10 py-1 overflow-visible">
              <motion.img
                src="/images/logo/logo_dark_ubxaCll.png"
                alt="Eagle HR Consultants"
                className="w-12 h-12 md:w-14 md:h-14 object-contain object-center"
                whileHover={isDesktop ? { scale: 1.05 } : undefined}
                transition={{ duration: 0.3 }}
              />
            </Link>

            {/* Desktop Nav - Absolutely Centered */}
            <div className="hidden lg:flex items-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <motion.div key={item.name} variants={fadeIn} initial="hidden" animate="visible">
                    {item.hasDropdown ? (
                      <div 
                        className="relative"
                        onMouseEnter={() => {
                          if (item.name === 'Our Services') {
                            setIsServicesOpen(true)
                            setIsResourcesOpen(false)
                          } else if (item.name === 'Resources') {
                            setIsResourcesOpen(true)
                            setIsServicesOpen(false)
                          }
                        }}
                        onMouseLeave={() => {
                          if (item.name === 'Our Services') {
                            setIsServicesOpen(false)
                          } else if (item.name === 'Resources') {
                            setIsResourcesOpen(false)
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <Link
                            href={item.href}
                            className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                              isActive(item.href)
                                ? 'text-primary-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary-600'
                                : 'text-neutral-700 hover:text-primary-900'
                            }`}
                          >
                            {item.name}
                          </Link>
                          <button
                            className="p-1 ml-1 rounded hover:bg-neutral-100 transition-colors duration-200"
                            onMouseEnter={() => {
                              if (item.name === 'Our Services') {
                                setIsServicesOpen(true)
                                setIsResourcesOpen(false)
                              } else if (item.name === 'Resources') {
                                setIsResourcesOpen(true)
                                setIsServicesOpen(false)
                              }
                            }}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${(isServicesOpen && item.name === 'Our Services') || (isResourcesOpen && item.name === 'Resources') ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                          isActive(item.href)
                            ? 'text-primary-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-primary-600'
                            : 'text-neutral-700 hover:text-primary-900'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center ml-auto z-10">
              <motion.div whileHover={isDesktop ? { scale: 1.03 } : undefined} whileTap={isDesktop ? { scale: 0.97 } : undefined}>
                <Link
                  href="/contact"
                  className="px-6 py-2 bg-secondary-500 text-white font-semibold rounded-lg shadow-md hover:bg-secondary-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <span>Partner With Us</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={isDesktop ? { scale: 0.9 } : undefined}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 rounded-lg hover:bg-neutral-100 transition-colors duration-200 flex items-center justify-center z-20 -mr-2"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-primary-900" />
              ) : (
                <Menu className="w-6 h-6 text-primary-900" />
              )}
            </motion.button>
          </div>
      </div>

      {/* Full-Width Services Dropdown */}
      <AnimatePresence>
        {isServicesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="hidden lg:block absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-primary-100"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-full min-w-0">
              {/* View All Services Link */}
              <div className="mb-6 pb-4 border-b border-neutral-200">
                <Link
                  href="/services"
                  className="inline-flex items-center text-primary-900 font-semibold hover:text-secondary-500 transition-colors duration-300"
                >
                  <span>View All Services</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
              
              {/* Services Carousel */}
              <div className="relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    animate={{ x: `-${currentSlide * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {services
                            .slice(slideIndex * servicesPerSlide, (slideIndex + 1) * servicesPerSlide)
                            .map((service, index) => (
                              <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                className="group"
                              >
                                <Link
                                  href={service.href}
                                  className="block p-6 rounded-xl hover:bg-primary-50 transition-all duration-300 group-hover:shadow-lg"
                                >
                                  <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-secondary-50 border border-secondary-200 rounded-lg flex items-center justify-center mr-4 lg:group-hover:scale-110 group-hover:border-secondary-300 transition-all duration-300">
                                      <service.icon className="w-6 h-6 text-secondary-500" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-primary-900 group-hover:text-secondary-500 transition-colors duration-300">
                                        {service.title}
                                      </h3>
                                    </div>
                                  </div>
                                  
                                  <p className="text-neutral-600 text-sm mb-4 leading-relaxed">
                                    {service.description}
                                  </p>
                                  
                                  <ul className="space-y-2">
                                    {service.features.map((feature, featureIndex) => (
                                      <li key={featureIndex} className="flex items-center text-xs text-neutral-500">
                                        <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2 flex-shrink-0"></div>
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                  
                                  <div className="mt-4 flex items-center text-primary-600 text-sm font-medium group-hover:text-secondary-500 transition-colors duration-300">
                                    Learn More
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Navigation Arrows */}
                {totalSlides > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-primary-700" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-primary-700" />
                    </button>
                  </>
                )}

                {/* Slide Indicators */}
                {totalSlides > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-primary-600 w-8' 
                            : 'bg-neutral-300 hover:bg-neutral-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Bottom CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 pt-6 border-t border-neutral-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-2">
                      Need a Custom Solution?
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      We tailor our services to meet your specific HR needs
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="bg-primary-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300 flex items-center gap-2"
                  >
                    Get Consultation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Width Resources Dropdown */}
      <AnimatePresence>
        {isResourcesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="hidden lg:block absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-primary-100"
            onMouseEnter={() => setIsResourcesOpen(true)}
            onMouseLeave={() => setIsResourcesOpen(false)}
          >
            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-full min-w-0">
              {/* Resources Slider */}
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-primary-900">HR Resources & Tools</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevResourcesSlide}
                      className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors duration-300"
                      disabled={totalResourcesSlides <= 1}
                    >
                      <ChevronLeft className="w-5 h-5 text-neutral-600" />
                    </button>
                    <button
                      onClick={nextResourcesSlide}
                      className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors duration-300"
                      disabled={totalResourcesSlides <= 1}
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-600" />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <motion.div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${currentResourcesSlide * 100}%)`
                    }}
                  >
                    {Array.from({ length: totalResourcesSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {resources
                            .slice(slideIndex * resourcesPerSlide, (slideIndex + 1) * resourcesPerSlide)
                            .map((resource, index) => (
                            <motion.div
                              key={resource.title}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.4 }}
                              className="group"
                            >
                              <Link
                                href={resource.href}
                                className="block p-6 rounded-xl hover:bg-primary-50 transition-all duration-300 group-hover:shadow-lg"
                              >
                                <div className="flex items-center mb-4">
                                  <div className="w-12 h-12 bg-secondary-50 border border-secondary-200 rounded-lg flex items-center justify-center mr-4 lg:group-hover:scale-110 group-hover:border-secondary-300 transition-all duration-300">
                                    <resource.icon className="w-6 h-6 text-secondary-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-primary-900 group-hover:text-secondary-500 transition-colors duration-300 flex items-center gap-2">
                                      {resource.title}
                                      {resource.isNew && (
                                        <span className="bg-secondary-500 text-primary-900 text-xs px-2 py-0.5 rounded-full">New</span>
                                      )}
                                    </h3>
                                  </div>
                                </div>
                                
                                <p className="text-neutral-600 text-sm leading-relaxed">
                                  {resource.description}
                                </p>
                                
                                <div className="mt-4 flex items-center text-primary-600 text-sm font-medium group-hover:text-secondary-500 transition-colors duration-300">
                                  Try Now
                                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Resources Slider Indicators */}
                {totalResourcesSlides > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalResourcesSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentResourcesSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentResourcesSlide 
                            ? 'bg-primary-600 w-8' 
                            : 'bg-neutral-300 hover:bg-neutral-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Bottom CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 pt-6 border-t border-neutral-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-2">
                      Need More HR Tools?
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      Access our complete suite of HR calculators and resources
                    </p>
                  </div>
                  <Link
                    href="/resources"
                    className="bg-primary-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300 flex items-center gap-2"
                  >
                    View All Resources
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-primary-100 z-50"
          >
            <div className="container mx-auto px-4 sm:px-6 py-6 max-w-full min-w-0">
              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => {
                            if (item.name === 'Our Services') {
                              setIsServicesOpen(!isServicesOpen)
                              setIsResourcesOpen(false)
                            } else if (item.name === 'Resources') {
                              setIsResourcesOpen(!isResourcesOpen)
                              setIsServicesOpen(false)
                            }
                          }}
                          className="flex items-center justify-between py-3 px-4 rounded-lg font-medium transition-all duration-200 w-full text-left text-primary-700 hover:text-primary-900 hover:bg-primary-50/50"
                        >
                          <span>{item.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                            (isServicesOpen && item.name === 'Our Services') || 
                            (isResourcesOpen && item.name === 'Resources') ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {/* Mobile Services Dropdown */}
                        <AnimatePresence>
                          {isServicesOpen && item.name === 'Our Services' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-4 mt-2 space-y-2"
                            >
                              {/* View All Services Link */}
                              <Link
                                href="/services"
                                onClick={() => {
                                  setIsOpen(false)
                                  setIsServicesOpen(false)
                                }}
                                className="flex items-center py-2 px-4 rounded-lg text-sm font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 transition-all duration-200 mb-2"
                              >
                                <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center mr-3">
                                  <ArrowRight className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold">View All Services</div>
                                  <div className="text-xs text-primary-600">See our complete service portfolio</div>
                                </div>
                              </Link>
                              {services.map((service) => (
                                <Link
                                  key={service.title}
                                  href={service.href}
                                  onClick={() => {
                                    setIsOpen(false)
                                    setIsServicesOpen(false)
                                  }}
                                  className="flex items-center py-2 px-4 rounded-lg text-sm text-neutral-600 hover:text-primary-900 hover:bg-primary-50/30 transition-all duration-200"
                                >
                                  <div className="w-8 h-8 bg-secondary-50 border border-secondary-200 rounded-lg flex items-center justify-center mr-3">
                                    <service.icon className="w-4 h-4 text-secondary-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{service.title}</div>
                                    <div className="text-xs text-neutral-500">{service.description}</div>
                                  </div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Mobile Resources Dropdown */}
                        <AnimatePresence>
                          {isResourcesOpen && item.name === 'Resources' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-4 mt-2 space-y-2"
                            >
                              {resources.map((resource) => (
                                <Link
                                  key={resource.title}
                                  href={resource.href}
                                  onClick={() => {
                                    setIsOpen(false)
                                    setIsResourcesOpen(false)
                                  }}
                                  className="flex items-center py-2 px-4 rounded-lg text-sm text-neutral-600 hover:text-primary-900 hover:bg-primary-50/30 transition-all duration-200"
                                >
                                  <div className="w-8 h-8 bg-secondary-50 border border-secondary-200 rounded-lg flex items-center justify-center mr-3">
                                    <resource.icon className="w-4 h-4 text-secondary-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {resource.title}
                                      {resource.isNew && (
                                        <span className="bg-secondary-500 text-primary-900 text-xs px-2 py-0.5 rounded-full">New</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-neutral-500">{resource.description}</div>
                                  </div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? 'text-primary-900 bg-primary-50 border-l-4 border-secondary-500'
                            : 'text-primary-700 hover:text-primary-900 hover:bg-primary-50/50'
                        }`}
                      >
                        <span>{item.name}</span>
                        {isActive(item.href) && (
                          <motion.div
                            initial={isDesktop ? { scale: 0 } : { opacity: 0 }}
                            animate={isDesktop ? { scale: 1 } : { opacity: 1 }}
                            className="w-2 h-2 bg-secondary-500 rounded-full"
                          />
                        )}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05 + 0.1, duration: 0.3 }}
                className="space-y-3"
              >
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-secondary-500 text-white font-semibold rounded-lg py-3 px-4 text-center transition-all duration-300 hover:bg-secondary-600 hover:shadow-lg"
                >
                  Partner With Us
                </Link>
                
                {/* Contact Info */}
                <div className="pt-4 border-t border-primary-100">
                  <div className="flex items-center justify-center space-x-4 text-sm text-primary-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>+254 700 178 680</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>info@eaglehr.co.ke</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
