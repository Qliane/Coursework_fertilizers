import { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePermissions } from '@/hooks/usePermissions';
import { useFertilizers } from '../hooks/useFertilizers';
import { FertilizersTable } from '../components/FertilizersTable';
import { FertilizerFormModal } from '../components/FertilizerFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export const FertilizersPage = () => {
  const { fertilizers, containers, loading, createFertilizer, updateFertilizer, deleteFertilizer } = useFertilizers();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('MANAGE_REFERENCES');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fertilizerToDelete, setFertilizerToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAdd = () => {
    setEditingFertilizer(null);
    setModalOpen(true);
  };

  const handleEdit = (fertilizer) => {
    setEditingFertilizer(fertilizer);
    setModalOpen(true);
  };

  const handleDeleteClick = (fertilizer) => {
    setFertilizerToDelete(fertilizer);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingFertilizer) {
        await updateFertilizer(editingFertilizer.id, data);
        setSnackbar({ open: true, message: 'Удобрение обновлено', severity: 'success' });
      } else {
        await createFertilizer(data);
        setSnackbar({ open: true, message: 'Удобрение добавлено', severity: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!fertilizerToDelete) return;
    try {
      await deleteFertilizer(fertilizerToDelete.id);
      setSnackbar({ open: true, message: 'Удобрение удалено', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setFertilizerToDelete(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Справочник удобрений</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Добавить удобрение
          </Button>
        )}
      </Box>

      <FertilizersTable
        fertilizers={fertilizers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        canManage={canManage}
      />

      <FertilizerFormModal
        key={editingFertilizer?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fertilizer={editingFertilizer}
        containers={containers}
        onSubmit={handleSubmit}
        loading={formLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление удобрения"
        content={`Удалить удобрение "${fertilizerToDelete?.name}"?`}
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