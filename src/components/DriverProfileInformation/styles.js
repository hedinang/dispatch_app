import styled from 'styled-components';
import { AxlModal } from 'axl-reactjs-ui';

export const Container = styled.div``;
export const DriverInfoContainer = styled.div`
  margin-right: 20px;
`;
export const DriverAvatar = styled.div`
  width: 200px;
  height: 200px;
  background-color: #d8d8d8;
  text-align: center;
`;
export const Avatar = styled.img`
  max-height: 200px;
  max-width: 200px;
`;
export const TableContainer = styled.div``;
export const RatingContainer = styled.div`
  margin: 10px 0 20px;
  text-align: left;
`;
export const DriverNameContainer = styled.div`
  display: flex;
  align-items: center;
`;
export const DriverTabs = styled.div``;
export const DriverTabTitle = styled.div``;
export const DriverTabContent = styled.div``;
export const Text = styled.div`
  font-family: 'AvenirNext';
  font-size: 14px;
  font-weight: 500;
  color: #4a4a4a;
  text-align: left;
`;
export const Text_1 = styled(Text)`
  color: #000000;
  word-break: break-all;
`;
export const DriverSince = styled(Text)`
  font-family: 'AvenirNext-Medium';
  color: #bebfc0;
  font-size: 11px;
  text-align: center;
  margin-top: 5px;
`;
export const DriverName = styled(Text)`
  font-size: 30px;
  font-family: 'AvenirNext';
  text-align: center;
`;
export const DriverId = styled(Text)`
  font-size: 30px;
  font-family: 'AvenirNext';
  color: #96979a;
  margin: 0 5px;
`;
export const DriverLabel = styled(Text)`
  text-align: left;
  color: #bebfc0;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 5px;
`;
export const DriverRegion = styled(Text)`
  border-radius: 5px;
  padding: 2px 10px;
  background-color: #50e3c2;
  font-size: 13px;
  color: #FFF;
`;
export const LabelStatus = styled(Text)`
  font-size: 10px;
  color: #848484;
  text-align: right;
`;
export const Status = styled.span`
  font-size: 15px;
  color: #4abc4e;
  font-style: italic;
  font-family: 'AvenirNext-DemiBoldItalic';
`;
export const PoolText = styled.span`
  text-transform: uppercase;
`;

export default {
  modalContainer: {
    width: 900,
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },
  driverRow: {
    marginBottom: 10
  }
}
