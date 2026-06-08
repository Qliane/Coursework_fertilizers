// src/modules/stock/pages/StockPage.jsx
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useStock } from '../hooks/useStock';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const StockPage = () => {
  const { user } = useAuth();
  const storageId = user?.roleId === 1 ? user.storageId : undefined;
  const { stock, loading, error, refetch } = useStock(storageId);

  const formatQuantity = (quantity) => new Intl.NumberFormat('ru-RU').format(quantity);
  const getPageTitle = () => {
    if (user?.storageName) return `Состояние склада: ${user.storageName}`;
    return 'Состояние всех складов';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{getPageTitle()}</Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={refetch} disabled={loading}>
          Обновить
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Удобрение</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Количество (мешки)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Вес единицы (кг)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Общий вес (кг)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : stock.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>Нет данных</TableCell></TableRow>
            ) : (
              stock.map((item) => (
                <TableRow key={item.fertilizerId} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.fertilizername}
                      {item.containerType && <Chip label={item.containerType} size="small" variant="outlined" />}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: item.quantity === 0 ? 'error.main' : 'inherit' }}>
                    {formatQuantity(item.quantity)}
                  </TableCell>
                  <TableCell>{item.weight ? `${formatQuantity(item.weight)} кг` : '-'}</TableCell>
                  <TableCell>{item.totalweight ? `${formatQuantity(item.totalweight)} кг` : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && stock.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Показано {stock.length} позиций</Typography>
          <Typography variant="body2" color="text.secondary">Обновлено: {new Date().toLocaleTimeString('ru-RU')}</Typography>
        </Box>
      )}
    </Box>
  );
};