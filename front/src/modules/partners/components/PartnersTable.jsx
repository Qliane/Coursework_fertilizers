import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

export const PartnersTable = ({ partners, loading, onView, onDelete, canManage }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }

  if (partners.length === 0) {
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
            <TableCell sx={{ color: 'white' }}>ИНН</TableCell>
            <TableCell sx={{ color: 'white' }}>Название</TableCell>
            <TableCell sx={{ color: 'white' }}>Телефон</TableCell>
            <TableCell sx={{ color: 'white' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id} hover>
              <TableCell>{partner.inn}</TableCell>
              <TableCell>{partner.fullname}</TableCell>
              <TableCell>{partner.phone || '—'}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => onView(partner.id)} title="Просмотр">
                    <VisibilityIcon />
                  </IconButton>
                  {canManage && (
                    <IconButton size="small" onClick={() => onDelete(partner)} title="Удалить">
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