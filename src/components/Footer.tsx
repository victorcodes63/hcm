'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { usePublicBrand } from '@/components/BrandProvider';
import { useResolvedBrandLogoSrc } from '@/hooks/useResolvedBrandLogoSrc';

const Footer = () => {
  const { orgName, appName, tagline, contactPhone, contactEmail, contactAddress } = usePublicBrand();
  const logoSrc = useResolvedBrandLogoSrc();
  const isDesktop = useIsDesktop();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const productLinks = [
    { name: 'Careers & vacancies', href: '/careers' },
    { name: 'Staff dashboard', href: '/dashboard/login' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ];

  return (
    <footer className="bg-white border-t border-neutral-200 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-full min-w-0">
        <div className="py-16 flex flex-col md:flex-row lg:flex-row gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <Link href="/" className="flex items-center mb-6">
              <div className="h-12 w-[140px] relative">
                <Image
                  src={logoSrc}
                  alt={appName}
                  fill
                  className="object-contain object-left"
                  sizes="140px"
                />
              </div>
            </Link>

            <p className="text-neutral-700 leading-relaxed mb-6">{tagline}</p>

            <div className="space-y-3">
              {contactPhone ? (
                <div className="flex items-center space-x-3 text-neutral-700">
                  <Phone className="w-4 h-4 text-secondary-500 shrink-0" />
                  <span>{contactPhone}</span>
                </div>
              ) : null}
              <div className="flex items-center space-x-3 text-neutral-700">
                <Mail className="w-4 h-4 text-secondary-500 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-secondary-600">
                  {contactEmail}
                </a>
              </div>
              {contactAddress ? (
                <div className="flex items-start space-x-3 text-neutral-700">
                  <MapPin className="w-4 h-4 text-secondary-500 mt-0.5 shrink-0" />
                  <span>{contactAddress}</span>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h4 className="text-lg font-semibold mb-6 text-primary-900">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-secondary-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h4 className="text-lg font-semibold mb-6 text-primary-900">{orgName}</h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              This environment is a demonstration HR information system. Replace branding and contact
              details with your organization&apos;s values using environment variables (see{' '}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">.env.example</code>).
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-neutral-200 py-6 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="text-neutral-600 text-sm w-full md:w-auto text-center md:text-left">
            © {new Date().getFullYear()} {orgName}. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:mt-0">
            <Link href="/privacy" className="text-neutral-600 hover:text-secondary-600 text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-neutral-600 hover:text-secondary-600 text-sm transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/dashboard/login" className="text-neutral-600 hover:text-secondary-600 text-sm transition-colors duration-200">
              Staff Dashboard
            </Link>
          </div>
        </motion.div>
      </div>

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
