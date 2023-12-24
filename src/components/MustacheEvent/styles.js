export default {
  innerItems: {
    position: 'relative',
    paddingBottom: 24,
  },
  item: {
    position: 'relative',
    padding: '0 0 10px 25px',
    textAlign: 'left'
  },
  car: {
    position: 'absolute',
    top: '7px',
    left: -24,
    borderRadius: '50%',
    width: '7px',
    height: '7px',
    bottom: 0,
    cursor: 'pointer'
  },
  inner: {
    position: 'relative',
    display: 'flex'
  },
  time: {
    minWidth: '30%',
    textAlign: 'right',
    marginBottom: 3,
    lineHeight: '20px',
    color: '#96979a',
    fontSize: '12px',
    fontFamily: 'AvenirNext'
  },
  line: {
    position: 'absolute',
    top: '10px',
    height: 'calc(100%)',
    width: '1px',
    background: 'rgb(160, 178, 184)',
    left: '4px'
  },
  modalDriverProfileContainer: {
    width: 'calc(100vw - 100px)',
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },
  lineDate: {
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: 10, 
    height: 1, 
    backgroundColor: '#ccc',
  },
  date: {
    margin: '0px 2px', 
    display: 'inline-block', 
    borderRadius: 4, 
    backgroundColor: '#f8f8f8', 
    padding: '2px 16px', 
    minWidth: 60, 
    border: 'solid 1px #ccc', 
    fontSize: 13
  }
}
