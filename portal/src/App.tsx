import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ConfirmDialog } from "@/components/common";
import SkeletonPage from "@/components/common/SkeletonPage";
import SantriProtectedRoute from "@/components/auth/SantriProtectedRoute";
import AuthorProtectedRoute from "@/components/auth/AuthorProtectedRoute";
import DataPrefetcher from "@/components/common/DataPrefetcher";
import ScrollToTop from "@/components/common/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "@/components/ThemeProvider";
import { usePublicData } from "@/hooks/use-public-data";
import MainLayout from "@/layouts/MainLayout";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "@/stores/auth-store";

const Home = lazy(() => import("./pages/Home"));
const Sejarah = lazy(() => import("./pages/Sejarah"));
const FoundersPage = lazy(() => import("./pages/FoundersPage"));
const FounderDetailPage = lazy(() => import("./pages/FounderDetailPage"));
const ProfilKami = lazy(() => import("./pages/ProfilKami"));
const VisiMisi = lazy(() => import("./pages/VisiMisi"));
const TenagaPengajarPage = lazy(() => import("./pages/TenagaPengajarPage"));
const Organisasi = lazy(() => import("./pages/Organisasi"));
const ProgramPage = lazy(() => import("./pages/ProgramPage"));
const FasilitasPage = lazy(() => import("./pages/FasilitasPage"));
const FasilitasDetail = lazy(() => import("./pages/FasilitasDetail"));
const JadwalPage = lazy(() => import("./pages/JadwalPage"));
const EkstrakurikulerPage = lazy(() => import("./pages/EkstrakurikulerPage"));
const GaleriPage = lazy(() => import("./pages/GaleriPage"));
const GaleriDetail = lazy(() => import("./pages/GaleriDetail"));
const PublicBlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const KontakPage = lazy(() => import("./pages/KontakPage"));
const PendaftaranPage = lazy(() => import("./pages/PendaftaranPage"));
const KebijakanPrivasiPage = lazy(() => import("./pages/KebijakanPrivasiPage"));
const SyaratKetentuanPage = lazy(() => import("./pages/SyaratKetentuanPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const FormPendaftaranPage = lazy(() => import("./pages/FormPendaftaranPage"));
const StatusPendaftaranPage = lazy(() => import("./pages/StatusPendaftaranPage"));
const UserSchedulePage = lazy(() => import("./pages/admissions/UserSchedulePage"));
const JadwalSantriPage = lazy(() => import("./pages/JadwalSantriPage"));
const NotifikasiPage = lazy(() => import("./pages/NotifikasiPage"));
const PengaturanPage = lazy(() => import("./pages/PengaturanPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PublicationRegisterPage = lazy(() => import("./pages/publication/PublicationRegisterPage"));
const ArticleListPage = lazy(() => import("./pages/publication/ArticleListPage"));
const ArticleDetailPage = lazy(() => import("./pages/publication/ArticleDetailPage"));
const JournalListPage = lazy(() => import("./pages/publication/JournalListPage"));
const JournalDetailPage = lazy(() => import("./pages/publication/JournalDetailPage"));
const PublikasiPage = lazy(() => import("./pages/publication/PublikasiPage"));
const AlurPendaftaranPage = lazy(() => import("./pages/website/AlurPendaftaranPage"));

const UserDashboardPage = lazy(() => import("./pages/DashboardPage"));
const AuthorDashboardPage = lazy(() => import("./pages/author/AuthorDashboardPage"));
const AuthorArticleListPage = lazy(() => import("./pages/author/AuthorArticleListPage"));
const AuthorJournalListPage = lazy(() => import("./pages/author/AuthorJournalListPage"));
const AuthorArticleFormPage = lazy(() => import("./pages/author/AuthorArticleFormPage"));
const AuthorProfilePage = lazy(() => import("./pages/author/AuthorProfilePage"));
const AuthorCollaborationsPage = lazy(() => import("./pages/author/AuthorCollaborationsPage"));
const AuthorCollaborationDetailPage = lazy(() => import("./pages/author/AuthorCollaborationDetailPage"));
const AuthorDiscussionsPage = lazy(() => import("./pages/author/AuthorDiscussionsPage"));

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

const SantriRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== "santri" && user.role !== "user") {
    return <Navigate to="/dashboard" replace />;
  }
  const userIdentifier = (user as any).username || user.id;
  let targetPath = "/santri/dashboard/" + userIdentifier;
  if (location.pathname.includes("/app/form-pendaftaran")) {
    targetPath = "/app/form-pendaftaran/" + userIdentifier;
  } else if (location.pathname.includes("/app/status")) {
    targetPath = "/app/status/" + userIdentifier;
  } else if (location.pathname.includes("/app/jadwal-ujian")) {
    targetPath = "/app/jadwal-ujian/" + userIdentifier;
  } else if (location.pathname.includes("/app/jadwal")) {
    targetPath = "/app/jadwal/" + userIdentifier;
  } else if (location.pathname.includes("/app/notifikasi")) {
    targetPath = "/app/notifikasi/" + userIdentifier;
  } else if (location.pathname.includes("/app/jadwal-tes")) {
    targetPath = "/app/jadwal-tes/" + userIdentifier;
  } else if (location.pathname.includes("/app/hasil-seleksi")) {
    targetPath = "/app/hasil-seleksi/" + userIdentifier;
  } else if (location.pathname.includes("/app/pengaturan")) {
    targetPath = "/app/pengaturan/" + userIdentifier;
  } else if (location.pathname.includes("/app/pembayaran")) {
    targetPath = "/app/pembayaran/" + userIdentifier;
  }
  return <Navigate to={targetPath} replace />;
};

const FaviconUpdater = () => {
  const { data: settings } = usePublicData<any>(["settings"], "/core/settings");

  useEffect(() => {
    if (settings?.favicon) {
      const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = settings.favicon;
      }
      const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = settings.favicon;
      }
    }
  }, [settings]);

  return null;
};

