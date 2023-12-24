import React from "react";
import {Box, Dialog, DialogTitle, IconButton, makeStyles} from "@material-ui/core";
import {Close as CloseIcon} from "@material-ui/icons";
import PropTypes from 'prop-types';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  dialog: {
    fontFamily: 'AvenirNext',
    minWidth: 600,
    color: '#5a5a5a',
  },
  dialogTitle: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Medium',
    fontWeight: 900,
  },
  center: {
    textAlign: "center",
  },
  closeBtn: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

function SimpleModal(props) {
  const classes = useStyles();

  const { onClose, title, children } = props;
  const { centerTitle, minWidth, ...rest } = props;

  return (
    <Dialog PaperProps={{className: classes.dialog, style: { minWidth }}} {...rest}>
      <DialogTitle disableTypography>
        <Box component="h3" m={0} className={clsx({
          [classes.dialogTitle]: true,
          [classes.center]: centerTitle,
        })}>
          {title}
        </Box>
        <IconButton onClick={onClose} className={classes.closeBtn} size="small">
          <CloseIcon fontSize="large" />
        </IconButton>
      </DialogTitle>
      {children}
    </Dialog>
  );
}

SimpleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.any.isRequired,
  onClose: PropTypes.func.isRequired,
  maxWidth: PropTypes.string,
  minWidth: PropTypes.number,
  centerTitle: PropTypes.bool,
};

export default SimpleModal;
