import { useState } from 'react';
import { Box, TextField, InputAdornment, Button, Snackbar, Alert, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { usePermissions } from '@/hooks/usePermissions';
import { usePartners } from '../hooks/usePartners';
import { PartnersTable } from '../components/PartnersTable';
import { PartnerFormModal } from '../components/PartnerFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export const PartnersPage = () => {
  const { partners, loading, search, setSearch, createPartner, updatePartner, deletePartner } = usePartners();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('MANAGE_PARTNERS');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAdd = () => {
    setEditingPartner(null);
    setModalOpen(true);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setModalOpen(true);
  };

  const handleDeleteClick = (partner) => {
    setPartnerToDelete(partner);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingPartner) {
        await updatePartner(editingPartner.id, data);
        setSnackbar({ open: true, message: 'Партнёр обновлён', severity: 'success' });
      } else {
        await createPartner(data);
        setSnackbar({ open: true, message: 'Партнёр добавлен', severity: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    try {
      await deletePartner(partnerToDelete.id);
      setSnackbar({ open: true, message: 'Партнёр удалён', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    }
  };

  const handleView = (id) => {
    window.location.href = `/partners/${id}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Партнёры</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Добавить партнёра
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Поиск по названию или ИНН"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
      </Paper>

      <PartnersTable
        partners={partners}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        canManage={canManage}
      />

      <PartnerFormModal
        key={editingPartner?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={editingPartner}
        onSubmit={handleSubmit}
        loading={formLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление партнёра"
        content={`Удалить партнёра "${partnerToDelete?.fullname}"?`}
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