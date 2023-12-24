import styled from "styled-components";

export const FreezeeButton = styled.span`
  cursor: pointer;
  font-size: 20px;
  display: inline-block;
  margin: 0 5px;
  vertical-align: middle;
`;

export const FreezeFilterOptions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
`;

export default {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: `calc(100vh - 115px)`
    },
    edit: {
      cursor: 'pointer',
      fontSize: '20px',
      position: 'relative'
    },
    list: {
      flex: 1,
      backgroundColor: '#fff',
      marginTop: '10px',
      marginBottom: '5px',
      overflowX: 'scroll'
    },
    highlightCell: {
      backgroundColor: 'rgba(136, 127, 255, 0.1)'
    },
    dropdown: {
      display: 'none',
      position: 'absolute',
      top: '100%',
      right: 0,
      background: '#FFF',
      minWidth: 80,
      borderRadius: 3,
      fontSize: 13,
      margin: '5px auto',
      border: '1px solid #CCC',
      zIndex: 1,
      padding: '3px 0'
    },
    active: {
      display: 'block'
    },
    button: {},
    arrow: {
      width: 5,
      height: 5,
      borderTop: '1px solid #CCC',
      borderLeft: '1px solid #CCC',
      position: 'absolute',
      top: -4,
      right: 6,
      background: '#FFF',
      transform: 'rotate(45deg)'
    },
    inner: {
      padding: '3px 10px',
    },
    searchBar: {
      paddingRight: '180px',
      boxSizing: 'border-box',
      position: 'relative',
    },
    searchButton: {
      position: 'absolute',
      top: 0,
      marginTop: 0,
      paddingRight: 0,
      right: 0,
      width: '170px'
    },
    searchBox: {
      width: '100%',
      height: '46px'
    },
    wrapFilter: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: 10,
      alignItems: 'center',
      textAlign: 'left'
    },
    filterLabel: {
      marginRight: 10
    },
    filterOptions: {
      width: 300,
      marginRight: 10
    },
    filterStateOption: {},
    paginationContainer: {}
}
