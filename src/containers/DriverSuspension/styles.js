import { Colors } from 'axl-reactjs-ui';
import styled from 'styled-components';

export const TopSection = styled('div')`
  display: flex;
  flex-direction: row;
`;
export const Spacer = styled('div')`
  flex: 1;
`;

export const ActionControl = styled.i`
  font-size: 22px;
  color: #828282;
`;

export default {
  container: {},
  formWrapper: {
    paddingBottom: '20px'
  },
  title: {
    fontSize: 20
  },
  formLabel: {
    fontSize: '14px',
    color: '#9b9b9b',
    lineHeight: 1.71,
    paddingBottom: '5px'
  },
  actionItem: {
    paddingLeft: '5px',
    fontSize: '16px'
  },
  searchBar: {
    padding: '5px 0'
  },
  searchButton: {
    marginTop: 0,
    marginBottom: 0
  },
  chooseDriver: {
    marginTop: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: '3px',
    padding: 10
  },
  chooseDriverSearch: {},
  chooseDriverListContainer: {
    marginTop: '15px',
    overflowX: 'auto',
  },
  chooseDriverBottom: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px'
  },
  chooseDriverAction: {
    margin: 0,
    minWidth: '180px'
  },
  chooseDriverSelectedText: {
    display: 'inline-block',
    margin: '0 10px'
  },
  error: {
    fontSize: 12,
    color: 'red'
  },
  modalDriverProfileContainer: {
    width: 'calc(100vw - 100px)',
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },
  modalContainer: {
    width: '1000px',
    height: '650px',
    maxWidth: '100%',
    maxHeight: '100%',
    padding: 0,
  },
  actionDropdown: {
    zIndex: 1000,
    minWidth: 125
  },
  inputDriverInfo: {
    width: '100%',
    height: 39,
    fontSize: 17, 
    boxSizing: 'border-box', 
    padding: '4px 14px 4px 8px', 
    border: 'solid 1px #ccc', 
    outline: 'none', 
    borderRadius: 3
  },
  searchBox: {
    width: '100%'
  }
}
