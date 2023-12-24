import { Colors } from 'axl-reactjs-ui';

export default {
  panelContainer: {
    borderRadius: '5px',
    backgroundColor: '#f4f4f4',
    padding: '10px 15px',
    marginBottom: '15px'
  },
  panelHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  panelHeaderLeft: {},
  panelHeaderRight: {
    display: 'flex',
    flexDirection: 'row',
    flex: 'none',
    justifyContent: 'center',
    alignItems: 'center'
  },
  panelHeaderTitle: {
    flex: 1,
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '14px',
    color: '#000'
  },
  panelHeaderStatus: {
    // fontFamily: 'AvenirNext-DemiBoldItalic',
    fontSize: '12px',
    fontStyle: 'italic',
    margin: '0 5px'
  },
  wrapHeaderEdit: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  panelHeaderButton: {
    margin: '0 5px'
  },
  noteLabel: {
    fontFamily: 'AvenirNext',
    fontSize: '10px',
    color: '#bec6d8'
  },
  noteContent: {
    borderRadius: '5px',
    border: 'solid 1px #bec6d8',
    padding: '7px 10px',
    fontStyle: 'italic'
  },
  text: {
    fontSize: '12px',
    color: '#000'
  },
  text2: {
    fontSize: '9px'
  },
  row: {
    marginBottom: '10px'
  },
  timewindow: {
    backgroundColor: '#FFF',
    padding: '7px 15px',
    borderRadius: '5px',
    marginBottom: '10px'
  },
  timeLabel: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '12px',
    color: '#96979a'
  },
  dropoffRemarkContainer: {
    marginBottom: '15px'
  },
  dropoffRemarkHeader: {
    color: '#4abc4e',
    padding: '0px 5px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropoffRemarkHeaderStatus: {
    fontFamily: 'AvenirNext-DemiBold',
    flex: 1
  },
  dropoffRemarkHeaderTime: {
    fontFamily: 'AvenirNext-Medium'
  },
  dropoffRemarkContent: {
    padding: '7px 10px',
    borderRadius: '5px',
    border: '1px solid #cfcfcf',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropoffRemarkContentText: {
    flex: 1,
    fontStyle: 'italic'
  },
  dropoffAccessContainer: {
    padding: '7px 10px',
    borderRadius: '5px',
    border: `1px solid ${Colors.periwinkle}`,
  },
  dropoffAccessHeader: {
    color: '#4abc4e',
    padding: '0px 5px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropoffAccessContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropoffAccessContentText: {
    flex: 1,
    color: '#000'
  },
  dropoffAccessContentLabel: {
    color: Colors.periwinkle,
    marginRight: '5px'
  },
  panelHeaderArrow: {
    cursor: 'pointer',
    fontSize: 30,
    color: '#bebfc0',
    margin: '0 5px'
  },
  Status: {
    DEFAULT: Colors.veryLightPink,
    PENDING: Colors.reddishOrange,
    DELIVERED: Colors.reddishOrange,
    DROPOFF_SUCCEEDED: Colors.darkPastelGreen,
    SUCCEEDED: Colors.darkPastelGreen,
    FAILED: Colors.dustyRed
  }
}
