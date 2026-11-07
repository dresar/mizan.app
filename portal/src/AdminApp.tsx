import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AdminLayout } from "@/components/layout";
import { ConfirmDialog } from "@/components/common";
import SkeletonPage from "@/components/common/SkeletonPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DataPrefetcher from "@/components/common/DataPrefetcher";
import ScrollToTop from "@/components/common/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "@/components/ThemeProvider";
import AuthLayout from "@/layouts/AuthLayout";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboardPage = lazy(() => import("./pages/Dashboard"));
const GenericResourcePage = lazy(() => import("./pages/GenericResourcePage"));
const GenericResourceFormPage = lazy(() => import("./pages/GenericResourceFormPage"));
const GenericAIGeneratorPage = lazy(() => import("./pages/ai/GenericAIGeneratorPage"));
const DataSyncPage = lazy(() => import("./pages/auth/DataSyncPage"));
const AdmissionsPage = lazy(() => import("./pages/admissions/AdmissionsPage"));
const SantriFormPage = lazy(() => import("./pages/admissions/SantriFormPage"));
const SantriDetailPage = lazy(() => import("./pages/admissions/SantriDetailPage"));
const SantriDocumentsPage = lazy(() => import("./pages/admissions/SantriDocumentsPage"));
const ExamSchedulesPage = lazy(() => import("./pages/admissions/ExamSchedulesPage"));
const ExamScheduleFormPage = lazy(() => import("./pages/admissions/ExamScheduleFormPage"));
const ExamResultsPage = lazy(() => import("./pages/admissions/ExamResultsPage"));
const ExamResultFormPage = lazy(() => import("./pages/admissions/ExamResultFormPage"));
const UsersPage = lazy(() => import("./pages/users/UsersPage"));
const ProfilePage = lazy(() => import("./pages/users/ProfilePage"));
const PaymentsPage = lazy(() => import("./pages/payments/PaymentsPage"));
const PaymentDetailPage = lazy(() => import("./pages/payments/PaymentDetailPage"));
const FinancialDashboard = lazy(() => import("./pages/financial/FinancialDashboard"));
const BlogEditorPage = lazy(() => import("./pages/blog/BlogEditorPage"));
const BlogAIGeneratorPage = lazy(() => import("./pages/blog/BlogAIGeneratorPage"));
const VisiMisiPage = lazy(() => import("./pages/website/visimisi/VisiMisiPage"));
const HeroListPage = lazy(() => import("./pages/website/hero/HeroListPage"));
const HeroFormPage = lazy(() => import("./pages/website/hero/HeroFormPage"));
const ProgramListPage = lazy(() => import("./pages/website/programs/ProgramListPage"));
const ProgramFormPage = lazy(() => import("./pages/website/programs/ProgramFormPage"));
const HistoryListPage = lazy(() => import("./pages/website/history/HistoryListPage"));
const HistoryFormPage = lazy(() => import("./pages/website/history/HistoryFormPage"));
const FounderListPage = lazy(() => import("./pages/website/founders/FounderListPage"));
const FounderFormPage = lazy(() => import("./pages/website/founders/FounderFormPage"));
const FacilitiesListPage = lazy(() => import("./pages/website/facilities/FacilitiesListPage"));
const FacilitiesFormPage = lazy(() => import("./pages/website/facilities/FacilitiesFormPage"));
const EducationListPage = lazy(() => import("./pages/website/education/EducationListPage"));
const EducationFormPage = lazy(() => import("./pages/website/education/EducationFormPage"));
const WebsiteSettingsPage = lazy(() => import("./pages/website/settings/WebsiteSettingsPage"));
const UniformListPage = lazy(() => import("./pages/website/uniforms/UniformListPage"));
const HomePageManager = lazy(() => import("./pages/website/home/HomePageManager"));
const AnnouncementListPage = lazy(() => import("./pages/blog/announcements/AnnouncementListPage"));
const AnnouncementFormPage = lazy(() => import("./pages/blog/announcements/AnnouncementFormPage"));
const TestimonialListPage = lazy(() => import("./pages/blog/testimonials/TestimonialListPage"));
const TestimonialFormPage = lazy(() => import("./pages/blog/testimonials/TestimonialFormPage"));
const CategoryListPage = lazy(() => import("./pages/blog/categories/CategoryListPage"));
const CategoryFormPage = lazy(() => import("./pages/blog/categories/CategoryFormPage"));
const TagListPage = lazy(() => import("./pages/blog/tags/TagListPage"));
const TagFormPage = lazy(() => import("./pages/blog/tags/TagFormPage"));
const TeacherListPage = lazy(() => import("./pages/hr/teachers/TeacherListPage"));
const TeacherFormPage = lazy(() => import("./pages/hr/teachers/TeacherFormPage"));
const GalleryListPage = lazy(() => import("./pages/media/gallery/GalleryListPage"));
const GalleryFormPage = lazy(() => import("./pages/media/gallery/GalleryFormPage"));
const DocumentationListPage = lazy(() => import("./pages/media/documentation/DocumentationListPage"));
const DocumentationFormPage = lazy(() => import("./pages/media/documentation/DocumentationFormPage"));
const MediaDashboardPage = lazy(() => import("./pages/media/MediaDashboardPage"));
const MediaAddAccountPage = lazy(() => import("./pages/media/MediaAddAccountPage"));
const MediaSettingsPage = lazy(() => import("./pages/media/MediaSettingsPage"));
const WhatsAppTemplateListPage = lazy(() => import("./pages/communication/whatsapp/WhatsAppTemplateListPage"));
const WhatsAppTemplateFormPage = lazy(() => import("./pages/communication/whatsapp/WhatsAppTemplateFormPage"));
const SystemSettingsPage = lazy(() => import("./pages/system/SystemSettingsPage"));
const DocumentSettingsPage = lazy(() => import("./pages/system/DocumentSettingsPage"));
const DocumentTemplateManager = lazy(() => import("./pages/system/DocumentTemplateManager"));
const AlurPendaftaranPage = lazy(() => import("./pages/website/AlurPendaftaranPage"));
const DailySchedulePage = lazy(() => import("./pages/website/DailySchedulePage"));
const DailyScheduleFormPage = lazy(() => import("./pages/website/DailyScheduleFormPage"));
const OrganisasiListPage = lazy(() => import("./pages/website/organisasi/OrganisasiListPage"));
const OrganisasiFormPage = lazy(() => import("./pages/website/organisasi/OrganisasiFormPage"));
const DocumentationPage = lazy(() => import("./pages/admin/DocumentationPage"));
const AdminArticleListPage = lazy(() => import("./pages/admin/publication/AdminArticleListPage"));
const AdminJournalListPage = lazy(() => import("./pages/admin/publication/AdminJournalListPage"));
const AdminAuthorVerificationPage = lazy(() => import("./pages/admin/publication/AdminAuthorVerificationPage"));
const AdminPublicationDashboard = lazy(() => import("./pages/admin/publication/AdminPublicationDashboard"));
const AdminPublicationCategoryPage = lazy(() => import("./pages/admin/publication/AdminPublicationCategoryPage"));
const AdminVolumePage = lazy(() => import("./pages/admin/publication/AdminVolumePage"));
const KMIDashboardPage = lazy(() => import("./pages/kmi/KMIDashboardPage"));
const KMIMapelPage = lazy(() => import("./pages/kmi/KMIMapelPage"));
const KMIKalenderPage = lazy(() => import("./pages/kmi/KMIKalenderPage"));
const KMIKelasPage = lazy(() => import("./pages/kmi/KMIKelasPage"));
const KMIAbsensiPage = lazy(() => import("./pages/kmi/KMIAbsensiPage"));
const KMINilaiPage = lazy(() => import("./pages/kmi/KMINilaiPage"));
const KMIRaporPage = lazy(() => import("./pages/kmi/KMIRaporPage"));
const KMITahunAjaranPage = lazy(() => import("./pages/kmi/KMITahunAjaranPage"));
const KMIGuruMapelPage = lazy(() => import("./pages/kmi/KMIGuruMapelPage"));
const KMIJadwalPage = lazy(() => import("./pages/kmi/KMIJadwalPage"));
const KMIKokurPage = lazy(() => import("./pages/kmi/KMIKokurPage"));

