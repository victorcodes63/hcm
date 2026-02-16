'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Linkedin, 
  Instagram,
  ArrowUp
} from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';

const Footer = () => {
  const isDesktop = useIsDesktop();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ];

  const services = [
    { name: 'Recruitment & Executive Search', href: '/services/recruitment' },
    { name: 'HR Outsourcing', href: '/services/hr-outsourcing' },
    { name: 'Training & Development', href: '/services/training-development' },
    { name: 'HR Compliance & Legal', href: '/services/hr-compliance' },
    { name: 'Salary Surveys', href: '/services/salary-surveys' },
    { name: 'HR Documentation', href: '/services/hr-documentation' },
    { name: 'Psychometric Testing', href: '/services/psychometric-testing' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/eaglehrke' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/eaglehr-consultants/' },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/eaglehrconsultantske' },
  ];

  return (
    <footer className="bg-white border-t border-neutral-200 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 flex flex-col md:flex-row lg:flex-row gap-8 lg:gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <Link href="/" className="flex items-center mb-6">
              <div className="w-12 h-12 relative">
                <Image
                  src="/images/logo/logo_dark_ubxaCll.png"
                  alt="Eagle HR Consultants Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
            </Link>
            
            <p className="text-neutral-700 leading-relaxed mb-6">
              Leading HR excellence in Kenya. We transform organizations through 
              exceptional human resource consulting, recruitment, and development services.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-neutral-700">
                <Phone className="w-4 h-4 text-secondary-500" />
                <span>+254 700 178 680</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-700">
                <Mail className="w-4 h-4 text-secondary-500" />
                <span>info@eaglehr.co.ke</span>
              </div>
              <div className="flex items-start space-x-3 text-neutral-700">
                <MapPin className="w-4 h-4 text-secondary-500 mt-0.5" />
                <span>10th Floor, Western Heights, Westlands</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h4 className="text-lg font-semibold mb-6 text-primary-900">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h4 className="text-lg font-semibold mb-6 text-primary-900">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-neutral-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h4 className="text-lg font-semibold mb-6 text-primary-900">Stay Connected</h4>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <p className="text-neutral-700 mb-3">
                Subscribe to our newsletter for HR insights and updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-l-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-primary-900 text-white rounded-r-lg hover:bg-primary-800 transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h5 className="text-sm font-medium mb-3 text-neutral-700">Follow Us</h5>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-all duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-neutral-200 py-6 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-neutral-600 text-sm">
            © {new Date().getFullYear()} Eagle HR Consultants. All rights reserved.
            <br />
            <span className="text-xs">
              Website by{' '}
              <a 
                href="https://www.raventechgroup.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-500 hover:text-secondary-600 transition-colors duration-200"
              >
                Raven Tech Group
              </a>
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">
            <Link href="/privacy" className="text-neutral-600 hover:text-orange-500 text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-neutral-600 hover:text-orange-500 text-sm transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/dashboard/login" className="text-neutral-600 hover:text-orange-500 text-sm transition-colors duration-200">
              Staff Dashboard
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button - Desktop Only */}
      <motion.button
        initial={{ opacity: 0, ...(isDesktop ? { scale: 0 } : {}) }}
        whileInView={{ opacity: 1, ...(isDesktop ? { scale: 1 } : {}) }}
        whileHover={isDesktop ? { scale: 1.1 } : undefined}
        whileTap={isDesktop ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.3 }}
        viewport={{ once: true }}
        onClick={scrollToTop}
        className="hidden md:flex fixed bottom-8 right-8 w-12 h-12 bg-secondary-500 text-primary-900 rounded-full shadow-lg hover:shadow-xl items-center justify-center z-50 transition-all duration-200"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </footer>
  );
};

export default Footer;

