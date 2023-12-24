import {makeStyles} from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  container: {
    fontFamily: 'AvenirNext',
    backgroundColor: '#fff',
    height: 'calc(100vh - 150px)',
    position: 'relative',
    overflow: "auto",
  },
  gridWrapper: {
    height: 'calc(100% - 35px)',
  },
  wrapper: {
    backgroundColor: '#f4f4f4',
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    fontFamily: 'AvenirNext-DemiBold',
  },
  title: {
    color: '#5a5a5a',
    fontSize: 14,
    padding: theme.spacing(1, 0),
    fontFamily: 'AvenirNext-Medium',
  },
  value: {
    color: '#3b3b3b',
    fontFamily: 'AvenirNext-DemiBold',
  },
  inner: {
    height: '100%',
    textAlign: 'left',
  },
  shipmentListWrapper: {
    flex: 1,
  },
  shipmentList: {
    height: '100%',
    maxHeight: 'calc(100vh - 310px)',
    boxSizing: 'border-box',
  },
  shipmentListInner: {
    backgroundColor: '#fff',
    height: '100%',
    overflowY: 'auto',
  },
  greyButton: {
    backgroundColor: '#9da5b6',
    color: '#fff',
    marginRight: 5,
    textTransform: 'capitalize',
    '&:hover': {
      backgroundColor: '#8393b9',
    }
  },
  noItems: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBox: {
    backgroundColor: '#fff',
    "&::placeholder": {
      fontSize: 13,
    }
  },
  selectItem: {
    fontSize: 13,
  },
  placeholder: {
    color: '#aeaeae',
    fontSize: 13,
  },
  grayInput: {
    backgroundColor: '#fafafa',
  },
  dialog: {
    fontFamily: 'AvenirNext',
    minWidth: 600
  },
  dialogTitle: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Medium',
    fontWeight: 900,
  },
  dialogActions: {
    padding: theme.spacing(2, 3),
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  closeBtn: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
  actionBtn: {
    marginLeft: 10,
    minWidth: 150,
  },
  browseButton: {
    marginLeft: 10,
    verticalAlign: 'text-top',
  },
  idInput: {
    backgroundColor: '#fafafa',
    fontSize: 14,
    "&::placeholder": {
      fontSize: 14,
    }
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  warning: {
    color: 'red',
    textAlign: 'left',
    fontSize: 13,
  },
  popup: {
    fontFamily: 'Helvetica Neue',
    fontSize: 13,
    textAlign: 'left',
  },
  popupList: {
    margin: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  radioGroup: {
    justifyContent: "space-between",
  },
  radioLabel: {
    fontSize: 13,
    fontFamily: 'AvenirNext',
  },
  tableContainer: {
    maxHeight: 500,
  },
  table: {
    border: '1px solid #ccc',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#fff8f8',
    }
  },
  tableHead: {
    textAlign: "center",
    fontFamily: 'AvenirNext-Medium',
    fontWeight: 900,
    backgroundColor: '#ccc',
  },
  tableCell: {
    textAlign: "center",
    maxWidth: 200,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
    zIndex: 99,
  },
  loading: {
    display: "flex",
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  copyIcon: {
    fontSize: 16,
    verticalAlign: 'text-top',
    marginLeft: 5,
    cursor: 'pointer',
  }
}))