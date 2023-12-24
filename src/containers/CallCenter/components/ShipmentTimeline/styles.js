import styled from "styled-components";

export const Container = styled.div`
  border: solid 0.3px #aeaeae;
  background-color: #ffffff;
  padding: 30px;
`;
export const Inner = styled.div``;
export const Item = styled.div`
  padding: 20px 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  &:nth-last-child(1) {
    .line { display: none; }
  }
`;
export const DateTime = styled.div`
  width: 120px;
`;
export const Date = styled.div`
  font-family: "AvenirNext-DemiBold";
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  color: #5e5e5e;
`;
export const Time = styled.div`
  font-family: "AvenirNext-DemiBold";
  font-size: 11px;
  font-weight: 600;
  text-align: right;
  color: #858485;
`;
export const StatusContainer = styled.div`
  width: 30px;
  padding: 0 30px;
  position: relative;
  height: 100%;
`;
export const Status = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #aca6f5;
  position: relative;
  &.success {
    background: #4abc4e;
  }
  &.fail {
    background: #d0021b;
  }
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
`;
export const Line = styled.div`
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    display: block;
    width: 5px;
    height: calc(100% + 40px);
    background: rgba(204, 204, 204, 0.4);
    margin: 0 auto;
`;
export const Text = styled.div`
  font-family: "AvenirNext-Medium";
  font-size: 14px;
  color: #8d8d8d;
  line-height: 1.3em;
  flex: 1;
`;

export default {}