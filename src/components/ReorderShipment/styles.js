import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  errorText: {
    color: 'red',
    marginTop: 20
  },
  chip: {
    height: 24,
    marginLeft: 5,
  },
  buttonLoading: {
    position: 'absolute',
    top: 'calc(50% - 15px)',
    left: 'calc(50% - 15px)',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 600
  },
  mapWrapper: { 
    height: '300px',
    maxWidth: '100%'
  },
  selectBtn: {
    padding: "3px 30px 3px 10px",
    fontSize: '13px',
  },
  buttonWrapper: {
    position: "relative",
  },
  dialogContent: {
    fontSize: '12px',
  },
  dialogAction: {
    padding: "8px 24px",
  },
  actionIcon: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  whiteBtn: {
    border: "solid 1px #979797",
    color: "#5a5a5a",
    backgroundColor: "white",
    textTransform: "capitalize",
    padding: "3px 20px",
    fontWeight: 600,
    width: 120,
  },
  confirmBtn: {
    textTransform: "capitalize",
    padding: "4px 20px",
    fontWeight: 600,
    width: 120,
  },
  applyBtn: {
    backgroundColor: "#8192a7",
    color: "#fff",
    textTransform: "capitalize",
    fontSize: '10px',
    fontWeight: 600,
    marginLeft: '5px',
    border: '1px solid transparent'
  },
  undoBtn:{
    backgroundColor: "#fff",
    color: "#8192a7",
    textTransform: "capitalize",
    fontSize: '10px',
    fontWeight: 600,
    marginLeft: '5px',
    border: '1px solid #8192a7'
  }, 
  rightContent:{ 
    paddingLeft: 20,
  },
  smallText: {
    marginTop: 10
  },
  footerButton: {
    minWidth: 'auto',
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(0.5),
    fontFamily: 'AvenirNext-Medium',
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'none',
    paddingTop: '7px',
    paddingBottom: '7px',
    borderRadius: 3,
    backgroundColor: 'rgb(244, 244, 244)'
  },
  freeBtnStyle: {
    minWidth: 'auto',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.6),
    paddingBottom: theme.spacing(0.6),
  },
  footerBtnIcon: {
    width: 16,
    height: 15,
    backgroundSize: 'contain',
    marginRight: 8,
  },
  footerBtnIcon2: {
    width: 16,
    height: 15,
    backgroundSize: 'contain',
  }
}));
