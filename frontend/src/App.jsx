import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toast"
import ProtectedRoute from "@/components/ProtectedRoute"
import AppLayout from "@/components/AppLayout"

const LoginPage = lazy(() => import("@/pages/LoginPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const InventoryPage = lazy(() => import("@/pages/InventoryPage"))
const PosPage = lazy(() => import("@/pages/PosPage"))

function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-3rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs">Loading...</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={["admin", "cashier"]}>
                  <AppLayout>
                    <PosPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AppLayout>
                    <InventoryPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}
