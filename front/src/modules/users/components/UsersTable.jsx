// src/modules/users/components/UsersTable.jsx
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const UsersTable = ({ users, loading, onEdit, onDelete, currentUserId }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Загрузка...</Typography>
      </Paper>
    );
  }

  if (users.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Нет пользователей</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ bgcolor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>Имя</TableCell>
            <TableCell sx={{ color: 'white' }}>Фамилия</TableCell>
            <TableCell sx={{ color: 'white' }}>Отчество</TableCell>
            <TableCell sx={{ color: 'white' }}>Роль</TableCell>
            <TableCell sx={{ color: 'white' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <TableRow key={user.id} hover>
                <TableCell>{user.name || '—'}</TableCell>
                <TableCell>{user.surname || '—'}</TableCell>
                <TableCell>{user.patronymic || '—'}</TableCell>
                <TableCell>{user.rolename}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(user)}
                      title="Редактировать"
                      disabled={isCurrentUser}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(user)}
                      title="Удалить"
                      disabled={isCurrentUser}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};