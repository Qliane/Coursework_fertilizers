// src/modules/storages/components/EmployeesTable.jsx
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Button, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const EmployeesTable = ({ employees, onAdd, onEdit, onDelete, canManage }) => {
  if (employees.length === 0) {
    return (
      <Box>
        {canManage && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAdd} sx={{ mb: 2 }}>
            Добавить сотрудника
          </Button>
        )}
        <Typography color="text.secondary">Нет сотрудников</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {canManage && (
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAdd} sx={{ mb: 2 }}>
          Добавить сотрудника
        </Button>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>ФИО</TableCell>
              <TableCell sx={{ color: 'white' }}>СНИЛС</TableCell>
              <TableCell sx={{ color: 'white' }}>ИНН</TableCell>
              <TableCell sx={{ color: 'white' }}>Роль</TableCell>
              <TableCell sx={{ color: 'white' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.userid}> {/* уникальный ключ */}
                <TableCell>{`${emp.surname} ${emp.name} ${emp.patronymic || ''}`}</TableCell>
                <TableCell>{emp.snils}</TableCell>
                <TableCell>{emp.inn}</TableCell>
                <TableCell>{emp.rolename}</TableCell>
                <TableCell>
                  {canManage && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => onEdit(emp)} title="Редактировать">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete(emp)} title="Удалить">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};