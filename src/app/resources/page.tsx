'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import SectionTitle from '@/components/SectionTitle';
import { 
  Calculator, 
  Download, 
  BookOpen, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

export default function ResourcesPage() {
  const isDesktop = useIsDesktop();
  const [activeFilter, setActiveFilter] = useState('All Resources');
  const resources = [
    {
      id: 'gross-calculator',
      title: 'Gross Salary Calculator',
      description: 'Calculate your gross salary from net pay with accurate tax deductions, NSSF, SHIF, and housing levy calculations for Kenya.',
      icon: Calculator,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'from-blue-100 to-sky-200',
      link: '/resources/gross-calculator',
      category: 'Calculators',
      features: ['PAYE Calculation', 'NSSF Contributions', 'SHIF Deduction', 'Housing Levy']
    },
    {
      id: 'net-calculator',
      title: 'Net Salary Calculator',
      description: 'Calculate your take-home pay from gross salary with all statutory deductions and benefits included.',
      icon: Calculator,
      color: 'from-green-600 to-green-700',
      bgColor: 'from-green-100 to-emerald-200',
      link: '/resources/net-calculator',
      category: 'Calculators',
      features: ['Gross to Net', 'Tax Deductions', 'Benefits Calculation', 'Statutory Compliance']
    },
    {
      id: 'interview-checklist-employers',
      title: 'Interview Checklist - Employers',
      description: 'Comprehensive checklist for employers to conduct effective interviews and make better hiring decisions.',
      icon: Users,
      color: 'from-orange-600 to-orange-700',
      bgColor: 'from-orange-100 to-amber-200',
      link: '/resources/interview-checklist-employers',
      category: 'Checklists',
      features: ['Pre-Interview Prep', 'Interview Questions', 'Assessment Criteria', 'Decision Framework']
    },
    {
      id: 'interview-checklist-candidates',
      title: 'Interview Checklist - Candidates',
      description: 'Step-by-step guide for job candidates to prepare for and excel in interviews.',
      icon: BookOpen,
      color: 'from-teal-600 to-teal-700',
      bgColor: 'from-teal-100 to-cyan-200',
      link: '/resources/interview-checklist-candidates',
      category: 'Checklists',
      features: ['Pre-Interview Prep', 'Common Questions', 'Presentation Tips', 'Follow-up Actions']
    }
  ];

  const categories = [
    { name: 'All Resources', count: resources.length },
    { name: 'Calculators', count: resources.filter(r => r.category === 'Calculators').length },
    { name: 'Checklists', count: resources.filter(r => r.category === 'Checklists').length }
  ];

  // Filter resources based on active filter
  const filteredResources = activeFilter === 'All Resources' 
    ? resources 
    : resources.filter(resource => resource.category === activeFilter);

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[60vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
            style={{
              backgroundImage: 'url(/images/hero/Reception_comp.webp)'
            }}
          />
          <div className="absolute inset-0 bg-white/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
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
                label="HR resources"
                title="HR resources & tools"
                titleLine2="for your success."
                subtitle="Access our comprehensive collection of HR tools, calculators, templates, and checklists designed to streamline your HR processes."
                variant="hero"
                className="mb-8"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveFilter(category.name)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeFilter === category.name
                      ? 'bg-primary-900 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-md'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource, index) => {
                const Icon = resource.icon;
                
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-neutral-100 flex flex-col h-full"
                  >
                    {/* Card Content - Flex grow to fill space */}
                    <div className="p-8 flex flex-col flex-grow">
                      {/* Icon */}
                      <motion.div
                        whileHover={isDesktop ? { scale: 1.1, rotate: 5 } : undefined}
                        className={`w-16 h-16 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                            {resource.category}
                          </span>
                          <Star className="w-4 h-4 text-secondary-500" />
                        </div>
                        
                        <h3 className="text-xl font-heading font-semibold text-primary-900 group-hover:text-secondary-500 transition-colors duration-300 mb-4">
                          {resource.title}
                        </h3>
                        
                        <p className="text-neutral-600 leading-relaxed mb-6 flex-grow">
                          {resource.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                          <h4 className="font-semibold text-primary-900 text-sm">Key Features:</h4>
                          <ul className="space-y-1">
                            {resource.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center text-sm text-neutral-600">
                                <CheckCircle className="w-4 h-4 text-secondary-500 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CTA - Fixed at bottom */}
                    <div className="p-8 pt-0 border-t border-neutral-100">
                      <Link
                        href={resource.link}
                        className="group w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 transition-colors duration-300 flex items-center justify-center"
                      >
                        Access Resource
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>

                    {/* Background Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 to-secondary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-500 to-secondary-400 text-primary-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <SectionTitle
                label="Get support"
                title="Need more HR support?"
                subtitle="Our HR experts are ready to help you implement these tools and transform your organisation's HR processes."
                variant="dark"
                className="mb-8"
              />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="group bg-primary-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                >
                  Get HR Consultation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                
                <Link
                  href="/services"
                  className="group border-2 border-primary-900 text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-900 hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  View Our Services
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
