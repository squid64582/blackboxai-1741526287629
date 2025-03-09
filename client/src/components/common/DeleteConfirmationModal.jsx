import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { setModal, setSelectedItem } from '../../store/slices/uiSlice';
import { deleteNotebook } from '../../store/slices/notebookSlice';
import { deleteNote } from '../../store/slices/noteSlice';

const DeleteConfirmationModal = () => {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { notebookToDelete, noteToDelete } = useSelector(
    (state) => state.ui.selectedItems
  );

  const handleClose = () => {
    dispatch(setModal({ modal: 'deleteConfirmation', open: false }));
    dispatch(setSelectedItem({ type: 'notebookToDelete', item: null }));
    dispatch(setSelectedItem({ type: 'noteToDelete', item: null }));
  };

  const handleDelete = async () => {
    try {
      if (notebookToDelete) {
        await dispatch(deleteNotebook(notebookToDelete._id)).unwrap();
      } else if (noteToDelete) {
        await dispatch(deleteNote(noteToDelete._id)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getDeleteMessage = () => {
    if (notebookToDelete) {
      return {
        title: 'Delete Notebook',
        message: `Are you sure you want to delete the notebook "${notebookToDelete.title}"? This action cannot be undone and will delete all notes within this notebook.`
      };
    } else if (noteToDelete) {
      return {
        title: 'Delete Note',
        message: `Are you sure you want to delete the note "${noteToDelete.title}"? This action cannot be undone.`
      };
    }
    return { title: '', message: '' };
  };

  const { title, message } = getDeleteMessage();

  return (
    <Dialog
      open={modals.deleteConfirmation}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
