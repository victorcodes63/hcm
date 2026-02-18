'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import SectionTitle from '@/components/SectionTitle';
import { 
  Calendar, 
  User, 
  Tag, 
  ExternalLink, 
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Users,
  Shield,
  Loader2
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string;
  body: string | null;
  date: string;
  author: string;
  category: string;
  url: string;
  image: string;
}

export default function InsightsPage() {
  const isDesktop = useIsDesktop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [postsFromApi, setPostsFromApi] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    fetch('/api/insights')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setPostsFromApi(
          arr.map((i: { id: string; slug?: string | null; title: string; excerpt: string; body?: string | null; date?: string; publishedAt?: string; author: string; category: string; url: string; image: string }) => ({
            id: i.id,
            slug: i.slug ?? null,
            title: i.title,
            excerpt: i.excerpt,
            body: i.body ?? null,
            date: i.date || (i.publishedAt ? new Date(i.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''),
            author: i.author,
            category: i.category,
            url: i.url,
            image: i.image,
          }))
        );
      })
      .catch(() => setPostsFromApi([]));
  }, []);

  const posts = postsFromApi ?? [];

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [posts, selectedCategory, searchTerm]);

  const categories = [
    { value: 'all', label: 'All Categories', icon: BookOpen },
    { value: 'HR Outsourcing', label: 'HR Outsourcing', icon: Users },
    { value: 'Compliance and Regulation', label: 'Compliance', icon: Shield },
    { value: 'Job Hunting Tips', label: 'Job Hunting', icon: TrendingUp },
    { value: 'Strategy Business', label: 'Strategy', icon: TrendingUp },
    { value: 'Uncategorized', label: 'General', icon: BookOpen }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SectionTitle
                label="News & insights"
                title="HR insights & expertise"
                titleLine2="from Eagle HR."
                subtitle="Stay updated with the latest HR trends, best practices, and insights from Kenya's leading HR consultancy experts."
                variant="hero"
                className="mb-8"
              />
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                  <SectionTitle
                    label="Articles"
                    title="Latest articles."
                    subtitle={`Showing ${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''}${selectedCategory !== 'all' ? ` in ${categories.find(c => c.value === selectedCategory)?.label}` : ''}`}
                    variant="section"
                    className="text-left"
                  />
                </div>

                <div className="space-y-12">
                  {postsFromApi === null ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                      <p className="text-neutral-600">Loading articles…</p>
                    </div>
                  ) : (
                    <>
                  {filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-200 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      } flex flex-col md:flex`}
                    >
                      {/* Image Section */}
                      <div className="md:w-1/2 h-64 md:h-auto">
                        <div className="w-full h-full relative overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center relative">
                                    <div class="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20"></div>
                                    <div class="relative z-10 text-center p-8">
                                      <div class="w-16 h-16 bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                      </div>
                                      <h4 class="text-lg font-semibold text-primary-900 mb-2">${post.category}</h4>
                                      <p class="text-sm text-neutral-600">Expert Insights</p>
                                    </div>
                                    <div class="absolute top-4 right-4 w-20 h-20 bg-secondary-500/10 rounded-full"></div>
                                    <div class="absolute bottom-4 left-4 w-12 h-12 bg-primary-500/10 rounded-full"></div>
                                  </div>
                                `;
                              }
                            }}
                          />
                          {/* Overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="md:w-1/2 p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl font-heading font-bold text-primary-900 mb-4 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-neutral-600 mb-6 leading-relaxed text-lg">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-neutral-500 mb-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                          </div>
                        </div>
                        
                        {post.slug ? (
                          <Link
                            href={`/insights/${post.slug}`}
                            className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300 w-fit"
                          >
                            Read full article
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Link>
                        ) : post.url && post.url !== '#' ? (
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors duration-300 w-fit"
                          >
                            Read full article
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        ) : null}
                      </div>
                    </motion.article>
                  ))}

                {filteredPosts.length === 0 && (
                  <div className="text-center py-20">
                    <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                      {posts.length === 0 ? 'No articles yet' : 'No articles found'}
                    </h3>
                    <p className="text-neutral-500">
                      {posts.length === 0
                        ? 'Articles from the database will appear here. Add articles from the staff dashboard.'
                        : 'Try adjusting your search terms or category filter.'}
                    </p>
                  </div>
                )}
                    </>
                  )}
                </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <SectionTitle
              label="Get guidance"
              title="Need expert HR guidance?"
              subtitle="Our team of HR experts is ready to help you implement these insights and transform your organisation's people practices."
              variant="dark"
              className="mb-8"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-secondary-500 text-primary-900 rounded-lg font-semibold text-lg hover:bg-secondary-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Expert Consultation
                <ExternalLink className="ml-2 w-5 h-5" />
              </a>
              
              <a
                href="https://www.eaglehr.co.ke/blog/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
              >
                Visit Our Blog
                <ExternalLink className="ml-2 w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
