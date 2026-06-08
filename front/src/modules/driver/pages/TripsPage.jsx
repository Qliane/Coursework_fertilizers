// src/modules/driver/pages/TripsPage.jsx
import { Box, Typography, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import { useDriverTrips } from '../hooks/useDriverTrips';
import { TripCard } from '../components/TripCard';
import { TripsFilters } from '../components/TripsFilters';

export const TripsPage = () => {
  const {
    driver,
    upds,
    loading,
    error,
    ebStatus,
    dateFrom,
    dateTo,
    setEbStatus,
    setDateFrom,
    setDateTo,
    resetFilters,
    refetch
  } = useDriverTrips();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }} onClose={refetch}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Мои перевозки
      </Typography>

      {driver && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            Водитель: {driver.surname} {driver.name} {driver.patronymic || ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Удостоверение: {driver.license}
          </Typography>
        </Paper>
      )}

      <TripsFilters
        ebStatus={ebStatus}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onEbStatusChange={setEbStatus}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={resetFilters}
        disabled={loading}
      />

      {upds.length === 0 ? (
        <Alert severity="info">Нет перевозок, соответствующих фильтрам</Alert>
      ) : (
        <Grid container spacing={2}>
          {upds.map((upd) => (
            <Grid item xs={12} key={upd.updId}>
              <TripCard upd={upd} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};