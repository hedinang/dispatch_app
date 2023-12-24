import styled from "styled-components";
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  text-align: right;
  flex: 1;
`;
export const InnerScrollable = styled.div`
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
`;
export const MemberCount = styled.span`
  font-family: AvenirNext;
  font-size: 9.5px;
  font-weight: 600;
  text-align: center;
  top: 2px;
  right: 7px;
  position: absolute;
  color: ${Colors.warmGrey};
`;

export default {
  buttonWrap: {
    margin: '0 1px 10px',
  },
  buttonCounter: {
    position: 'relative'
  }
}