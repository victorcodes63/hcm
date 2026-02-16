'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, Users, Calculator, ShieldCheck, FileText, Clock, CheckCircle, Download, ArrowRight, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/SectionTitle';
import ServicePageCard from '@/components/ServicePageCard';

export default function HROutsourcingPage() {
  const outsourcingServices = [
    {
      icon: Calculator,
      title: "Payroll Management",
      description: "Complete payroll processing including salary calculations, deductions, and statutory compliance with accuracy and timeliness.",
      features: ["Salary processing", "Statutory deductions", "Tax calculations", "Payslip generation"],
      color: "from-blue-600 to-blue-700",
      bgColor: "from-blue-100 to-sky-200"
    },
    {
      icon: Users,
      title: "HR Administration",
      description: "Comprehensive HR administrative support including record keeping, employee data management, and HR documentation.",
      features: ["Employee records", "HR documentation", "Data management", "Administrative support"],
      color: "from-emerald-600 to-emerald-700",
      bgColor: "from-emerald-100 to-emerald-200"
    },
    {
      icon: ShieldCheck,
      title: "Compliance Management",
      description: "Ensure your organization meets all regulatory requirements and maintains compliance with Kenyan labor laws.",
      features: ["Labor law compliance", "Regulatory reporting", "Audit support", "Policy implementation"],
      color: "from-purple-600 to-purple-700",
      bgColor: "from-purple-100 to-purple-200"
    },
    {
      icon: FileText,
      title: "Policy Development",
      description: "Development and implementation of HR policies that align with Kenyan labor laws and industry best practices.",
      features: ["Policy creation", "Legal compliance", "Implementation support", "Regular updates"],
      color: "from-orange-600 to-orange-700",
      bgColor: "from-orange-100 to-orange-200"
    }
  ];

  const benefits = [
    "Cost Reduction", "Expert HR Knowledge", "Compliance Assurance", "Time Savings",
    "Scalable Solutions", "Risk Mitigation", "Technology Integration", "24/7 Support"
  ];

  const stats = [
    { number: "40%", label: "Average Cost Savings", description: "Reduction in HR operational costs" },
    { number: "95%", label: "Compliance Rate", description: "Regulatory compliance achievement" },
    { number: "500+", label: "Companies Served", description: "Across various industries" },
    { number: "24/7", label: "Support Available", description: "Round-the-clock HR assistance" }
  ];

  const caseStudy = {
    company: "Bata Shoe Company Kenya",
    duration: "5+ Years Partnership",
    staffSize: "500+ Employees",
    image: "/images/clients/bata_logo.jpg",
    challenge: "Managing comprehensive HR operations for a large manufacturing workforce across multiple locations in Kenya, including complex statutory requirements, leave management, and compliance with Kenyan labor laws.",
    solution: "Complete HR outsourcing solution covering payroll management, statutory deductions (PAYE, NSSF, NHIF), leave management, compliance monitoring, and policy development tailored for the manufacturing sector.",
    results: [
      "100% compliance with Kenyan labor laws and statutory requirements",
      "Streamlined payroll processing for 500+ employees across multiple locations",
      "Efficient leave management system with automated tracking and approvals",
      "Comprehensive HR policy development aligned with manufacturing industry standards",
      "Regular compliance audits and reporting ensuring zero violations",
      "Cost-effective HR operations allowing focus on core manufacturing business"
    ]
  };

  const industries = [
    "Manufacturing & Industrial", "Technology & IT", "Financial Services", "Healthcare & Pharmaceuticals",
    "Retail & Consumer Goods", "Education & Training", "Government & Public Sector", "NGOs & Development"
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
              backgroundImage: 'url(/images/services/outsourcing/hero.jpg)'
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
              label="HR outsourcing"
              title="HR outsourcing services."
              subtitle="Streamline your HR operations with our professional outsourcing services. Focus on your core business while we handle your HR needs with expertise and efficiency."
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
                href="/downloads/eagle-hr-outsourcing-guide.pdf"
                download="Eagle-HR-Outsourcing-Guide.pdf"
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
              title="Comprehensive HR outsourcing solutions."
              subtitle="We offer end-to-end HR outsourcing services designed to streamline your operations and ensure compliance with Kenyan labour laws."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {outsourcingServices.map((service, index) => (
              <ServicePageCard key={index} item={service} index={index} />
            ))}
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
            className="mb-16"
          >
            <SectionTitle
              label="Why us"
              title="Why choose our HR outsourcing services?"
              subtitle="Partner with us to transform your HR operations and focus on what matters most—growing your business."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary-100">
                  <CheckCircle className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-semibold text-primary-900">{benefit}</h3>
              </motion.div>
            ))}
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
              title="Proven results & impact."
              subtitle="Our HR outsourcing services deliver measurable results that transform businesses and drive sustainable growth."
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

      {/* Case Study Section */}
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
              label="Case study"
              title="Success story."
              subtitle="A long-term partnership that demonstrates our commitment to excellence and proven results in HR outsourcing."
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
                    backgroundImage: 'url(/images/services/outsourcing/Bata-Image.jpg)'
                  }}
                />
                <div className="absolute inset-0 bg-white/85" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  {/* Logo and Company Info */}
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <div className="w-24 h-24 mx-auto md:mx-0 mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
                        <img
                          src={caseStudy.image}
                          alt={caseStudy.company}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center hidden">
                          <Building2 className="w-12 h-12 text-primary-900" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-primary-900 mb-2">
                        {caseStudy.company}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-neutral-600">
                        <span className="inline-flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {caseStudy.duration}
                        </span>
                        <span className="inline-flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {caseStudy.staffSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
              <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-3 text-lg">Challenge:</h4>
                      <p className="text-neutral-600 leading-relaxed">{caseStudy.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-3 text-lg">Solution:</h4>
                      <p className="text-neutral-600 leading-relaxed">{caseStudy.solution}</p>
                </div>
                
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-3 text-lg">Results Achieved:</h4>
                      <ul className="space-y-2">
                        {caseStudy.results.map((result, index) => (
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
        </div>
      </section>

      {/* Industries Section */}
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
              label="Industries"
              title="Industries we serve."
              subtitle="Our HR outsourcing expertise spans across various industries, providing tailored solutions for each sector's unique requirements."
              variant="section"
            />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-secondary-50/80 rounded-lg p-4 text-center border border-secondary-100/60 hover:bg-secondary-100/80 transition-colors duration-300"
              >
                <div className="text-sm font-medium text-primary-900">{industry}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-56 lg:h-auto lg:min-h-[340px] order-1">
                  <Image
                    src="/images/about/Smiling%20African%20American%20Woman%20Business%20Suit.PNG"
                    alt="Professional HR consultation"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center order-2">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-primary-900 mb-4">
                    Ready to Strengthen Your HR Framework?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-6">
                    Partner with us to build scalable HR systems that enhance performance, ensure compliance, and support sustainable business growth.
                  </p>
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
              <p className="text-orange-100 mb-6 flex-grow">Comprehensive overview of Eagle HR&apos;s services, expertise, and track record in HR outsourcing.</p>
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
