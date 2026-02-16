'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Brain, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Target, 
  BarChart3, 
  Shield, 
  Award,
  Clock,
  FileText,
  TrendingUp,
  Star,
  Building2,
  Download
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';
import ServicePageCard from '@/components/ServicePageCard';
import Image from 'next/image';
import Link from 'next/link';

export default function PsychometricTestingPage() {
  const testTypes = [
    {
      icon: Brain,
      title: 'Cognitive Ability Tests',
      description: 'Measure reasoning, problem-solving, and analytical thinking skills',
      features: ['Verbal Reasoning', 'Numerical Reasoning', 'Abstract Reasoning', 'Logical Thinking']
    },
    {
      icon: Users,
      title: 'Personality Assessments',
      description: 'Evaluate behavioral traits, work styles, and cultural fit',
      features: ['Big Five Personality', 'Behavioral Styles', 'Leadership Potential', 'Team Dynamics']
    },
    {
      icon: Target,
      title: 'Aptitude Tests',
      description: 'Assess specific skills and abilities for particular roles',
      features: ['Technical Aptitude', 'Mechanical Reasoning', 'Spatial Ability', 'Language Skills']
    },
    {
      icon: BarChart3,
      title: 'Emotional Intelligence',
      description: 'Measure emotional awareness and interpersonal skills',
      features: ['Self-Awareness', 'Social Skills', 'Empathy', 'Emotional Regulation']
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Assessment Planning',
      description: 'We work with you to identify the specific competencies and traits needed for the role',
      icon: Target
    },
    {
      step: '02',
      title: 'Test Administration',
      description: 'Professional administration of validated psychometric assessments in controlled environments',
      icon: Brain
    },
    {
      step: '03',
      title: 'Analysis & Scoring',
      description: 'Comprehensive analysis of results using advanced statistical methods and norm comparisons',
      icon: BarChart3
    },
    {
      step: '04',
      title: 'Detailed Reporting',
      description: 'Detailed reports with actionable insights and recommendations for hiring decisions',
      icon: FileText
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Objective Selection',
      description: 'Remove bias and subjectivity from hiring decisions with data-driven assessments'
    },
    {
      icon: TrendingUp,
      title: 'Improved Performance',
      description: 'Higher job performance and reduced turnover through better candidate-job matching'
    },
    {
      icon: Shield,
      title: 'Risk Mitigation',
      description: 'Identify potential issues early and make informed decisions about candidate suitability'
    },
    {
      icon: Award,
      title: 'Cultural Fit',
      description: 'Ensure candidates align with your organizational values and team dynamics'
    }
  ];

  const clientSuccess = {
    company: 'Central Bank of Kenya (CBK)',
    challenge: 'Need to assess over 1,000 potential hires for various positions requiring different skill sets and competencies',
    solution: 'Comprehensive psychometric testing program including aptitude tests and personality assessments',
    results: [
      'Successfully assessed 1,000+ candidates',
      'Improved hiring accuracy by 40%',
      'Reduced time-to-hire by 30%',
      'Enhanced candidate experience with professional assessment process'
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
            <SectionTitle
              label="Psychometric testing"
              title="Psychometric testing"
              titleLine2="for better hiring decisions."
              subtitle="Comprehensive psychological assessments to identify the right talent, reduce hiring risks, and improve organisational performance through data-driven selection."
              variant="hero"
              className="mb-8"
            />
          </motion.div>
        </div>
      </section>

      {/* Test Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="Assessment types"
              title="Comprehensive assessment types."
              subtitle="Our psychometric testing covers all aspects of human capability and potential, providing you with complete insights for informed hiring decisions."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testTypes.map((test, index) => (
              <ServicePageCard key={test.title} item={test} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="Our process"
              title="Our assessment process."
              subtitle="A systematic approach to psychometric testing that ensures accuracy, reliability, and actionable insights for your hiring decisions."
              variant="section"
            />
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-semibold text-primary-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center border border-secondary-100">
                      <step.icon className="w-6 h-6 text-secondary-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionTitle
              label="Why us"
              title="Why choose psychometric testing?"
              subtitle="Transform your hiring process with scientific assessments that provide objective insights and improve your selection outcomes."
              variant="section"
              className="mb-16"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gradient-to-br from-neutral-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-secondary-100">
                  <benefit.icon className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-primary-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Success Story */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/images/clients/interview.jpg" 
                alt="Professional assessment and testing environment" 
                className="w-full h-full object-cover object-[center_bottom]"
              />
              <div className="absolute inset-0 bg-white/80"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Logo and Company Info */}
                <div className="space-y-6">
                  <div className="text-center md:text-left">
                    <div className="w-24 h-24 mx-auto md:mx-0 mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
                      <img
                        src="/images/clients/cbk_loho.png"
                        alt="Central Bank of Kenya"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-900 mb-2">
                      Central Bank of Kenya
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-neutral-600">
                      <span className="inline-flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        2+ Years Partnership
                      </span>
                      <span className="inline-flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        1,000+ Candidates Assessed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 text-lg">Challenge:</h4>
                    <p className="text-neutral-600 leading-relaxed">{clientSuccess.challenge}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-3 text-lg">Solution:</h4>
                    <p className="text-neutral-600 leading-relaxed">{clientSuccess.solution}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-3 text-lg">Results Achieved:</h4>
                    <ul className="space-y-2">
                      {clientSuccess.results.map((result, index) => (
                        <li key={index} className="flex items-start text-neutral-600">
                          <CheckCircle className="w-5 h-5 text-secondary-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
            <SectionTitle label="Industries" title="Industries we serve." subtitle="With deep expertise across multiple sectors, we understand the unique talent assessment needs of each industry we serve." variant="section" />
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
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-primary-900 mb-4">Ready to Transform Your Hiring?</h3>
                  <p className="text-neutral-600 leading-relaxed mb-6">Let our psychometric testing experts help you make better hiring decisions and build a stronger, more capable workforce.</p>
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
              <p className="text-orange-100 mb-6 flex-grow">Comprehensive overview of Eagle HR&apos;s services, expertise, and track record in recruitment.</p>
              <a href="/downloads/eagle-hr-company-profile.pdf" download="Eagle-HR-Company-Profile.pdf" className="inline-flex items-center text-white hover:text-secondary-300 transition-colors duration-300 mt-auto"><Download className="w-4 h-4 mr-2" />Download PDF</a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} viewport={{ once: true }} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 flex flex-col h-full">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6"><Building2 className="w-8 h-8 text-white" /></div>
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
