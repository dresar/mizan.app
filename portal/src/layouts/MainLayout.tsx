import { ReactNode, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import AnnouncementPopup from '@/components/common/AnnouncementPopup';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [showUp, setShowUp] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowUp(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-18">{children}</main>
      <Footer />
      <WhatsAppButton className="bottom-20 right-6" role="public" />
      <AnnouncementPopup />
      {showUp && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-60 p-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MainLayout;