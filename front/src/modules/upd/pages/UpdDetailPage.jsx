import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, IconButton, Grid, Chip, CircularProgress, Alert, Snackbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useUpdDetail } from '../hooks/useUpdDetail';
import { BillsTable } from '../components/BillsTable';
import { BillFormModal } from '../components/BillFormModal';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export const UpdDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    upd, bills, loading, error, drivers, vehicles, fertilizers,
    createBill, updateBill, deleteBill, shipUpd, signElectronicBill,
  } = useUpdDetail(id);
  const { hasPermission } = usePermissions();
  const canManageBills = hasPermission('MANAGE_BILLS');
  const canShip = hasPermission('SHIP_UPD');
  const canSign = hasPermission('SIGN_ELECTRONIC_BILL');

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!upd) return <Alert severity="error">УПД не найден</Alert>;

  const handleAddBill = () => {
    setEditingBill(null);
    setBillModalOpen(true);
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setBillModalOpen(true);
  };

  const handleDeleteBill = (billId) => {
    setBillToDelete(billId);
    setDeleteDialogOpen(true);
  };

  const handleSubmitBill = async (data) => {
    setFormLoading(true);
    try {
      if (editingBill) {
        await updateBill(editingBill.id, data);
        setSnackbar({ open: true, message: 'Накладная обновлена', severity: 'success' });
      } else {
        await createBill(data);
        setSnackbar({ open: true, message: 'Накладная создана', severity: 'success' });
      }
      setBillModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    try {
      await deleteBill(billToDelete);
      setSnackbar({ open: true, message: 'Накладная удалена', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  const handleShip = async () => {
    try {
      await shipUpd();
      setSnackbar({ open: true, message: 'Отгрузка инициирована, ЭТрН созданы', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleSign = async (billId) => {
    try {
      await signElectronicBill(billId);
      setSnackbar({ open: true, message: 'Статус ЭТрН обновлён', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Typography variant="h4">УПД #{upd.id}</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Партнёр</Typography>
            <Typography>{upd.partnername}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Дата заключения</Typography>
            <Typography>{new Date(upd.concldate).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Дата отгрузки</Typography>
            <Typography>{new Date(upd.shipdate).toLocaleDateString() || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Статус</Typography>
            <Chip label={upd.shipdate ? 'Отгружено' : 'Черновик'} color={upd.shipdate ? 'success' : 'warning'} />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Транспортные накладные</Typography>
        {canManageBills && !upd.shipdate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBill}>
            Создать накладную
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2 }}>
        <BillsTable
          bills={bills}
          canManage={canManageBills && !upd.shipdate}
          canSign={canSign}
          onEdit={handleEditBill}
          onDelete={handleDeleteBill}
          onSign={handleSign}
          userRoleId={user?.roleId}
        />
      </Paper>

      {canShip && !upd.shipdate && bills.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" size="large" startIcon={<LocalShippingIcon />} onClick={handleShip}>
            Отгрузить
          </Button>
        </Box>
      )}

      <BillFormModal
        key={editingBill?.id || 'new'}
        open={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        bill={editingBill}
        drivers={drivers}
        vehicles={vehicles}
        fertilizers={fertilizers}
        updId={id}
        onSubmit={handleSubmitBill}
        loading={formLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление накладной"
        content="Удалить транспортную накладную? Все связанные ЭТрН также будут удалены."
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