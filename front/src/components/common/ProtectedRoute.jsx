// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { CircularProgress, Box, Typography, Button } from "@mui/material";
import { ROLE_NAMES } from "@/utils/constants";
import { getDefaultRoute } from "@/utils/routes";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === "/login" && isAuthenticated) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  if (requiredRole) {
    console.log("ROLE:", requiredRole, user?.roleId);
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.includes(user?.roleId);

    if (!hasRequiredRole) {
      return (
        <Box
          sx={{ p: 4, textAlign: "center", maxWidth: 600, mx: "auto", mt: 4 }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            ⚠️ Доступ запрещён
          </Typography>
          <Typography variant="body1" paragraph>
            У вашей роли{" "}
            <strong>{ROLE_NAMES[user?.roleId] || user?.rolename}</strong> нет
            прав для доступа к этой странице.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Для доступа к этому разделу необходима одна из следующих ролей:{" "}
            {roles.map((roleId) => ROLE_NAMES[roleId]).join(", ")}.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Назад
          </Button>
        </Box>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
