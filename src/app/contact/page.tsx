'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  Users,
  Award,
  Clock,
  Heart
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';

// Metadata moved to layout.tsx

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+254 700 178 680',
      subtitle: 'Mon-Fri 8AM-6PM'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'info@eaglehr.co.ke',
      subtitle: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: '10th Floor, Western Heights, Westlands',
      subtitle: 'Nairobi, Kenya'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subtitle: '8:00 AM - 6:00 PM'
    }
  ];

  const whyChooseUs = [
    {
      icon: Users,
      title: 'Expert Team',
      description: '15+ years of combined HR experience'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: '500+ companies served successfully'
    },
    {
      icon: Heart,
      title: 'Client Satisfaction',
      description: '98% client satisfaction rate'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can you start working with us?',
      answer: 'We can typically begin working with new clients within 1-2 weeks of initial consultation, depending on the scope of services required.'
    },
    {
      question: 'Do you offer services outside of Nairobi?',
      answer: 'Yes, we serve clients across Kenya and East Africa. We provide both on-site and remote services depending on your needs.'
    },
    {
      question: 'What is your typical response time?',
      answer: 'We respond to all inquiries within 24 hours and provide detailed proposals within 3-5 business days.'
    },
    {
      question: 'Do you offer customized training programs?',
      answer: 'Absolutely! All our training programs are customized to meet your specific organizational needs and industry requirements.'
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[60vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image with Reduced Opacity */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
            style={{
              backgroundImage: 'url(/images/hero/Reception_comp.webp)'
            }}
          />
          {/* White Overlay with Higher Opacity */}
          <div className="absolute inset-0 bg-white/70" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SectionTitle
                label="Contact us"
                title="Let's transform your"
                titleLine2="HR together."
                subtitle="Ready to take your HR to the next level? Get in touch with our experts for a free consultation and discover how we can help your organisation succeed."
                variant="hero"
                className="mb-8"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-bold text-primary-900 mb-2">
                  Get In Touch
                </h2>
                <p className="text-neutral-600">
                  We&apos;re here to help you succeed. Reach out to us through any of the channels below, 
                  and we&apos;ll get back to you as soon as possible.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-20"
                  >
                    <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-secondary-100">
                      <info.icon className="w-5 h-5 text-secondary-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-semibold text-primary-900 mb-1">{info.title}</h3>
                      <p className="text-neutral-900 font-medium text-sm">{info.details}</p>
                      <p className="text-xs text-neutral-600">{info.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                <h3 className="text-base font-semibold text-primary-900 mb-2">Why Choose Eagle HR?</h3>
                <ul className="space-y-1 text-xs text-neutral-700">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></span>
                    Over 7 years of HR expertise in Kenya
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></span>
                    Proven track record with 500+ companies
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full mr-2"></span>
                    Comprehensive HR solutions tailored to your needs
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Google Maps - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <div className="bg-white p-6 border-b border-neutral-200">
              <h3 className="text-2xl font-semibold text-primary-900 mb-2">Our Location</h3>
              <p className="text-neutral-600">
                10th Floor, Western Heights, Westlands, Nairobi, Kenya
              </p>
            </div>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.854450088491!2d36.79817511254719!3d-1.25944469872326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f179700832047%3A0x16a4df78c12925e9!2sEAGLE%20HR%20CONSULTANTS%20LIMITED!5e0!3m2!1sen!2ske!4v1761121155235!5m2!1sen!2ske" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="Why us"
              title="Why choose Eagle HR?"
              subtitle="When you partner with us, you're choosing excellence, expertise, and proven results."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-gradient-to-br from-neutral-50 to-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-secondary-100">
                  <item.icon className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-primary-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="FAQ"
              title="Frequently asked questions."
              subtitle="Here are some common questions we receive. Don't see your question? Contact us directly and we'll be happy to help."
              variant="section"
            />
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-primary-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <SectionTitle
              label="Get started"
              title="Ready to get started?"
              subtitle="Join hundreds of organisations that have transformed their HR practices with our expert guidance and innovative solutions."
              variant="dark"
              className="mb-8"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-secondary-500 text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                Schedule Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <a
                href="tel:+254700178680"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 flex items-center justify-center"
              >
                Call Us Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

