'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Users, 
  Download, 
  CheckCircle, 
  Target, 
  Award, 
  Clock, 
  TrendingUp,
  Globe,
  Briefcase,
  UserCheck,
  BarChart3,
  ArrowRight,
  Star,
  Building2,
  Users2,
  FileText,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/SectionTitle';
import { useIsDesktop } from '@/hooks/useIsDesktop';

export default function RecruitmentPage() {
  const isDesktop = useIsDesktop();
  const recruitmentServices = [
    {
      icon: Target,
      title: "Executive Search",
      description: "C-suite and senior leadership recruitment with global reach and local expertise",
      features: ["C-suite placements", "Board appointments", "Senior management", "Succession planning"],
      image: "/images/services/recruitment_page/exectuive.jpg",
      color: "from-slate-600 to-slate-700",
      bgColor: "from-slate-100 to-gray-200"
    },
    {
      icon: Briefcase,
      title: "Professional Recruitment",
      description: "Mid to senior-level professionals across all industries and functions",
      features: ["Management roles", "Specialized positions", "Industry expertise", "Cultural fit assessment"],
      image: "/images/services/recruitment_page/professional.jpg",
      color: "from-blue-600 to-blue-700",
      bgColor: "from-blue-100 to-sky-200"
    },
    {
      icon: Users2,
      title: "Bulk Recruitment",
      description: "High-volume recruitment for entry to mid-level positions with speed and efficiency",
      features: ["Mass hiring", "Graduate programs", "Seasonal recruitment", "Project-based hiring"],
      image: "/images/services/recruitment_page/bulk_interview.svg",
      color: "from-orange-600 to-orange-700",
      bgColor: "from-orange-100 to-orange-200"
    },
    {
      icon: UserCheck,
      title: "Talent Assessment",
      description: "Comprehensive evaluation through psychometric testing and behavioral analysis",
      features: ["Psychometric testing", "Behavioral assessments", "Skills evaluation", "Cultural fit analysis"],
      image: "/images/services/recruitment_page/assessment.svg",
      color: "from-emerald-600 to-emerald-700",
      bgColor: "from-emerald-100 to-emerald-200"
    }
  ];

  const industries = [
    "Banking & Financial Services", "Technology & IT", "Healthcare & Pharmaceuticals", 
    "Manufacturing & Engineering", "Government & Public Sector", "NGOs & Development",
    "Education & Training", "Retail & Consumer Goods", "Energy & Utilities", "Real Estate & Construction"
  ];

  const processSteps = [
    {
      step: "01",
      title: "Job Description Development",
      description: "We collaborate with you to develop comprehensive job descriptions, identifying specific skills, qualifications, and experience required for the role while ensuring alignment with organizational goals and industry standards."
    },
    {
      step: "02", 
      title: "Strategic Advertising & Sourcing",
      description: "We create compelling job advertisements and deploy them across multiple channels including print media, digital platforms, LinkedIn, and our extensive network to reach the right talent pool."
    },
    {
      step: "03",
      title: "Application Management & Shortlisting",
      description: "We manage all applications with complete accountability, ensuring regional balance, gender inclusivity, and equal opportunity in our transparent shortlisting process."
    },
    {
      step: "04",
      title: "Comprehensive Interviews",
      description: "Our professional team conducts probing face-to-face interviews to test candidates' understanding and ability to deliver performance standards, followed by written assessments focusing on technical skills and experience."
    },
    {
      step: "05",
      title: "Background & Integrity Checks",
      description: "We conduct thorough background checks with past employers and integrity verification through EACC, HELB, DCI, and CRB to ensure candidate credibility and ethical standards."
    },
    {
      step: "06",
      title: "Psychometric Assessment",
      description: "Top candidates undergo comprehensive psychometric testing using the Work Personality Index to evaluate leadership potential, work style, problem-solving abilities, and stress management capabilities."
    },
    {
      step: "07",
      title: "Panel Review & Selection",
      description: "Our expert panel reviews all assessments and provides detailed reports with scores, rankings, and recommendations to support your final selection decision."
    },
    {
      step: "08",
      title: "Offer Management & Onboarding",
      description: "We facilitate the offer process and support smooth onboarding to ensure successful placement and long-term retention."
    }
  ];

  const stats = [
    { number: "2000+", label: "Successful Placements", description: "Across all industries and levels" },
    { number: "98%", label: "Client Satisfaction", description: "Based on post-placement feedback" },
    { number: "15", label: "Days Average", description: "Time to present qualified candidates" },
    { number: "85%", label: "Retention Rate", description: "Candidates still with clients after 2 years" }
  ];

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 min-h-[50vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image with Reduced Opacity */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
            style={{
              backgroundImage: 'url(/images/services/recruitment_page/recruitment_interview.jpg)'
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
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SectionTitle
                label="Recruitment & Executive Search"
                title="World-class talent acquisition."
                subtitle="Partner with Kenya's leading recruitment firm to find exceptional talent that drives your business forward. From C-suite executives to specialised professionals, we deliver results that exceed expectations."
                variant="hero"
                className="mb-8"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/contact"
                className="group bg-secondary-500 text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center"
              >
                Start Your Search
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <a
                href="/downloads/eagle-hr-company-profile.pdf"
                download="Eagle-HR-Company-Profile.pdf"
                className="group border-2 border-primary-300 text-primary-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 hover:border-primary-400 transition-all duration-300 flex items-center"
              >
                <Download className="mr-2 w-5 h-5" />
                Download Company Profile
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-secondary-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-primary-200">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              label="Our services"
              title="Comprehensive recruitment solutions."
              subtitle="We offer end-to-end recruitment services tailored to your specific needs, from executive search to bulk hiring and everything in between."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {recruitmentServices.map((service, index) => (
              <motion.div
                key={index}
                initial={isDesktop ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                whileInView={isDesktop ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={isDesktop ? { delay: index * 0.1, duration: 0.6 } : { duration: 0 }}
                viewport={{ once: true }}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 hover:border-primary-200 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row h-full min-w-0">
                  {/* Image: full width on mobile, fixed width on desktop */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto md:min-h-[200px] flex-shrink-0 rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-90 hidden items-center justify-center`}>
                      <div className="w-16 h-16 bg-white/20 flex items-center justify-center">
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20`} />
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 flex items-center justify-center backdrop-blur-sm rounded-lg">
                      <service.icon className="w-5 h-5 text-primary-900" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center min-w-0 rounded-b-xl md:rounded-r-xl md:rounded-bl-none">
                    <h3 className="text-xl sm:text-2xl font-semibold text-primary-900 mb-3 sm:mb-4">
                      {service.title}
                    </h3>
                    <p className="text-neutral-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                      {service.description}
                    </p>
                    <ul className="space-y-2 sm:space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-neutral-600 text-sm sm:text-base">
                          <CheckCircle className="w-5 h-5 text-secondary-500 mr-3 flex-shrink-0" />
                          <span className="min-w-0">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              label="Our process"
              title="Our proven recruitment process."
              subtitle="Our systematic approach ensures we find the right talent for your organisation while maintaining the highest standards of quality and efficiency."
              variant="section"
            />
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Timeline Container */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary-500 via-secondary-400 to-secondary-500"></div>
              
              <div className="space-y-12">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="relative flex items-start"
                  >
                    {/* Timeline Node */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className="w-16 h-16 bg-white border-4 border-secondary-500 text-secondary-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                </div>
                
                    {/* Content Card */}
                    <div className="ml-8 flex-1">
                      <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold text-primary-900 mb-4">
                          {step.title}
                        </h3>
                        <p className="text-neutral-600 leading-relaxed">
                          {step.description}
                  </p>
                </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
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
              label="Industries"
              title="Industries we serve."
              subtitle="With deep expertise across multiple sectors, we understand the unique talent requirements and challenges of each industry we serve."
              variant="section"
            />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-secondary-50/80 rounded-lg p-4 text-center border border-secondary-100/60 hover:bg-secondary-100/80 transition-colors duration-300"
              >
                <div className="text-sm font-medium text-primary-900">{industry}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Reused from home, rearranged: image left, text + buttons right */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: Image */}
                <div className="relative h-56 lg:h-auto lg:min-h-[340px] order-1">
                  <Image
                    src="/images/about/Smiling%20African%20American%20Woman%20Business%20Suit.PNG"
                    alt="Professional HR consultation"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Right: Text + CTA */}
                <div className="p-8 lg:p-10 flex flex-col justify-center order-2">
                  <h3 className="text-2xl lg:text-3xl font-heading font-bold text-primary-900 mb-4">
                    Ready to Find Your Next Great Hire?
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-6">
                    Partner with Kenya&apos;s leading recruitment firm to attract, assess, and place the right talent—from C-suite to specialist roles—so your business can grow with confidence.
                  </p>
                  <p className="text-xl font-semibold text-secondary-500 mb-4">Take the next step</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/contact"
                      className="bg-primary-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-800 transition text-center"
                    >
                      Start Your Search
                    </Link>
                    <Link
                      href="/contact"
                      className="border border-primary-900 text-primary-900 px-8 py-4 rounded-lg font-semibold hover:bg-primary-900 hover:text-white transition text-center"
                    >
                      Schedule Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Resources Section */}
      <section className="py-12 bg-secondary-500 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="Resources"
              title="Download our resources."
              subtitle="Access our company profile and client list to learn more about Eagle HR and the organisations we partner with."
              variant="dark"
              className="mb-16"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Company Profile</h3>
              <p className="text-orange-100 mb-6 flex-grow">
                Comprehensive overview of Eagle HR&apos;s services, expertise, and track record in recruitment.
              </p>
              <a
                href="/downloads/eagle-hr-company-profile.pdf"
                download="Eagle-HR-Company-Profile.pdf"
                className="inline-flex items-center text-white hover:text-secondary-300 transition-colors duration-300 mt-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Client List</h3>
              <p className="text-orange-100 mb-6 flex-grow">
                Organisations across Kenya and beyond who trust Eagle HR with their recruitment and HR needs.
              </p>
              <a
                href="/downloads/eagle-hr-client-list.pdf"
                download="Eagle-HR-Client-List.pdf"
                className="inline-flex items-center text-white hover:text-secondary-300 transition-colors duration-300 mt-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
