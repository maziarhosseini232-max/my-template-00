/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/search/SearchModal';
import { ToastContainer } from './components/common/ToastContainer';

// Homepage sections
import { HeroSection } from './components/home/HeroSection';
import { ContinueLearningSection } from './components/home/ContinueLearningSection';
import { CategoryGrid } from './components/home/CategoryGrid';
import { PopularCarousel } from './components/home/PopularCarousel';
import { TrendingSection } from './components/home/TrendingSection';
import { InstructorSpotlight } from './components/home/InstructorSpotlight';
import { TestimonialSection } from './components/home/TestimonialSection';
import { FinalCtaSection } from './components/home/FinalCtaSection';

// Page Views
import { CatalogView } from './components/catalog/CatalogView';
import { CourseDetailPage } from './components/course/CourseDetailPage';
import { CoursePlayer } from './components/player/CoursePlayer';
import { CartView } from './components/cart/CartView';
import { WishlistView } from './components/wishlist/WishlistView';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { InstructorStudio } from './components/instructor/InstructorStudio';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CourseManagementStudio } from './components/admin/studio/CourseManagementStudio';

const AppContent: React.FC = () => {
  const { currentRoute, setSearchModalOpen } = useApp();

  // Global keyboard shortcut listener for ⌘K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  // Render view based on route
  const renderCurrentView = () => {
    switch (currentRoute.view) {
      case 'home':
        return (
          <main>
            <HeroSection />
            <ContinueLearningSection />
            <CategoryGrid />
            <PopularCarousel />
            <TrendingSection />
            <InstructorSpotlight />
            <TestimonialSection />
            <FinalCtaSection />
          </main>
        );

      case 'catalog':
        return <CatalogView />;

      case 'course-detail':
        return <CourseDetailPage slugOrId={currentRoute.param || 'modern-ui-ux-design-systems-mastery'} />;

      case 'player':
        return <CoursePlayer courseId={currentRoute.param || 'course-1'} />;

      case 'cart':
        return <CartView />;

      case 'wishlist':
        return <WishlistView />;

      case 'dashboard':
      case 'certificates':
        return <StudentDashboard />;

      case 'instructor':
        return <InstructorStudio />;

      case 'admin':
        return <CourseManagementStudio />;

      default:
        return (
          <main>
            <HeroSection />
            <CategoryGrid />
            <PopularCarousel />
          </main>
        );
    }
  };

  // Check if current view is distraction-free player
  const isPlayerView = currentRoute.view === 'player';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Search Modal Overlay */}
      <SearchModal />

      {/* Global Toast Notification System */}
      <ToastContainer />

      {/* Header Navbar (hidden on full screen player) */}
      {!isPlayerView && <Navbar />}

      {/* Main Page Area */}
      <div className="flex-1">
        {renderCurrentView()}
      </div>

      {/* Footer (hidden on player view) */}
      {!isPlayerView && <Footer />}

      {/* Native Bottom Bar Navigation for Mobile (hidden on player view) */}
      {!isPlayerView && <MobileNav />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

