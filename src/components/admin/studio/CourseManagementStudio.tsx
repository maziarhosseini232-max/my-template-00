import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { StudioSidebar } from './StudioSidebar';
import { StudioHeader } from './StudioHeader';
import { StudioDashboard } from './StudioDashboard';
import { CourseListManager } from './CourseListManager';
import { CourseBuilderWizard } from './CourseBuilderWizard';
import { MediaLibraryTab } from './MediaLibraryTab';
import { CategoriesManagerTab } from './CategoriesManagerTab';
import { InstructorsManagerTab } from './InstructorsManagerTab';
import { StudentsManagerTab } from './StudentsManagerTab';
import { OrdersManagerTab } from './OrdersManagerTab';
import { PayoutsManagerTab } from './PayoutsManagerTab';
import { StudioSettingsTab } from './StudioSettingsTab';
import { BulkUploadModal } from './BulkUploadModal';
import { ImportCoursePackageModal } from './ImportCoursePackageModal';
import { CourseAnalyticsModal } from './CourseAnalyticsModal';
import { CoursePreviewModal } from './CoursePreviewModal';
import { Course } from '../../../types';

export const CourseManagementStudio: React.FC = () => {
  const { courses, categories, instructors, activeAdminTab, setActiveAdminTab, setCurrentView } = useApp();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Modals state
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [analyticsCourse, setAnalyticsCourse] = useState<Course | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setActiveTab('create-course');
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setActiveTab('create-course');
  };

  const handlePreviewCourse = (course: Course) => {
    setPreviewCourse(course);
  };

  const handleViewAnalytics = (course: Course) => {
    setAnalyticsCourse(course);
  };

  return (
    <div className="min-h-screen bg-[#f0fbf8] dark:bg-[#04171d] text-[#06242e] dark:text-slate-100 flex flex-col font-['Vazirmatn',sans-serif]" dir="rtl">
      
      {/* Studio Header */}
      <StudioHeader
        onNewCourse={handleCreateCourse}
        onImportCourse={() => setShowImportModal(true)}
        onOpenBulkUpload={() => setShowBulkUpload(true)}
        onExitStudio={() => setCurrentView('home')}
      />

      {/* Main Studio Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Studio Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <StudioSidebar
            activeTab={activeTab}
            onTabChange={tab => {
              if (tab !== 'create-course') {
                setEditingCourse(null);
              }
              setActiveTab(tab);
            }}
            onNewCourse={handleCreateCourse}
            onOpenBulkUpload={() => setShowBulkUpload(true)}
            onImportPackage={() => setShowImportModal(true)}
          />
        </div>

        {/* Studio Dynamic Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <StudioDashboard
              onNavigate={setActiveTab}
              onCreateCourse={handleCreateCourse}
              onEditCourse={handleEditCourse}
              onPreviewCourse={handlePreviewCourse}
              onViewAnalytics={handleViewAnalytics}
            />
          )}

          {/* Courses List Tab */}
          {activeTab === 'courses' && (
            <CourseListManager
              onCreateNew={handleCreateCourse}
              onEditCourse={handleEditCourse}
              onPreviewCourse={handlePreviewCourse}
              onViewAnalytics={handleViewAnalytics}
            />
          )}

          {/* Create or Edit Course Wizard Tab */}
          {activeTab === 'create-course' && (
            <CourseBuilderWizard
              initialCourse={editingCourse}
              onSaveAndClose={() => {
                setEditingCourse(null);
                setActiveTab('courses');
              }}
              onCancel={() => {
                setEditingCourse(null);
                setActiveTab('courses');
              }}
              onPreview={handlePreviewCourse}
            />
          )}

          {/* Media Library Tab */}
          {activeTab === 'media-library' && (
            <MediaLibraryTab onOpenBulkUpload={() => setShowBulkUpload(true)} />
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <CategoriesManagerTab />
          )}

          {/* Instructors Tab */}
          {activeTab === 'instructors' && (
            <InstructorsManagerTab />
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <StudentsManagerTab />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersManagerTab />
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <PayoutsManagerTab />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <StudioDashboard
                onNavigate={setActiveTab}
                onCreateCourse={handleCreateCourse}
                onEditCourse={handleEditCourse}
                onPreviewCourse={handlePreviewCourse}
                onViewAnalytics={handleViewAnalytics}
              />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <StudioSettingsTab />
          )}

        </div>

      </div>

      {/* Global Modals */}
      {showBulkUpload && (
        <BulkUploadModal onClose={() => setShowBulkUpload(false)} />
      )}

      {showImportModal && (
        <ImportCoursePackageModal onClose={() => setShowImportModal(false)} />
      )}

      {analyticsCourse && (
        <CourseAnalyticsModal
          course={analyticsCourse}
          onClose={() => setAnalyticsCourse(null)}
        />
      )}

      {previewCourse && (
        <CoursePreviewModal
          course={previewCourse}
          onClose={() => setPreviewCourse(null)}
        />
      )}

    </div>
  );
};
