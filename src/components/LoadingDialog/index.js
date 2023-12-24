import React from 'react';
import {Box, CircularProgress, Dialog, DialogContent, DialogTitle, Button} from "@material-ui/core";
import useStyles from "./styles";
import {Error as ErrorIcon} from "@material-ui/icons";

export default function LoadingDialog (props){

    const classes = useStyles();
    const { showDialog,polling,handleCloseDialog, error, title } = props;
  
    return (
    <Dialog 
        disableBackdropClick
        disableEscapeKeyDown    
        PaperProps={{className: classes.dialog}}
        open={showDialog}            
        onClose={handleCloseDialog}
    >
      <DialogTitle disableTypography>
        <Box component="h3" m={0} className={classes.dialogTitle}>
            <Box style={{verticalAlign: 'middle'}}>{title}</Box>
        </Box>
      </DialogTitle>
      <DialogContent>      
        <Box>
         <Box  align="center" p={1} >
            {polling && <CircularProgress style={{verticalAlign: "middle", marginLeft: 5}} color="primary" size={28} />}
        </Box>
         {error && <Box className={classes.error} p={2}>
           <ErrorIcon fontSize="small" style={{verticalAlign: 'top'}} />
           <Box component="span" px={0.5}>{error}</Box>
         </Box> }
         {error && <Box align="center" p={1}>
           <Button onClick={handleCloseDialog} variant="outlined" className={classes.actionBtn} color="warn">
             Ok
           </Button>
         </Box>}
       </Box>
     </DialogContent>
    </Dialog>    
    )
}