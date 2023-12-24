import styled from "styled-components";
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  padding: 10px;
  text-align: right;
`;
export const InnerScrollable = styled.div`
  overflow-y: hidden;
  white-space: nowrap;
  overflow-scrolling: touch;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
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
export const UserContainer = styled.div`
  flex: 1;
`;
export const ButtonLinkContainer = styled.div`
  margin-top: 4px;
  margin-bottom: 4px;
  padding-left: 5px;
  padding-right: 5px;
  display: inline-block;
`;
export const ButtonLink = styled.a`
  cursor: pointer;
  border-radius: 2px;
  border: 0.8px solid rgb(204,204,204);
  background-color: rgb(250,250,250);
  vertical-align: middle;
  padding: 0px 10px;
  font-family: 'AvenirNext-DemiBold';
  color: rgb(174,174,174);
  height: 32px;
  font-size: 13px;
  font-weight: 300;
  box-shadow: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
`;

export const Title = styled.div`
  font-family: 'AvenirNext-Bold';
  font-size: 28px;
  font-weight: 500;
  color: #4a4a4a;
  line-height: 1.3em;
  margin: 0 0 10px;
  padding: 0 15px;
  text-align: center;
`;

export const Text = styled.div`
  font-family: 'AvenirNext';
  font-size: 20px;
  letter-spacing: 0.4px;
  color: #707070;
  line-height: 1.3em;
  padding: 0 15px;
  text-align: center;
`;

export default {
  buttonWrap: {
    margin: '0 1px 10px',
  },
  buttonControl: {
    minWidth: 200,
    padding: '0 5px',
    margin: '0'
  },
  cancleButton: {
    minWidth: 75
  },
  buttonCounter: {
    position: 'relative'
  }
}