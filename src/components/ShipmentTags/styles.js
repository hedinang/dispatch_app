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
  margin-bottom: 30px;
`;
export const Col = styled.div`
  flex: 1;
`;
export const Title = styled.h1`
  font-family: 'AvenirNext-Bold';
  font-size: 25px;
  font-weight: 500;
  letter-spacing: -0.1px;
  text-align: center;
  color: ${Colors.greyishBrown};
  text-align: left;
  margin-top: 0;
  padding-top: 0;
`;
export const Label = styled.div`
  width: 95px;
  font-family: 'AvenirNext-Medium';
  font-size: 22px;
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
    minHeight: 220
  },
  col: {
    paddingTop: 10
  }
}
