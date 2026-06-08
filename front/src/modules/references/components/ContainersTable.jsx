import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const ContainersTable = ({ containers, loading, onEdit, onDelete, canManage }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }

  if (containers.length === 0) {
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
            <TableCell sx={{ color: 'white' }}>Ширина (м)</TableCell>
            <TableCell sx={{ color: 'white' }}>Высота (м)</TableCell>
            <TableCell sx={{ color: 'white' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {containers.map((container) => (
            <TableRow key={container.id} hover>
              <TableCell>{container.name}</TableCell>
              <TableCell>{container.weight}</TableCell>
              <TableCell>{container.width}</TableCell>
              <TableCell>{container.height}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => onEdit(container)} title="Редактировать" disabled={!canManage}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(container)} title="Удалить" disabled={!canManage}>
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