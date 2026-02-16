'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Award, 
  Download,
  ArrowRight,
  Star,
  Building,
  Gavel,
  BookOpen,
  Clock,
  Target
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import ServicePageCard from '@/components/ServicePageCard';
import Image from 'next/image';
import Link from 'next/link';

export default function HRCompliancePage() {
  const complianceServices = [
    {
      icon: ShieldCheck,
      title: 'Labor Law Compliance',
      description: 'Comprehensive compliance with all Kenyan labor laws and regulations.',
      features: [
        'Employment Act 2007 compliance',
        'NSSF and NHIF statutory requirements',
        'Workplace safety regulations',
        'Minimum wage compliance'
      ],
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      icon: FileText,
      title: 'Employment Contracts',
      description: 'Draft and review employment contracts that protect all parties.',
      features: [
        'Contract drafting and review',
        'Terms and conditions compliance',
        'Confidentiality agreements',
        'Non-compete clauses'
      ],
      color: 'text-green-600',
      bgColor: 'from-green-50 to-green-100'
    },
    {
      icon: Scale,
      title: 'Disciplinary Procedures',
      description: 'Fair and legally compliant disciplinary processes.',
      features: [
        'Disciplinary policy development',
        'Investigation procedures',
        'Appeal mechanisms',
        'Documentation standards'
      ],
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      icon: Gavel,
      title: 'Legal Advisory',
      description: 'Expert legal advice on HR matters and employment disputes.',
      features: [
        'Employment law consultation',
        'Dispute resolution support',
        'Regulatory compliance advice',
        'Risk assessment and mitigation'
      ],
      color: 'text-red-600',
      bgColor: 'from-red-50 to-red-100'
    }
  ];

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Risk Mitigation',
      description: 'Minimize legal risks and protect your organization from costly compliance violations.'
    },
    {
      icon: Users,
      title: 'Employee Protection',
      description: 'Ensure fair treatment of employees while maintaining organizational interests.'
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Comprehensive documentation and record-keeping for all HR processes.'
    },
    {
      icon: Award,
      title: 'Expert Guidance',
      description: 'Access to experienced HR and legal professionals with deep industry knowledge.'
    }
  ];

  const stats = [
    { number: '100%', label: 'Compliance Rate', description: 'Zero violations for our clients' },
    { number: '500+', label: 'Policies Reviewed', description: 'Employment policies audited' },
    { number: '50+', label: 'Legal Cases', description: 'Successfully resolved disputes' },
    { number: '24/7', label: 'Support', description: 'Round-the-clock compliance assistance' }
  ];

  const caseStudy = {
    company: 'Kenya Revenue Authority (KRA)',
    duration: '3+ Years',
    staffSize: '8,000+',
    image: '/images/services/compliance/kra.jpg',
    challenge: 'Managing compliance across a large workforce with complex employment structures and multiple statutory requirements.',
    solution: 'Comprehensive HR compliance audit, policy development, and ongoing advisory services.',
    results: [
      '100% compliance with all labor laws',
      'Reduced legal disputes by 85%',
      'Streamlined disciplinary procedures',
      'Enhanced employee satisfaction'
    ]
  };

  const industries = [
    "Banking & Financial Services", "Technology & IT", "Healthcare & Pharmaceuticals",
    "Manufacturing & Engineering", "Government & Public Sector", "NGOs & Development",
    "Education & Training", "Retail & Consumer Goods", "Energy & Utilities", "Real Estate & Construction"
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 min-h-[50vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image with Reduced Opacity */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
            style={{
              backgroundImage: 'url(/images/services/compliance/hero.jpg)'
            }}
          />
          {/* White Overlay with Higher Opacity */}
          <div className="absolute inset-0 bg-white/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <SectionTitle
              label="HR compliance & legal"
              title="HR compliance & legal."
              subtitle="Ensure your organisation meets all Kenyan labour laws and regulations. Comprehensive compliance support and legal advisory services."
              variant="hero"
              className="mb-8"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-secondary-500 text-white rounded-lg font-semibold text-lg hover:bg-secondary-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="/downloads/compliance-guide.pdf"
                className="inline-flex items-center px-8 py-4 bg-white/20 text-primary-900 rounded-lg font-semibold text-lg hover:bg-white/30 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm"
              >
                <Download className="mr-2 w-5 h-5" />
                Download Guide
              </a>
          </div>
          </motion.div>
        </div>
      </section>

      {/* Comprehensive HR Compliance Solutions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <SectionTitle
              label="Our services"
              title="Comprehensive HR compliance solutions."
              subtitle="Stay compliant with all Kenyan labour laws and regulations. Our expert team ensures your organisation meets every statutory requirement."
              variant="section"
              className="mb-16"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {complianceServices.map((service, index) => (
                <ServicePageCard key={index} item={service} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">
                Why Choose Our Compliance Services?
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Our comprehensive approach ensures your organization stays compliant while protecting your interests.
                  </p>
                </div>
                
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-secondary-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-secondary-100">
                    <benefit.icon className="w-8 h-8 text-secondary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Our Compliance Track Record
              </h2>
              <p className="text-xl text-primary-200 max-w-3xl mx-auto">
                Proven results in helping organizations maintain full compliance with Kenyan labor laws.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xl font-semibold text-primary-200 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-primary-300">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Client Spotlight */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">
                Client Success Story
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                How we helped a major government institution achieve 100% compliance across 8,000+ employees.
                  </p>
                </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Background Image with White Overlay */}
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: 'url(/images/services/compliance/kra.jpg)'
                  }}
                />
                <div className="absolute inset-0 bg-white/85" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-12 md:p-16">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  {/* Logo and Company Info */}
                  <div className="space-y-8">
                    <div className="text-center md:text-left">
                      <div className="w-24 h-24 mx-auto md:mx-0 mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
                        <img
                          src="/images/clients/kra_logo.png"
                          alt={caseStudy.company}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center hidden">
                          <Award className="w-12 h-12 text-primary-900" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-primary-900 mb-2">
                        {caseStudy.company}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {caseStudy.challenge}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-3 text-lg">Our Solution:</h4>
                      <p className="text-neutral-600 leading-relaxed mb-4">
                        {caseStudy.solution}
                  </p>
                </div>
                
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-3 text-lg">Results Achieved:</h4>
                      <ul className="space-y-2">
                        {caseStudy.results.map((result, index) => (
                          <li key={index} className="flex items-start text-neutral-600">
                            <Star className="w-5 h-5 text-secondary-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
            <SectionTitle label="Industries" title="Industries we serve." subtitle="Our compliance expertise spans across various industries, each with unique regulatory requirements." variant="section" />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((industry, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05, duration: 0.4 }} viewport={{ once: true }} className="bg-secondary-50/80 rounded-lg p-4 text-center border border-secondary-100/60 hover:bg-secondary-100/80 transition-colors duration-300">
                <div className="text-sm font-medium text-primary-900">{industry}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-56 lg:h-auto lg:min-h-[340px] order-1">
                  <Image src="/images/about/Smiling%20African%20American%20Woman%20Business%20Suit.PNG" alt="Professional HR consultation" fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center order-2">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-primary-900 mb-4">Ready to Ensure Full Compliance?</h3>
                  <p className="text-neutral-600 leading-relaxed mb-6">Let our expert team help you navigate the complex world of HR compliance. Protect your organisation and ensure fair treatment of your employees.</p>
                  <p className="text-xl font-semibold text-secondary-500 mb-4">Take the next step</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/services" className="bg-primary-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-800 transition text-center">View All Services</Link>
                    <Link href="/contact" className="border border-primary-900 text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-900 hover:text-white transition text-center">Schedule Consultation</Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Resources Section */}
      <section className="py-12 bg-secondary-500 text-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
            <SectionTitle label="Resources" title="Download our resources." subtitle="Access our company profile and client list to learn more about Eagle HR and the organisations we partner with." variant="dark" className="mb-16" />
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} viewport={{ once: true }} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 flex flex-col h-full">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6"><FileText className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-semibold mb-4">Company Profile</h3>
              <p className="text-orange-100 mb-6 flex-grow">Comprehensive overview of Eagle HR&apos;s services, expertise, and track record in HR compliance.</p>
              <a href="/downloads/eagle-hr-company-profile.pdf" download="Eagle-HR-Company-Profile.pdf" className="inline-flex items-center text-white hover:text-secondary-300 transition-colors duration-300 mt-auto"><Download className="w-4 h-4 mr-2" />Download PDF</a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} viewport={{ once: true }} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 flex flex-col h-full">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6"><Building className="w-8 h-8 text-white" /></div>
              <h3 className="text-xl font-semibold mb-4">Client List</h3>
              <p className="text-orange-100 mb-6 flex-grow">Organisations across Kenya and beyond who trust Eagle HR with their recruitment and HR needs.</p>
              <a href="/downloads/eagle-hr-client-list.pdf" download="Eagle-HR-Client-List.pdf" className="inline-flex items-center text-white hover:text-secondary-300 transition-colors duration-300 mt-auto"><Download className="w-4 h-4 mr-2" />Download PDF</a>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}