import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  height: 100%;
`;
export const Inner = styled.div`
  height: 100%;
  padding: 10px 25px 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
`;
export const Top = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 0;
`;
export const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
export const ShipmentDetailPanel = styled.div`
  min-height: 180px;
  border-radius: 3px;
  margin-bottom: 15px;
  box-sizing: border-box;
  text-align: left;
`;
export const ShipmentDetailInfo = styled.div`
  flex: 1;
  margin-right: -25px;
  padding-right: 17px;
  margin-bottom: 5px;
  position: relative;
  padding-top: 15px;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
export const Col = styled.div`
  flex: 1;
`;
export const Left = styled.div`
  text-align: left;
`;
export const Text = styled.div`
  font-size: 12px;
  margin-bottom: 5px;
`;
export const StatusText = styled.span`
  color: #000;
  position: absolute;
  top: 0;
  right: 35px;
  font-size: 10px;
`;

export const WarningBox = styled.div`
  border: solid 1px #a32;
  background-color: #fff4f4;
  border-radius: 6px;
  margin: 12px 0px;
  padding: 8px;
  line-height: 1.5;
  font-size: 15px;
`;

export const WorkloadInformation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
  justify-content: center;
  padding: 6px 15px;
  background-color: rgb(244, 244, 244);
  border-radius: 6px;
  font-family: AvenirNext-Medium;
  font-size: 14px;
  margin: 8px 8px 8px 0;
`;

export default {
  Status: {
    DEFAULT: Colors.veryLightPink,
    PENDING: Colors.reddishOrange,
    DELIVERED: Colors.reddishOrange,
    DROPOFF_SUCCEEDED: Colors.darkPastelGreen,
    PICKUP_SUCCEEDED: Colors.darkPastelGreen,
    SUCCEEDED: Colors.darkPastelGreen,
    FAILED: Colors.dustyRed,
    CANCELLED_BEFORE_PICKUP: Colors.dustyRed,
    PICKUP_FAILED: Colors.dustyRed,
    DROPOFF_FAILED: Colors.dustyRed
  },
  textarea: {
    resize: 'vertical',
    minHeight: 120
  },
  control: {
    minWidth: 100
  },
  cancel: {
    width: 80
  },
  search: {
    height: 32,
    width: 150
  },
  assignmentLabel: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'AvenirNext-DemiBold'
  },
  assignmentId: {
    backgroundColor: 'rgba(136, 127, 255, 0.5)',
    display: 'inline-block',
    padding: '4px 7px',
    margin: '2px 4px 2px 4px',
    borderRadius: '3px',
    color: '#3b3b3b',
    fontSize: '10px',
    fontWeight: 700,
  },
}
