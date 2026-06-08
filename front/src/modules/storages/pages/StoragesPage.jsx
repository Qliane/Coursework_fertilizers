import { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert, TextField, InputAdornment, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { usePermissions } from '@/hooks/usePermissions';
import { useStorages } from '../hooks/useStorages';
import { StoragesTable } from '../components/StoragesTable';
import { StorageFormModal } from '../components/StorageFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';

export const StoragesPage = () => {
  const navigate = useNavigate();
  const { storages, loading, createStorage, updateStorage, deleteStorage } = useStorages();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('MANAGE_STORAGES');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');

  const filteredStorages = storages.filter(s =>
    s.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingStorage(null);
    setModalOpen(true);
  };

  const handleEdit = (storage) => {
    setEditingStorage(storage);
    setModalOpen(true);
  };

  const handleDeleteClick = (storage) => {
    setStorageToDelete(storage);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingStorage) {
        await updateStorage(editingStorage.id, data);
        setSnackbar({ open: true, message: 'Склад обновлён', severity: 'success' });
      } else {
        await createStorage(data);
        setSnackbar({ open: true, message: 'Склад добавлен', severity: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!storageToDelete) return;
    try {
      await deleteStorage(storageToDelete.id);
      setSnackbar({ open: true, message: 'Склад удалён', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setStorageToDelete(null);
    }
  };

  const handleView = (id) => navigate(`/storages/${id}`);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Склады</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Добавить склад
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Поиск по названию или адресу"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
      </Paper>

      <StoragesTable
        storages={filteredStorages}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        canManage={canManage}
      />

      <StorageFormModal
        key={editingStorage?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storage={editingStorage}
        onSubmit={handleSubmit}
        loading={formLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление склада"
        content={`Удалить склад "${storageToDelete?.fullname}"?`}
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