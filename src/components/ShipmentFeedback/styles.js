import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  overflow: hidden;
  height: 100%;
`;
export const Inner = styled.div`
  overflow-y: scroll;
  height: 100%;
  padding: 30px 17px 30px 25px;
  box-sizing: border-box;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 8px;
`;
export const Col = styled.div``;
export const Label = styled.div`
  width: 65px;
  font-family: 'AvenirNext-Medium';
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.1px;
  text-align: center;
  color: ${Colors.greyishBrown};
  text-align: left;
`;
export const Content = styled.div`
  flex: 1;
`;
export const Control = styled.div`
  margin-bottom: 5px;
`;

export default {
  container: {},
  textarea: {
    resize: 'vertical',
    minHeight: 100,
    fontSize: 12.5,
    color: '#8d8d8d',
  }
}
