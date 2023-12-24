export default {
  container: {
    padding: '10px 20px',
  },
  status: {
    CLAIMED: {
      color: '#77b45c'
    },
    READY: {
      color: '#f2c063'
    },
    IN_PROGRESS: {
      color: '#eb7035'
    },
    PENDING: {
      color: '#bebebe'
    },
    UNBOOKED: {
      color: '#ff2233'
    },
    COMPLETED: {
      color: '#297fc9'
    }
  },
  name: {
    flex: 1,
    display: 'flex',
    textAlign: 'center',
    color: '#111',
    fontWeight: '500',
    fontSize: '18px',
    paddingBottom: '5px',
  },
  label: {
    display: 'inline-block',
    minWidth: '45px',
    fontSize: '11px',
    color: '#bebfc0',
    fontWeight: 600,
    fontFamily: 'AvenirNext-DemiBold',
    marginRight: '2px',
  },
  label2: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '14px',
    color: '#000000',
    marginRight: '5px'
  },
  label3: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '13px',
    color: '#000000',
    marginRight: '5px'
  },
  driverPhotoContainer: {
    width: '75px',
    height: '75px',
    backgroundColor: '#d8d8d8',
    marginRight: '15px'
  },
  photo: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  defaulDriverPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  text: {
    fontFamily: 'AvenirNext',
    fontSize: '12px',
    color: '#000000'
  },
  driverName: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#000000'
  },
  driverPhoto: {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    cursor: 'pointer'
  },
  modalDriverProfileContainer: {
    width: 900,
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },

}