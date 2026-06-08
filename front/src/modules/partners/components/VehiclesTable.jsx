import { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { VehicleFormModal } from "./VehicleFormModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

export const VehiclesTable = ({ vehicles, onAdd, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAdd = () => {
    setEditingVehicle(null);
    setModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setModalOpen(true);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingVehicle) {
        await onUpdate(editingVehicle.id, data);
        setSnackbar({
          open: true,
          message: "ТС обновлено",
          severity: "success",
        });
      } else {
        await onAdd(data);
        setSnackbar({
          open: true,
          message: "ТС добавлено",
          severity: "success",
        });
      }
      setModalOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await onDelete(vehicleToDelete.id);
      setSnackbar({ open: true, message: "ТС удалено", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        sx={{ mb: 2 }}
      >
        Добавить ТС
      </Button>

      {vehicles.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Рег. номер</TableCell>
                <TableCell sx={{ color: "white" }}>Тип</TableCell>
                <TableCell sx={{ color: "white" }}>
                  Грузоподъёмность (кг)
                </TableCell>
                <TableCell sx={{ color: "white" }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.registrationmark}</TableCell>
                  <TableCell>
                    {vehicle.type === "T" ? "Грузовой" : "Прицеп"}
                  </TableCell>
                  <TableCell>{vehicle.capacity}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(vehicle)}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(vehicle)}
                      title="Удалить"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary">Нет транспортных средств</Typography>
      )}

      <VehicleFormModal
        key={editingVehicle?.id || "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vehicle={editingVehicle}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление ТС"
        content={`Удалить ТС "${vehicleToDelete?.registrationmark}"?`}
        confirmText="Удалить"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
