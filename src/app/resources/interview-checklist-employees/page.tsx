'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Clock, User, FileText, Star, AlertCircle, Download, Printer, Briefcase, MapPin, Phone } from 'lucide-react';

export default function InterviewChecklistEmployees() {
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
        { id: 'research-company', text: 'Research the company thoroughly (mission, values, recent news)' },
        { id: 'review-job-description', text: 'Review job description and requirements carefully' },
        { id: 'prepare-questions', text: 'Prepare thoughtful questions to ask the interviewer' },
        { id: 'practice-responses', text: 'Practice common interview questions and STAR method' },
        { id: 'prepare-documents', text: 'Prepare copies of CV, references, and portfolio' },
        { id: 'plan-route', text: 'Plan route and allow extra time for travel' },
        { id: 'test-technology', text: 'Test video conferencing setup (if virtual interview)' }
      ]
    },
    {
      title: 'Day of Interview',
      items: [
        { id: 'dress-professionally', text: 'Dress appropriately for the company culture' },
        { id: 'arrive-early', text: 'Arrive 10-15 minutes early (or log in 5 minutes early for virtual)' },
        { id: 'bring-materials', text: 'Bring copies of CV, notebook, and pen' },
        { id: 'turn-off-phone', text: 'Turn off or silence your phone' },
        { id: 'positive-mindset', text: 'Maintain a positive and confident mindset' },
        { id: 'body-language', text: 'Practice good posture and confident body language' }
      ]
    },
    {
      title: 'During the Interview',
      items: [
        { id: 'firm-handshake', text: 'Offer a firm handshake and maintain eye contact' },
        { id: 'listen-actively', text: 'Listen carefully to questions before responding' },
        { id: 'use-examples', text: 'Use specific examples and the STAR method' },
        { id: 'be-honest', text: 'Be honest about your experience and skills' },
        { id: 'ask-questions', text: 'Ask thoughtful questions about the role and company' },
        { id: 'show-enthusiasm', text: 'Show genuine enthusiasm for the position' },
        { id: 'take-notes', text: 'Take notes if appropriate (ask permission first)' }
      ]
    },
    {
      title: 'Post-Interview Follow-up',
      items: [
        { id: 'thank-interviewer', text: 'Thank the interviewer for their time' },
        { id: 'send-thank-you', text: 'Send thank you email within 24 hours' },
        { id: 'follow-up-timeline', text: 'Ask about next steps and timeline' },
        { id: 'reflect-performance', text: 'Reflect on your performance and areas for improvement' },
        { id: 'update-notes', text: 'Update your interview notes and company research' },
        { id: 'continue-applying', text: 'Continue applying to other positions while waiting' },
        { id: 'follow-up-politely', text: 'Follow up politely if you haven\'t heard back' }
      ]
    }
  ];

  const interviewTips = [
    {
      icon: User,
      title: 'Be Authentic',
      description: 'Be yourself while maintaining professionalism. Authenticity helps build genuine connections.'
    },
    {
      icon: Star,
      title: 'Use Examples',
      description: 'Prepare specific examples that demonstrate your skills and achievements.'
    },
    {
      icon: Briefcase,
      title: 'Research Thoroughly',
      description: 'Know the company, role, and industry to show genuine interest.'
    },
    {
      icon: Clock,
      title: 'Manage Time',
      description: 'Keep answers concise but complete. Respect the interviewer\'s time.'
    }
  ];

  const commonQuestions = [
    {
      question: 'Tell me about yourself',
      tip: 'Focus on relevant experience and what makes you a good fit for this role.'
    },
    {
      question: 'Why do you want to work here?',
      tip: 'Show you\'ve researched the company and connect your values with theirs.'
    },
    {
      question: 'What are your strengths?',
      tip: 'Choose strengths relevant to the job and provide specific examples.'
    },
    {
      question: 'What are your weaknesses?',
      tip: 'Choose a real weakness and explain how you\'re working to improve it.'
    },
    {
      question: 'Where do you see yourself in 5 years?',
      tip: 'Show ambition while demonstrating how this role fits your career path.'
    },
    {
      question: 'Why should we hire you?',
      tip: 'Summarize your key qualifications and what unique value you bring.'
    }
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
              <User className="w-4 h-4 mr-2" />
              Interview Checklist
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-primary-900"
            >
              Interview Checklist
              <span className="block text-secondary-500">For Job Seekers</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-neutral-700 leading-relaxed mb-8"
            >
              A comprehensive checklist to help you prepare for interviews and make a great impression with potential employers.
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
                  Interview Preparation Progress
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

      {/* Common Questions Section */}
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
              Common Interview Questions
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Prepare for these frequently asked questions to boost your confidence and performance.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {commonQuestions.map((qa, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-lg font-heading font-semibold text-primary-900 mb-3">
                    {qa.question}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    <strong>Tip:</strong> {qa.tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-900 mb-6">
              Interview Success Tips
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Expert advice to help you make a great impression and land your dream job.
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
                className="text-center p-6 bg-gradient-to-br from-neutral-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
              Need Career Support?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Our career experts can help you with interview preparation, CV writing, and job search strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-secondary-500 text-primary-900 rounded-lg font-semibold text-lg hover:bg-secondary-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Career Coaching
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

