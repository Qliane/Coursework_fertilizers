// src/modules/report/components/StockReport.jsx
import { useState, useEffect } from 'react';
import {
  Paper, Grid, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { reportService } from '@/services/reportService';
import { storageService } from '@/api/endpoints/storage';
import { FormatButtons } from './FormatButtons';
import { ROLES } from '@/utils/constants';

export const StockReport = () => {
  const { user } = useAuth();
  const [asOfDate, setAsOfDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storages, setStorages] = useState([]);
  const [selectedStorageId, setSelectedStorageId] = useState('');

  const isStorekeeperOrDirector = user?.roleId === ROLES.STOREKEEPER || user?.roleId === ROLES.DIRECTOR;
  const isOfficeWorker = user?.roleId === ROLES.OFFICE_WORKER;
  const fixedStorageId = isStorekeeperOrDirector ? user?.storageId : null;

  useEffect(() => {
    if (isOfficeWorker) {
      storageService.getAll()
        .then(data => {
          setStorages(data);
          if (data.length > 0 && !selectedStorageId) {
            setSelectedStorageId(data[0].id);
          }
        })
        .catch(err => console.error('Ошибка загрузки складов', err));
    }
  }, [isOfficeWorker]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { asOfDate: asOfDate.toISOString().split('T')[0] };
      if (fixedStorageId) {
        params.storageId = fixedStorageId;
      } else if (isOfficeWorker && selectedStorageId) {
        params.storageId = selectedStorageId;
      }
      const result = await reportService.getCurrentStock(params);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки отчёта');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format) => {
    const params = { asOfDate: asOfDate.toISOString().split('T')[0] };
    if (fixedStorageId) {
      params.storageId = fixedStorageId;
    } else if (isOfficeWorker && selectedStorageId) {
      params.storageId = selectedStorageId;
    }
    reportService.downloadCurrentStock(params, format);
  };

  useEffect(() => {
    if (!isOfficeWorker || (isOfficeWorker && selectedStorageId)) {
      loadReport();
    }
  }, [asOfDate, selectedStorageId, isOfficeWorker]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Дата остатков"
              value={asOfDate}
              onChange={setAsOfDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          {isOfficeWorker && storages.length > 0 && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Склад</InputLabel>
                <Select
                  value={selectedStorageId}
                  label="Склад"
                  onChange={(e) => setSelectedStorageId(e.target.value)}
                >
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
                <TableCell sx={{ color: 'white' }}>Наименование</TableCell>
                <TableCell sx={{ color: 'white' }}>Тип тары</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Количество (шт)</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Вес ед. (кг)</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Общий вес (кг)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.fertilizername}</TableCell>
                  <TableCell>{row.containertype || '—'}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right">{row.weight}</TableCell>
                  <TableCell align="right">{row.totalweight}</TableCell>
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