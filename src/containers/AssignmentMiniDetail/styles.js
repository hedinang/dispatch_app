const styles = theme => ({
  container: {
    fontFamily: 'AvenirNext',
    fontSize: 14,
  },
  backItem: {
    verticalAlign: 'middle',
    cursor: 'pointer',
    fontSize: 14,
  },
  infoContainer: {

  },
  label: {
    fontSize: '2em',
    fontFamily: 'AvenirNext-DemiBold',
    verticalAlign: 'middle',
  },
  code: {
    backgroundColor: 'rgba(136, 127, 255, 0.5)',
    display: 'inline-block',
    padding: '4px 7px',
    margin: '2px 6px',
    borderRadius: '3px',
    color: '#3b3b3b',
    fontSize: '10px',
    verticalAlign: 'middle',
  },
  assignmentInfo: {
    textAlign: 'left',
  },
  shipmentList: {
    backgroundColor: '#f6f6f6',
  },
  bold: {
    fontFamily: 'AvenirNext-DemiBold',
  },
  active: {
    color: '#006ddb',
  },
  pending: {
    color: '#fa6725',
  },
  in_progress: {
    color: '#fdbd39',
  },
  completed: {
    color: '#4abc4e',
  },
  failed: {
    color: '#d63031',
  },
});

export default styles;