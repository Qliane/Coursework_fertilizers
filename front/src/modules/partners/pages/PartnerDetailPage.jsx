/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, IconButton, CircularProgress, Alert, Button, Snackbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { usePartnerDetails } from '../hooks/usePartnerDetails';
import { VehiclesTable } from '../components/VehiclesTable';
import { DriversTable } from '../components/DriversTable';
import { PartnerUpdTable } from '../components/PartnerUpdTable';
import { PartnerFormModal } from '../components/PartnerFormModal';
import { usePartners } from '../hooks/usePartners';
import { usePermissions } from '@/hooks/usePermissions';

export const PartnerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { partner, upds, vehicles, drivers, loading, error, addVehicle, updateVehicle, deleteVehicle, addDriver, updateDriver, deleteDriver, addUpd, updateUpd, deleteUpd, refetch } = usePartnerDetails(id);
  const { updatePartner } = usePartners();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('MANAGE_PARTNERS');
  const canManageUpd = hasPermission('MANAGE_UPD');

  const [tabValue, setTabValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleEditPartner = () => {
    setEditModalOpen(true);
  };

  const handlePartnerUpdate = async (data) => {
    setEditLoading(true);
    try {
      const updated = await updatePartner(id, data);
      await refetch();
      setSnackbar({ open: true, message: 'Партнёр обновлён', severity: 'success' });
      setEditModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!partner) return <Alert severity="error">Партнёр не найден</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/partners')}><ArrowBackIcon /></IconButton>
          <Typography variant="h4">{partner.fullname}</Typography>
        </Box>
        {canManage && (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditPartner}>
            Редактировать
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">ИНН</Typography>
        <Typography>{partner.inn}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Телефон</Typography>
        <Typography>{partner.phone || '—'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Юридический адрес</Typography>
        <Typography>{partner.postaddress || '—'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Фактический адрес</Typography>
        <Typography>{partner.factaddress || '—'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Доверенное лицо</Typography>
        <Typography>{partner?.username || 'Не указано'}</Typography>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="УПД" />
          <Tab label="Транспорт" />
          <Tab label="Водители" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <PartnerUpdTable
              upds={upds}
              onAdd={addUpd}
              onUpdate={updateUpd}
              onDelete={deleteUpd}
              canManage={canManageUpd}
            />
          )}
          {tabValue === 1 && <VehiclesTable vehicles={vehicles} onAdd={addVehicle} onUpdate={updateVehicle} onDelete={deleteVehicle} />}
          {tabValue === 2 && <DriversTable drivers={drivers} onAdd={addDriver} onUpdate={updateDriver} onDelete={deleteDriver} />}
        </Box>
      </Paper>

      <PartnerFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        partner={partner}
        onSubmit={handlePartnerUpdate}
        loading={editLoading}
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