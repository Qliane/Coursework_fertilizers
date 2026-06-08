// src/modules/report/components/IncomingReport.jsx
import { useState, useEffect } from 'react';
import {
  Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { reportService } from '@/services/reportService';
import { fertilizerService } from '@/api/endpoints/fertilizer';
import { storageService } from '@/api/endpoints/storage';
import { FormatButtons } from './FormatButtons';

export const IncomingReport = () => {
  const { user } = useAuth();
  const [fertilizers, setFertilizers] = useState([]);
  const [storages, setStorages] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedFertilizerId, setSelectedFertilizerId] = useState('');
  const [selectedStorageId, setSelectedStorageId] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isStorekeeperOrDirector = user?.roleId === 1 || user?.roleId === 2;
  const fixedStorageId = isStorekeeperOrDirector ? user?.storageId : null;

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [ferts, stores] = await Promise.all([
          fertilizerService.getAll(),
          storageService.getAll()
        ]);
        setFertilizers(ferts);
        setStorages(stores);
        if (!isStorekeeperOrDirector && stores.length) {
          setSelectedStorageId(stores[0]?.id || '');
        }
      } catch (err) {
        console.error('Ошибка загрузки фильтров', err);
      }
    };
    loadFilters();
  }, [isStorekeeperOrDirector]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split('T')[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split('T')[0];
      if (selectedFertilizerId) params.fertilizerId = selectedFertilizerId;
      if (fixedStorageId) params.storageId = fixedStorageId;
      else if (selectedStorageId) params.storageId = selectedStorageId;

      const result = await reportService.getIncoming(params);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки отчёта');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format) => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom.toISOString().split('T')[0];
    if (dateTo) params.dateTo = dateTo.toISOString().split('T')[0];
    if (selectedFertilizerId) params.fertilizerId = selectedFertilizerId;
    if (fixedStorageId) params.storageId = fixedStorageId;
    else if (selectedStorageId) params.storageId = selectedStorageId;
    reportService.downloadIncoming(params, format);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <DatePicker
              label="Дата с"
              value={dateFrom}
              onChange={setDateFrom}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <DatePicker
              label="Дата по"
              value={dateTo}
              onChange={setDateTo}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Удобрение</InputLabel>
              <Select
                value={selectedFertilizerId}
                label="Удобрение"
                onChange={(e) => setSelectedFertilizerId(e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                {fertilizers.map(f => (
                  <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {!fixedStorageId && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Склад</InputLabel>
                <Select
                  value={selectedStorageId}
                  label="Склад"
                  onChange={(e) => setSelectedStorageId(e.target.value)}
                >
                  <MenuItem value="">Все склады</MenuItem>
                  {storages.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.fullname}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} md="auto">
            <FormatButtons
              onView={loadReport}
              onDownloadCsv={() => handleDownload('csv')}
              onDownloadPdf={() => handleDownload('pdf')}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Дата</TableCell>
                <TableCell sx={{ color: 'white' }}>Склад</TableCell>
                <TableCell sx={{ color: 'white' }}>Удобрение</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Количество (шт)</TableCell>
                <TableCell sx={{ color: 'white' }}>Создатель</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(row.date).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>{row.storageName}</TableCell>
                  <TableCell>{row.fertilizerName}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell>{row.creatorName}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">Нет данных</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </LocalizationProvider>
  );
};