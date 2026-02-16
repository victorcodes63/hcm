'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Clock, Users, FileText, Star, AlertCircle, Download, Printer } from 'lucide-react';

export default function InterviewChecklistEmployers() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const checklistSections = [
    {
      title: 'Pre-Interview Preparation',
      items: [
        { id: 'review-cv', text: 'Review candidate CV and application thoroughly' },
        { id: 'prepare-questions', text: 'Prepare structured interview questions' },
        { id: 'check-requirements', text: 'Review job requirements and success criteria' },
        { id: 'schedule-room', text: 'Book interview room and ensure it\'s ready' },
        { id: 'test-technology', text: 'Test video conferencing equipment (if virtual)' },
        { id: 'prepare-materials', text: 'Prepare company materials and job description' },
        { id: 'notify-team', text: 'Notify team members about interview schedule' }
      ]
    },
    {
      title: 'Interview Day Setup',
      items: [
        { id: 'arrive-early', text: 'Arrive 15 minutes before interview time' },
        { id: 'check-environment', text: 'Ensure interview room is clean and professional' },
        { id: 'prepare-documents', text: 'Have candidate documents and questions ready' },
        { id: 'test-equipment', text: 'Final check of all technical equipment' },
        { id: 'welcome-candidate', text: 'Greet candidate warmly and make introductions' },
        { id: 'explain-process', text: 'Explain interview process and timeline' }
      ]
    },
    {
      title: 'During the Interview',
      items: [
        { id: 'start-positive', text: 'Start with positive, welcoming atmosphere' },
        { id: 'ask-behavioral', text: 'Ask behavioral questions using STAR method' },
        { id: 'listen-actively', text: 'Listen actively and take notes' },
        { id: 'ask-follow-up', text: 'Ask follow-up questions for clarification' },
        { id: 'assess-skills', text: 'Assess technical and soft skills appropriately' },
        { id: 'allow-questions', text: 'Allow candidate to ask questions about role' },
        { id: 'maintain-professional', text: 'Maintain professional and respectful tone' }
      ]
    },
    {
      title: 'Post-Interview Actions',
      items: [
        { id: 'thank-candidate', text: 'Thank candidate for their time and interest' },
        { id: 'explain-next-steps', text: 'Explain next steps in the process' },
        { id: 'document-feedback', text: 'Document interview feedback immediately' },
        { id: 'rate-candidate', text: 'Rate candidate against job requirements' },
        { id: 'discuss-team', text: 'Discuss candidate with interview team' },
        { id: 'make-decision', text: 'Make hiring decision within agreed timeline' },
        { id: 'notify-candidate', text: 'Notify candidate of decision promptly' }
      ]
    }
  ];

  const interviewTips = [
    {
      icon: Users,
      title: 'Build Rapport',
      description: 'Create a comfortable environment to help candidates perform their best.'
    },
    {
      icon: FileText,
      title: 'Use Structured Questions',
      description: 'Prepare consistent questions to fairly evaluate all candidates.'
    },
    {
      icon: Star,
      title: 'Focus on Potential',
      description: 'Look for growth potential and cultural fit, not just current skills.'
    },
    {
      icon: Clock,
      title: 'Manage Time',
      description: 'Keep interviews on schedule to respect everyone\'s time.'
    }
  ];

  const legalConsiderations = [
    'Avoid discriminatory questions about age, gender, religion, or family status',
    'Focus on job-related qualifications and experience',
    'Ensure all candidates receive equal treatment',
    'Document all interview decisions with clear reasoning',
    'Follow company policies and legal requirements',
    'Maintain confidentiality of candidate information'
  ];

  const totalItems = checklistSections.reduce((total, section) => total + section.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercentage = Math.round((completedCount / totalItems) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-900 rounded-full text-sm font-medium mb-6"
            >
              <Users className="w-4 h-4 mr-2" />
              Interview Checklist
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-primary-900"
            >
              Interview Checklist
              <span className="block text-secondary-500">For Employers</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-neutral-700 leading-relaxed mb-8"
            >
              A comprehensive checklist to help you conduct effective interviews and make the best hiring decisions.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-bold text-primary-900">
                  Interview Progress
                </h2>
                <span className="text-sm text-neutral-600">
                  {completedCount} of {totalItems} items completed
                </span>
              </div>
              
              <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-secondary-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {progressPercentage}% Complete
                </span>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-primary-100 text-primary-900 rounded-lg font-semibold text-sm hover:bg-primary-200 transition-colors duration-200 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                  <button className="px-4 py-2 bg-secondary-100 text-secondary-900 rounded-lg font-semibold text-sm hover:bg-secondary-200 transition-colors duration-200 flex items-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Checklist Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {checklistSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg"
                >
                  <h3 className="text-xl font-heading font-bold text-primary-900 mb-6">
                    {section.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05), duration: 0.4 }}
                        viewport={{ once: true }}
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                          completedItems.has(item.id)
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-neutral-50 border border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            completedItems.has(item.id)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-neutral-300 hover:border-primary-500'
                          }`}
                        >
                          {completedItems.has(item.id) && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        
                        <span className={`flex-1 text-sm ${
                          completedItems.has(item.id)
                            ? 'text-green-800 line-through'
                            : 'text-neutral-700'
                        }`}>
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">
              Interview Best Practices
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Expert tips to help you conduct effective interviews and make better hiring decisions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {interviewTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-secondary-100">
                  <tip.icon className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-primary-900 mb-3">
                  {tip.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {tip.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Considerations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-8"
            >
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-heading font-bold text-blue-900 mb-4">
                    Legal Considerations
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Ensure your interview process complies with employment laws and best practices:
                  </p>
                  <ul className="space-y-2">
                    {legalConsiderations.map((consideration, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Need Professional HR Support?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Our HR experts can help you develop comprehensive interview processes and make better hiring decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-secondary-500 text-primary-900 rounded-lg font-semibold text-lg hover:bg-secondary-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get HR Consultation
              </a>
              
              <a
                href="/services"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
              >
                View Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

