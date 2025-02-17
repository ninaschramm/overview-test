import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "class" | "image";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, onClose, onConfirm, type }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        {`Are you sure you want to delete this ${type}?`}
        <br />
        {`All related annotations to this ${type} will be removed.`}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
