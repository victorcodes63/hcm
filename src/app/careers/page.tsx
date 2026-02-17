'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DynamicJobListings from '@/components/ats/DynamicJobListings';
import { 
  Briefcase, 
  ArrowRight, 
  Users,
  Search,
  MapPin,
  BookOpen,
  CheckCircle,
  Building2,
  LucideIcon
} from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import SectionTitle from '@/components/SectionTitle';

// Metadata moved to layout.tsx

export default function CareersPage() {
  const isDesktop = useIsDesktop();
  const [jobCategories, setJobCategories] = useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const getCategoryIcon = (name: string): LucideIcon => {
    const key = name.toLowerCase();
    if (key.includes('executive')) return Users;
    if (key.includes('sales') || key.includes('marketing')) return ArrowRight;
    if (key.includes('education') || key.includes('training')) return BookOpen;
    if (key.includes('technology') || key.includes('it')) return Search;
    if (key.includes('operations')) return CheckCircle;
    if (key.includes('finance') || key.includes('account')) return Building2;
    return Briefcase;
  };

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
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-center overflow-hidden">
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
                href="#job-openings"
                className="inline-flex items-center px-8 py-4 bg-primary-900 text-white rounded-lg font-semibold text-lg hover:bg-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Browse Jobs
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-900 text-primary-900 rounded-lg font-semibold text-lg hover:bg-primary-900 hover:text-white transition-all duration-300"
              >
                Post a Job
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 sm:py-12 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for jobs, companies, or keywords..."
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                </div>
                <a
                  href="#job-openings"
                  className="w-full sm:w-auto px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300 flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-5 h-5" />
                  Search
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <select className="w-full pl-10 pr-8 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-base">
                    <option>All Locations</option>
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                    <option>Kisumu</option>
                    <option>Nakuru</option>
                    <option>Remote</option>
                  </select>
                </div>
                <div className="relative">
                  <select className="w-full pl-4 pr-8 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white text-base">
                    <option>All Categories</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">2,500+</div>
              <div className="text-neutral-600">Active Jobs</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">500+</div>
              <div className="text-neutral-600">Companies</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">15,000+</div>
              <div className="text-neutral-600">Job Seekers</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">98%</div>
              <div className="text-neutral-600">Success Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Job Listings */}
      <section id="job-openings" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
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
              label="Categories"
              title="Browse by category."
              subtitle="Find jobs in your field of expertise."
              variant="section"
            />
          </motion.div>

          {jobCategories.length === 0 ? (
            <div className="text-center text-neutral-500">No categories available yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-neutral-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center mr-4 border border-secondary-100">
                    {(() => {
                      const Icon = getCategoryIcon(category.name);
                      return <Icon className="w-6 h-6 text-secondary-500" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900">{category.name}</h3>
                    <p className="text-sm text-neutral-600">{category.count} jobs available</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    document.getElementById('job-openings')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center text-primary-600 hover:text-secondary-500 font-medium transition-colors duration-300"
                >
                  Browse Jobs
                  <ArrowRight className="ml-1 w-4 h-4" />
                </button>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

