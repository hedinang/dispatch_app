import { Colors } from 'axl-reactjs-ui';

export const Statuses = {
  default: '#bebfc0',
  early: '#a5ccec',
  late: '#8447f6',
  unassigned: '#bebfc0',
  pending: '#fa6725',
  in_progress: '#fbc04f',
  succeeded: '#66b752',
  failed: '#d63031'
}

export default {
  container: {
    height: '100%',
    boxSizing: 'border-box',
    flexDirection: 'column',
    display: 'flex'
  },
  title: {
    display: 'flex',
    fontSize: 12,
    fontWeight: 'normal',
    color: '#4a4a4a',
    textAlign: 'left',
    padding: '15px',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    fontFamily: 'AvenirNext-Bold'
  },
  innerTitle: {
    flex: 1,
    textAlign: 'center'
  },
  info: {
    fontSize: 12,
    color: Colors.veryLightPink,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  shipmentTotal: {
    fontSize: 16,
    color: '#3b3b3b',
    display: 'inline-block',
    margin: '0 5px'
  },
  chart: {
    display: 'flex',
    flex: 1
  },
  pane: {
    width: '50%',
    padding: '15px',
    boxSizing: 'border-box'
  },
  panelContainer: {
    display: 'flex',
    flex: 1
  },
  innerPanelContainer: {
    flex: 1,
    padding: '0 15px 10px',
    textAlign: 'left'
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 275,
    margin: '0 auto 5px'
  },
  rowLabel: {
    display: 'inline-block',
    width: 135,
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginRight: 10,
    fontWeight: 'normal'
  },
  toggleButton: {
    flex: 0,
    marginRight: 15
  },
  toggleChartLink: {
    fontFamily: 'AvenirNext',
    fontSize: '12px',
    color: '#4a90e2',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 'normal'
  },
  dateTitle: {
    fontFamily: 'AvenirNext-MediumItalic',
    fontSize: 11,
    padding: '0 5px'
  }
}
