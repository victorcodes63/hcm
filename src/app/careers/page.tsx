'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicJobListings from '@/components/ats/DynamicJobListings';
import { ArrowRight } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import SectionTitle from '@/components/SectionTitle';
import { getCategoryIcon } from '@/lib/job-category-icons';

// Metadata moved to layout.tsx

export default function CareersPage() {
  const isDesktop = useIsDesktop();
  const [jobCategories, setJobCategories] = useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/jobs?activeOnly=true')
      .then((r) => r.json())
      .then((jobs) => {
        if (cancelled || !Array.isArray(jobs)) return;
        const counts = new Map<string, number>();
        jobs.forEach((j: { category?: string }) => {
          const category = String(j.category || '').trim();
          if (!category) return;
          counts.set(category, (counts.get(category) || 0) + 1);
        });
        const categories = Array.from(counts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
        setJobCategories(categories);
      })
      .catch(() => {
        if (!cancelled) setJobCategories([]);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section — includes stats bridge at bottom */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
            style={{ backgroundImage: 'url(/images/hero/Reception_comp.webp)' }}
          />
          <div className="absolute inset-0 bg-white/70" />
        </div>

        {/* Hero copy + CTAs */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 pb-16 sm:pb-20">
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
                label="Job board"
                title="Find your dream job"
                titleLine2="in Kenya."
                subtitle="Discover thousands of job opportunities across Kenya. Our advanced job board connects talented professionals with top employers nationwide."
                variant="hero"
                className="mb-8"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-900 text-primary-900 rounded-lg font-semibold text-lg hover:bg-primary-900 hover:text-white transition-all duration-300"
              >
                Post a Job
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* How to apply — replaces stats bridge */}
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-primary-100">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.9 }}
              className="py-8 sm:py-10"
            >
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.25em] text-secondary-700 uppercase mb-2">
                      How to apply
                    </p>
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary-900 mb-2">
                      A simple 3‑step process.
                    </h2>
                    <p className="text-sm sm:text-base text-neutral-600">
                      Find a role, apply in minutes, and we’ll keep you updated.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      n: '01',
                      title: 'Browse & filter',
                      desc: 'Use search and filters to quickly narrow down roles by category, location, and type.',
                    },
                    {
                      n: '02',
                      title: 'Apply with confidence',
                      desc: 'Open the listing, review requirements, and submit your application with accurate details.',
                    },
                    {
                      n: '03',
                      title: 'Watch for updates',
                      desc: 'We’ll share updates via email and let you know the next steps.',
                    },
                  ].map((step) => (
                    <div
                      key={step.n}
                      className="rounded-2xl border border-primary-100 bg-white px-5 py-5 shadow-sm text-center"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-secondary-50 border border-secondary-100 text-secondary-700 font-bold tabular-nums">
                          {step.n}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-primary-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Job Listings */}
      <section id="job-openings" className="py-14 sm:py-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <SectionTitle
              label="Opportunities"
              title="Current job openings."
              subtitle="Browse through our latest job opportunities and find your perfect match."
              variant="section"
            />
          </motion.div>

          {/* Dynamic Job Listings Component */}
          <DynamicJobListings
            showSearch={true}
            initialFilters={selectedCategory ? { category: selectedCategory } : {}}
          />
        </div>
      </section>

      {/* Job Categories */}
      {jobCategories.length > 0 && (
        <section className="py-14 sm:py-16 bg-white border-t border-primary-100">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <SectionTitle
                label="Categories"
                title="Browse by category."
                subtitle="Find jobs in your field of expertise."
                variant="section"
              />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {jobCategories.map((category, index) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <motion.button
                    key={category.name}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      document.getElementById('job-openings')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group flex flex-col items-center gap-3 p-5 bg-primary-50 hover:bg-primary-100 border border-primary-100 hover:border-primary-300 rounded-2xl text-center transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-primary-100 flex items-center justify-center group-hover:border-primary-300 transition-colors">
                      <Icon className="w-5 h-5 text-primary-500 group-hover:text-primary-700 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-900 leading-snug mb-0.5">
                        {category.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {category.count} {category.count === 1 ? 'job' : 'jobs'}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

