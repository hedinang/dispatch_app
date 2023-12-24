export default {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
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
      color: '#bebebe'
    },
    COMPLETED: {
      color: '#297fc9'
    }
  },
  label: {
    display: 'inline-block',
    minWidth: '45px',
    fontSize: '11px',
    color: '#bebfc0',
    fontWeight: 600,
    fontFamily: 'AvenirNext-DemiBold',
  },
  label2: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '14px',
    color: '#000000',
  },
  label3: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '13px',
    color: '#000000',
  },
  text: {
    fontFamily: 'AvenirNext',
    fontSize: '12px',
    color: '#000000'
  },
  grayText: {
    color: '#707070',
  },
  note: {
    color: '#d0021b',
  }
}