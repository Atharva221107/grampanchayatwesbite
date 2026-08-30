import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import Home from '@/pages/Home';
import Placeholder from '@/pages/Placeholder';

const AboutVillage = lazy(() => import('@/pages/AboutVillage'));
const GramPanchayat = lazy(() => import('@/pages/GramPanchayat'));
const GovernmentSchemes = lazy(() => import('@/pages/GovernmentSchemes'));
const Announcements = lazy(() => import('@/pages/Announcements'));
const ImportantNotices = lazy(() => import('@/pages/ImportantNotices'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Contact = lazy(() => import('@/pages/Contact'));

const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminAnnouncements = lazy(() => import('@/pages/admin/AdminAnnouncements'));
const AdminVillageInfo = lazy(() => import('@/pages/admin/AdminVillageInfo'));
const AdminSchemes = lazy(() => import('@/pages/admin/AdminSchemes'));
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminNotices = lazy(() => import('@/pages/admin/AdminNotices'));
const AdminMembers = lazy(() => import('@/pages/admin/AdminMembers'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutVillage />} />
        <Route path="/panchayat" element={<GramPanchayat />} />
        <Route path="/schemes" element={<GovernmentSchemes />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notices" element={<ImportantNotices />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/search"
          element={<Placeholder title="Search" description="Global search across announcements, schemes, notices, and village information." />}
        />
        <Route
          path="*"
          element={<Placeholder title="Page Not Found" description="The page you are looking for does not exist." />}
        />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="village-info" element={<AdminVillageInfo />} />
        <Route path="schemes" element={<AdminSchemes />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
