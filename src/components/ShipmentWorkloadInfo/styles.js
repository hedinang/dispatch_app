import { Colors } from 'axl-reactjs-ui';

export default {
  error: {
    color: 'red',
    textAlign: 'center',
  },
  loadingWrapper: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    left: '0',
    background: 'gray',
    opacity: '0.4',
    cursor: 'none',
    zIndex: '2',
  },
  loading: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
  },
  buttonWrap: {
    display: 'flex',
    marginTop: '10px',
  },
  editBtn: {
    marginLeft: 'auto',
  },
  cancelBtn: {
    marginLeft: 'auto',
    width: '88px',
  },
  saveBtn: {
    marginLeft: '10px',
    width: '88px',
  },
  workloadNumber: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#273c75',
    margin: '0 5px',
  },
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
};
