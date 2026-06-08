// src/modules/report/components/OutgoingReport.jsx
import { useState, useEffect } from 'react';
import {
  Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { reportService } from '@/services/reportService';
import { storageService } from '@/api/endpoints/storage';
import { partnerService } from '@/api/endpoints/partner';
import { FormatButtons } from './FormatButtons';
import { ROLES } from '@/utils/constants';

const EB_STATUS_OPTIONS = [
  { value: 1, label: 'Подписано директором' },
  { value: 2, label: 'Подписано клиентом' },
  { value: 3, label: 'Завершён' }
];

export const OutgoingReport = () => {
  const { user } = useAuth();
  const [storages, setStorages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedStorageId, setSelectedStorageId] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedEbStatus, setSelectedEbStatus] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isStorekeeperOrDirector = user?.roleId === ROLES.STOREKEEPER || user?.roleId === ROLES.DIRECTOR;
  const isTrustedPerson = user?.roleId === ROLES.TRUSTED_PERSON;
  const isOfficeWorker = user?.roleId === ROLES.OFFICE_WORKER;

  const fixedStorageId = isStorekeeperOrDirector ? user?.storageId : null;

  useEffect(() => {
    if (isOfficeWorker) {
      Promise.all([storageService.getAll(), partnerService.getAll()])
        .then(([stores, partnersData]) => {
          setStorages(stores);
          setPartners(partnersData);
          if (stores.length && !selectedStorageId) setSelectedStorageId(stores[0]?.id || '');
        })
        .catch(err => console.error('Ошибка загрузки фильтров', err));
    }
  }, [isOfficeWorker]);
  console.log(user);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split('T')[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split('T')[0];
      if (selectedEbStatus) params.ebStatus = selectedEbStatus;

      console.log(isTrustedPerson);
      if (isTrustedPerson) {
        params.partnerId = user?.partnerId
      } else if (fixedStorageId) {
        params.storageId = fixedStorageId;
      } else if (isOfficeWorker && selectedStorageId) {
        params.storageId = selectedStorageId;
      }

      if (!isTrustedPerson && selectedPartnerId) {
        params.partnerId = selectedPartnerId;
      }

      const result = await reportService.getOutgoing(params);
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
    if (selectedEbStatus) params.ebStatus = selectedEbStatus;

    if (fixedStorageId) {
      params.storageId = fixedStorageId;
    } else if (isOfficeWorker && selectedStorageId) {
      params.storageId = selectedStorageId;
    }

    if (!isTrustedPerson && selectedPartnerId) {
      params.partnerId = selectedPartnerId;
    }

    reportService.downloadOutgoing(params, format);
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <DatePicker
              label="Заключено с"
              value={dateFrom}
              onChange={setDateFrom}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <DatePicker
              label="Заключено по"
              value={dateTo}
              onChange={setDateTo}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          {/* Для доверенного лица не показываем выбор склада и партнёра */}
          {!isTrustedPerson && !fixedStorageId && isOfficeWorker && (
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

          {!isTrustedPerson && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Партнёр</InputLabel>
                <Select
                  value={selectedPartnerId}
                  label="Партнёр"
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                >
                  <MenuItem value="">Все партнёры</MenuItem>
                  {partners.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.fullname}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Статус ЭТрН</InputLabel>
              <Select
                value={selectedEbStatus}
                label="Статус ЭТрН"
                onChange={(e) => setSelectedEbStatus(e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                {EB_STATUS_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

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
                <TableCell sx={{ color: 'white' }}>Дата заключения</TableCell>
                <TableCell sx={{ color: 'white' }}>Дата отгрузки</TableCell>
                <TableCell sx={{ color: 'white' }}>Партнёр</TableCell>
                <TableCell sx={{ color: 'white' }}>Склад</TableCell>
                <TableCell sx={{ color: 'white' }}>Водитель</TableCell>
                <TableCell sx={{ color: 'white' }}>Статус ЭТрН</TableCell>
                <TableCell sx={{ color: 'white' }}>Транспорт</TableCell>
                <TableCell sx={{ color: 'white' }}>Товары</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(row.conclDate).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>{row.shipDate ? new Date(row.shipDate).toLocaleDateString('ru-RU') : '—'}</TableCell>
                  <TableCell>{row.partnerName}</TableCell>
                  <TableCell>{row.storageName}</TableCell>
                  <TableCell>{row.driverName || '—'}</TableCell>
                  <TableCell>
                    <Chip label={row.ebStatus} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{row.vehicleInfo || '—'}</TableCell>
                  <TableCell>{row.itemsInfo || '—'}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center">Нет данных</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </LocalizationProvider>
  );
};