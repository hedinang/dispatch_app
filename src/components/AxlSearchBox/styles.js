import styled from 'styled-components';
import search from '../../images/search.png';

const ContainerStyle = {
  default: `
    width: 100%;
    position: relative;
  `,
  main: `
    width: 100%;
    position: relative;
  `,
  periwinkle: `
    width: 100%;
    position: relative;
  `,
  dropdown: `
    width: 100%;
    position: relative;
  `
}
const InputStyle = {
  default: `
    height: 35px;
    font-size: 17px;
    line-height: 36px;
    box-sizing: border-box;
    border-radius: 3px;
    padding: 4px 14px 4px 30px;
    border: solid 1px #CCC;
    outline: none;
    background-image: url(${search});
    background-repeat: no-repeat;
    background-position: 8px center;
    background-size: 13px;
    &::-webkit-input-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &::-moz-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &:-ms-input-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &:-moz-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
  `,
  main: ``,
  periwinkle: `
    height: 35px;
    font-size: 17px;
    line-height: 36px;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 4px 30px 4px 14px;
    border: solid 1px #887fff;
    outline: none;
    background-color: #fefefe;
    background-size: 17px;
    &::-webkit-input-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &::-moz-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &:-ms-input-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &:-moz-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
  `,
  dropdown: `
    height: 35px;
    font-size: 17px;
    line-height: 36px;
    box-sizing: border-box;
    border-radius: 3px;
    padding: 4px 14px 4px 45px;
    border: solid 1px #CCC;
    outline: none;
    background-repeat: no-repeat;
    background-position: 8px center;
    background-size: 17px;
    &::-webkit-input-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &::-moz-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &:-ms-input-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
    &:-moz-placeholder {
      font-size: 11px;
      color: #cfcfcf;
      font-family: "AvenirNext-Medium";
    }
  `,
};
const inputErrorStyle = {
  default: `
    border: solid 1px red;
    outline: none;
  `,
  main: `
    border: solid 1px red;
    outline: none;
  `,
  periwinkle: ``,
  dropdown: `
    border: solid 1px red;
    outline: none;
  `
};
const clearStyle = {
  default: `
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 10px;
    width: 12px;
    height: 12px;
    line-height: 0;
    cursor: pointer;
    &:before {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, 2px) rotate(45deg);
    }
    &:after {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, -3px) rotate(-45deg);
    }
  `,
  main: ``,
  periwinkle: `
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 10px;
    width: 12px;
    height: 12px;
    line-height: 0;
    cursor: pointer;
    &:before {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, 2px) rotate(45deg);
    }
    &:after {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, -3px) rotate(-45deg);
    }
  `,
  dropdown: `
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 10px;
    width: 12px;
    height: 12px;
    line-height: 0;
    cursor: pointer;
    &:before {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, 2px) rotate(45deg);
    }
    &:after {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, -3px) rotate(-45deg);
    }
  `
}
const ContainStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    position: relative;
  `,
};
const TagContainerStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    border-radius: 0 0 4px 4px;
    box-shadow: 0 0.5px 2px 0 rgba(0, 0, 0, 0.12);
    background-color: #fefefe;
    padding: 10px 15px;
  `,
};
const DropDownStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    position: absolute;
    margin: auto;
    left: 0;
    bottom: 0;
    cursor: pointer;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
};
const DropDownContainerStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    min-width: 200px;
    border-radius: 6px;
    box-shadow: 1px 2px 6px 0 #9b9b9b;
    background-color: #ffffff;
    position: absolute;
    top: 100%;
    z-index: 9;
    left: 0;
    text-align: left;
    margin-top: 15px;
  `,
};
const DropDownInnerStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    position: relative;
    padding: 10px 0;
    &:before {
      content: "";
      display: block;
      position: absolute;
      top: -15px;
      left: 22px;
      border-bottom: 8px solid #FFF;
      border-left: 8px solid transparent;
      border-top: 8px solid transparent;
      border-right: 8px solid transparent;
    }
  `,
};
const DropDownIconStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    width: 20px;
    height: 20px;
    margin: 0 15px;
  `,
};
const DropDownItemStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    display: flex;
    align-items: center;
    border-bottom: 1px solid #CCC;
    margin-bottom: 8px;
    padding-bottom: 8px;
    padding-right: 20px;
    cursor: pointer;
    font-family: 'AvenirNext-DemiBold';
    color: #aeaeae;
    font-size: 13px;
    &.last {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  `,
};
const CheckboxStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    width: 7px;
    height: 7px;
    border-radius: 2px;
    box-shadow: 0 0 1px 0 #9b9b9b;
    border: solid 1px #aeaeae;
    margin: 0 15px;
    display: inline-block;
    &.checked {
      border-radius: 50%;
      border-color: #4a9eff;
    }
  `,
};
const TextStyle = {
  default: ``,
  main: ``,
  periwinkle: ``,
  dropdown: `
    display: flex;
    align-items: center;
  `,
};


export const Input = styled.input`
  ${props => props.theme.type ? InputStyle[props.theme.type] : InputStyle.default}
  ${props => props.isError ? props.theme.type ? inputErrorStyle[props.theme.type] : inputErrorStyle.default : {}}
`;
export const Container = styled.div`${props => props.theme.type ? ContainerStyle[props.theme.type] : ContainerStyle.default}`;
export const Clear = styled.div`${props => props.theme.type ? clearStyle[props.theme.type] : clearStyle.default}`;
export const Contain = styled.div`${props => props.theme.type ? ContainStyle[props.theme.type] : ContainStyle.default}`;
export const TagContainer = styled.div`${props => props.theme.type ? TagContainerStyle[props.theme.type] : TagContainerStyle.default}`;
export const DropDown = styled.div`${props => props.theme.type ? DropDownStyle[props.theme.type] : DropDownStyle.default}`;
export const DropDownContainer = styled.div`${props => props.theme.type ? DropDownContainerStyle[props.theme.type] : DropDownContainerStyle.default}`;
export const DropDownInner = styled.div`${props => props.theme.type ? DropDownInnerStyle[props.theme.type] : DropDownInnerStyle.default}`;
export const DropDownIcon = styled.img`${props => props.theme.type ? DropDownIconStyle[props.theme.type] : DropDownIconStyle.default}`;
export const DropDownItem = styled.div`${props => props.theme.type ? DropDownItemStyle[props.theme.type] : DropDownItemStyle.default}`;
export const Checkbox = styled.div`${props => props.theme.type ? CheckboxStyle[props.theme.type] : CheckboxStyle.default}`;
export const Text = styled.div`${props => props.theme.type ? TextStyle[props.theme.type] : TextStyle.default}`;
