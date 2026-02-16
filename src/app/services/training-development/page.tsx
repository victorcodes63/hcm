'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Users, Target, Award, CheckCircle, Download, ArrowRight, Phone, Mail, Clock, TrendingUp, Star, Building2, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/SectionTitle';
import ServicePageCard from '@/components/ServicePageCard';

export default function TrainingDevelopmentPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const trainingServices = [
    {
      icon: Users,
      title: "Leadership Development",
      description: "Comprehensive leadership programs to develop and enhance management capabilities at all levels of your organization.",
      features: ["Executive coaching", "Management training", "Team leadership", "Strategic thinking"],
      color: "from-blue-600 to-blue-700",
      bgColor: "from-blue-100 to-sky-200"
    },
    {
      icon: BookOpen,
      title: "Skills Training",
      description: "Targeted skills development programs tailored to your industry and organizational needs for maximum impact.",
      features: ["Technical skills", "Soft skills", "Industry-specific training", "Certification programs"],
      color: "from-emerald-600 to-emerald-700",
      bgColor: "from-emerald-100 to-emerald-200"
    },
    {
      icon: Target,
      title: "Performance Management",
      description: "Training on effective performance management systems and employee evaluation processes for better outcomes.",
      features: ["Goal setting", "Performance reviews", "Feedback systems", "Development planning"],
      color: "from-purple-600 to-purple-700",
      bgColor: "from-purple-100 to-purple-200"
    },
    {
      icon: Award,
      title: "Board Training Services",
      description: "Specialized training for board members including interview skills, vision and mission development, and governance best practices.",
      features: ["Interview skills training", "Vision & mission workshops", "Governance training", "Board effectiveness"],
      color: "from-orange-600 to-orange-700",
      bgColor: "from-orange-100 to-orange-200"
    }
  ];

  const boardTrainingServices = [
    "Interview Skills Training",
    "Vision & Mission Development", 
    "Governance Best Practices",
    "Board Effectiveness Training",
    "Strategic Planning Workshops",
    "Risk Management Training"
  ];

  const pacidaSpotlight = {
    company: "Pacida",
    logo: "/images/clients/Pacida Logo.png",
    description: "Pacida has been a valued client of Eagle HR's training and development services, particularly benefiting from our specialized board training programs.",
    services: [
      "Board interview skills training",
      "Vision and mission development workshops", 
      "Governance effectiveness training",
      "Strategic planning facilitation"
    ],
    results: [
      "Enhanced board interview processes",
      "Clearer organizational vision and mission",
      "Improved governance structures",
      "Better strategic decision-making"
    ]
  };

  const stats = [
    { number: "95%", label: "Training Effectiveness", description: "Measured improvement in skills" },
    { number: "500+", label: "Participants Trained", description: "Across various industries" },
    { number: "50+", label: "Training Programs", description: "Customized for different needs" },
    { number: "98%", label: "Satisfaction Rate", description: "Based on participant feedback" }
  ];

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
              backgroundImage: 'url(/images/services/training/hero.jpg)'
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
            className="text-center max-w-4xl mx-auto"
          >
            <SectionTitle
              label="Training & development"
              title="Training & development."
              subtitle="Enhance your team's capabilities with our customised training programmes. We focus on leadership development, skills training, and performance management for sustainable growth."
              variant="hero"
              className="mb-8"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-secondary-500 text-white rounded-lg font-semibold text-lg hover:bg-secondary-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/downloads/eagle-hr-training-guide.pdf"
                download="Eagle-HR-Training-Guide.pdf"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-900 rounded-lg font-semibold text-lg border-2 border-primary-900 hover:bg-primary-900 hover:text-white transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Download className="mr-2 w-5 h-5" />
                Download Guide
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
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
              label="Our services"
              title="Comprehensive training solutions."
              subtitle="We offer end-to-end training and development programmes designed to enhance your team's capabilities and drive organisational success."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trainingServices.map((service, index) => (
              <ServicePageCard key={index} item={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Board Training Services Section */}
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
              label="Board training"
              title="Specialised board training services."
              subtitle="Our specialised board training programmes focus on governance excellence, strategic leadership, and organisational effectiveness for board members and executives."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {boardTrainingServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center mb-4 border border-secondary-100">
                  <Award className="w-6 h-6 text-secondary-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary-900">{service}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Spotlight Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionTitle
              label="Case study"
              title="Client spotlight."
              subtitle="Success stories from our training and development partnerships across various industries and organisational levels."
              variant="section"
            />
          </motion.div>

          <div className="max-w-6xl mx-auto">
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
                    backgroundImage: 'url(/images/services/training/pacida.jpg)'
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
                          src={pacidaSpotlight.logo}
                          alt={pacidaSpotlight.company}
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
                        {pacidaSpotlight.company}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed">
                        {pacidaSpotlight.description}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-3 text-lg">Services Provided:</h4>
                      <ul className="space-y-2">
                        {pacidaSpotlight.services.map((service, index) => (
                          <li key={index} className="flex items-start text-neutral-600">
                            <CheckCircle className="w-5 h-5 text-secondary-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-3 text-lg">Results Achieved:</h4>
                      <ul className="space-y-2">
                        {pacidaSpotlight.results.map((result, index) => (
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
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionTitle
              label="Impact"
              title="Training impact & results."
              subtitle="Our training programmes deliver measurable results that transform individuals and organisations for long-term success."
              variant="dark"
              className="mb-16"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-primary-200 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-primary-300">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-16">
            <SectionTitle label="Industries" title="Industries we serve." subtitle="With deep expertise across multiple sectors, we understand the unique talent and development needs of each industry we serve." variant="section" />
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
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-primary-900 mb-4">Ready to Transform Your Team?</h3>
                  <p className="text-neutral-600 leading-relaxed mb-6">Partner with us to develop your people through leadership programmes, skills training, and performance management that drive sustainable growth.</p>
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
              <p className="text-orange-100 mb-6 flex-grow">Comprehensive overview of Eagle HR&apos;s services, expertise, and track record in training and development.</p>
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
