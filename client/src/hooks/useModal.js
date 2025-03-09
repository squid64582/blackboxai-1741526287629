import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModal, setSelectedItem } from '../store/slices/uiSlice';

export const useModal = (modalName) => {
  const dispatch = useDispatch();
  const { modals, selectedItems } = useSelector((state) => state.ui);

  const isOpen = modals[modalName] || false;

  const openModal = useCallback((selectedItem = null) => {
    if (selectedItem) {
      dispatch(setSelectedItem({ type: `${modalName}Item`, item: selectedItem }));
    }
    dispatch(setModal({ modal: modalName, open: true }));
  }, [dispatch, modalName]);

  const closeModal = useCallback(() => {
    dispatch(setModal({ modal: modalName, open: false }));
    // Clear selected item if it exists
    const itemKey = `${modalName}Item`;
    if (selectedItems[itemKey]) {
      dispatch(setSelectedItem({ type: itemKey, item: null }));
    }
  }, [dispatch, modalName, selectedItems]);

  const toggleModal = useCallback(() => {
    dispatch(setModal({ modal: modalName, open: !isOpen }));
  }, [dispatch, modalName, isOpen]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    selectedItem: selectedItems[`${modalName}Item`]
  };
};

// Example usage:
/*
const MyComponent = () => {
  const { 
    isOpen,
    openModal,
    closeModal,
    selectedItem 
  } = useModal('createNote');

  return (
    <>
      <Button onClick={() => openModal(someData)}>
        Open Modal
      </Button>

      <Dialog open={isOpen} onClose={closeModal}>
        <DialogContent>
          {selectedItem && <div>{selectedItem.title}</div>}
        </DialogContent>
      </Dialog>
    </>
  );
};
*/

export default useModal;
