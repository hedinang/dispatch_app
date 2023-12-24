import {makeStyles} from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  dialog: {
    fontFamily: 'AvenirNext',
    minWidth: 600
  },
  dialogTitle: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Medium',
    fontWeight: 900,
    textAlign: 'center',
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
  },
  actionBtn: {
    marginLeft: 10,
    minWidth: 150,
    color: 'red'
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  loading: {
    display: "flex",
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },

}))