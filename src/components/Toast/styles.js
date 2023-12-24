import styled from "styled-components";
import { ToastContainer } from 'react-toastify';

export const Container = styled.div`
  border-radius: 10px;
`;
export const Inner = styled.div`
`;
export const Content = styled.div``;
export const CloseButton = styled.div`
  position: absolute;
  top: 10px;
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
    height: 2px;
    background: #CCC;
    transform: translate(-1px, 2px) rotate(45deg);
  }
  &:after {
    content: "";
    display: inline-block;
    width: 12px;
    height: 2px;
    background: #CCC;
    transform: translate(-1px, -3px) rotate(-45deg);
  }
`;
export const HeaderPanel = styled.div`
  background: #6c62f5;
  font-family: AvenirNext-DemiBold;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  position: relative;
  position: relative;
`;
export const LeftPanel = styled.div`
  margin-right: 10px;
`;
export const RightPanel = styled.div``;
export const Logo = styled.img``;

export const ToastWrapper = styled(ToastContainer).attrs({
  toastClassName: 'toast-1',
  className: 'toast',
  bodyClassName: 'body',
  progressClassName: 'progress',
})`
  padding: 0;
  margin: 0;
  text-align: left;
  &.toast {
    padding: 0;
    margin: 0;
    border-radius: 8px;
    z-index: 999999;
  }
  toast-1 {
    position: relative;
  }
  .Toastify__toast-body {
    margin: 0;
    padding: 0;
  }
  .Toastify__toast-container--top-right {
    padding: 0;
    margin: 0;
    border-radius: 10px;
    overflow: hidden;
  }
  .Toastify__close-button {
    display: none;
  }
  .Toastify__toast-container {
    margin: 0;
    padding: 0;
  }
  .Toastify__toast {
    margin: 10px 0;
    padding: 0;
    cursor: auto;
    border-radius: 10px;
  }
  .toast {
    background-color: var(--color-black);
  }
  .body {
    background-color: var(--color-black);
    color: var(--color-white);
    font-family: var(--default-font-family);
  }
`;

export const ToastHeaderStyled = styled.div`
  position: relative;
  background-color: #6c62f5;
  padding: 8px 10px;
`;
export const ToastTitleStyled = styled.div`
  font-family: "AvenirNext-DemiBold";
  font-weight: 600;
  color: #ffffff;
  font-size: 13px;
`;

export const ToastContentStyled = styled.div`
  padding: 10px;
  font-family: "AvenirNext-MediumItalic";
  font-size: 12px;
  font-weight: 500;
  font-style: italic;
  color: #5a5a5a;
  b {
    font-family: 'AvenirNext-DemiBoldItalic';
  }
`;

export const ToastContainerStyled = styled.div`
  height: 100%;
`;

export const ToastCloseStyled = styled.div`
    position: absolute;
    top: 10px;
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
      transform: translate(-1px, 3px) rotate(45deg);
    }
    &:after {
      content: "";
      display: inline-block;
      width: 12px;
      height: 1px;
      background: #CCC;
      transform: translate(-1px, -2px) rotate(-45deg);
    }
`;

export default {
  toast: {
    background: "#000"
  }
}