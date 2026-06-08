import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const FertilizersTable = ({ fertilizers, loading, onEdit, onDelete, canManage }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }
  if (fertilizers.length === 0) {
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
            <TableCell sx={{ color: 'white' }}>Вес (кг)</TableCell>
            <TableCell sx={{ color: 'white' }}>Тара</TableCell>
            <TableCell sx={{ color: 'white' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fertilizers.map((fertilizer) => (
            <TableRow key={fertilizer.id} hover>
              <TableCell>{fertilizer.name}</TableCell>
              <TableCell>{fertilizer.weight}</TableCell>
              <TableCell>{fertilizer.containerName}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => onEdit(fertilizer)} title="Редактировать" disabled={!canManage}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(fertilizer)} title="Удалить" disabled={!canManage}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};