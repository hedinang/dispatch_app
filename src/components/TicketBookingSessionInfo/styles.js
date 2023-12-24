export default {
  container: {
    padding: '12px 16px',
    position: 'relative',
    fontSize: '14px'
  },
  title: {
    fontSize: '17px',
    fontWeight: 'bold',
    paddingBottom: 10
  },
  innerContainer: {
    padding: '20px 10px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  name: {
    flex: 1,
    textAlign: 'left',
    color: '#111',
    fontWeight: '500',
    fontSize: '18px'
  },
  pickupTime:{
    width: '80px',
    padding: '12px 10px',
    backgroundColor: '#f7f6ff',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#4a4a4a',
    fontSize: '18px',
    fontWeight: '400',
  },
  label: {
    color: '#848484',
    fontWeight: '500',
    fontSize: '12px',
    paddingBottom: '8px'
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
    COMPLETED: {
      color: '#297fc9'
    }
  },
}
