import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, IconButton, Tooltip, Button, Chip, CircularProgress, Typography, Pagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';

export const OrdersTable = ({
  orders,
  loading,
  pagination,
  canReceive,
  onViewDetails,
  onReceive,
  onPageChange,
}) => {
  const formatFertilizersList = (fertilizers) => {
    if (!fertilizers?.length) return '';
    return fertilizers.map(f => `${f.name} (${f.declaredCount} мешков)`).join(', ');
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }

  if (orders.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Нет данных для отображения</Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Дата создания</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Дата разгрузки</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Склад</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Создатель</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>Список удобрений</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onViewDetails(order)}
              >
                <TableCell>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>
                  {order.realizedAt
                    ? new Date(order.realizedAt).toLocaleDateString('ru-RU')
                    : <Typography variant="body2" color="text.secondary">Не проведена</Typography>
                  }
                </TableCell>
                <TableCell>{order.storageName}</TableCell>
                <TableCell>{order.creatorName}</TableCell>
                <TableCell>
                  <Tooltip title={formatFertilizersList(order.fertilizers)}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {formatFertilizersList(order.fertilizers)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Просмотреть детали">
                      <IconButton size="small" onClick={() => onViewDetails(order)} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {!order.realizedAt && canReceive && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={() => onReceive(order.id)}
                      >
                        Принять
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        </Box>
      )}
    </>
  );
};