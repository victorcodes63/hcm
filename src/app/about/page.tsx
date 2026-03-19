'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TeamMember from '@/components/TeamMember';
import FounderSection from '@/components/FounderSection';
import InteractiveStatsMatrix from '@/components/InteractiveStatsMatrix';
import { TeamMember as TeamMemberType } from '@/types';
import { ArrowRight } from 'lucide-react';
import {
  IconTargetArrow,
  IconEye,
  IconShieldStar,
  IconAward,
  IconUsersGroup,
  IconBulb
} from '@tabler/icons-react';
import Link from 'next/link';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import SectionTitle from '@/components/SectionTitle';

// Metadata moved to layout.tsx

export default function AboutPage() {
  const isDesktop = useIsDesktop();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const teamMembers: TeamMemberType[] = [
    {
      id: '1',
      name: 'Mrs. Winnie Mbugua',
      position: 'Business Manager',
      bio: 'With extensive experience in business strategy and client relations, Winnie leads our business development initiatives and ensures exceptional client satisfaction.',
      image: '/images/team/winnie.webp'
    },
    {
      id: '2',
      name: 'Mr. Moses Kirui',
      position: 'Finance & Operations Manager',
      bio: 'Moses oversees our day-to-day operations, ensuring seamless service delivery and maintaining the highest standards of operational excellence.',
      image: '/images/team/kirui.webp'
    },
    {
      id: '3',
      name: 'Mr. Titus Muriuki',
      position: 'Head of Outsourced Workforce Management',
      bio: 'Titus specializes in managing outsourced workforce solutions, helping organizations optimize their human capital through strategic workforce planning.',
      image: '/images/team/titus.jpeg'
    }
  ];

  const founderData = {
    name: "Dr. Ben Chumo",
    title: "Chairman & Founder",
    image: "/images/team/chairman.jpg",
    bio: [
      "Dr. Ben Chumo is a renowned Human Resource Management practitioner, educator, innovator, and transformative leader who has devoted his life to improving the wellbeing of Kenyans.",
      "Dr. Chumo holds a Doctor of Philosophy degree in Human Resource Management from Jomo Kenyatta University of Agriculture and Technology (2013), an MBA from the University of Nairobi (2006), and a Bachelor of Arts degree from the University of Nairobi (1984). He has served as Managing Director and CEO of Kenya Power, transforming the company's customer base from 2.2 million to 4.2 million customers within just 2 years.",
      "His international experience includes consultancy services in war-torn Afghanistan in 2010, where he developed strategies for enhancing revenue collection and streamlining meter reading services for Kabul Electricity Directorate. Dr. Chumo has also been an adjunct faculty in Human Resource Management at both Jomo Kenyatta University and the University of Nairobi, and hopes to teach and mentor young people on human resource management when he retires."
    ],
    achievements: [
      {
        title: "Order of the Grand Warrior (OGW)",
        description: "Awarded by President Mwai Kibaki in 2008 for his contributions to Kenya's development"
      },
      {
        title: "Honorary Doctorate",
        description: "Doctor of Philosophy in Business (Honoris Causa) conferred by Laikipia University"
      },
      {
        title: "Transformative Leadership",
        description: "Doubled Kenya Power's customer base from 2.2M to 4.2M customers in just 2 years"
      },
      {
        title: "International Impact",
        description: "Led electrification projects benefiting 400,000 households across Kenya through GPOBA"
      }
    ],
    philosophy: [
      {
        title: "People-Centric Leadership",
        description: "Every decision is guided by how it impacts people and their potential for growth, focusing on human capital development."
      },
      {
        title: "Excellence in Execution",
        description: "We never settle for good enough - we strive for exceptional results in everything we do, maintaining the highest standards."
      },
      {
        title: "Local Expertise",
        description: "Deep understanding of Kenyan business culture, labor laws, and market dynamics, combined with international best practices."
      },
      {
        title: "Transformative Impact",
        description: "Applying international best practices to local contexts for maximum impact, driving socio-economic development."
      }
    ],
    linkedin: "https://www.linkedin.com/in/dr-ben-chumo-phd-55764a155/",
    ctaText: "Schedule a Meeting",
    ctaLink: "/contact"
  };

  const values = [
    {
      icon: IconShieldStar,
      title: 'Integrity',
      description: 'We maintain the highest ethical standards in all our interactions, building trust through transparency and honesty.'
    },
    {
      icon: IconAward,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, delivering exceptional results that exceed client expectations.'
    },
    {
      icon: IconUsersGroup,
      title: 'Client-Centricity',
      description: 'Our clients\' success is our success. We tailor solutions to meet specific organizational needs and goals.'
    },
    {
      icon: IconBulb,
      title: 'Innovation',
      description: 'We embrace innovative approaches and cutting-edge practices to deliver forward-thinking HR solutions.'
    }
  ];


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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <SectionTitle
                label="About Eagle HR"
                title="Leading HR excellence"
                titleLine2="across Kenya."
                subtitle="For nearly a decade, Eagle HR Consultants has been at the forefront of human resource innovation, helping organisations unlock their full potential through exceptional people practices."
                variant="hero"
              />
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Our Story with Mission, Vision, Values */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isMounted ? 0 : 0.2 }}
              className="mb-16"
            >
              <SectionTitle
                label="Our story"
                title="Our story."
                subtitle="Founded in 2017, Eagle HR Consultants emerged as a response to the growing need for professional HR services in Kenya's rapidly expanding business landscape. What started as a small team of HR experts has grown into one of the most trusted HR consulting firms in East Africa."
                variant="section"
              />
            </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: isMounted ? 0.1 : 0.3 }}
            >
              <h3 className="text-2xl font-heading font-bold text-primary-900 mb-6">
                Building Excellence Through People
              </h3>
              <div className="space-y-4 text-neutral-700">
                <p>
                  Eagle HR Consultants was founded to address the growing human resource challenges that limit organizational growth and performance in Kenya. Many businesses face persistent issues in talent acquisition, compliance management, and workforce optimization—areas critical to long-term success.
                </p>
                <p>
                  Today, we partner with over 100 organizations across more than 20 industries, delivering measurable HR solutions that enhance efficiency, compliance, and employee engagement. Our data-driven frameworks and analytics-based insights enable organizations to make informed people decisions that directly impact productivity and profitability.
                </p>
                <p>
                  By combining deep local market intelligence with global best practices, we align human capital strategies with business goals. Our approach is precise and outcome-focused: we listen, we analyze, and we deliver sustainable HR solutions built on trust, transparency, and measurable impact.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: isMounted ? 0.2 : 0.4 }}
              className="relative lg:self-end"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-secondary-100/70">
                <InteractiveStatsMatrix />
              </div>
            </motion.div>
          </div>

          {/* Mission, Vision, Values - Full Width Below */}
          <div className="mt-16 space-y-8">
            {/* Mission and Vision - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg border border-primary-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center mr-4 border border-secondary-100">
                    <IconTargetArrow className="w-6 h-6 text-secondary-500" stroke={1.7} />
                  </div>
                  <h4 className="text-xl font-heading font-semibold text-primary-900">Our Mission</h4>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  To deliver exceptional HR solutions that empower organizations to achieve their full potential through their greatest asset - their people. We combine deep local expertise with global best practices to drive measurable results.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg border border-primary-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-secondary-50 rounded-xl flex items-center justify-center mr-4 border border-secondary-100">
                    <IconEye className="w-6 h-6 text-secondary-500" stroke={1.7} />
                  </div>
                  <h4 className="text-xl font-heading font-semibold text-primary-900">Our Vision</h4>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  To be the leading HR consulting firm in East Africa, recognized for excellence, innovation, and transformative impact. We envision a future where every organization thrives through exceptional people practices.
                </p>
              </motion.div>
            </div>

            {/* Core Values - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg border border-primary-100"
            >
              <SectionTitle label="Values" title="Our core values." variant="section" className="mb-8 text-center" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div key={value.title} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-secondary-100">
                        <value.icon className="w-5 h-5 text-secondary-500" />
                      </div>
                      <p className="text-base font-semibold text-primary-900">{value.title}</p>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <FounderSection founder={founderData} />

      {/* Team Section */}
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
              label="Team"
              title="Meet our team."
              subtitle="Our experienced professionals bring together decades of HR expertise to deliver exceptional results for our clients."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <TeamMember member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
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
              subtitle="We're not just another HR consultancy. Here's what sets us apart and makes us the right choice for your organisation."
              variant="section"
            />
          </motion.div>

          {/* Mixed Rectangle and Square Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: IconUsersGroup,
                title: "Local Expertise, Global Standards",
                reason: "Deep understanding of Kenyan business culture and labor laws",
                justification: "Our team combines 7+ years of local market experience with international best practices, ensuring solutions that work in Kenya's unique business environment while meeting global standards.",
                size: "rectangle"
              },
              {
                icon: IconTargetArrow,
                title: "Proven Track Record",
                reason: "Over 7 years of excellence with measurable results",
                justification: "100+ companies served, 2000+ successful placements, and 98% client satisfaction rate. Our numbers speak for themselves - we deliver consistent, measurable outcomes.",
                size: "square"
              },
              {
                icon: IconShieldStar,
                title: "Client-Centric Approach",
                reason: "Every solution tailored to your specific needs",
                justification: "We don't believe in one-size-fits-all solutions. Our team takes time to understand your unique challenges and crafts HR strategies that align with your business goals and culture.",
                size: "square"
              },
              {
                icon: IconAward,
                title: "Award-Winning Leadership",
                reason: "Led by Dr. Ben Chumo, OGW recipient ",
                justification: "Dr. Ben Chumo's Order of the Grand Warrior (OGW) recognition and his transformative leadership at Kenya Power (doubling customer base from 2.2M to 4.2M) brings unparalleled expertise to your organization.",
                size: "rectangle"
              },
              {
                icon: IconBulb,
                title: "Comprehensive Solutions",
                reason: "End-to-end HR services under one roof",
                justification: "From recruitment and compliance to training and outsourcing - we provide complete HR solutions. No need to juggle multiple vendors when you can get everything from one trusted partner.",
                size: "square"
              },
              {
                icon: IconAward,
                title: "Measurable Results",
                reason: "Focus on outcomes that improve your bottom line",
                justification: "We don't just provide services - we deliver measurable ROI. Our clients see average 40% improvement in hiring success rates and 25% reduction in HR operational costs within the first year.",
                size: "rectangle"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`${
                  item.size === 'rectangle' 
                    ? 'md:col-span-2 lg:col-span-1' 
                    : 'md:col-span-1'
                } bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-primary-900">
                    {item.title}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-primary-700 mb-2">Why This Matters:</h4>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-primary-700 mb-2">The Proof:</h4>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {item.justification}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-white border border-primary-200 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-heading font-bold text-primary-900 mb-4">
                Ready to Experience the Difference?
              </h3>
              <p className="text-lg text-neutral-600 mb-6 max-w-2xl mx-auto">
                Join the growing number of organizations that have transformed their HR practices with Eagle HR Consultants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center px-8 py-4 border-2 border-primary-900 text-primary-900 rounded-lg font-semibold hover:bg-primary-900 hover:text-white transition-all duration-300"
                >
                  Explore Our Services
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Clients Section */}
      <section id="clients" className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="Clients"
              title="Trusted by leading organisations."
              subtitle="We're proud to partner with organisations across Kenya, from startups to multinational corporations, helping them build stronger teams and achieve their business goals."
              variant="section"
            />
          </motion.div>

          {/* Featured Client Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src="/images/clients/interview.jpg" 
                  alt="Professional meeting with clients" 
                  className="w-full h-full object-cover object-[center_bottom]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/70 to-transparent"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center gap-8 max-w-6xl mx-auto">
                  {/* Client Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-white rounded-2xl p-6 flex items-center justify-center shadow-lg">
                      <img 
                        src="/images/clients/cbk_loho.png" 
                        alt="Central Bank of Kenya" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Client Info */}
                  <div className="flex-1 text-center lg:text-left text-white">
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur-sm text-white">
                      <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2 animate-pulse"></span>
                      Latest Partnership
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">
                      Central Bank of Kenya
                    </h3>
                    
                    <p className="text-xl text-white mb-6 leading-relaxed">
                      The monetary authority of Kenya, responsible for maintaining price and financial stability 
                      through monetary policy, issuing currency, and overseeing the financial system. Partnering 
                      with Eagle HR on a massive recruitment assignment spanning two years.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm border border-white/30">
                        <span className="text-sm font-medium text-white">Monetary Authority</span>
                      </div>
                      <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm border border-white/30">
                        <span className="text-sm font-medium text-white">Central Bank</span>
                      </div>
                      <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm border border-white/30">
                        <span className="text-sm font-medium text-white">Strategic Partnership</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Logo Wall */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <SectionTitle
              label="Partners"
              title="Our trusted partners."
              subtitle="Join these leading organisations who trust Eagle HR with their human capital needs."
              variant="section"
              className="mb-8"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[
                { name: 'Kenya Development Corporation', logo: '/images/clients/kdc_logo.png' },
                { name: 'Kenya Revenue Authority', logo: '/images/clients/kra_logo.png' },
                { name: 'Kenya Bureau of Standards', logo: '/images/clients/KEBS_Logo.png' },
                { name: 'KeNIC', logo: '/images/clients/KeNIC_Logo.png' },
                { name: 'Kenya Civil Aviation', logo: '/images/clients/kca_logo.png' },
                { name: 'National Construction Authority', logo: '/images/clients/nca_logo.png' },
                { name: 'ICPAK', logo: '/images/clients/icpak_logo.png' },
                { name: 'Bata Kenya', logo: '/images/clients/bata_logo.jpg' },
                { name: 'Consolidated Bank', logo: '/images/clients/consolidated_logo.webp' },
                { name: 'Kenya Re', logo: '/images/clients/kenyare_logo.png' },
                { name: 'TBC', logo: '/images/clients/tbc_logo 2.jpg' },
                { name: 'TARDA', logo: '/images/clients/tarda_logo.png' },
                { name: 'Pacida', logo: '/images/clients/Pacida Logo.png' },
                { name: 'WSUP', logo: '/images/clients/WSUP_logo.png' },
                { name: 'CMA', logo: '/images/clients/cma_logo.png' },
                { name: 'USIU', logo: '/images/clients/usiu_logo.png' },
                { name: 'CBK', logo: '/images/clients/cbk_loho.png' },
                { name: 'Kimisitu', logo: '/images/clients/kimisitu_logo.png' }
            ].map((client, index) => (
              <motion.div
                key={client.name}
                  initial={{ opacity: 0, ...(isDesktop ? { scale: 0.9 } : {}) }}
                  whileInView={{ opacity: 1, ...(isDesktop ? { scale: 1 } : {}) }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                  className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center h-24 border border-neutral-100 hover:border-primary-200"
                >
                  <div className="relative">
                    <img 
                      src={client.logo} 
                      alt={client.name}
                      className={`${client.name === 'WSUP' ? 'max-w-full max-h-[3.6rem] w-[9.6rem]' : client.name === 'Kenya Bureau of Standards' ? 'max-w-full max-h-[4.8rem] w-auto' : client.name === 'Consolidated Bank' ? 'max-w-full max-h-[4.8rem] w-auto' : client.name === 'Kenya Development Corporation' ? 'max-w-full max-h-[4.8rem] w-auto' : client.name === 'TARDA' ? 'max-w-full max-h-[4.2rem] w-auto' : 'max-w-full max-h-[3.6rem]'} object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                      onError={(e) => {
                        // Fallback to text if logo doesn't exist
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className="hidden text-xs font-bold text-primary-900 text-center"
                      style={{ display: 'none' }}
                    >
                      {client.name.split(' ')[0]}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center bg-white rounded-2xl p-8 shadow-lg"
          >
            <SectionTitle
              label="Get in touch"
              title="Join our growing client family."
              subtitle="Whether you're a startup looking to build your first HR processes or an established organisation seeking to optimize your people operations, we're here to help."
              variant="section"
              className="mb-6"
            />
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300"
            >
              Start Your HR Transformation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Client Testimonials Section - Real clients */}
      <section className="py-24 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <SectionTitle
              label="Testimonials"
              title="What our clients say."
              subtitle="Hear directly from organisations we partner with about their experience with Eagle HR."
              variant="section"
            />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Central Bank of Kenya */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="h-full bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/80 shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:border-primary-200/60 transition-all duration-300 flex flex-col overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-secondary-500/12 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4 mb-5 relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-100 shadow-md">
                    <img
                      src="/images/about/smile_1.jpg"
                      alt="Central Bank of Kenya"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-primary-900 text-lg">Leadership Team</h3>
                    <p className="text-secondary-600 font-medium text-sm">Central Bank of Kenya</p>
                  </div>
                </div>
                <p className="text-neutral-700 italic leading-relaxed flex-1 relative">
                  &ldquo;Eagle HR has been a strategic partner in our talent acquisition and HR advisory.
                  Their expertise in executive search and compliance has been invaluable to our organization.&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Kenya Bureau of Standards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="h-full bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/80 shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:border-primary-200/60 transition-all duration-300 flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-100 shadow-md">
                    <img
                      src="/images/about/smile_2.jpg"
                      alt="Kenya Bureau of Standards"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-primary-900 text-lg">HR & Standards Division</h3>
                    <p className="text-secondary-600 font-medium text-sm">Kenya Bureau of Standards</p>
                  </div>
                </div>
                <p className="text-neutral-700 italic leading-relaxed flex-1">
                  &ldquo;Working with Eagle HR has strengthened our workforce planning and recruitment processes.
                  Their professional approach and understanding of the public sector have delivered strong results.&rdquo;
                </p>
              </div>
            </motion.div>

            {/* PACIDA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="h-full bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/80 shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:border-primary-200/60 transition-all duration-300 flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-100 shadow-md">
                    <img
                      src="/images/about/smile_4.jpg"
                      alt="PACIDA"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-primary-900 text-lg">Management Team</h3>
                    <p className="text-secondary-600 font-medium text-sm">PACIDA</p>
                  </div>
                </div>
                <p className="text-neutral-700 italic leading-relaxed flex-1">
                  &ldquo;Eagle HR&apos;s recruitment and HR outsourcing services have supported our growth and
                  operational excellence. We value their commitment to quality and timely delivery.&rdquo;
                </p>
              </div>
            </motion.div>
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
              title="Ready to partner with us?"
              subtitle="Join hundreds of organisations that have transformed their HR practices with our expert guidance and innovative solutions."
              variant="dark"
              className="mb-8"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group bg-secondary-500 text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <Link
                href="/services"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 flex items-center justify-center"
              >
                Explore Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

