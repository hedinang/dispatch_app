import styled from "styled-components";

export const Container = styled.div`
  text-align: left;
`;
export const StatusContainer = styled.div`
  margin-bottom: 30px;
`;
export const StatusRow = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 2px;
  background-color: #5b558e;
  padding: 15px 15px 30px;
  margin-bottom: 30px;
`;
export const StatusInfo = styled.div`
  flex: 1;
`;
export const CallInfo = styled.div`
  text-align: left;
`;
export const StatusText = styled.span`
  font-size: 16px;
  letter-spacing: 0.12px;
  color: #ffffff;
`;
export const StatusValue = styled.span`
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.15px;
  color: #ffffff;
`;
export const CallText = styled(StatusText)`
  display: inline-block;
  width: 120px;
`;
export const Inner = styled.div``;
export const Item = styled.div`
  background: #FFF;
  margin-bottom: 5px;
  cursor: pointer;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
export const Flex = styled.div``;
export const ClientContainer = styled.div``;
export const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  line-height: 0;
`;
export const Avatar = styled.img``;
export const ShipmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 10px 15px;
`;
export const AddressContainer = styled(ShipmentContainer)`
  justify-content: flex-start;
`;
export const Label = styled.span`
  font-family: 'AvenirNext-DemiBold';
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.62px;
  color: #9b9b9b;
`;
export const Text = styled.span`
  font-family: 'AvenirNext-DemiBold';
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #5a5a5a;
`;
export const Label_1 = styled(Label)`
  font-size: 15px;
  line-height: 2em;
`;
export const Text_1 = styled(Text)`
  font-size: 16px;
  line-height: 2em;
`;
export const HR = styled.hr`
  border: none;
  margin: 15px 0;
  border-bottom: 1px solid #ccc;
`;
export const CustomerContainer = styled.div`
  background: #FFF;
  padding: 10px 15px;
`;

export default {}