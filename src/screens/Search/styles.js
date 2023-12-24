import styled from 'styled-components';
import { Colors, AxlButton } from 'axl-reactjs-ui';

export const List = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0px;
`;
export const THead = styled.thead`
  background-color: #b7b2f5;
  border: 5px solid #e4e4e4;
  border-bottom-width: 10px;
`;
export const TBody = styled.tbody`
  margin-top: 10px;
`;
export const TR = styled.tr`
  &:hover {
    background-color: rgba(136, 127, 255, 0.1);
  }
`;
export const TH = styled.th`
  padding: 15px 10px;
  font-size: 11px;
  color: #FFF;
  font-family: 'AvenirNextLTPro-Heavy';
  font-style: normal;
  text-transform: uppercase;
  font-weight: normal;
  position: relative;
  background-color: ${Colors.lavender};
  &.left { text-align: left; }
  &.center { text-align: center; }
  &.right { text-align: right; }
  &.th-1 { width: 25%; }
  &.th-2 { width: 30%; }
  &.th-3 { width: 25%; }
  &.th-4 { width: 20%; }
  &.tick {
    background-color: rgba(136, 127, 255, 0.1);
  }
`;
export const TD = styled.td`
  font-size: 12px;
  color: rgb(74, 74, 74);
  font-family: AvenirNext;
  font-weight: 500;
  font-style: normal;
  border: 5px solid #e4e4e4;
  position: relative;
  &.th-1 { width: 25%; }
  &.th-2 { width: 30%; }
  &.th-3 { width: 25%; }
  &.th-4 { width: 20%; }
  &.tick {
    background-color: rgba(136, 127, 255, 0.1);
  }
`;
export const Text = styled.div`
  margin-bottom: 5px;
  font-family: 'AvenirNext-Medium';
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.1px;
  text-align: left;
  color: #4a4a4a;
  &.left { text-align: left; }
  &.center { text-align: center; }
  &.right { text-align: right; }
  &.word-break { word-break: break-word; }
`;
export const TextBold = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
`;
export const Label = styled(Text)`
  font-size: 10px;
  font-family: 'AvenirNext-Medium';
  color: #9b9b9b;
`;
export const Box = styled.div`
  &:after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid transparent;
  }
  &.tick {
    &:after {
      border: 1px solid ${(props) => props.color};
    }
  }
`;
export const BoxEmpty = styled.div`
  min-height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const Logo = styled.img``;
export const LogoContain = styled.div`
  margin: -10px;
  line-height: 0;
`;
export const Icon = styled.span`
  display: inline-block;
  margin-right: 10px;
  color: #b7b2f5;
`;
export const Link = styled.span`
  cursor: pointer;
  font-family: 'AvenirNext-Medium';
  font-size: 10px;
  font-weight: 500;
  letter-spacing: -0.1px;
  text-align: center;
  color: #9b9b9b;
  &:hover {
    text-decoration: underline;
  }
`;
export const Expand = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: ${Colors.bluish};
`;
export const Button = styled.button`
  border: none;
  background: none;
  outline: none;
  margin: 0 5px;
  padding: 0;
  cursor: pointer;
  width: 15px;
  height: 15px;
`;
export const IconImage = styled.img`
  width: 15px;
  height: auto;
`;

export const SearchContainer = styled.div`
  padding-right: 180px;
  box-sizing: border-box;
  position: relative;
  display: flex;
`;

export const SearchBar = styled.div`
  box-sizing: border-box;
  position: relative;
  display: flex;
  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export const DatePickerContainer = styled.div`
  background: #FFF;
  margin-right: 10px;
  div {
    height: 100%;
  }
`;

export const SearchInput = styled.div`
  flex: 1;
  @media (max-width: 767px) {
    margin: 15px 0;
  }
`;

export const SearchButton = styled.div`
  margin: 0;
  @media (min-width: 768px) {
    width: 170px;
    margin-left: 15px;
  }
