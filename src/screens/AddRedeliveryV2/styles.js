import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles({
  loadingBG: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inputWrapper: {
    display: 'flex',
    textAlign: 'left',
    alignItems: 'center',
  },
  mapWrapper: {
    position: 'relative',
  },
  shipmentIds: {
    minWidth: 150,
  },
  assignmentIdExclude: {
    '&::-webkit-input-placeholder': { fontSize: '12px' }
  }
});