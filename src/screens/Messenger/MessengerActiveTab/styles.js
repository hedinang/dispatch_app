import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
`;
export const Inner = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;
export const Scrollable = styled.div`
  margin: 0;
  overflow: hidden;
  direction: rtl;
  height: 100%;
  display: flex;
  flex-direction: column;
  > * {
    direction: ltr;
    overflow: hidden;
    flex: 0;
    overflow: visible;
    max-height: 50%;
    &:nth-last-child(1) {
      flex: 1;
      overflow: hidden;
      max-height: inherit;
    }
  }
`;
export const LoadMore = styled.div`
  cursor: pointer;
  padding: 8px 0;
  background: #FFF;
  font-size: 13px;
`;
export const SearchContainer = styled.div`
  padding: 10px 20px 10px 20px;
`;
export const MessageGroup = styled.div``;
export const Message = styled.div`
  display: flex;  
  padding: 10px 5px 10px 15px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  :hover {
    background-color: #aca6f5;
  }
`;
export const AccountName = styled.div`
  text-align: left;
  flex: 1;
  margin: 0 5px;
  font-family: 'AvenirNext-Bold';
  font-size: 15px;
  font-weight: bold;
  color: #545454;
  &.readed {
    font-family: 'AvenirNext-DemiBold';
    color: #696969;
    font-weight: normal;
  }
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
  &.readed {
    display: none;
  }
`;
export const Timer = styled.div`
  font-family: 'AvenirNext';
  font-size: 11px;
  color: #000000;
  width: 50px;
  margin: 0 10px 0 5px;
  text-align: right;
`;

export default {}