'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.'
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.'
    },
    {
      icon: Shield,
      title: 'Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
    }
  ];

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[60vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <SectionTitle
              label="Privacy policy"
              title="Your privacy matters"
              titleLine2="To us."
              subtitle="We are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data."
              variant="hero"
              className="mb-8"
            />
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <SectionTitle
                label="Overview"
                title="Our privacy commitment."
                subtitle="At HRIS Demo, we understand the importance of privacy and are committed to protecting your personal information. This Privacy Policy outlines our practices regarding the collection, use, and protection of your data."
                variant="section"
                className="text-left mb-6"
              />
            </motion.div>

            {/* Key Sections */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center mr-4 border border-secondary-100">
                      <section.icon className="w-6 h-6 text-secondary-500" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-primary-900">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Detailed Policy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-neutral-50 rounded-xl p-8"
            >
              <SectionTitle
                label="Full policy"
                title="Detailed privacy policy."
                variant="section"
                className="text-left mb-6"
              />
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">1. Information Collection</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    We collect information when you register for our services, submit job applications, 
                    or contact us. This may include your name, email address, phone number, resume, 
                    and other relevant information.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">2. Use of Information</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    We use your information to provide HR services, match you with job opportunities, 
                    communicate with you about our services, and improve our offerings.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">3. Data Protection</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    We implement industry-standard security measures to protect your personal information 
                    from unauthorized access, use, or disclosure.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">4. Your Rights</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    You have the right to access, update, or delete your personal information. 
                    You may also opt out of certain communications from us.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <SectionTitle
                label="Contact"
                title="Questions about this policy?"
                subtitle="If you have any questions about this Privacy Policy, please contact us at:"
                variant="section"
                className="mb-6"
              />
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <a
                  href="mailto:info@example.com"
                  className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  info@example.com
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary-900 text-primary-900 rounded-lg font-semibold hover:bg-primary-900 hover:text-white transition-colors duration-300"
                >
                  Contact Us
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

