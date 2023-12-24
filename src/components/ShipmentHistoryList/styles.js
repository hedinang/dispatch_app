import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
export const SearchContainer = styled.div`
  margin: 0 0 5px;
`;
export const Inner = styled.div``;
export const List = styled.div``;
export const Item = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2px 0 7.5px 20px;
  &:after {
    content: "";
    width: 1px;
    height: 100%;
    display: block;
    position: absolute;
    top: 15px;
    left: 3px;
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
  width: 7px;
  height: 7px;
  display: inline-block;
  background-color: #96979a;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  left: 0;
  margin: auto;
  z-index: 1;
  cursor: pointer
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
    'STARTED': '#96979a',
    'CREATED': Colors.veryLightPink,
    'ASSIGNED': Colors.veryLightPink,
    'ROUTED': Colors.maize,
    'PICKUP_READY': Colors.maize,
    'DROPOFF_READY': Colors.maize,
    'PICKUP_SUCCEEDED': Colors.periwinkle,
    'PICKUPED': Colors.periwinkle,
    'SUCCESSED': Colors.darkPastelGreen,
    'DROPOFF_SUCCEEDED': Colors.darkPastelGreen,
    'SUCCEEDED': Colors.darkPastelGreen,
    'RECEIVED_OK': Colors.bluish,
    'DROPOFF_FAILED': '#c44',
    'PICKUP_FAILED': '#c44',
    'FAILED': '#c44',
  },
  strong: {
    fontFamily: 'AvenirNext-Bold'
  },
  coordinatesWrap: {
    marginRight: '5px',
    marginLeft: '5px'
  },
  updateStopWrap: {
    display: 'flex',
    flexDirection: 'row'
  }
}
