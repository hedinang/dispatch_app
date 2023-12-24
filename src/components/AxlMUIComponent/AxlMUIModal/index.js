import React, {useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {AxlMUIBox, AxlMUIModalBox} from "../AxlMUIBox";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default function AxlMUIModal({
                                   trigger,
                                   isOpen = false,
                                   disabled,
                                   onClose = () => {},
                                   onRendered = () => {},
                                   isClose = true,
                                   ...props}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(isOpen);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  useEffect(() => {
    if(isClose !== undefined && isClose) {
      handleClose();
    }
  }, [isClose]);

  return (
    <div>
      {React.cloneElement(trigger, {onClick: () => {
        if(!disabled) {
          handleOpen();
          trigger.props.onClick && trigger.props.onClick();
        } else {
          return false;
        }
      }})}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        onRendered={onRendered}
      >
        <Fade in={open} disableStrictModeCompat>
          <AxlMUIModalBox onClose={handleClose} bgcolor={props.bgcolor} {...props}>{props.children}</AxlMUIModalBox>
        </Fade>
      </Modal>
    </div>
  );
}
