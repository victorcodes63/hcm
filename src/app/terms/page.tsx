'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { FileText, Scale, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: FileText,
      title: 'Service Agreement',
      content: 'By using our services, you agree to be bound by these terms and conditions. Please read them carefully before engaging with our HR consulting services.'
    },
    {
      icon: Scale,
      title: 'Service Scope',
      content: 'Our services include recruitment, HR outsourcing, training, compliance, and other HR consulting services as described in our service agreements.'
    },
    {
      icon: Shield,
      title: 'Client Responsibilities',
      content: 'Clients are responsible for providing accurate information, maintaining confidentiality, and complying with applicable laws and regulations.'
    },
    {
      icon: AlertCircle,
      title: 'Limitation of Liability',
      content: 'Our liability is limited to the extent permitted by law. We are not responsible for indirect or consequential damages arising from our services.'
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
              label="Terms of service"
              title="Terms of service"
              titleLine2="Legal agreement."
              subtitle="These terms and conditions govern your use of our HR consulting services. Please read them carefully before engaging with our services."
              variant="hero"
              className="mb-8"
            />
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
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
                title="Service terms & conditions."
                subtitle="These terms and conditions outline the rights and responsibilities of both HRIS Demo and our clients when using our HR consulting services."
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

            {/* Detailed Terms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-neutral-50 rounded-xl p-8"
            >
              <SectionTitle
                label="Full terms"
                title="Detailed terms & conditions."
                variant="section"
                className="text-left mb-6"
              />
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">1. Service Provision</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    HRIS Demo will provide HR consulting services as agreed in the service contract. 
                    Services may include recruitment, training, compliance, and other HR-related activities.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">2. Client Obligations</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Clients must provide accurate information, maintain confidentiality, and comply with 
                    all applicable laws and regulations. Payment terms are as specified in the service agreement.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">3. Confidentiality</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Both parties agree to maintain strict confidentiality regarding all business information 
                    and personal data shared during the course of our professional relationship.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">4. Limitation of Liability</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Our liability is limited to the fees paid for the specific service. We are not liable 
                    for indirect, consequential, or punitive damages arising from our services.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">5. Termination</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Either party may terminate the service agreement with written notice as specified in 
                    the contract. Outstanding fees remain due upon termination.
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
                title="Questions about these terms?"
                subtitle="If you have any questions about these terms and conditions, please contact us:"
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

