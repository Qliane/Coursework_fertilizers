// src/modules/upd/pages/UpdPage.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";
import { useUpdList } from "../hooks/useUpdList";
import { UpdTable } from "../components/UpdTable";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { partnerService } from "@/api/endpoints/partner";

export const UpdPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canShip = hasPermission("SHIP_UPD");

  const [partners, setPartners] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const { upds, loading, error, shipUpd, refetch } = useUpdList(
    selectedPartnerId,
    dateFrom,
    dateTo,
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadPartners = async () => {
      setLoadingData(true);
      try {
        const partnersData = await partnerService.getAll();
        setPartners(partnersData);
      } catch (err) {
        console.error("Ошибка загрузки партнёров:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadPartners();
  }, []);

  const handleShip = async (id) => {
    try {
      await shipUpd(id);
      setSnackbar({
        open: true,
        message: "Отгрузка инициирована",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleViewDetails = (id) => navigate(`/upd/${id}`);

  const applyFilters = () => {
    refetch();
  };

  const resetFilters = () => {
    setSelectedPartnerId(null);
    setDateFrom(null);
    setDateTo(null);
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Универсальные передаточные документы (УПД)
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Партнёр</InputLabel>
                <Select
                  value={selectedPartnerId === null ? "all" : selectedPartnerId}
                  label="Партнёр"
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPartnerId(val === "all" ? null : val);
                  }}
                >
                  <MenuItem value="all">Все партнёры</MenuItem>
                  {partners.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.fullname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Дата с"
                value={dateFrom}
                onChange={setDateFrom}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Дата по"
                value={dateTo}
                onChange={setDateTo}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  disabled={loading}
                  style={{ fontSize: 12 }}
                >
                  Применить
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  disabled={loading}
                  style={{ fontSize: 12 }}
                >
                  Сбросить
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <UpdTable
          upds={upds}
          loading={loading}
          onViewDetails={handleViewDetails}
          onShip={handleShip}
          canShip={canShip}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};
