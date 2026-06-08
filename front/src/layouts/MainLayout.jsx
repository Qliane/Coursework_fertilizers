// src/layouts/MainLayout.jsx
// src/layouts/MainLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ROLE_NAMES, ROLES } from "@/utils/constants";
import GlobalSelector from "@/components/common/GlobalSelector";

const MainLayout = () => {
  const [referencesAnchor, setReferencesAnchor] = useState(null);
  const [mobileAnchor, setMobileAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();

  const menuItems = [
    { path: "/stock", label: "Склад", visible: hasPermission("VIEW_STOCK") },
    {
      path: "/orders",
      label: "Приходные ордера",
      visible: hasPermission("VIEW_ORDERS"),
    },
    
    { 
      path: "/report", 
      label: "Отчёт", 
      visible: user?.roleId !== ROLES.DRIVER
    },
    {
      path: "/users",
      label: "Пользователи",
      visible: hasPermission("VIEW_USERS"),
    },
    {
      path: "/partners",
      label: "Партнёры",
      visible: hasPermission("VIEW_PARTNERS"),
    },
    {
      path: "/storages",
      label: "Склады",
      visible: hasPermission("VIEW_STORAGES"),
    },
    { path: "/upd", label: "УПД", visible: hasPermission("VIEW_UPD") },
    {
      path: "/trips",
      label: "Перевозки",
      visible: hasPermission("VIEW_TRIPS"),
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.visible);

  const handleReferencesClick = (event) =>
    setReferencesAnchor(event.currentTarget);
  const handleReferencesClose = () => setReferencesAnchor(null);
  const handleMobileMenuClick = (event) => setMobileAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileAnchor(null);
  const handleUserMenuClick = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleNavigation = (path) => {
    navigate(path);
    handleReferencesClose();
    handleMobileMenuClose();
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate("/login");
  };

  const showReferences = hasPermission("VIEW_REFERENCES");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Управление складом удобрений
          </Typography>

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              alignItems: "center",
            }}
          >
            {visibleMenuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
              >
                {item.label}
              </Button>
            ))}
            {showReferences && (
              <Button color="inherit" onClick={handleReferencesClick}>
                Справочники
              </Button>
            )}
            {user && (
              <IconButton color="inherit" onClick={handleUserMenuClick}>
                <AccountCircleIcon />
              </IconButton>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={handleMobileMenuClick}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* References Dropdown (Desktop) */}
      {showReferences && (
        <Menu
          anchorEl={referencesAnchor}
          open={Boolean(referencesAnchor)}
          onClose={handleReferencesClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => handleNavigation("/references/fertilizers")}>
            Удобрения
          </MenuItem>
          <MenuItem onClick={() => handleNavigation("/references/containers")}>
            Тара
          </MenuItem>
        </Menu>
      )}

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {visibleMenuItems.map((item) => (
          <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
            {item.label}
          </MenuItem>
        ))}
        {showReferences && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleNavigation("/references/fertilizers")}
            >
              Удобрения
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation("/references/containers")}
            >
              Тара
            </MenuItem>
          </>
        )}
        {user && (
          <>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Выйти ({user.name})
            </MenuItem>
          </>
        )}
      </Menu>

      {/* User Menu (Desktop) */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body1">
              {user?.name} {user?.surname}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ROLE_NAMES[user?.roleId] || user?.rolename}
            </Typography>
            {user?.storageName && (
              <Typography variant="caption" color="text.secondary">
                {user.storageName}
              </Typography>
            )}
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Выйти
        </MenuItem>
      </Menu>

      <Container component="main" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{ py: 2, bgcolor: "grey.100", textAlign: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          Система управления складом удобрений
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
