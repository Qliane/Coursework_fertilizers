import { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePermissions } from '@/hooks/usePermissions';
import { useContainers } from '../hooks/useContainers';
import { ContainersTable } from '../components/ContainersTable';
import { ContainerFormModal } from '../components/ContainerFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export const ContainersPage = () => {
  const { containers, loading, createContainer, updateContainer, deleteContainer } = useContainers();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('MANAGE_REFERENCES');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [containerToDelete, setContainerToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAdd = () => {
    setEditingContainer(null);
    setModalOpen(true);
  };

  const handleEdit = (container) => {
    setEditingContainer(container);
    setModalOpen(true);
  };

  const handleDeleteClick = (container) => {
    setContainerToDelete(container);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingContainer) {
        await updateContainer(editingContainer.id, data);
        setSnackbar({ open: true, message: 'Тара обновлена', severity: 'success' });
      } else {
        await createContainer(data);
        setSnackbar({ open: true, message: 'Тара добавлена', severity: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!containerToDelete) return;
    try {
      await deleteContainer(containerToDelete.id);
      setSnackbar({ open: true, message: 'Тара удалена', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setContainerToDelete(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Справочник тары</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Добавить тару
          </Button>
        )}
      </Box>

      <ContainersTable
        containers={containers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        canManage={canManage}
      />

      <ContainerFormModal
        key={editingContainer?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        container={editingContainer}
        onSubmit={handleSubmit}
        loading={formLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление тары"
        content={`Удалить тару "${containerToDelete?.name}"?`}
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