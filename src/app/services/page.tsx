'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import { Service } from '@/types';
import { ArrowRight, CheckCircle, Plus } from 'lucide-react';
import {
  IconUsersGroup,
  IconSchool,
  IconFileText,
  IconCalculator,
  IconShieldCheck,
  IconChartHistogram,
  IconBuildingSkyscraper,
  IconStar,
  IconBrain,
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import SectionTitle from '@/components/SectionTitle';

// Metadata moved to layout.tsx

// Helper functions for service comparison
const getServiceDuration = (serviceId: string) => {
  const durations = {
    'recruitment': '2-8 weeks',
    'hr-outsourcing': 'Ongoing',
    'training-development': '1-12 weeks',
    'hr-compliance': '1-4 weeks',
    'salary-surveys': '2-6 weeks',
    'hr-documentation': '1-3 weeks',
    'psychometric-testing': '1-2 weeks'
  };
  return durations[serviceId as keyof typeof durations] || 'Varies';
};

const getServicePrice = (serviceId: string) => {
  const prices = {
    'recruitment': 'KSh 50,000+',
    'hr-outsourcing': 'KSh 25,000+/mo',
    'training-development': 'KSh 15,000+',
    'hr-compliance': 'KSh 30,000+',
    'salary-surveys': 'KSh 40,000+',
    'hr-documentation': 'KSh 20,000+',
    'psychometric-testing': 'KSh 35,000+'
  };
  return prices[serviceId as keyof typeof prices] || 'Contact Us';
};

const getServiceTarget = (serviceId: string) => {
  const targets = {
    'recruitment': 'All Organizations',
    'hr-outsourcing': 'Growing Companies',
    'training-development': 'Teams & Individuals',
    'hr-compliance': 'All Organizations',
    'salary-surveys': 'HR Teams',
    'hr-documentation': 'All Organizations',
    'psychometric-testing': 'HR Teams & Recruiters'
  };
  return targets[serviceId as keyof typeof targets] || 'All Organizations';
};

export default function ServicesPage() {
  const isDesktop = useIsDesktop();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const services: Service[] = [
    {
      id: 'recruitment',
      title: 'Recruitment & Executive Search',
      description: 'Find the perfect talent for your organization with our comprehensive recruitment solutions. From entry-level positions to C-suite executives, we deliver exceptional candidates who drive results.',
      icon: 'users',
      category: 'recruitment',
      features: [
        'Executive Search & C-Suite Placements',
        'Technical & Specialized Recruitment',
        'Mass Recruitment for Large Projects',
        'Talent Assessment & Psychometric Testing',
        'Interview Coordination & Management',
        'Reference Checking & Background Verification',
        'Onboarding Support & Integration',
        'Retained Search Services'
      ]
    },
    {
      id: 'hr-outsourcing',
      title: 'HR Outsourcing',
      description: 'Streamline your HR operations with our professional outsourcing services. Focus on your core business while we handle all aspects of human resource management.',
      icon: 'building',
      category: 'hr-operations',
      features: [
        'Complete HR Department Outsourcing',
        'Payroll Processing & Management',
        'HR Administration & Documentation',
        'Policy Development & Implementation',
        'Compliance Management & Reporting',
        'Employee Relations & Disciplinary Actions',
        'Performance Management Systems',
        'HR Technology Implementation'
      ]
    },
    {
      id: 'training-development',
      title: 'Training & Development',
      description: 'Enhance your team\'s capabilities with our customized training programs. From leadership development to technical skills, we design programs that deliver measurable results.',
      icon: 'graduation',
      category: 'training-development',
      features: [
        'Leadership Development Programs',
        'Technical Skills Training',
        'Soft Skills & Communication Training',
        'Team Building & Collaboration',
        'Performance Management Training',
        'Compliance & Legal Training',
        'Executive Coaching & Mentoring',
        'Custom Training Program Design'
      ]
    },
    {
      id: 'hr-compliance',
      title: 'HR Compliance & Legal',
      description: 'Ensure your organization meets all Kenyan labor laws and regulations. We provide comprehensive compliance support and legal advisory services.',
      icon: 'shield',
      category: 'compliance',
      features: [
        'Labor Law Compliance',
        'Employment Contract Review',
        'Disciplinary Procedures',
        'Legal Advisory Services',
        'Compliance Audits',
        'Policy Development',
        'Risk Assessment',
        'Regulatory Updates'
      ]
    },
    {
      id: 'salary-surveys',
      title: 'Salary Surveys & Analytics',
      description: 'Make data-driven compensation decisions with comprehensive salary surveys, market analytics, and strategic pay structure design.',
      icon: 'bar-chart',
      category: 'analytics',
      features: [
        'Salary Benchmarking',
        'Compensation Analytics',
        'Pay Structure Design',
        'Compensation Modeling',
        'Market Rate Analysis',
        'ROI on Compensation Spend',
        'Pay Equity Assessments',
        'Budget Forecasting'
      ]
    },
    {
      id: 'hr-documentation',
      title: 'HR Documentation & Policies',
      description: 'Professional HR documentation that ensures compliance, clarity, and consistency. From policy development to employee handbooks.',
      icon: 'file-text',
      category: 'documentation',
      features: [
        'Policy Development',
        'Employee Handbooks',
        'Compliance Documentation',
        'HR Forms & Templates',
        'Legal Documentation',
        'Procedure Manuals',
        'Training Materials',
        'Audit Documentation'
      ]
    },
    {
      id: 'psychometric-testing',
      title: 'Psychometric Testing',
      description: 'Comprehensive psychological assessments for talent selection, development, and organizational effectiveness. Data-driven insights for better hiring decisions.',
      icon: 'brain',
      category: 'recruitment',
      features: [
        'Cognitive Ability Testing',
        'Personality Assessments',
        'Aptitude Testing',
        'Emotional Intelligence Testing',
        'Leadership Potential Assessment',
        'Team Dynamics Analysis',
        'Cultural Fit Evaluation',
        'Custom Assessment Design'
      ]
    }
  ];

  const benefits = [
    'Access to Expert HR Knowledge',
    'Cost-Effective Solutions',
    'Compliance Assurance',
    'Scalable Services',
    '24/7 Support & Monitoring',
    'Proven Track Record',
    'Customized Approach',
    'Technology Integration',
    'Data-Driven Insights & Reporting',
    'Dedicated Account Management'
  ];

  // Filter services based on active filter
  const filteredServices = services.filter(service => {
    if (activeFilter === 'all') return true;
    return service.category === activeFilter;
  });

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
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
              initial={{ opacity: 0, ...(isDesktop ? { scale: 0.8 } : {}) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SectionTitle
                label="Our services"
                title="Comprehensive HR solutions"
                titleLine2="that drive results."
                subtitle="From recruitment to training, we offer a full spectrum of HR services designed to help your organisation thrive in today's competitive business environment."
                variant="hero"
                className="mb-8"
              />
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-neutral-50/50">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionTitle
            label="Services"
            title="Our services at a glance."
            subtitle="Choose a category or browse all services below."
            variant="section"
            className="mb-10"
          />
          {/* Service Categories Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'all' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              All Services
            </button>
            <button 
              onClick={() => setActiveFilter('recruitment')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'recruitment' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Recruitment
            </button>
            <button 
              onClick={() => setActiveFilter('hr-operations')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'hr-operations' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              HR Operations
            </button>
            <button 
              onClick={() => setActiveFilter('training-development')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'training-development' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Training & Development
            </button>
            <button 
              onClick={() => setActiveFilter('compliance')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'compliance' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Compliance
            </button>
            <button 
              onClick={() => setActiveFilter('analytics')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'analytics' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveFilter('documentation')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'documentation' 
                  ? 'bg-primary-900 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Documentation
            </button>
          </div>

          {/* Enhanced Service Cards */}
          {isMounted ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => (
                <EnhancedServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
                  <div className="w-16 h-16 bg-neutral-200 rounded-xl mb-6"></div>
                  <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Comparison Matrix */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionTitle
            label="Compare"
            title="Find the right solution for your organisation."
            subtitle="Compare our services to find the perfect fit for your needs."
            variant="section"
            className="mb-16"
          />

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-primary-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Service</th>
                  <th className="px-6 py-4 text-center font-semibold">Duration</th>
                  <th className="px-6 py-4 text-center font-semibold">Best For</th>
                  <th className="px-6 py-4 text-center font-semibold">Features</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <tr key={service.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} hover:bg-primary-50 transition-colors duration-300`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                          {(() => {
                            const iconMap = {
                              'users': IconUsersGroup,
                              'building': IconBuildingSkyscraper,
                              'graduation': IconSchool,
                              'file-text': IconFileText,
                              'calculator': IconCalculator,
                              'shield': IconShieldCheck,
                              'bar-chart': IconChartHistogram,
                            };
                            const IconComponent =
                              iconMap[service.icon as keyof typeof iconMap] || IconUsersGroup;
                            return <IconComponent className="w-4 h-4 text-secondary-500" stroke={1.7} />;
                          })()}
                        </div>
                        <div>
                          <div className="font-semibold text-primary-900">{service.title}</div>
                          <div className="text-sm text-neutral-600">{service.features.length} key features</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        {getServiceDuration(service.id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-neutral-600">
                        {getServiceTarget(service.id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
                        {service.features.length} features
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/services/${service.id}`}
                        className="inline-flex items-center px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors duration-300"
                      >
                        Learn More
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section — two-column: intro left, accordion right */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionTitle
            label="FAQ"
            title="Common questions about our HR services."
            subtitle="Find answers below, or contact us for a confidential discussion about your organisation\u2019s needs."
            variant="section"
            className="mb-12"
          />
          <div className="max-w-4xl mx-auto">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Benefits Section — world-class layout: aligned heights, refined card, clear CTA */}
      <section className="py-20 md:py-28 bg-neutral-50/50">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionTitle
            label="Why work with us"
            title="Expertise and results that scale with your organisation."
            subtitle="We combine deep HR expertise with a track record you can measure—so you get both strategic guidance and tangible outcomes."
            variant="section"
            className="mb-14 md:mb-16 max-w-3xl mx-auto"
          />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,400px)_1fr] gap-8 lg:gap-14 items-stretch max-w-6xl mx-auto">
            <div className="relative flex-shrink-0 w-full aspect-[3/4] max-h-[520px] lg:max-h-none lg:aspect-auto lg:h-full lg:min-h-[460px] rounded-2xl overflow-hidden bg-white shadow-sm">
              <Image
                src="/images/about/African American Businessman with Tablet.png"
                alt="Professional with tablet - HR expertise"
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
            <div className="min-w-0 flex flex-col h-full lg:min-h-[460px]">
              <div className="rounded-2xl bg-white border border-neutral-100 shadow-soft p-6 sm:p-8 lg:p-10 flex-1 min-h-0 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-5">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary-500/10 flex items-center justify-center mt-0.5" aria-hidden>
                        <CheckCircle className="w-3.5 h-3.5 text-secondary-600" />
                      </span>
                      <span className="text-primary-900 font-medium text-[15px] leading-snug min-w-0 pt-px">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-neutral-100 flex-shrink-0">
                <p className="text-primary-900 font-semibold text-base">
                  Ready to strengthen your HR framework?
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-secondary-500 text-white text-sm font-semibold rounded-xl hover:bg-secondary-600 transition-colors shadow-sm"
                >
                  Get in touch
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-500 to-secondary-400 text-primary-900">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <SectionTitle
              label="Get started"
              title="Ready to transform your HR?"
              subtitle="Let's discuss how our comprehensive HR services can drive your organisation's success. Contact us today for a free consultation."
              variant="dark"
              className="mb-8"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group bg-primary-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
              >
                Get Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <Link
                href="/about"
                className="group border-2 border-primary-900 text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-900 hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Enhanced Service Card — Tabler icons, consistent gold accent + light cream container
const EnhancedServiceCard = ({ service, index }: { service: Service; index: number }) => {
  const iconMap = {
    'users': IconUsersGroup,
    'building': IconBuildingSkyscraper,
    'graduation': IconSchool,
    'file-text': IconFileText,
    'calculator': IconCalculator,
    'shield': IconShieldCheck,
    'bar-chart': IconChartHistogram,
    'brain': IconBrain,
  };

  const IconComponent = iconMap[service.icon as keyof typeof iconMap] || IconUsersGroup;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      viewport={{ once: true, margin: '40px' }}
      className="group relative bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 border border-neutral-100 flex flex-col h-full"
    >
      {/* Service Badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-xs font-medium">
          {getServiceDuration(service.id)}
        </span>
      </div>

      {/* Icon — same styling as header/service cards: cream bg + gold icon */}
      <div className="w-16 h-16 bg-secondary-50 rounded-xl flex items-center justify-center mb-6 border border-secondary-100 group-hover:shadow-md transition-transform duration-200 group-hover:scale-105">
        <IconComponent className="w-8 h-8 text-secondary-500" stroke={1.7} />
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-xl font-heading font-semibold text-primary-900 group-hover:text-secondary-500 transition-colors duration-300">
            {service.title}
          </h3>
          
          <p className="text-neutral-600 leading-relaxed mt-4">
            {service.description}
          </p>

          {/* Key Features — no per-item animation for performance */}
          <div className="space-y-2 mt-6">
            <h4 className="font-semibold text-primary-900 text-sm">Key Features:</h4>
            <ul className="space-y-2">
              {service.features.slice(0, 4).map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className="flex gap-2 items-start text-sm text-neutral-600"
                >
                  <CheckCircle className="w-4 h-4 text-secondary-500 flex-shrink-0 mt-0.5" aria-hidden />
                  <span className="min-w-0 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Section - Always at bottom */}
        <div className="pt-4 border-t border-neutral-100 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-neutral-600">
              Best for: <span className="font-medium text-primary-900">{getServiceTarget(service.id)}</span>
            </div>
            <div className="text-sm text-neutral-500">
              Duration: <span className="font-medium">{getServiceDuration(service.id)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/services/${service.id}`}
              className="flex-1 bg-primary-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors duration-300 text-center"
            >
              Learn More
            </Link>
            <Link
              href="/contact"
              className="flex-1 border border-primary-900 text-primary-900 py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-900 hover:text-white transition-colors duration-300 text-center"
            >
              Get Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 to-secondary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

// FAQ Accordion Component
const FAQAccordion = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How long does the recruitment process typically take?",
      answer: "Our recruitment process typically takes 2-4 weeks for standard positions and 4-8 weeks for executive roles, depending on the complexity and requirements of the position."
    },
    {
      question: "Do you provide ongoing support after placement?",
      answer: "Yes, we provide comprehensive onboarding support and follow-up services to ensure successful integration and long-term retention of placed candidates."
    },
    {
      question: "What industries do you specialize in?",
      answer: "We serve organizations across diverse industries including technology, banking, healthcare, manufacturing, education, and many more with specialized knowledge for each sector."
    },
    {
      question: "Can you help with compliance and legal HR issues?",
      answer: "Absolutely. Our HR advisory services include compliance management, policy development, and legal guidance to ensure your organization meets all regulatory requirements."
    },
    {
      question: "What makes your HR services different from competitors?",
      answer: "Our combination of local expertise with global best practices, proven track record with 500+ companies, and personalized approach tailored to each client's unique needs sets us apart in the Kenyan market."
    },
    {
      question: "Do you offer customized HR solutions?",
      answer: "Yes, we specialize in creating tailored HR solutions that align with your organization's specific goals, culture, and industry requirements. Every solution is designed to meet your unique challenges."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors duration-200"
          >
            <h3 className="font-medium text-primary-900 text-base pr-4">
              {faq.question}
            </h3>
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all duration-200 ${
                activeFAQ === index
                  ? 'bg-primary-900 border-primary-900 text-white'
                  : 'bg-neutral-50 text-neutral-500'
              }`}
            >
              <Plus
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeFAQ === index ? 'rotate-45' : ''
                }`}
              />
            </span>
          </button>

          <AnimatePresence>
            {activeFAQ === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-0">
                  <p className="text-neutral-600 leading-relaxed text-sm border-t border-neutral-100 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

