import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SlidingHRQuestions from '@/components/SlidingHRQuestions';
import StickyAboutSection from '@/components/StickyAboutSection';
import AccordionServicesSection from '@/components/AccordionServicesSection';
import FeaturedJobs from '@/components/FeaturedJobs';
import FloatingTestimonials from '@/components/FloatingTestimonials';
import Footer from '@/components/Footer';
import { Testimonial } from '@/types';

export default function Home() {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Leadership Team',
      position: 'HR & Administration',
      company: 'Central Bank of Kenya',
      content: 'Eagle HR has been a strategic partner in our talent acquisition and HR advisory. Their expertise in executive search and compliance has been invaluable to our organization.',
      rating: 5,
      image: '/images/about/smile_1.jpg'
    },
    {
      id: '2',
      name: 'HR & Standards Division',
      position: 'Partner',
      company: 'Kenya Bureau of Standards',
      content: 'Working with Eagle HR has strengthened our workforce planning and recruitment processes. Their professional approach and understanding of the public sector have delivered strong results.',
      rating: 5,
      image: '/images/about/smile_2.jpg'
    },
    {
      id: '3',
      name: 'Management Team',
      position: 'Partner',
      company: 'PACIDA',
      content: 'Eagle HR\'s recruitment and HR outsourcing services have supported our growth and operational excellence. We value their commitment to quality and timely delivery.',
      rating: 5,
      image: '/images/about/smile_4.jpg'
    },
    {
      id: '4',
      name: 'Leadership',
      position: 'Partner',
      company: 'KeNIC',
      content: 'Eagle HR has helped us build a high-performing team through their rigorous recruitment and assessment processes. A trusted partner for our HR needs.',
      rating: 5,
      image: '/images/about/smile_1.jpg'
    },
    {
      id: '5',
      name: 'HR Team',
      position: 'Partner',
      company: 'Kenya Development Corporation',
      content: 'From executive search to HR compliance, Eagle HR has consistently delivered. Their local expertise and professional standards make them a go-to partner.',
      rating: 5,
      image: '/images/about/smile_2.jpg'
    },
    {
      id: '6',
      name: 'Leadership Team',
      position: 'Partner',
      company: 'Consolidated Bank',
      content: 'Eagle HR\'s talent acquisition and training programs have contributed to our organizational development. We recommend their services for any institution seeking HR excellence.',
      rating: 5,
      image: '/images/about/smile_4.jpg'
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SlidingHRQuestions />
      <StickyAboutSection />
      <AccordionServicesSection />
      <FeaturedJobs />
      <FloatingTestimonials testimonials={testimonials} />
      <Footer />
    </main>
  );
}
