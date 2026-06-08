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
import { DriverFormModal } from "./DriverFormModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import {DriverCategoriesChips} from "./DriverCategoriesChips";

export const DriversTable = ({ drivers, onAdd, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAdd = () => {
    setEditingDriver(null);
    setModalOpen(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setModalOpen(true);
  };

  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingDriver) {
        await onUpdate(editingDriver.userid, data);
        setSnackbar({
          open: true,
          message: "Водитель обновлён",
          severity: "success",
        });
      } else {
        await onAdd(data);
        setSnackbar({
          open: true,
          message: "Водитель добавлен",
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
    if (!driverToDelete) return;
    try {
      await onDelete(driverToDelete.userid);
      setSnackbar({
        open: true,
        message: "Водитель удалён",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
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
        Добавить водителя
      </Button>
      {drivers.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>ФИО</TableCell>
                <TableCell sx={{ color: "white" }}>Номер ВУ</TableCell>
                <TableCell sx={{ color: "white" }}>Категории</TableCell>
                <TableCell sx={{ color: "white" }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{`${driver.surname} ${driver.name} ${driver.patronymic || ""}`}</TableCell>
                  <TableCell>{driver.license}</TableCell>
                  <TableCell>
                    <DriverCategoriesChips
                      value={driver.categories}
                      maxChips={2}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(driver)}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(driver)}
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
        <Typography color="text.secondary">Нет водителей</Typography>
      )}

      <DriverFormModal
        key={editingDriver?.id || "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        driver={editingDriver}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление водителя"
        content={`Удалить водителя "${driverToDelete?.surname} ${driverToDelete?.name}"?`}
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