const NativeLoginRedirect = () => {
  useEffect(() => {
    window.location.href = '/login';
  }, []);
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      refetchOnWindowFocus: false,
      placeholderData: (prev: unknown) => prev,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24,
  buster: "v2",
});

const AdminApp = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" richColors />
            <ConfirmDialog />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <DataPrefetcher />
              <ScrollToTop />
              <Suspense fallback={<SkeletonPage />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin-cms/dashboard" replace />} />
                  <Route path="/admin.html" element={<Navigate to="/admin-cms/dashboard" replace />} />
                  <Route path="/admin" element={<Navigate to="/admin-cms/dashboard" replace />} />
                  <Route path="/admin-cms" element={<Navigate to="/admin-cms/dashboard" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/admin-cms/dashboard" replace />} />
                  <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
                  <Route path="/register" element={<AuthLayout><LoginPage /></AuthLayout>} />
                  <Route path="/admin-cms/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
                  <Route path="/admin/login" element={<AuthLayout><LoginPage /></AuthLayout>} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/admin-cms/sync" element={<DataSyncPage />} />
                    <Route path="/admin/sync" element={<DataSyncPage />} />
                    <Route path="/admin-cms/sync" element={<DataSyncPage />} />
                    <Route element={<AdminLayout />}>
                      <Route path="/admin-cms/dashboard" element={<AdminDashboardPage />} />
                      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                      <Route path="/admin-cms/system-docs" element={<DocumentationPage />} />
                      <Route path="/admin/system-docs" element={<DocumentationPage />} />
                      <Route path="/admin-cms/publication/dashboard" element={<AdminPublicationDashboard />} />
                      <Route path="/admin/publication/dashboard" element={<AdminPublicationDashboard />} />
                      <Route path="/admin-cms/publication/articles" element={<AdminArticleListPage />} />
                      <Route path="/admin/publication/articles" element={<AdminArticleListPage />} />
                      <Route path="/admin-cms/publication/journals" element={<AdminJournalListPage />} />
                      <Route path="/admin/publication/journals" element={<AdminJournalListPage />} />
                      <Route path="/admin-cms/publication/categories" element={<AdminPublicationCategoryPage />} />
                      <Route path="/admin/publication/categories" element={<AdminPublicationCategoryPage />} />
                      <Route path="/admin-cms/publication/volumes" element={<AdminVolumePage />} />
                      <Route path="/admin/publication/volumes" element={<AdminVolumePage />} />
                      <Route path="/admin-cms/publication/authors" element={<AdminAuthorVerificationPage />} />
                      <Route path="/admin/publication/authors" element={<AdminAuthorVerificationPage />} />
                      <Route path="/admin-cms/admissions" element={<AdmissionsPage />} />
                      <Route path="/admin/admissions" element={<AdmissionsPage />} />
                      <Route path="/admin-cms/admissions/new" element={<SantriFormPage />} />
                      <Route path="/admin/admissions/new" element={<SantriFormPage />} />
                      <Route path="/admin-cms/admissions/documents" element={<SantriDocumentsPage />} />
                      <Route path="/admin/admissions/documents" element={<SantriDocumentsPage />} />
                      <Route path="/admin-cms/admissions/schedules" element={<ExamSchedulesPage />} />
                      <Route path="/admin/admissions/schedules" element={<ExamSchedulesPage />} />
                      <Route path="/admin-cms/admissions/schedules/new" element={<ExamScheduleFormPage />} />
                      <Route path="/admin/admissions/schedules/new" element={<ExamScheduleFormPage />} />
                      <Route path="/admin-cms/admissions/schedules/:id/edit" element={<ExamScheduleFormPage />} />
                      <Route path="/admin/admissions/schedules/:id/edit" element={<ExamScheduleFormPage />} />
                      <Route path="/admin-cms/admissions/results" element={<ExamResultsPage />} />
                      <Route path="/admin/admissions/results" element={<ExamResultsPage />} />
                      <Route path="/admin-cms/admissions/results/new" element={<ExamResultFormPage />} />
                      <Route path="/admin/admissions/results/new" element={<ExamResultFormPage />} />
                      <Route path="/admin-cms/admissions/results/:id/edit" element={<ExamResultFormPage />} />
                      <Route path="/admin/admissions/results/:id/edit" element={<ExamResultFormPage />} />
                      <Route path="/admin-cms/admissions/:id" element={<SantriDetailPage />} />
                      <Route path="/admin/admissions/:id" element={<SantriDetailPage />} />
                      <Route path="/admin-cms/admissions/:id/edit" element={<SantriFormPage />} />
                      <Route path="/admin/admissions/:id/edit" element={<SantriFormPage />} />
                      <Route path="/admin-cms/financial-dashboard" element={<FinancialDashboard />} />
                      <Route path="/admin/financial-dashboard" element={<FinancialDashboard />} />
                      <Route path="/admin-cms/payments" element={<PaymentsPage />} />
                      <Route path="/admin/payments" element={<PaymentsPage />} />
                      <Route path="/admin-cms/payments/:id" element={<PaymentDetailPage />} />
                      <Route path="/admin/payments/:id" element={<PaymentDetailPage />} />
                      <Route path="/admin-cms/users" element={<UsersPage />} />
                      <Route path="/admin/users" element={<UsersPage />} />
                      <Route path="/admin-cms/profile" element={<ProfilePage />} />
                      <Route path="/admin/profile" element={<ProfilePage />} />
                      <Route path="/admin-cms/blog" element={<Navigate to="/admin/blog/posts" replace />} />
                      <Route path="/admin/blog" element={<Navigate to="/admin/blog/posts" replace />} />
                      <Route path="/admin-cms/blog/posts" element={<GenericResourcePage resource="blogBlogpost" title="Artikel & Berita" basePath="/admin/blog/posts" viewMode="grid" />} />
                      <Route path="/admin/blog/posts" element={<GenericResourcePage resource="blogBlogpost" title="Artikel & Berita" basePath="/admin/blog/posts" viewMode="grid" />} />
                      <Route path="/admin-cms/blog/generate-ai" element={<BlogAIGeneratorPage />} />
                      <Route path="/admin/blog/generate-ai" element={<BlogAIGeneratorPage />} />
                      <Route path="/admin-cms/blog/posts/new" element={<BlogEditorPage />} />
                      <Route path="/admin/blog/posts/new" element={<BlogEditorPage />} />
                      <Route path="/admin-cms/blog/posts/:id/edit" element={<BlogEditorPage />} />
                      <Route path="/admin/blog/posts/:id/edit" element={<BlogEditorPage />} />
                      <Route path="/admin-cms/announcements" element={<AnnouncementListPage />} />
                      <Route path="/admin/announcements" element={<AnnouncementListPage />} />
                      <Route path="/admin-cms/announcements/new" element={<AnnouncementFormPage />} />
                      <Route path="/admin/announcements/new" element={<AnnouncementFormPage />} />
                      <Route path="/admin-cms/announcements/:id/edit" element={<AnnouncementFormPage />} />
                      <Route path="/admin/announcements/:id/edit" element={<AnnouncementFormPage />} />
                      <Route path="/admin-cms/blog/categories" element={<CategoryListPage />} />
                      <Route path="/admin/blog/categories" element={<CategoryListPage />} />
                      <Route path="/admin-cms/blog/categories/new" element={<CategoryFormPage />} />
                      <Route path="/admin/blog/categories/new" element={<CategoryFormPage />} />
                      <Route path="/admin-cms/blog/categories/:id/edit" element={<CategoryFormPage />} />
                      <Route path="/admin/blog/categories/:id/edit" element={<CategoryFormPage />} />
                      <Route path="/admin-cms/blog/tags" element={<TagListPage />} />
                      <Route path="/admin/blog/tags" element={<TagListPage />} />
                      <Route path="/admin-cms/blog/tags/new" element={<TagFormPage />} />
                      <Route path="/admin/blog/tags/new" element={<TagFormPage />} />
                      <Route path="/admin-cms/blog/tags/:id/edit" element={<TagFormPage />} />
                      <Route path="/admin/blog/tags/:id/edit" element={<TagFormPage />} />
                      <Route path="/admin-cms/testimonials" element={<TestimonialListPage />} />
                      <Route path="/admin/testimonials" element={<TestimonialListPage />} />
                      <Route path="/admin-cms/testimonials/new" element={<TestimonialFormPage />} />
                      <Route path="/admin/testimonials/new" element={<TestimonialFormPage />} />
                      <Route path="/admin-cms/testimonials/:id/edit" element={<TestimonialFormPage />} />
                      <Route path="/admin/testimonials/:id/edit" element={<TestimonialFormPage />} />
                      <Route path="/admin-cms/faq" element={<GenericResourcePage resource="faq" title="FAQ" basePath="/admin/faq" />} />
                      <Route path="/admin/faq" element={<GenericResourcePage resource="faq" title="FAQ" basePath="/admin/faq" />} />
                      <Route path="/admin-cms/faq/new" element={<GenericResourceFormPage resource="faq" title="FAQ" basePath="/admin/faq" />} />
                      <Route path="/admin/faq/new" element={<GenericResourceFormPage resource="faq" title="FAQ" basePath="/admin/faq" />} />
                      <Route path="/admin-cms/faq/:id/edit" element={<GenericResourceFormPage resource="faq" title="FAQ" basePath="/admin/faq" />} />
                      <Route path="/admin/faq/:id/edit" element={<GenericResourceFormPage resource="faq" title="FAQ" basePath="/admin/faq" />} />
                      <Route path="/admin-cms/ai-generator" element={<GenericAIGeneratorPage />} />
                      <Route path="/admin/ai-generator" element={<GenericAIGeneratorPage />} />
                      <Route path="/admin-cms/extracurricular" element={<GenericResourcePage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin/extracurricular" />} />
                      <Route path="/admin/extracurricular" element={<GenericResourcePage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin/extracurricular" />} />
                      <Route path="/admin-cms/extracurricular/new" element={<GenericResourceFormPage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin/extracurricular" />} />
                      <Route path="/admin/extracurricular/new" element={<GenericResourceFormPage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin/extracurricular" />} />
                      <Route path="/admin-cms/extracurricular/:id/edit" element={<GenericResourceFormPage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin/extracurricular" />} />
                      <Route path="/admin/extracurricular/:id/edit" element={<GenericResourceFormPage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin/extracurricular" />} />
                      <Route path="/admin-cms/daily-schedule" element={<DailySchedulePage />} />
                      <Route path="/admin/daily-schedule" element={<DailySchedulePage />} />
                      <Route path="/admin-cms/daily-schedule/new" element={<DailyScheduleFormPage />} />
                      <Route path="/admin/daily-schedule/new" element={<DailyScheduleFormPage />} />
                      <Route path="/admin-cms/daily-schedule/:id/edit" element={<DailyScheduleFormPage />} />
                      <Route path="/admin/daily-schedule/:id/edit" element={<DailyScheduleFormPage />} />
                      <Route path="/admin-cms/website-settings" element={<WebsiteSettingsPage />} />
                      <Route path="/admin/website-settings" element={<WebsiteSettingsPage />} />
                      <Route path="/admin-cms/registration-flow" element={<GenericResourcePage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin/registration-flow" />} />
                      <Route path="/admin/registration-flow" element={<GenericResourcePage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin/registration-flow" />} />
                      <Route path="/admin-cms/registration-flow/new" element={<GenericResourceFormPage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin/registration-flow" />} />
                      <Route path="/admin/registration-flow/new" element={<GenericResourceFormPage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin/registration-flow" />} />
                      <Route path="/admin-cms/registration-flow/:id/edit" element={<GenericResourceFormPage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin/registration-flow" />} />
                      <Route path="/admin/registration-flow/:id/edit" element={<GenericResourceFormPage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin/registration-flow" />} />
                      <Route path="/admin-cms/home-settings" element={<HomePageManager />} />
                      <Route path="/admin/home-settings" element={<HomePageManager />} />
                      <Route path="/admin-cms/hero-sections" element={<HeroListPage />} />
                      <Route path="/admin/hero-sections" element={<HeroListPage />} />
                      <Route path="/admin-cms/hero-sections/new" element={<HeroFormPage />} />
                      <Route path="/admin/hero-sections/new" element={<HeroFormPage />} />
                      <Route path="/admin-cms/hero-sections/:id/edit" element={<HeroFormPage />} />
                      <Route path="/admin/hero-sections/:id/edit" element={<HeroFormPage />} />
                      <Route path="/admin-cms/vision-mission" element={<VisiMisiPage />} />
                      <Route path="/admin/vision-mission" element={<VisiMisiPage />} />
                      <Route path="/admin-cms/history" element={<HistoryListPage />} />
                      <Route path="/admin/history" element={<HistoryListPage />} />
                      <Route path="/admin-cms/history/new" element={<HistoryFormPage />} />
                      <Route path="/admin/history/new" element={<HistoryFormPage />} />
                      <Route path="/admin-cms/history/:id/edit" element={<HistoryFormPage />} />
                      <Route path="/admin/history/:id/edit" element={<HistoryFormPage />} />
                      <Route path="/admin-cms/media" element={<MediaDashboardPage />} />
                      <Route path="/admin/media" element={<MediaDashboardPage />} />
                      <Route path="/admin-cms/media/add-account" element={<MediaAddAccountPage />} />
                      <Route path="/admin/media/add-account" element={<MediaAddAccountPage />} />
                      <Route path="/admin-cms/media/settings" element={<MediaSettingsPage />} />
                      <Route path="/admin/media/settings" element={<MediaSettingsPage />} />
                      <Route path="/admin-cms/website/founders" element={<FounderListPage />} />
                      <Route path="/admin/website/founders" element={<FounderListPage />} />
                      <Route path="/admin-cms/website/founders/new" element={<FounderFormPage />} />
                      <Route path="/admin/website/founders/new" element={<FounderFormPage />} />
                      <Route path="/admin-cms/website/founders/:id/edit" element={<FounderFormPage />} />
                      <Route path="/admin/website/founders/:id/edit" element={<FounderFormPage />} />
                      <Route path="/admin-cms/programs" element={<ProgramListPage />} />
                      <Route path="/admin/programs" element={<ProgramListPage />} />
                      <Route path="/admin-cms/programs/new" element={<ProgramFormPage />} />
                      <Route path="/admin/programs/new" element={<ProgramFormPage />} />
                      <Route path="/admin-cms/programs/:id/edit" element={<ProgramFormPage />} />
                      <Route path="/admin/programs/:id/edit" element={<ProgramFormPage />} />
                      <Route path="/admin-cms/facilities" element={<FacilitiesListPage />} />
                      <Route path="/admin/facilities" element={<FacilitiesListPage />} />
                      <Route path="/admin-cms/facilities/new" element={<FacilitiesFormPage />} />
                      <Route path="/admin/facilities/new" element={<FacilitiesFormPage />} />
                      <Route path="/admin-cms/facilities/:id/edit" element={<FacilitiesFormPage />} />
                      <Route path="/admin/facilities/:id/edit" element={<FacilitiesFormPage />} />
                      <Route path="/admin-cms/organisasi" element={<OrganisasiListPage />} />
                      <Route path="/admin/organisasi" element={<OrganisasiListPage />} />
                      <Route path="/admin-cms/organisasi/new" element={<OrganisasiFormPage />} />
                      <Route path="/admin/organisasi/new" element={<OrganisasiFormPage />} />
                      <Route path="/admin-cms/organisasi/:id/edit" element={<OrganisasiFormPage />} />
                      <Route path="/admin/organisasi/:id/edit" element={<OrganisasiFormPage />} />
                      <Route path="/admin-cms/education" element={<EducationListPage />} />
                      <Route path="/admin/education" element={<EducationListPage />} />
                      <Route path="/admin-cms/education/new" element={<EducationFormPage />} />
                      <Route path="/admin/education/new" element={<EducationFormPage />} />
                      <Route path="/admin-cms/education/:id/edit" element={<EducationFormPage />} />
                      <Route path="/admin/education/:id/edit" element={<EducationFormPage />} />
                      <Route path="/admin-cms/tuition-fees" element={<GenericResourcePage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin/tuition-fees" />} />
                      <Route path="/admin/tuition-fees" element={<GenericResourcePage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin/tuition-fees" />} />
                      <Route path="/admin-cms/tuition-fees/new" element={<GenericResourceFormPage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin/tuition-fees" />} />
                      <Route path="/admin/tuition-fees/new" element={<GenericResourceFormPage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin/tuition-fees" />} />
                      <Route path="/admin-cms/tuition-fees/:id/edit" element={<GenericResourceFormPage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin/tuition-fees" />} />
                      <Route path="/admin/tuition-fees/:id/edit" element={<GenericResourceFormPage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin/tuition-fees" />} />
                      <Route path="/admin-cms/uniforms" element={<UniformListPage />} />
                      <Route path="/admin/uniforms" element={<UniformListPage />} />
                      <Route path="/admin-cms/uniforms/new" element={<GenericResourceFormPage resource="seragam" title="Seragam" basePath="/admin/uniforms" />} />
                      <Route path="/admin/uniforms/new" element={<GenericResourceFormPage resource="seragam" title="Seragam" basePath="/admin/uniforms" />} />
                      <Route path="/admin-cms/uniforms/:id/edit" element={<GenericResourceFormPage resource="seragam" title="Seragam" basePath="/admin/uniforms" />} />
                      <Route path="/admin/uniforms/:id/edit" element={<GenericResourceFormPage resource="seragam" title="Seragam" basePath="/admin/uniforms" />} />
                      <Route path="/admin-cms/statistics" element={<GenericResourcePage resource="statistik" title="Statistik" basePath="/admin/statistics" />} />
                      <Route path="/admin/statistics" element={<GenericResourcePage resource="statistik" title="Statistik" basePath="/admin/statistics" />} />
                      <Route path="/admin-cms/statistics/new" element={<GenericResourceFormPage resource="statistik" title="Statistik" basePath="/admin/statistics" />} />
                      <Route path="/admin/statistics/new" element={<GenericResourceFormPage resource="statistik" title="Statistik" basePath="/admin/statistics" />} />
                      <Route path="/admin-cms/statistics/:id/edit" element={<GenericResourceFormPage resource="statistik" title="Statistik" basePath="/admin/statistics" />} />
                      <Route path="/admin/statistics/:id/edit" element={<GenericResourceFormPage resource="statistik" title="Statistik" basePath="/admin/statistics" />} />
                      <Route path="/admin-cms/teachers" element={<TeacherListPage />} />
                      <Route path="/admin/teachers" element={<TeacherListPage />} />
                      <Route path="/admin-cms/teachers/new" element={<TeacherFormPage />} />
                      <Route path="/admin/teachers/new" element={<TeacherFormPage />} />
                      <Route path="/admin-cms/teachers/:id/edit" element={<TeacherFormPage />} />
                      <Route path="/admin/teachers/:id/edit" element={<TeacherFormPage />} />
                      <Route path="/admin-cms/positions" element={<GenericResourcePage resource="bagianJabatan" title="Jabatan & Posisi" />} />
                      <Route path="/admin/positions" element={<GenericResourcePage resource="bagianJabatan" title="Jabatan & Posisi" />} />
                      <Route path="/admin-cms/gallery" element={<GalleryListPage />} />
                      <Route path="/admin/gallery" element={<GalleryListPage />} />
                      <Route path="/admin-cms/gallery/new" element={<GalleryFormPage />} />
                      <Route path="/admin/gallery/new" element={<GalleryFormPage />} />
                      <Route path="/admin-cms/gallery/:id/edit" element={<GalleryFormPage />} />
                      <Route path="/admin/gallery/:id/edit" element={<GalleryFormPage />} />
                      <Route path="/admin-cms/documentation" element={<DocumentationListPage />} />
                      <Route path="/admin/documentation" element={<DocumentationListPage />} />
                      <Route path="/admin-cms/documentation/new" element={<DocumentationFormPage />} />
                      <Route path="/admin/documentation/new" element={<DocumentationFormPage />} />
                      <Route path="/admin-cms/documentation/:id/edit" element={<DocumentationFormPage />} />
                      <Route path="/admin/documentation/:id/edit" element={<DocumentationFormPage />} />
                      <Route path="/admin-cms/contacts" element={<GenericResourcePage resource="kontak" title="Kontak Masuk" />} />
                      <Route path="/admin/contacts" element={<GenericResourcePage resource="kontak" title="Kontak Masuk" />} />
                      <Route path="/admin-cms/contact-persons" element={<GenericResourcePage resource="contactPersons" title="Contact Person" />} />
                      <Route path="/admin/contact-persons" element={<GenericResourcePage resource="contactPersons" title="Contact Person" />} />
                      <Route path="/admin-cms/social-media" element={<GenericResourcePage resource="socialMedia" title="Sosial Media" />} />
                      <Route path="/admin/social-media" element={<GenericResourcePage resource="socialMedia" title="Sosial Media" />} />
                      <Route path="/admin-cms/whatsapp-templates" element={<WhatsAppTemplateListPage />} />
                      <Route path="/admin/whatsapp-templates" element={<WhatsAppTemplateListPage />} />
                      <Route path="/admin-cms/whatsapp-templates/new" element={<WhatsAppTemplateFormPage />} />
                      <Route path="/admin/whatsapp-templates/new" element={<WhatsAppTemplateFormPage />} />
                      <Route path="/admin-cms/whatsapp-templates/:id/edit" element={<WhatsAppTemplateFormPage />} />
                      <Route path="/admin/whatsapp-templates/:id/edit" element={<WhatsAppTemplateFormPage />} />
                      <Route path="/admin-cms/settings" element={<SystemSettingsPage />} />
                      <Route path="/admin/settings" element={<SystemSettingsPage />} />
                      <Route path="/admin-cms/bugnotes" element={<GenericResourcePage resource="adminBugnotes" title="Bug Notes" basePath="/admin/bugnotes" />} />
                      <Route path="/admin/bugnotes" element={<GenericResourcePage resource="adminBugnotes" title="Bug Notes" basePath="/admin/bugnotes" />} />
                      <Route path="/admin-cms/bugnotes/new" element={<GenericResourceFormPage resource="adminBugnotes" title="Bug Notes" basePath="/admin/bugnotes" />} />
                      <Route path="/admin/bugnotes/new" element={<GenericResourceFormPage resource="adminBugnotes" title="Bug Notes" basePath="/admin/bugnotes" />} />
                      <Route path="/admin-cms/bugnotes/:id/edit" element={<GenericResourceFormPage resource="adminBugnotes" title="Bug Notes" basePath="/admin/bugnotes" />} />
                      <Route path="/admin/bugnotes/:id/edit" element={<GenericResourceFormPage resource="adminBugnotes" title="Bug Notes" basePath="/admin/bugnotes" />} />
                      <Route path="/admin-cms/document-settings" element={<DocumentSettingsPage />} />
                      <Route path="/admin/document-settings" element={<DocumentSettingsPage />} />
                      <Route path="/admin-cms/document-templates" element={<DocumentTemplateManager />} />
                      <Route path="/admin/document-templates" element={<DocumentTemplateManager />} />
                      <Route path="/admin-cms/kmi/dashboard" element={<KMIDashboardPage />} />
                      <Route path="/admin/kmi/dashboard" element={<KMIDashboardPage />} />
                      <Route path="/admin-cms/kmi/mapel" element={<KMIMapelPage />} />
                      <Route path="/admin/kmi/mapel" element={<KMIMapelPage />} />
                      <Route path="/admin-cms/kmi/kalender" element={<KMIKalenderPage />} />
                      <Route path="/admin/kmi/kalender" element={<KMIKalenderPage />} />
                      <Route path="/admin-cms/kmi/tahun-ajaran" element={<KMITahunAjaranPage />} />
                      <Route path="/admin/kmi/tahun-ajaran" element={<KMITahunAjaranPage />} />
                      <Route path="/admin-cms/kmi/kelas" element={<KMIKelasPage />} />
                      <Route path="/admin/kmi/kelas" element={<KMIKelasPage />} />
                      <Route path="/admin-cms/kmi/guru-mapel" element={<KMIGuruMapelPage />} />
                      <Route path="/admin/kmi/guru-mapel" element={<KMIGuruMapelPage />} />
                      <Route path="/admin-cms/kmi/jadwal" element={<KMIJadwalPage />} />
                      <Route path="/admin/kmi/jadwal" element={<KMIJadwalPage />} />
                      <Route path="/admin-cms/kmi/absensi" element={<KMIAbsensiPage />} />
                      <Route path="/admin/kmi/absensi" element={<KMIAbsensiPage />} />
                      <Route path="/admin-cms/kmi/absensi/input" element={<KMIAbsensiPage />} />
                      <Route path="/admin/kmi/absensi/input" element={<KMIAbsensiPage />} />
                      <Route path="/admin-cms/kmi/nilai" element={<KMINilaiPage />} />
                      <Route path="/admin/kmi/nilai" element={<KMINilaiPage />} />
                      <Route path="/admin-cms/kmi/rapor" element={<KMIRaporPage />} />
                      <Route path="/admin/kmi/rapor" element={<KMIRaporPage />} />
                      <Route path="/admin-cms/kmi/kokur" element={<KMIKokurPage />} />
                      <Route path="/admin/kmi/kokur" element={<KMIKokurPage />} />

                      <Route path="/admin-cms/dashboard" element={<AdminDashboardPage />} />
                      <Route path="/admin-cms/system-docs" element={<DocumentationPage />} />
                      <Route path="/admin-cms/publication/dashboard" element={<AdminPublicationDashboard />} />
                      <Route path="/admin-cms/publication/articles" element={<AdminArticleListPage />} />
                      <Route path="/admin-cms/publication/journals" element={<AdminJournalListPage />} />
                      <Route path="/admin-cms/publication/categories" element={<AdminPublicationCategoryPage />} />
                      <Route path="/admin-cms/publication/volumes" element={<AdminVolumePage />} />
                      <Route path="/admin-cms/publication/authors" element={<AdminAuthorVerificationPage />} />
                      <Route path="/admin-cms/admissions" element={<AdmissionsPage />} />
                      <Route path="/admin-cms/admissions/new" element={<SantriFormPage />} />
                      <Route path="/admin-cms/admissions/documents" element={<SantriDocumentsPage />} />
                      <Route path="/admin-cms/admissions/schedules" element={<ExamSchedulesPage />} />
                      <Route path="/admin-cms/admissions/schedules/new" element={<ExamScheduleFormPage />} />
                      <Route path="/admin-cms/admissions/schedules/:id/edit" element={<ExamScheduleFormPage />} />
                      <Route path="/admin-cms/admissions/results" element={<ExamResultsPage />} />
                      <Route path="/admin-cms/admissions/results/new" element={<ExamResultFormPage />} />
                      <Route path="/admin-cms/admissions/results/:id/edit" element={<ExamResultFormPage />} />
                      <Route path="/admin-cms/admissions/:id" element={<SantriDetailPage />} />
                      <Route path="/admin-cms/admissions/:id/edit" element={<SantriFormPage />} />
                      <Route path="/admin-cms/financial-dashboard" element={<FinancialDashboard />} />
                      <Route path="/admin-cms/payments" element={<PaymentsPage />} />
                      <Route path="/admin-cms/payments/:id" element={<PaymentDetailPage />} />
                      <Route path="/admin-cms/users" element={<UsersPage />} />
                      <Route path="/admin-cms/profile" element={<ProfilePage />} />
                      <Route path="/admin-cms/blog" element={<Navigate to="/admin-cms/blog/posts" replace />} />
                      <Route path="/admin-cms/blog/posts" element={<GenericResourcePage resource="blogBlogpost" title="Artikel & Berita" basePath="/admin-cms/blog/posts" viewMode="grid" />} />
                      <Route path="/admin-cms/blog/generate-ai" element={<BlogAIGeneratorPage />} />
                      <Route path="/admin-cms/blog/posts/new" element={<BlogEditorPage />} />
                      <Route path="/admin-cms/blog/posts/:id/edit" element={<BlogEditorPage />} />
                      <Route path="/admin-cms/announcements" element={<AnnouncementListPage />} />
                      <Route path="/admin-cms/announcements/new" element={<AnnouncementFormPage />} />
                      <Route path="/admin-cms/announcements/:id/edit" element={<AnnouncementFormPage />} />
                      <Route path="/admin-cms/blog/categories" element={<CategoryListPage />} />
                      <Route path="/admin-cms/blog/categories/new" element={<CategoryFormPage />} />
                      <Route path="/admin-cms/blog/categories/:id/edit" element={<CategoryFormPage />} />
                      <Route path="/admin-cms/blog/tags" element={<TagListPage />} />
                      <Route path="/admin-cms/blog/tags/new" element={<TagFormPage />} />
                      <Route path="/admin-cms/blog/tags/:id/edit" element={<TagFormPage />} />
                      <Route path="/admin-cms/testimonials" element={<TestimonialListPage />} />
                      <Route path="/admin-cms/testimonials/new" element={<TestimonialFormPage />} />
                      <Route path="/admin-cms/testimonials/:id/edit" element={<TestimonialFormPage />} />
                      <Route path="/admin-cms/faq" element={<GenericResourcePage resource="faq" title="FAQ" basePath="/admin-cms/faq" />} />
                      <Route path="/admin-cms/faq/new" element={<GenericResourceFormPage resource="faq" title="FAQ" basePath="/admin-cms/faq" />} />
                      <Route path="/admin-cms/faq/:id/edit" element={<GenericResourceFormPage resource="faq" title="FAQ" basePath="/admin-cms/faq" />} />
                      <Route path="/admin-cms/ai-generator" element={<GenericAIGeneratorPage />} />
                      <Route path="/admin-cms/extracurricular" element={<GenericResourcePage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin-cms/extracurricular" />} />
                      <Route path="/admin-cms/extracurricular/new" element={<GenericResourceFormPage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin-cms/extracurricular" />} />
                      <Route path="/admin-cms/extracurricular/:id/edit" element={<GenericResourceFormPage resource="ekstrakurikuler" title="Ekstrakurikuler" basePath="/admin-cms/extracurricular" />} />
                      <Route path="/admin-cms/daily-schedule" element={<DailySchedulePage />} />
                      <Route path="/admin-cms/daily-schedule/new" element={<DailyScheduleFormPage />} />
                      <Route path="/admin-cms/daily-schedule/:id/edit" element={<DailyScheduleFormPage />} />
                      <Route path="/admin-cms/website-settings" element={<WebsiteSettingsPage />} />
                      <Route path="/admin-cms/registration-flow" element={<GenericResourcePage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin-cms/registration-flow" />} />
                      <Route path="/admin-cms/registration-flow/new" element={<GenericResourceFormPage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin-cms/registration-flow" />} />
                      <Route path="/admin-cms/registration-flow/:id/edit" element={<GenericResourceFormPage resource="registrationFlow" title="Alur Pendaftaran" basePath="/admin-cms/registration-flow" />} />
                      <Route path="/admin-cms/home-settings" element={<HomePageManager />} />
                      <Route path="/admin-cms/hero-sections" element={<HeroListPage />} />
                      <Route path="/admin-cms/hero-sections/new" element={<HeroFormPage />} />
                      <Route path="/admin-cms/hero-sections/:id/edit" element={<HeroFormPage />} />
                      <Route path="/admin-cms/vision-mission" element={<VisiMisiPage />} />
                      <Route path="/admin-cms/history" element={<HistoryListPage />} />
                      <Route path="/admin-cms/history/new" element={<HistoryFormPage />} />
                      <Route path="/admin-cms/history/:id/edit" element={<HistoryFormPage />} />
                      <Route path="/admin-cms/media" element={<MediaDashboardPage />} />
                      <Route path="/admin-cms/media/add-account" element={<MediaAddAccountPage />} />
                      <Route path="/admin-cms/media/settings" element={<MediaSettingsPage />} />
                      <Route path="/admin-cms/website/founders" element={<FounderListPage />} />
                      <Route path="/admin-cms/website/founders/new" element={<FounderFormPage />} />
                      <Route path="/admin-cms/website/founders/:id/edit" element={<FounderFormPage />} />
                      <Route path="/admin-cms/programs" element={<ProgramListPage />} />
                      <Route path="/admin-cms/programs/new" element={<ProgramFormPage />} />
                      <Route path="/admin-cms/programs/:id/edit" element={<ProgramFormPage />} />
                      <Route path="/admin-cms/facilities" element={<FacilitiesListPage />} />
                      <Route path="/admin-cms/facilities/new" element={<FacilitiesFormPage />} />
                      <Route path="/admin-cms/facilities/:id/edit" element={<FacilitiesFormPage />} />
                      <Route path="/admin-cms/organisasi" element={<OrganisasiListPage />} />
                      <Route path="/admin-cms/organisasi/new" element={<OrganisasiFormPage />} />
                      <Route path="/admin-cms/organisasi/:id/edit" element={<OrganisasiFormPage />} />
                      <Route path="/admin-cms/education" element={<EducationListPage />} />
                      <Route path="/admin-cms/education/new" element={<EducationFormPage />} />
                      <Route path="/admin-cms/education/:id/edit" element={<EducationFormPage />} />
                      <Route path="/admin-cms/tuition-fees" element={<GenericResourcePage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin-cms/tuition-fees" />} />
                      <Route path="/admin-cms/tuition-fees/new" element={<GenericResourceFormPage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin-cms/tuition-fees" />} />
                      <Route path="/admin-cms/tuition-fees/:id/edit" element={<GenericResourceFormPage resource="biayaPendidikan" title="Biaya Pendidikan" basePath="/admin-cms/tuition-fees" />} />
                      <Route path="/admin-cms/uniforms" element={<UniformListPage />} />
                      <Route path="/admin-cms/uniforms/new" element={<GenericResourceFormPage resource="seragam" title="Seragam" basePath="/admin-cms/uniforms" />} />
                      <Route path="/admin-cms/uniforms/:id/edit" element={<GenericResourceFormPage resource="seragam" title="Seragam" basePath="/admin-cms/uniforms" />} />
                      <Route path="/admin-cms/statistics" element={<GenericResourcePage resource="statistik" title="Statistik" basePath="/admin-cms/statistics" />} />
                      <Route path="/admin-cms/statistics/new" element={<GenericResourceFormPage resource="statistik" title="Statistik" basePath="/admin-cms/statistics" />} />
                      <Route path="/admin-cms/statistics/:id/edit" element={<GenericResourceFormPage resource="statistik" title="Statistik" basePath="/admin-cms/statistics" />} />
                      <Route path="/admin-cms/teachers" element={<TeacherListPage />} />
                      <Route path="/admin-cms/teachers/new" element={<TeacherFormPage />} />
                      <Route path="/admin-cms/teachers/:id/edit" element={<TeacherFormPage />} />
                      <Route path="/admin-cms/positions" element={<GenericResourcePage resource="bagianJabatan" title="Jabatan & Posisi" />} />
                      <Route path="/admin-cms/gallery" element={<GalleryListPage />} />
                      <Route path="/admin-cms/gallery/new" element={<GalleryFormPage />} />
                      <Route path="/admin-cms/gallery/:id/edit" element={<GalleryFormPage />} />
                      <Route path="/admin-cms/documentation" element={<DocumentationListPage />} />
                      <Route path="/admin-cms/documentation/new" element={<DocumentationFormPage />} />
                      <Route path="/admin-cms/documentation/:id/edit" element={<DocumentationFormPage />} />
                      <Route path="/admin-cms/contacts" element={<GenericResourcePage resource="kontak" title="Kontak Masuk" />} />
                      <Route path="/admin-cms/contact-persons" element={<GenericResourcePage resource="contactPersons" title="Contact Person" />} />
                      <Route path="/admin-cms/social-media" element={<GenericResourcePage resource="socialMedia" title="Sosial Media" />} />
                      <Route path="/admin-cms/whatsapp-templates" element={<WhatsAppTemplateListPage />} />
                      <Route path="/admin-cms/whatsapp-templates/new" element={<WhatsAppTemplateFormPage />} />
                      <Route path="/admin-cms/whatsapp-templates/:id/edit" element={<WhatsAppTemplateFormPage />} />
                      <Route path="/admin-cms/settings" element={<SystemSettingsPage />} />
                      <Route path="/admin-cms/bugnotes" element={<GenericResourcePage resource="adminBugnotes" title="Bug Notes" basePath="/admin-cms/bugnotes" />} />
                      <Route path="/admin-cms/bugnotes/new" element={<GenericResourceFormPage resource="adminBugnotes" title="Bug Notes" basePath="/admin-cms/bugnotes" />} />
                      <Route path="/admin-cms/bugnotes/:id/edit" element={<GenericResourceFormPage resource="adminBugnotes" title="Bug Notes" basePath="/admin-cms/bugnotes" />} />
                      <Route path="/admin-cms/document-settings" element={<DocumentSettingsPage />} />
                      <Route path="/admin-cms/document-templates" element={<DocumentTemplateManager />} />
                      <Route path="/admin-cms/kmi/dashboard" element={<KMIDashboardPage />} />
                      <Route path="/admin-cms/kmi/mapel" element={<KMIMapelPage />} />
                      <Route path="/admin-cms/kmi/kalender" element={<KMIKalenderPage />} />
                      <Route path="/admin-cms/kmi/tahun-ajaran" element={<KMITahunAjaranPage />} />
                      <Route path="/admin-cms/kmi/kelas" element={<KMIKelasPage />} />
                      <Route path="/admin-cms/kmi/guru-mapel" element={<KMIGuruMapelPage />} />
                      <Route path="/admin-cms/kmi/jadwal" element={<KMIJadwalPage />} />
                      <Route path="/admin-cms/kmi/absensi" element={<KMIAbsensiPage />} />
                      <Route path="/admin-cms/kmi/absensi/input" element={<KMIAbsensiPage />} />
                      <Route path="/admin-cms/kmi/nilai" element={<KMINilaiPage />} />
                      <Route path="/admin-cms/kmi/rapor" element={<KMIRaporPage />} />
                      <Route path="/admin-cms/kmi/kokur" element={<KMIKokurPage />} />
                    </Route>
                  </Route>

                  <Route path="/faq" element={<Navigate to="/admin/faq" replace />} />
                  <Route path="/extracurricular" element={<Navigate to="/admin/extracurricular" replace />} />
                  <Route path="/daily-schedule" element={<Navigate to="/admin/daily-schedule" replace />} />
                  <Route path="/website-settings" element={<Navigate to="/admin/website-settings" replace />} />
                  <Route path="/registration-flow" element={<Navigate to="/admin/registration-flow" replace />} />
                  <Route path="/home-settings" element={<Navigate to="/admin/home-settings" replace />} />
                  <Route path="/hero-sections" element={<Navigate to="/admin/hero-sections" replace />} />
                  <Route path="/hero-sections/*" element={<Navigate to="/admin/hero-sections" replace />} />
                  <Route path="/vision-mission" element={<Navigate to="/admin/vision-mission" replace />} />
                  <Route path="/history" element={<Navigate to="/admin/history" replace />} />
                  <Route path="/history/*" element={<Navigate to="/admin/history" replace />} />
                  <Route path="/media" element={<Navigate to="/admin/media" replace />} />
                  <Route path="/media/*" element={<Navigate to="/admin/media" replace />} />
                  <Route path="/programs" element={<Navigate to="/admin/programs" replace />} />
                  <Route path="/programs/*" element={<Navigate to="/admin/programs" replace />} />
                  <Route path="/facilities" element={<Navigate to="/admin/facilities" replace />} />
                  <Route path="/facilities/*" element={<Navigate to="/admin/facilities" replace />} />
                  <Route path="/organisasi" element={<Navigate to="/admin/organisasi" replace />} />
                  <Route path="/education" element={<Navigate to="/admin/education" replace />} />
                  <Route path="/education/*" element={<Navigate to="/admin/education" replace />} />
                  <Route path="/tuition-fees" element={<Navigate to="/admin/tuition-fees" replace />} />
                  <Route path="/uniforms" element={<Navigate to="/admin/uniforms" replace />} />
                  <Route path="/statistics" element={<Navigate to="/admin/statistics" replace />} />
                  <Route path="/teachers" element={<Navigate to="/admin/teachers" replace />} />
                  <Route path="/teachers/*" element={<Navigate to="/admin/teachers" replace />} />
                  <Route path="/positions" element={<Navigate to="/admin/positions" replace />} />
                  <Route path="/gallery" element={<Navigate to="/admin/gallery" replace />} />
                  <Route path="/gallery/*" element={<Navigate to="/admin/gallery" replace />} />
                  <Route path="/documentation" element={<Navigate to="/admin/documentation" replace />} />
                  <Route path="/documentation/*" element={<Navigate to="/admin/documentation" replace />} />
                  <Route path="/contacts" element={<Navigate to="/admin/contacts" replace />} />
                  <Route path="/contact-persons" element={<Navigate to="/admin/contact-persons" replace />} />
                  <Route path="/social-media" element={<Navigate to="/admin/social-media" replace />} />
                  <Route path="/whatsapp-templates" element={<Navigate to="/admin/whatsapp-templates" replace />} />
                  <Route path="/whatsapp-templates/*" element={<Navigate to="/admin/whatsapp-templates" replace />} />
                  <Route path="/bugnotes" element={<Navigate to="/admin/bugnotes" replace />} />
                  <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                  <Route path="/admissions" element={<Navigate to="/admin/admissions" replace />} />
                  <Route path="/admissions/*" element={<Navigate to="/admin/admissions" replace />} />
                  <Route path="/financial-dashboard" element={<Navigate to="/admin/financial-dashboard" replace />} />
                  <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
                  <Route path="/payments/*" element={<Navigate to="/admin/payments" replace />} />
                  <Route path="/bank-accounts" element={<Navigate to="/admin/bank-accounts" replace />} />
                  <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                  <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />
                  <Route path="/announcements" element={<Navigate to="/admin/announcements" replace />} />
                  <Route path="/announcements/*" element={<Navigate to="/admin/announcements" replace />} />
                  <Route path="/blog/categories" element={<Navigate to="/admin/blog/categories" replace />} />
                  <Route path="/blog/categories/*" element={<Navigate to="/admin/blog/categories" replace />} />
                  <Route path="/blog/tags" element={<Navigate to="/admin/blog/tags" replace />} />
                  <Route path="/blog/tags/*" element={<Navigate to="/admin/blog/tags" replace />} />
                  <Route path="/testimonials" element={<Navigate to="/admin/testimonials" replace />} />
                  <Route path="/testimonials/*" element={<Navigate to="/admin/testimonials" replace />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default AdminApp;
