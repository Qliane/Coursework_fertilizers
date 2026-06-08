import { Paper, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@/utils/constants';

export const OrdersFilters = ({
  filters,
  storages,
  onFilterChange,
  onReset,
  onApply,
  disabled = false,
}) => {

  const applySearch = () => {
    onApply();
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Фильтры</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={disabled}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={filters.status}
                label="Статус"
                onChange={(e) => onFilterChange('status', e.target.value)}
              >
                <MenuItem value={ORDER_STATUS.ALL}>Все</MenuItem>
                <MenuItem value={ORDER_STATUS.PENDING}>Ожидает приёмки</MenuItem>
                <MenuItem value={ORDER_STATUS.COMPLETED}>Проведён</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="Дата с"
              value={filters.startDate}
              onChange={(date) => onFilterChange('startDate', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true, disabled } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <DatePicker
              label="Дата по"
              value={filters.endDate}
              onChange={(date) => onFilterChange('endDate', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true, disabled } }}
            />
          </Grid>

          {storages.length > 0 && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" disabled={disabled}>
                <InputLabel>Склад</InputLabel>
                <Select
                  label="Склад"
                  onChange={(e) => onFilterChange('storageId', e.target.value)}
                >
                  <MenuItem>Все склады</MenuItem>
                  {storages.map((storage) => (
                    <MenuItem key={storage.id} value={storage.id}>
                      {storage.fullname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={storages.length > 0 ? 3 : 6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={applySearch}
                disabled={disabled}
                fullWidth
                style={{fontSize: 12}}
              >
                Применить
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={disabled}
                style={{fontSize: 12}}
              >
                Сбросить
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
};