const App = () => {
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
              <FaviconUpdater />
              <ScrollToTop />
              <Suspense fallback={<SkeletonPage />}>
                <Routes>
                  <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                  <Route path="/sejarah" element={<MainLayout><Sejarah /></MainLayout>} />
                  <Route path="/profil" element={<Navigate to="/sejarah" replace />} />
                  <Route path="/profil/sejarah" element={<Navigate to="/sejarah" replace />} />
                  <Route path="/profil/visi-misi" element={<MainLayout><VisiMisi /></MainLayout>} />
                  <Route path="/profil/organisasi" element={<MainLayout><Organisasi /></MainLayout>} />
                  <Route path="/profil/pengajar" element={<MainLayout><TenagaPengajarPage /></MainLayout>} />
                  <Route path="/profil/pendiri" element={<MainLayout><FoundersPage /></MainLayout>} />
                  <Route path="/profil/pendiri/:id" element={<MainLayout><FounderDetailPage /></MainLayout>} />
                  <Route path="/program" element={<MainLayout><ProgramPage /></MainLayout>} />
                  <Route path="/fasilitas" element={<MainLayout><FasilitasPage /></MainLayout>} />
                  <Route path="/fasilitas/:slug" element={<MainLayout><FasilitasDetail /></MainLayout>} />
                  <Route path="/kehidupan-santri" element={<Navigate to="/kehidupan-santri/jadwal" replace />} />
                  <Route path="/kehidupan-santri/jadwal" element={<MainLayout><JadwalPage /></MainLayout>} />
                  <Route path="/kehidupan-santri/ekstrakurikuler" element={<MainLayout><EkstrakurikulerPage /></MainLayout>} />
                  <Route path="/galeri" element={<MainLayout><GaleriPage /></MainLayout>} />
                  <Route path="/galeri/:id" element={<MainLayout><GaleriDetail /></MainLayout>} />
                  <Route path="/blog" element={<MainLayout><PublicBlogPage /></MainLayout>} />
                  <Route path="/blog/:slug" element={<MainLayout><BlogDetail /></MainLayout>} />
                  <Route path="/artikel" element={<MainLayout><ArticleListPage /></MainLayout>} />
                  <Route path="/artikel/:slug" element={<MainLayout><ArticleDetailPage /></MainLayout>} />
                  <Route path="/publikasi" element={<MainLayout><PublikasiPage /></MainLayout>} />
                  <Route path="/jurnal" element={<MainLayout><JournalListPage /></MainLayout>} />
                  <Route path="/jurnal/:slug" element={<MainLayout><JournalDetailPage /></MainLayout>} />
                  <Route path="/publikasi/register" element={<MainLayout><PublicationRegisterPage /></MainLayout>} />
                  <Route path="/kontak" element={<MainLayout><KontakPage /></MainLayout>} />
                  <Route path="/pendaftaran" element={<MainLayout><PendaftaranPage /></MainLayout>} />
                  <Route path="/kebijakan-privasi" element={<MainLayout><KebijakanPrivasiPage /></MainLayout>} />
                  <Route path="/syarat-ketentuan" element={<MainLayout><SyaratKetentuanPage /></MainLayout>} />
                  <Route path="/alur-pendaftaran" element={<MainLayout><AlurPendaftaranPage /></MainLayout>} />
                  <Route path="/alur" element={<Navigate to="/alur-pendaftaran" replace />} />

                  <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
                  <Route path="/register" element={<AuthLayout><LoginPage /></AuthLayout>} />
                  <Route path="/admin-cms" element={<Navigate to="/admin.html" replace />} />
                  <Route path="/admin-cms/*" element={<Navigate to="/admin.html" replace />} />

                  <Route element={<SantriProtectedRoute />}>
                    <Route path="/santri/dashboard/:santriId" element={<AppLayout><UserDashboardPage /></AppLayout>} />
                    <Route path="/app/form-pendaftaran/:santriId" element={<AppLayout><FormPendaftaranPage /></AppLayout>} />
                    <Route path="/app/status/:santriId" element={<AppLayout><StatusPendaftaranPage /></AppLayout>} />
                    <Route path="/app/jadwal/:santriId" element={<AppLayout><JadwalSantriPage /></AppLayout>} />
                    <Route path="/app/jadwal-ujian/:santriId" element={<AppLayout><UserSchedulePage /></AppLayout>} />
                    <Route path="/app/notifikasi/:santriId" element={<AppLayout><NotifikasiPage /></AppLayout>} />
                    <Route path="/app/pengaturan/:santriId" element={<AppLayout><PengaturanPage /></AppLayout>} />
                    <Route path="/app/pembayaran/:santriId" element={<AppLayout><PaymentPage /></AppLayout>} />
                  </Route>

                  <Route element={<AuthorProtectedRoute />}>
                    <Route path="/author/dashboard" element={<AppLayout><AuthorDashboardPage /></AppLayout>} />
                    <Route path="/author/articles" element={<AppLayout><AuthorArticleListPage /></AppLayout>} />
                    <Route path="/author/articles/new" element={<AppLayout><AuthorArticleFormPage /></AppLayout>} />
                    <Route path="/author/articles/:id/edit" element={<AppLayout><AuthorArticleFormPage /></AppLayout>} />
                    <Route path="/author/journals" element={<AppLayout><AuthorJournalListPage /></AppLayout>} />
                    <Route path="/author/profile" element={<AppLayout><AuthorProfilePage /></AppLayout>} />
                    <Route path="/author/collaborations" element={<AppLayout><AuthorCollaborationsPage /></AppLayout>} />
                    <Route path="/author/collaborations/:id" element={<AppLayout><AuthorCollaborationDetailPage /></AppLayout>} />
                    <Route path="/author/discussions" element={<AppLayout><AuthorDiscussionsPage /></AppLayout>} />
                  </Route>

                  <Route path="/santri/dashboard" element={<SantriRedirect />} />
                  <Route path="/app/*" element={<SantriRedirect />} />

                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
