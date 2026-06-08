import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Box
} from '@mui/material';

export const FormDialog = ({
  open, onClose, title, children,
  onSubmit, submitText = 'Сохранить',
  cancelText = 'Отмена', loading = false,
  maxWidth = 'sm', fullWidth = true
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>{children}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{cancelText}</Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};