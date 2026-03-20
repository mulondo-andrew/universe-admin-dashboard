import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

import { ThemeProvider } from "@/components/theme-provider";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import Login from "@/pages/auth/Login";
import SignUp from "@/pages/auth/SignUp";
import Dashboard from "@/pages/admin/Dashboard";
import BuildingsPage from "@/pages/admin/buildings/page";
import UserDirectoryPage from "@/pages/admin/identity/directory/page";
import UserDetailPage from "@/pages/admin/identity/directory/[id]/page";
import AcademicManagerPage from "@/pages/admin/academic/manager/page";
import ElectionCenterPage from "@/pages/admin/governance/elections/page";
import ModerationQueuePage from "@/pages/admin/safety/moderation/page";
import KillSwitchPage from "@/pages/admin/system/kill-switch/page";
import PlaceholderPage from "@/pages/PlaceholderPage";
import UserProfilePage from "@/pages/user/profile/page";
import SettingsPage from "@/pages/user/settings/page";
import NetworkPage from "@/pages/user/network/page";
import OnboardingPage from "@/pages/auth/Onboarding";
import { CheckAndSyncUser } from "@/components/CheckAndSyncUser";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <CheckAndSyncUser>
          {children}
        </CheckAndSyncUser>
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/login"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/onboarding"
    >
      <ThemeProvider defaultTheme="system" storageKey="universe-theme">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <SignedOut>
                <Login />
              </SignedOut>
            } />
            <Route path="/sign-up/*" element={
              <SignedOut>
                <SignUp />
              </SignedOut>
            } />
            <Route path="/sign-in/*" element={<Navigate to="/login" replace />} />
            <Route path="/sign-up/*" element={<Navigate to="/login" replace />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* User Module */}
            <Route path="user/profile" element={<UserProfilePage />} />
            <Route path="user/settings" element={<SettingsPage />} />
            <Route path="user/network" element={<NetworkPage />} />

            {/* Identity Module */}
            <Route path="admin/identity/directory" element={<UserDirectoryPage />} />
            <Route path="admin/identity/directory/:id" element={<UserDetailPage />} />
            <Route path="admin/identity/rbac" element={<PlaceholderPage title="Role Management" description="Configure granular permissions and access control lists for different user roles across the platform." />} />
            <Route path="admin/identity/digital-id" element={<PlaceholderPage title="Digital ID Verification" description="Review and approve student ID uploads and manage digital credential issuance." />} />

            {/* Academic & Campus Infrastructure */}
            <Route path="admin/campus/buildings" element={<BuildingsPage />} />
            <Route path="admin/academic/manager" element={<AcademicManagerPage />} />
            <Route path="admin/academic/registrar" element={<PlaceholderPage title="Registrar (Enrollment)" description="Manage student enrollments, waitlists, and course capacities." />} />
            <Route path="admin/academic/scheduling" element={<PlaceholderPage title="Scheduling" description="Resolve room conflicts and optimize the master university timetable." />} />

            {/* Organizations & Elections */}
            <Route path="admin/governance/clubs" element={<PlaceholderPage title="Clubs & Guilds" description="Approve new student organizations, manage budgets, and oversee faculty advisors." />} />
            <Route path="admin/governance/elections" element={<ElectionCenterPage />} />

            {/* Moderation & Safety */}
            <Route path="admin/safety/moderation" element={<ModerationQueuePage />} />
            <Route path="admin/safety/crisis" element={<PlaceholderPage title="Crisis Response" description="Activate emergency protocols, broadcast campus-wide alerts, and coordinate with campus security." />} />
            <Route path="admin/safety/filters" element={<PlaceholderPage title="Content Filters" description="Configure automated keyword blocking and AI-driven toxicity detection rules." />} />

            {/* Communications & Economy */}
            <Route path="admin/engagement/announcements" element={<PlaceholderPage title="Announcements" description="Draft and publish official university communications to specific cohorts or the entire student body." />} />
            <Route path="admin/engagement/marketplace" element={<PlaceholderPage title="Marketplace Admin" description="Monitor transactions, resolve disputes, and manage prohibited item lists." />} />
            <Route path="admin/engagement/gamification" element={<PlaceholderPage title="Gamification" description="Configure XP rewards, achievement badges, and leaderboard rules." />} />

            {/* System & Realtime */}
            <Route path="admin/system/kill-switch" element={<KillSwitchPage />} />
            <Route path="admin/system/state" element={<PlaceholderPage title="Universe State" description="View real-time metrics on active WebSocket connections, cache hit rates, and database load." />} />
            <Route path="admin/system/devices" element={<PlaceholderPage title="Device Registry" description="Manage trusted devices, revoke active sessions, and monitor login anomalies." />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
    </ThemeProvider>
    </ClerkProvider>
  );
}
