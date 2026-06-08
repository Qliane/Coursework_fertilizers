// src/modules/driver/components/TripsFilters.jsx
import { Paper, Box, Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { DRIVER_EB_STATUS_FILTERS, DRIVER_EB_STATUS_LABELS } from '@/utils/constants';

export const TripsFilters = ({
  ebStatus,
  onEbStatusChange,
  disabled = false
}) => {

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Селектор статуса (без изменений) */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус</InputLabel>
              <Select
                value={ebStatus}
                label="Статус"
                onChange={(e) => onEbStatusChange(e.target.value)}
                disabled={disabled}
              >
                {Object.values(DRIVER_EB_STATUS_FILTERS).map(status => (
                  <MenuItem key={status} value={status}>
                    {DRIVER_EB_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
};