`;

export default {
  colorStatus: {
    'ASSIGNED': '#5a5a5a',
    'CANCELLED_AFTER_PICKUP': '#d0021b',
    'CANCELLED_BEFORE_PICKUP': '#d0021b',
    'CREATED': '#5a5a5a',
    'DELIVERED': '#4abc4e',
    'DELIVERY_FAILED': '#d0021b',
    'DROPOFF_DELAY': '',
    'DROPOFF_EN_ROUTE': '',
    'DROPOFF_FAILED': '#d0021b',
    'DROPOFF_READY': '',
    'DROPOFF_SUCCEEDED': '#4abc4e',
    'EN_ROUTE': '',
    'GEOCODED': '#5a5a5a',
    'GEOCODE_FAILED': '#d0021b',
    'GEOCODE_FAILED_DROPOFF': '#d0021b',
    'GEOCODE_FAILED_PICKUP': '#d0021b',
    'GEOCODE_FAILED_WITH_SUGGESTIONS': '#d0021b',
    'PENDING': '#f5a623',
    'PICKUP_DELAY': '#f5a623',
    'PICKUP_EN_ROUTE': '',
    'PICKUP_FAILED': '#d0021b',
    'PICKUP_READY': '',
    'PICKUP_SUCCEEDED': '#4abc4e',
    'REATTEMPT_DELIVERED': '',
    'REATTEMPT_DELIVERY_FAILED': '#d0021b',
    'REATTEMPT_EN_ROUTE': '',
    'REATTEMPTING': '',
    'RECEIVED': '',
    'RETURN_DELAY': '',
    'RETURN_EN_ROUTE': '',
    'RETURN_READY': '',
    'RETURN_SUCCEEDED': '#4abc4e',
    'SUCCEEDED': '#4abc4e',
    'FAILED': '#d0021b',
  },
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
        backgroundColor: '#fff',
        marginTop: '20px',
        marginBottom: '20px'
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
        width: '100%',
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
        overflow: 'auto',
    },
    boxContent: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        bottom: '325px',
    },
    searchBar: {
        paddingRight: '180px',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex'
    },
    searchButton: {
      margin: 0,
      padding: 0,
      display: 'block'
    },
    label: {
        display: 'inline-block',
        fontFamily: 'AvenirNext-Medium',
        fontSize: '18px',
        fontWeight: '500',
        color: '#3b3b3b',
    },
    center: {
      textAlign: 'center'
    },
    left: {
      textAlign: 'left'
    },
    right: {
      textAlign: 'right'
    },
    colCenter: {
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    colStart: {
      justifyContent: 'flex-start'
    },
    colWhite: {
      backgroundColor: '#FFF'
    },
    modalContainer: {
      display: 'flex'
    },
    modalStyle: {
      width: '480px',
      display: 'block',
      overflow: 'initial',
      backgroundColor: 'transparent',
      margin: 'auto',
      boxShadow: 'none',
      zIndex: 100000
    },
    modalImageStyle: {
        width: '650px',
        backgroundColor: '#FFF',
        padding: '30px 0'
    },
    wrapImages: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 9999
    },
    imageShipment: {
        width: 'auto',
        maxWidth: '100%',
        // maxHeight: '100%',
        maxHeight: 'calc(100vh - 100px)',
        margin: 'auto',
        backgroundColor: '#FFF'
    },
    arrowButton: {
        width: '30px',
        height: '30px',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        margin: 'auto',
        zIndex: 10000,
        cursor: 'pointer'
    },
    arrowPrev: {
        left: 0
    },
    arrowNext: {
        right: 0
    },
    arrowIcon: {
      fontSize: '25px',
      color: '#fff'
    },
    panelBox: {
      position: 'relative',
      zIndex: 1
    },
    TDIndex: {
      zIndex: 1000
    },
    content: {
      position: 'absolute',
      bottom: '51px',
      left: 0,
      right: 0,
      top: 0,
      overflowY: 'scroll',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50px',
      boxSizing: 'border-box',
      padding: '5px',
      backgroundColor: Colors.veryLightGrey,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  }
}
