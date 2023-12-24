export default {
  list: {
    backgroundColor: 'white',
    borderRadius: '4px',
    margin: 6,
    paddingTop: 0,
    boxShadow: '0px 0px 1px #444'
  },
  header_bar: {
    flex: 1,
    height: '1px',
    backgroundColor: '#aaa'
  },
  list_header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: '15px'
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
      color: '#F23'
    },
    COMPLETED: {
      color: '#297fc9'
    }
  },
}
