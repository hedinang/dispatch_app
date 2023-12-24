export default {
  panelContainer: {
    borderRadius: '5px',
    backgroundColor: '#f4f4f4',
    padding: '10px 15px',
    marginBottom: '15px',
  },
  panelHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  panelHeaderRight: {
    display: 'flex',
    flexDirection: 'row',
    flex: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupTitle: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '16px'
  },
  panelHeaderTitle: {
    flex: 1,
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '14px',
    color: '#000',
  },
  panelHeaderArrow: {
    cursor: 'pointer',
    fontSize: 30,
    color: '#bebfc0',
    margin: '0 5px',
  },
  buttonGroupWrapper: {
    display: 'flex',
  },
  buttonWrapper: {
    padding: '0 10px',
  },

  rowCenter: {
    display:'flex',
    gap:'5px', 
    justifyContent:'center'
  },

  count: {
    marginLeft: 5,
    verticalAlign: 'middle',
  },
  requiredText: {
    textAlign: 'center',
    padding: '0 10px',
    paddingTop: 5,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#f5a623',
  },
  modalContainer: {
    display: 'flex'
  },
  modalStyle: {
    width: '480px',
    display: 'block',
    overflow: 'auto',
    backgroundColor: 'transparent',
    margin: 'auto',
    boxShadow: 'none'
  },
  modalImageStyle: {
    width: '650px',
    backgroundColor: '#FFF',
    padding: '30px 0'
  },
  wrapImages: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 9999
  },
  buttonControl: {
    minWidth: '80px'
  },
  imageShipment: {
    width: 'auto',
    maxWidth: '100%',
    // maxHeight: '100%',
    maxHeight: 'calc(100vh - 100px)',
    margin: 'auto',
    backgroundColor: '#FFFF'
  },
  arrowButton: {
    width: '30px',
    height: '30px',
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 'auto',
    zIndex: 10000,
    cursor: 'pointer'
  },
  arrowPrev: {
    left: 0
  },
  arrowNext: {
    right: 0
  },
  arrowIcon: {
    fontSize: '25px',
    color: '#fff'
  },

}

export const style = theme => ({
  buttonWrapper: {
    '& > div:first-child > div': {
      paddingLeft: '0 !important',
    },
    '& > div:last-child > div': {
      borderRight: 'none !important',
    },
  }
})
