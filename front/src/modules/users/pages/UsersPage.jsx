// src/modules/users/pages/UsersPage.jsx
import { useState } from 'react';
import {
  Box, Typography, Button, Snackbar, Alert, Paper, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useUsers } from '../hooks/useUsers';
import { UsersTable } from '../components/UsersTable';
import { UserFormModal } from '../components/UserFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const {
    users, loading, search, setSearch,
    roleFilter, setRoleFilter,
    storageFilter, setStorageFilter,
    partnerFilter, setPartnerFilter,
    storages, partners,
    createUser, updateUser, deleteUser
  } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        setSnackbar({ open: true, message: 'Пользователь обновлён', severity: 'success' });
      } else {
        await createUser(data);
        setSnackbar({ open: true, message: 'Пользователь добавлен', severity: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setSnackbar({ open: true, message: 'Пользователь удалён', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Пользователи</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Добавить пользователя
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Поиск по имени или фамилии"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Роль</InputLabel>
              <Select
                value={roleFilter}
                label="Роль"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value={1}>Кладовщик</MenuItem>
                <MenuItem value={2}>Директор</MenuItem>
                <MenuItem value={3}>Работник офиса</MenuItem>
                <MenuItem value={4}>Доверенное лицо</MenuItem>
                <MenuItem value={5}>Водитель</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Склад</InputLabel>
              <Select
                value={storageFilter}
                label="Склад"
                onChange={(e) => setStorageFilter(e.target.value || '')}
              >
                <MenuItem value="">Все склады</MenuItem>
                {storages.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.fullname}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Партнёр</InputLabel>
              <Select
                value={partnerFilter}
                label="Партнёр"
                onChange={(e) => setPartnerFilter(e.target.value || '')}
              >
                <MenuItem value="">Все партнёры</MenuItem>
                {partners.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.fullname}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        currentUserId={currentUser?.id}
      />

      <UserFormModal
        key={editingUser?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
        onSubmit={handleSubmit}
        loading={formLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление пользователя"
        content={`Удалить пользователя "${userToDelete?.surname} ${userToDelete?.name}"?`}
        confirmText="Удалить"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};