import styled from 'styled-components';
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

export default {
  default: {
    container: {
      minWidth: 300,
      borderRadius: 5,
      boxShadow: '0 4px 10px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0eb'
    },
    dropdownButton: {
      padding: 0,
      margin: 0,
      minWidth: '175px',
      background: 0,
      border: 'none',
      boxShadow: 'none',
      borderBottom: '1px solid #887fff',
      fontFamily: 'AvenirNext-Bold',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#887fff',
      borderRadius: 0,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      outline: 'none',
      textAlign: 'left'
    },
    option: {
      borderTop: '1px solid #e3e5ea',
      padding: '12px 15px',
      fontFamily: 'Lato-Bold',
      fontSize: '14px',
      fontWeight: 'bold',
      letterSpacing: '-0.1px',
      color: '#9da5b6',
      cursor: 'pointer'
    },
    control: {
      border: '1px solid #e4e4e4',
      display: 'flex',
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
      alignItems: 'center',
      margin: 10,
      borderRadius: 3,
      backgroundColor: '#ffffff',
      padding: '3px 5px',
      position: 'relative'
    },
    menuList: {
      border: 'none',
      maxHeight: '600px',
      overflow: 'auto'
    },
    valueContainer: {
      flex: 1,
      position: 'relative'
    },
    input: {
      border: '1px solid transparent',
      marginLeft: 5,
      position: 'relative',
      zIndex: 1,
    },
    indicatorsContainer: {
      width: 24,
      height: 24
    },
    indicatorSeparator: {},
    dropdownIndicator: {
      width: 24,
      maxHeight: 24
    },
    singleValue: {},
    placeholder: {
      fontFamily: 'AvenirNext-Medium',
      fontSize: 12,
      fontWeight: 500,
      color: '#cfcfcf',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      margin: 'auto',
      padding: '3px 3px 3px 5px',
      zIndex: 0
    }
  },
  primary: {
    container: {
      minWidth: 200,
      borderRadius: '0 0 3px 3px',
      boxShadow: '0 4px 10px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0eb',
      marginTop: '-9px',
      boxSizing: 'border-box'
    },
    dropdownButton: {
      width: '100%',
      cursor: 'pointer',
      outline: 'none',
      borderRadius: '3px',
      border: 'solid 1px #ccc',
      backgroundColor: '#ffffff',
      display: 'flex',
      height: '45px',
      padding: '0 0 0 15px',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: '120px',
      fontFamily: 'AvenirNext-Medium',
      fontSize: '13px',
      textAlign: 'left',
      color: '#9b9b9b',
      position: 'relative',
      zIndex: 3
    },
    option: {
      borderTop: '1px solid #e3e5ea',
      padding: '12px 15px',
      fontFamily: 'Lato-Bold',
      fontSize: '14px',
      fontWeight: 'bold',
      letterSpacing: '-0.1px',
      color: '#9da5b6',
      cursor: 'pointer'
    },
    control: {
      border: '1px solid #e4e4e4',
      display: 'flex',
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
      alignItems: 'center',
      margin: 10,
      borderRadius: 3,
      backgroundColor: '#ffffff',
      padding: '3px 5px',
      position: 'relative'
    },
    menuList: {
      border: 'none',
      maxHeight: '600px',
      overflow: 'auto'
    },
    valueContainer: {
      flex: 1,
      position: 'relative'
    },
    input: {
      border: '1px solid transparent',
      marginLeft: 0,
      position: 'relative',
      zIndex: 1,
      width: '100%'
    },
    indicatorsContainer: {
      width: 24,
      height: 24
    },
    indicatorSeparator: {},
    dropdownIndicator: {
      width: 24,
      maxHeight: 24
    },
    singleValue: {},
    placeholder: {
      fontFamily: 'AvenirNext-Medium',
      fontSize: 12,
      fontWeight: 500,
      color: '#cfcfcf',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      margin: 'auto',
      padding: '3px 3px 3px 5px',
      zIndex: 0
    },
    dropdownButtonIcon: {
      background: 'red'
    }
  }
}

export const Container = styled.div`
  display: flex;
  align-items: center;
  margin: 0 10px;
`;

export const Label = styled.label`
  cursor: pointer;
`;

export const Checkbox = styled.span`
  width: 10px;
  height: 10px;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  display: inline-block;
  margin-right: 10px;
  vertical-align: -1px;
  &.checked {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    border: 2.5px solid #887fff;
    vertical-align: 0px;
  }
`;

export const ClearIcon = styled.span`
  width: 14px;
  height: 14px;
  cursor: pointer;
  margin: 0 0 0 15px;
  color: gray;
`;
export const ClearSearch = styled.span`
  width: 11px;
  height: 11px;
  cursor: pointer;
  margin: 0;
  color: gray;
  font-size: 10px;
`;
export const DropdownIconContainer = styled.span`
  display: flex;
  align-items: center;
`;
export const Controler = styled.div``;
export const IndicatorsContainer = styled.div``;
export const ClearIndicator = styled.div`
  width: 11px;
  height: 11px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  line-height: 0;
`;
