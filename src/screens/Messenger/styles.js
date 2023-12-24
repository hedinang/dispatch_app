import styled from "styled-components";
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  border: solid 1px rgba(151, 151, 151, 0.3);
`;
export const BoxFlex = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 117px);
`;
export const LeftPanel = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  background-color: ${Colors.lightBlueTwo};
`;
export const TabList = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 7px 15px 0px;
  border-bottom: 1px solid #e4e4e4;
`;
export const TabItem = styled.div`
  font-family: 'AvenirNext-Medium';
  font-size: 26px;
  font-weight: 500;
  color: #5e5e5e;
  flex: 1;
  position: relative;
  padding-bottom: 10px;
  margin: 0 8px;
  text-align: center;
  cursor: pointer;
  :before {}
  :after {
    content: "";
    width: 100%;
    height: 6px;
    display: block;
    border-radius: 6px;
    background-color: transparent;
    position: absolute;
    bottom: -4px;
  }
  &.active {
    :after {
      background-color: #6c62f5;
    }
  }
`;
export const TabContent = styled.div`
  flex: 1;
  overflow: hidden;
`;
export const Dotted = styled.div`
  display: inline-block;
  width: 7px;
  height: 7px;
  background-color: #6c62f5;
  position: absolute;
  top: 0;
  bottom: 6px;
  right: 0px;
  margin: auto;
  border-radius: 50%;
`;
export const Counter = styled.div`
  box-shadow: 0 1px 2px 0 rgba(204,204,204,0.35);
  background-color: #6c62f5;
  font-family: 'AvenirNext-Bold';
  font-size: 8px;
  font-weight: bold;
  color: #ffffff;
  padding: 3px 9px;
  border-radius: 8px;
  vertical-align: middle;
  display: inline-block;
  margin-left: 10px;
`;
export const MainPanel = styled.div`
  // flex: 1;
  width: calc(100vw - 344px);
  background-color: ${Colors.white};
  position: relative;
  // overflow: hidden;
`;
export const LoadingContainer = styled.div`
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;  
`;

export default {}