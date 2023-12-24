import styled from 'styled-components';

export const Container = styled.div`
  padding: 15px;
`;
export const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
export const Tab = styled.div`
  padding: 5px 5px 5px;
  margin: 0 5px;
  border-bottom: 2px solid transparent;
  //border-bottom: 2px solid #887fff;
  font-family: 'AvenirNext-DemiBold';
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #4a4a4a;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  &.active {
    border-bottom: 3px solid #887fff;
  }
`;
export const Content = styled.div`
  padding: 7.5px;
`;
export const Box = styled.div`
  padding: 15px;
  margin: 7.5px;
  border-radius: 5px;
  border: solid 1px #ededed;
  background-color: #ffffff;
  box-sizing: border-box;
  height: calc(100% - 15px);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
export const BoxClient = styled(Box)`
  flex-direction: row;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
export const Text = styled.div`
  font-family: 'AvenirNext';
  font-size: 12px;
  font-weight: 600;
  color: #bebfc0;
  text-align: center;
`;
export const Text_1 = styled(Text)`
  text-align: left;
`;
export const Text_2 = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  font-size: 25px;
  color: #3b3b3b;
`;
export const Text_3 = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  font-size: 18px;
  color: #3b3b3b;
`;
export const Label = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  color: #bebfc0;
  text-transform: uppercase;
  margin-bottom: 10px;
`;
export const LabelClient = styled(Label)`
  margin: 0 15px 0 0;
`;
export const ClientList = styled.div`
  flex: 1;
  display: flex;
`;
export const ClientLogo = styled.img`
  margin: 0 5px;
`;

export default {
  colShipmentInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  col: {
    flex: 1,
    height: '100%'
  },
  row: {
    flex: 1
  }
}
