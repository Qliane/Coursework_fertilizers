// src/modules/storages/components/StoragesTable.jsx
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

export const StoragesTable = ({ storages, loading, onView, onDelete, canManage }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }

  if (storages.length === 0) {
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
            <TableCell sx={{ color: 'white' }}>Название</TableCell>
            <TableCell sx={{ color: 'white' }}>Адрес</TableCell>
            <TableCell sx={{ color: 'white' }}>Телефон</TableCell>
            <TableCell sx={{ color: 'white' }}>Вместимость</TableCell>
            <TableCell sx={{ color: 'white' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {storages.map((storage) => (
            <TableRow key={storage.id} hover>
              <TableCell>{storage.fullname}</TableCell>
              <TableCell>{storage.address}</TableCell>
              <TableCell>{storage.phone || '—'}</TableCell>
              <TableCell>{storage.capacity ? `${storage.capacity} мешков` : '—'}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => onView(storage.id)} title="Просмотр">
                    <VisibilityIcon />
                  </IconButton>
                  {canManage && (
                    <IconButton size="small" onClick={() => onDelete(storage)} title="Удалить">
                      <DeleteIcon />
                    </IconButton>
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