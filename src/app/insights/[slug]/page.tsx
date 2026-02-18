'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

interface InsightPost {
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
  imageTitle: string | null;
}

export default function InsightSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<InsightPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/insights/slug/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        setPost(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="pt-28 pb-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-100 rounded w-1/2" />
              <div className="aspect-video bg-neutral-100 rounded-xl" />
              <div className="h-4 bg-neutral-100 rounded w-full" />
              <div className="h-4 bg-neutral-100 rounded w-5/6" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen min-w-0 overflow-x-hidden">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-primary-900 mb-4">Article not found</h1>
            <p className="text-neutral-600 mb-6">
              The insight you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Insights
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const content = post.body?.trim() || post.excerpt;

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden">
      <Navbar />

      <article className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Insights
          </Link>

          <header className="mb-10">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full w-fit mb-4">
              <Tag className="w-4 h-4" />
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-neutral-500 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            </div>
          </header>

          <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm mb-10">
            <img
              src={post.image}
              alt={post.imageTitle || post.title}
              className="w-full aspect-video object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {post.imageTitle && (
              <p className="text-sm text-neutral-500 px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                {post.imageTitle}
              </p>
            )}
          </div>

          <div className="prose prose-neutral prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
