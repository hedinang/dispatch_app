const styleButton = (color, bgColor) => ({
  backgroundColor: bgColor,
  color,
  minWidth: 120,
  border: `1px solid ${bgColor}`,
})

export default {
  container: {
    textAlign: 'center',
    fontFamily: 'AvenirNext',
  },
  column2: {
    width: '50%',
    textAlign: 'left',
  },
  label: {
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: 1.5,
    color: '#373a3c'
  },
  content: {
    fontSize: '14px',
    color: '#666',
    marginBottom: 20
  },
  itemWrapper: {
    paddingBottom: '20px',
    paddingLeft: '10px'
  },
  btnBack: {
    backgroundColor: '#fff',
    color: '#4a4a4a',
    minWidth: 120,
    border: '1px solid #4a4a4a',
  },
  btnSend: styleButton('#fff', '#75c31e'),
  txtSentVia: {
    color: '#c7c6c7',
    fontFamily: 'AvenirNext',
    fontWeight: 500,
  },
  btnWarning: styleButton('#fff', '#fa6724'),
  btnDisabled: styleButton('#fff', '#bfbfbf'),
  btnRemoveSchedule: styleButton('#fff', '#d0021b'),
  limitLine: {
    lineHeight: 1.3, 
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    whiteSpace: 'pre-line',
  }
}
