import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: 0,
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, align, isShowClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Box>
        <Typography variant="h6" align={align}>
          {children}
        </Typography>
        {onClose && isShowClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </Box>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

function AxlDialog({ isOpen, childrenTitle, childrenAction, children, handleClose, maxWidth = 'md', alignTitle = 'inherit', DialogContentProps, dividers = true, isShowClose = true, }) {
  return (
    <Dialog onClose={handleClose} open={isOpen} fullWidth maxWidth={maxWidth} style={{fontFamily: 'AvenirNext'}}>
      <DialogTitle onClose={handleClose} align={alignTitle} isShowClose={isShowClose}>
        {childrenTitle}
      </DialogTitle>
      <DialogContent dividers={dividers} {...DialogContentProps}>{children}</DialogContent>
      {childrenAction && <DialogActions>{childrenAction}</DialogActions>}
    </Dialog>
  );
}

export default AxlDialog;
