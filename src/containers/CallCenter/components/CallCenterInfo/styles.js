import styled from "styled-components";

export const Container = styled.div`
  border-radius: 2px;
  background-color: #5b558e;
  padding: 15px 15px 30px;
  text-align: left;
  margin-bottom: 15px;
`;
export const StatusContainer = styled.div`
  margin-bottom: 30px;
`;
export const StatusRow = styled.div`
  display: flex;
  flex-direction: row;
`;
export const StatusInfo = styled.div`
  flex: 1;
`;
export const CallInfo = styled.div`
  text-align: left;
`;
export const StatusText = styled.span`
  font-size: 16px;
  letter-spacing: 0.12px;
  color: #ffffff;
`;
export const StatusValue = styled.span`
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.15px;
  color: #ffffff;
`;
export const CallText = styled(StatusText)`
  display: inline-block;
  width: 120px;
`;
export const ProcessContainer = styled.div`
  width: 100%;
  height: 10px;
  position: relative;
  border-radius: 11px;
  background-color: #ffffff;
  margin-top: 20px;
`;
export const Proccer = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  background: #9f97ff;  
  &:after {
    content: "";
    display: inline-block;
    width: 11px;
    height: 5px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    transform: rotate(-45deg);
    border-bottom: 2px solid #FFF;
    border-left: 2px solid #FFF;
  }
  &.success {
    background: #4abc4e;
  }
  &.fail {
    background: #d0021b;
    &:after {
      content: "";
      border: none;
      display: inline-block;
      width: 15px;
      height: 2px;
      background: #FFF;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      transform: rotate(45deg);
    }
    &:before {
      content: "";
      border: none;
      display: inline-block;
      width: 15px;
      height: 2px;
      background: #FFF;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      transform: rotate(-45deg);
    }
  }
`;
export const BubbleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;
export const BubbleText = styled.span`
  border-radius: 50%;
  background: #FFF;
  width: 25px;
  height: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin: 3px;
  :nth-child(1) {
    background: yellow;
  }
`;
export const BubbleTextSpan = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;
export const BubbleSpan = styled.span`
  color: #FFF;
`;
export const BullesContainer = styled(BubbleContainer)``;

export default {}