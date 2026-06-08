// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "@/modules/auth/pages/LoginPage";
import { StockPage } from "@/modules/stock/pages/StockPage";
import { OrdersPage } from "@/modules/orders/pages/OrdersPage";
import { FertilizersPage } from "@/modules/references/pages/FertilizersPage";
import { ContainersPage } from "@/modules/references/pages/ContainersPage";
import { AuthProvider } from "@/app/store/AuthProvider";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { TripsPage } from "@/modules/driver/pages/TripsPage";
import { ROLES } from "./utils/constants";
import { useAuth } from "@/modules/auth/hooks/useAuth"; // Импортируем хук

import { PartnersPage } from "@/modules/partners/pages/PartnersPage";
import { PartnerDetailPage } from "@/modules/partners/pages/PartnerDetailPage";
import { StoragesPage } from "@/modules/storages/pages/StoragesPage";
import { StorageDetailPage } from "@/modules/storages/pages/StorageDetailPage";
import { UpdPage } from "@/modules/upd/pages/UpdPage";
import { UpdDetailPage } from "@/modules/upd/pages/UpdDetailPage";
import { UsersPage } from "@/modules/users/pages/UsersPage";
import { ReportsPage } from "@/modules/report/pages/ReportsPage";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.roleId === ROLES.DRIVER) {
    return <Navigate to="/trips" replace />;
  }

  return <Navigate to="/report" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole={[ROLES.OFFICE_WORKER]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            {/* Используем компонент HomeRedirect вместо жесткого Navigate */}
            <Route index element={<HomeRedirect />} />

            {/* Склад - доступно кладовщикам и директорам */}
            <Route
              path="stock"
              element={
                <ProtectedRoute
                  requiredRole={[ROLES.STOREKEEPER, ROLES.DIRECTOR]}
                >
                  <StockPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="partners"
              element={
                <ProtectedRoute
                  requiredRole={[ROLES.DIRECTOR, ROLES.OFFICE_WORKER]}
                >
                  <PartnersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="partners/:id"
              element={
                <ProtectedRoute
                  requiredRole={[ROLES.DIRECTOR, ROLES.OFFICE_WORKER]}
                >
                  <PartnerDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="storages"
              element={
                <ProtectedRoute requiredRole={[ROLES.OFFICE_WORKER]}>
                  <StoragesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="storages/:id"
              element={
                <ProtectedRoute requiredRole={[ROLES.OFFICE_WORKER]}>
                  <StorageDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="upd"
              element={
                <ProtectedRoute
                  requiredRole={[
                    ROLES.STOREKEEPER,
                    ROLES.DIRECTOR,
                    ROLES.TRUSTED_PERSON,
                  ]}
                >
                  <UpdPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="upd/:id"
              element={
                <ProtectedRoute
                  requiredRole={[
                    ROLES.OFFICE_WORKER,
                    ROLES.STOREKEEPER,
                    ROLES.DIRECTOR,
                    ROLES.TRUSTED_PERSON,
                  ]}
                >
                  <UpdDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Приходные ордера - доступно кладовщикам, директорам и работникам офиса */}
            <Route
              path="orders"
              element={
                <ProtectedRoute
                  requiredRole={[
                    ROLES.STOREKEEPER,
                    ROLES.DIRECTOR,
                    ROLES.OFFICE_WORKER,
                  ]}
                >
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Отчёт - доступно всем авторизованным (кроме скрытых в меню) */}
            <Route
              path="report"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Справочники - доступно кладовщикам, директорам и работникам офиса */}
            <Route path="references">
              <Route
                path="fertilizers"
                element={
                  <ProtectedRoute
                    requiredRole={[
                      ROLES.STOREKEEPER,
                      ROLES.DIRECTOR,
                      ROLES.OFFICE_WORKER,
                    ]}
                  >
                    <FertilizersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="containers"
                element={
                  <ProtectedRoute
                    requiredRole={[
                      ROLES.STOREKEEPER,
                      ROLES.DIRECTOR,
                      ROLES.OFFICE_WORKER,
                    ]}
                  >
                    <ContainersPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path="trips"
              element={
                <ProtectedRoute requiredRole={[ROLES.DRIVER]}>
                  <TripsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
