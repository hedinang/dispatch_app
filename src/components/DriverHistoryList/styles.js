import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div``;
export const Inner = styled.div``;
export const List = styled.div`
  padding: 15px 40px;
  text-align: left;
`;
export const Item = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 7.5px 0 7.5px 20px;
  &:after {
    content: "";
    width: 1px;
    height: 100%;
    display: block;
    position: absolute;
    top: 20px;
    left: 4px;
    bottom: 0;
    background-color: ${Colors.veryLightPink};
  }
  &:nth-last-child(1) {
    &:after {
      display: none;
    }
  }
`;
export const Text = styled.div`
  flex: 1;
  font-family: 'AvenirNext';
  font-size: 12px;
  color: #4a4a4a;
`;
export const Circle = styled.div`
  width: 9px;
  height: 9px;
  display: inline-block;
  background-color: #96979a;
  border-radius: 50%;
  position: absolute;
  top: 12px;
  left: 0;
  margin: auto;
  z-index: 1;
`;
export const Date = styled.div`
  font-family: 'AvenirNext';
  font-size: 12px;
  color: #96979a;
`;
export const RemarkText = styled.div`
  font-family: 'AvenirNext-Italic';
  font-size: 12px;
  color: #4a4a4a;
`;
export default {
  status: {
    'PENDING': Colors.periwinkle,
    'SUCCEEDED': Colors.darkPastelGreen,
    'FAILED': Colors.dustyRed
  },
  action: {
    'book': Colors.darkPastelGreen,
    'un-book': Colors.dustyRed,
  }
}
