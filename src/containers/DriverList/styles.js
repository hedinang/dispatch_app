import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const DriverLink = styled.span`
  cursor: pointer;
  color: #887fff;
  font-size: 16px;
`;
export const MessageLink = styled.i`
  cursor: pointer;
`;

export default {
    container: {
      minHeight: '600px'
    },
    topHeader: {
      textAlign: 'left',
      padding: '0px 10px 10px 10px',
      display: 'flex'
    },
    input: {
      height: '40px',
      borderRadius: '4px',
      fontSize: '18px',
      padding: '6px',
      boxSizing: 'border-box'
    },
    button: {
      cursor: 'pointer'
    },
    list: {
      marginTop: '20px',
      marginBottom: '20px',
      overflowX: 'auto'
    },
    tableStyle: {
      backgroundColor: '#fff'
    },
    shipmentList: {
      position: 'absolute',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: 0,
      paddingLeft: '10px',
      paddingRight: '10px',
      overflow: 'auto'
    },
    highlightCell: {
      backgroundColor: 'rgba(136, 127, 255, 0.1)'
    },
    panel: {
      height: '100%',
      float: 'left',
      padding: '8px',
      boxSizing: 'border-box',
    },
    innerBox: {
      height: '100%',
      backgroundColor: Colors.veryLightGrey,
      overflow: 'hidden',
      position: 'relative'
    },
    bottomBox: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '325px',
      backgroundColor: '#fff',
      borderTop: 'solid 1px #ccc',
    },
    boxContent: {
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      bottom: '325px',
    },
    label: {
      display: 'inline-block',
      fontFamily: 'AvenirNext-Medium',
      fontSize: '18px',
      fontWeight: '500',
      color: '#3b3b3b',
    },
    searchBar: {
      paddingRight: '180px',
      boxSizing: 'border-box',
      position: 'relative'
    },
    searchButton: {
      position: 'absolute',
      top: 0,
      marginTop: 0,
      paddingRight: 0,
      right: 0,
      width: '170px',
      height: '41px',
  },
  searchBox: {
    width: '100%',
    height: '46px'
  },
  wrapTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '15px 0'
  },
  title: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 26,
    color: '#4a4a4a',
    paddingRight: 15
  },
  iconDownload: {
    width: 20,
    height: 20,
    fontSize: 20,
    color: '#FFF',
    cursor: 'pointer',
    padding: 10,
    background: '#887fff',
    borderRadius: 100
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  pagination: {
    padding: '10px 0'
  },
  actionButton: {
    margin: '3px'
  },
  confirmBoxStyle: {
    resize: 'vertical',
    minHeight: 85
  },
  confirmBoxContainerStyle: {
    padding: '0 15px',
    marginTop: 20
  },
  actionControls: {
    display: 'flex',
    alignItems: 'center'
  },
  modalDriverProfileContainer: {
    width: 900,
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },
  categoryWrap: {
    margin: "0px 15px",
  },
  category: {
    fontSize: '14px',
    width: '100%',
    margin: '20px 0px 0px',
    textAlign: 'left',
    color: '#96979a',
    fontWeight: 600
  },
  outlinedInput: {
    backgroundColor: '#fff',
    fontWeight: 600,
    fontSize: '17px',
    borderRadius: 0,
  }
}
