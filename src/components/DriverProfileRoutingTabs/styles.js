import styled from 'styled-components';

export const Container = styled.div`
`;
export const Inner = styled.div`
  border: solid 1px #e4e4e4;
  border-radius: 5px;
`;
export const TabHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #f4f4f4;
  border-bottom: solid 1px #e4e4e4;
  overflow-x: scroll;
  white-space: nowrap;
`;
export const TabContent = styled.div`
  position: relative;
  height: 392px;
  overflow: auto;
`;
export const TabGroupItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 50px;
`;
export const TabItem = styled.div`
  font-size: 18px;
  line-height: 21px;
  padding: 10px 20px;
  margin: 0 10px 0px;
  font-size: 14px;
  color: #4a4a4a;
  font-family: 'AvenirNext-DemiBold';
  cursor: pointer;
  border-bottom: 3px solid transparent;
  &.active {
    border-bottom: 3px solid #887fff;
  }
`;
export const TabIcon = styled.div`
  font-size: 18px;
  padding: 10px 5px;
  margin: 0 5px 0px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  &.active {
    border-bottom: 3px solid #887fff;
  }
`;
export const Control = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin: 10px 0 5px;
`;

export default {
  controlButton: {
    width: 150,
    padding: 0
  },
  loadingStyle: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    margin: 'auto'
  }
}
