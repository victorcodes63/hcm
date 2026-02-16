'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Calculator, 
  Info, 
  TrendingUp, 
  Shield, 
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function PAYECalculatorPage() {
  const [grossSalary, setGrossSalary] = useState('');
  const [nssfContribution, setNssfContribution] = useState('');
  const [nhifContribution, setNhifContribution] = useState('');
  const [personalRelief, setPersonalRelief] = useState('2400'); // 2024 personal relief
  const [results, setResults] = useState<any>(null);

  const calculatePAYE = () => {
    const gross = parseFloat(grossSalary) || 0;
    const nssf = parseFloat(nssfContribution) || 0;
    const nhif = parseFloat(nhifContribution) || 0;
    const relief = parseFloat(personalRelief) || 0;

    // Calculate taxable income
    const taxableIncome = gross - nssf - nhif;

    // PAYE calculation based on 2024 tax brackets
    let paye = 0;
    if (taxableIncome <= 288000) {
      paye = taxableIncome * 0.1; // 10% for first 288,000
    } else if (taxableIncome <= 388000) {
      paye = 28800 + (taxableIncome - 288000) * 0.25; // 10% + 25% for next 100,000
    } else if (taxableIncome <= 688000) {
      paye = 53800 + (taxableIncome - 388000) * 0.3; // Previous + 30% for next 300,000
    } else if (taxableIncome <= 1088000) {
      paye = 143800 + (taxableIncome - 688000) * 0.325; // Previous + 32.5% for next 400,000
    } else {
      paye = 273800 + (taxableIncome - 1088000) * 0.35; // Previous + 35% for above
    }

    // Apply personal relief
    const finalPAYE = Math.max(0, paye - relief);

    const netSalary = gross - nssf - nhif - finalPAYE;

    setResults({
      grossSalary: gross,
      nssfContribution: nssf,
      nhifContribution: nhif,
      personalRelief: relief,
      taxableIncome: taxableIncome,
      paye: finalPAYE,
      netSalary: netSalary,
      totalDeductions: nssf + nhif + finalPAYE
    });
  };

  const payeFacts = [
    {
      icon: Info,
      title: 'Personal Relief',
      description: 'KSh 2,400 per month (2024) - Reduces your PAYE liability'
    },
    {
      icon: TrendingUp,
      title: 'Tax Brackets',
      description: 'Progressive tax system: 10% to 35% based on income levels'
    },
    {
      icon: Shield,
      title: 'NSSF & NHIF',
      description: 'Mandatory contributions that reduce your taxable income'
    },
    {
      icon: FileText,
      title: 'Monthly Filing',
      description: 'Employers must file PAYE returns by 9th of following month'
    }
  ];

  const statutoryInfo = [
    {
      title: 'NSSF (National Social Security Fund)',
      description: 'Mandatory social security contribution',
      rate: '6% of gross salary (capped at KSh 1,800)',
      details: 'Both employee and employer contribute 6% each'
    },
    {
      title: 'NHIF (National Hospital Insurance Fund)',
      description: 'Health insurance contribution',
      rate: 'KSh 150 - KSh 1,700 per month',
      details: 'Based on gross salary brackets'
    },
    {
      title: 'PAYE (Pay As You Earn)',
      description: 'Income tax deducted at source',
      rate: '10% - 35% progressive rates',
      details: 'Applied to taxable income after NSSF and NHIF deductions'
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-500 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Calculator className="w-4 h-4 mr-2" />
              PAYE Calculator
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Calculate Your
              <span className="block text-secondary-400">PAYE Tax</span>
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed">
              Get accurate PAYE calculations based on current Kenyan tax rates and statutory deductions.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Calculator Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-heading font-bold text-primary-900 mb-6">
                PAYE Calculator
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Gross Salary (KSh)
                  </label>
                  <input
                    type="number"
                    value={grossSalary}
                    onChange={(e) => setGrossSalary(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors duration-200"
                    placeholder="Enter your gross salary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    NSSF Contribution (KSh)
                  </label>
                  <input
                    type="number"
                    value={nssfContribution}
                    onChange={(e) => setNssfContribution(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors duration-200"
                    placeholder="Enter NSSF contribution"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    NHIF Contribution (KSh)
                  </label>
                  <input
                    type="number"
                    value={nhifContribution}
                    onChange={(e) => setNhifContribution(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors duration-200"
                    placeholder="Enter NHIF contribution"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">
                    Personal Relief (KSh)
                  </label>
                  <input
                    type="number"
                    value={personalRelief}
                    onChange={(e) => setPersonalRelief(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors duration-200"
                    placeholder="Personal relief amount"
                  />
                </div>

                <button
                  onClick={calculatePAYE}
                  className="w-full bg-primary-900 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors duration-300 flex items-center justify-center"
                >
                  Calculate PAYE
                  <Calculator className="ml-2 w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-heading font-bold text-primary-900 mb-6">
                Calculation Results
              </h2>
              
              {results ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-neutral-200">
                    <span className="text-neutral-600">Gross Salary:</span>
                    <span className="font-semibold text-primary-900">KSh {results.grossSalary.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-neutral-200">
                    <span className="text-neutral-600">NSSF Contribution:</span>
                    <span className="font-semibold text-red-600">-KSh {results.nssfContribution.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-neutral-200">
                    <span className="text-neutral-600">NHIF Contribution:</span>
                    <span className="font-semibold text-red-600">-KSh {results.nhifContribution.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-neutral-200">
                    <span className="text-neutral-600">Taxable Income:</span>
                    <span className="font-semibold text-primary-900">KSh {results.taxableIncome.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-neutral-200">
                    <span className="text-neutral-600">PAYE Tax:</span>
                    <span className="font-semibold text-red-600">-KSh {results.paye.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b-2 border-primary-200">
                    <span className="text-neutral-600">Personal Relief:</span>
                    <span className="font-semibold text-green-600">+KSh {results.personalRelief.toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary-900">Net Salary:</span>
                      <span className="text-2xl font-bold text-primary-900">KSh {results.netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">Enter your salary details to see the calculation</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* PAYE Facts Section */}
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
              Understanding PAYE
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Key facts about PAYE and statutory deductions in Kenya
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {payeFacts.map((fact, index) => (
              <motion.div
                key={fact.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gradient-to-br from-neutral-50 to-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary-50 border border-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <fact.icon className="w-8 h-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-primary-900 mb-3">
                  {fact.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {fact.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statutory Deductions Section */}
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
              Statutory Deductions
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Understanding mandatory deductions from your salary
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {statutoryInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-heading font-bold text-primary-900 mb-3">
                  {info.title}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {info.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="font-medium">Rate: {info.rate}</span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {info.details}
                  </p>
                </div>
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
              Need Help with HR Compliance?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Our HR experts can help you navigate complex tax and compliance requirements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-secondary-500 text-primary-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                Get HR Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <button className="group border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
                Download Tax Guide
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
