import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Typography, Box } from '@mui/material';
import { ELECTRONIC_BILL_STATUS_LABELS } from '@/utils/constants';

export const UpdTable = ({ upds, loading, onViewDetails, onShip, canShip }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }

  if (upds.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Нет данных</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ bgcolor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>Партнёр</TableCell>
            <TableCell sx={{ color: 'white' }}>Дата заключения</TableCell>
            <TableCell sx={{ color: 'white' }}>Дата отгрузки</TableCell>
            <TableCell sx={{ color: 'white' }}>Статус</TableCell>
            <TableCell sx={{ color: 'white' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {upds.map((upd) => (
            <TableRow key={upd.id} hover>
              <TableCell>{upd.partnername}</TableCell>
              <TableCell>{new Date(upd.concldate).toLocaleDateString()}</TableCell>
              <TableCell>{upd.shipdate && new Date(upd.shipdate).toLocaleDateString() || '—'}</TableCell>
              <TableCell>
                <Chip label={upd.shipdate ? 'Отгружено' : 'Черновик'} color={upd.shipdate ? 'success' : 'warning'} />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => onViewDetails(upd.id)}>
                    Подробнее
                  </Button>
                  {!upd.shipdate && canShip && (
                    <Button size="small" variant="contained" color="primary" onClick={() => onShip(upd.id)}>
                      Отгрузить
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};