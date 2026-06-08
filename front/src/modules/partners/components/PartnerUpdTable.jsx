import { useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { UpdFormModal } from './UpdFormModal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';

export const PartnerUpdTable = ({ upds, onAdd, onUpdate, onDelete, canManage }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUpd, setEditingUpd] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updToDelete, setUpdToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAdd = () => {
    setEditingUpd(null);
    setModalOpen(true);
  };

  const handleDeleteClick = (upd) => {
    setUpdToDelete(upd);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingUpd) {
        await onUpdate(editingUpd.id, data);
        setSnackbar({ open: true, message: 'УПД обновлён', severity: 'success' });
      } else {
        await onAdd(data);
        setSnackbar({ open: true, message: 'УПД создан', severity: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!updToDelete) return;
    try {
      await onDelete(updToDelete.id);
      setSnackbar({ open: true, message: 'УПД удалён', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setUpdToDelete(null);
    }
  };

  const handleViewDetails = (updId) => {
    navigate(`/upd/${updId}`);
  };

  return (
    <Box>
      {canManage && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ mb: 2 }}>
          Создать УПД
        </Button>
      )}
      {upds.length ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Дата заключения</TableCell>
                <TableCell sx={{ color: 'white' }}>Дата отгрузки</TableCell>
                <TableCell sx={{ color: 'white' }}>Склад</TableCell>
                <TableCell sx={{ color: 'white' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upds.map((upd) => (
                <TableRow key={upd.id} hover>
                  <TableCell>{new Date(upd.concldate).toLocaleDateString()}</TableCell>
                  <TableCell>{upd.shipdate && new Date(upd.shipdate).toLocaleDateString() || '—'}</TableCell>
                  <TableCell>{upd.storagename}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={() => handleViewDetails(upd.id)}>
                        Подробнее
                      </Button>
                      {canManage && (
                        <IconButton size="small" onClick={() => handleDeleteClick(upd)} title="Удалить">
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
      ) : (
        <Typography color="text.secondary">Нет УПД</Typography>
      )}

      <UpdFormModal
        key={editingUpd?.id || 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        upd={editingUpd}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление УПД"
        content={`Удалить УПД #${updToDelete?.id}?`}
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