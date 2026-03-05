import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const AuthPage = lazy(() => import('../pages/auth/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const AdminDashboardPage = lazy(() => import('../pages/admin/dashboard/page'));
const PrivacyPage = lazy(() => import('../pages/legal/privacy/page'));
const TermsPage = lazy(() => import('../pages/legal/terms/page'));
const ImprintPage = lazy(() => import('../pages/legal/imprint/page'));
const TrialPage = lazy(() => import('../pages/trial/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/trial',
    element: <TrialPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/imprint',
    element: <ImprintPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
