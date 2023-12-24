import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const DriverLink = styled.strong`
  cursor: pointer;
`;
export const Title = styled.div`
  flex: 0.7;
`;
export const ViewDispatchButton = styled.div`
  margin: 0 10px;
  flex: 0.3;
  text-align: right;
`;

export default {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%'
  },
  title: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  items: {
    position: 'relative',
    fontSize: '13px',
    lineHeight: '13px',
    fontWeight: '300',
    padding: '0 17px 0 0',
    width: '100%',
    height: '100%',
    margin: '0px auto',
    overflowY: 'scroll'
  },
  innerItems: {
    position: 'relative'
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
  notes: {
    // flex: 0.7,
    fontSize: 12,
    lineHeight: '20px',
    color: '#4a4a4a',
    paddingRight: '20px',
    fontFamily: 'AvenirNext'
  },
  list:{
    margin: 0,
    paddingLeft: '20px'
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
  clear: {
    clear: 'both',
    display: 'table'
  },
  noHistory: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  driverName: {
    fontFamily: 'AvenirNext-Bold'
  },
  strong: {
    fontFamily: 'AvenirNext-Bold'
  },
  status: {
    'book': '#4abc4e',
    'un-book': '#d63031',
    'assign': Colors.bluish,
    'unassign': '#d63031',
    'DATE': Colors.lightGrey,
    'activate': Colors.lightGrey,
    'finish': '#00f',
    'system': '#ccc',
    'check-in': Colors.bluish,
  },
  modalDriverProfileContainer: {
    width: 'calc(100vw - 100px)',
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },
  fieldsContainer: {
    margin: 0,
    padding: '0 0 0 1rem',
  },
  fieldKey: {
    fontFamily: 'AvenirNext-DemiBold'
  },
  fieldValue: {
    fontFamily: 'AvenirNext-Italic',
  }
}
