import styled from "styled-components";

export const Container = styled.div`
  border: solid 1px #aeaeae;
  background-color: #ffffff;
  padding: 15px;
  text-align: left;
`;
export const ClientContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;
export const ClientAvatarContainer = styled.div`
  margin-right: 15px;
`;
export const ClientAvatar = styled.img``;
export const ClientName = styled.div`
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.11px;
  color: #5a5a5a;
`;
export const ClientInfo = styled.div`
  flex: 1;
  text-align: left;
`;
export const TrackingContainer = styled.div``;
export const TrackingText = styled.div`
  font-size: 15px;
  line-height: 30px;
  letter-spacing: 0.08px;
  font-weight: normal;
  color: #b7b6b7;
`;
export const TrackingCode = styled.a`
  color: #7c7b7c;
  font-weight: 500;  
`;
export const HR = styled.hr`
  border: none;
  border-bottom: 1px solid #ccc;
`;
export const InfoContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
export const InfoContainer = styled.div`
  margin: 0 65px 30px;
  flex: ${props => props.flex ? 0.5 : 0};
`;
export const Label = styled.div`
  font-size: 15px;
  line-height: 30px;
  letter-spacing: 0.08px;
  color: #b7b6b7;
  display: ${props => props.inline ? 'inline-block' : 'block'};
`;
export const Text = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 30px;
  letter-spacing: 0.11px;
  color: #5a5a5a;
  display: ${props => props.inline ? 'inline-block' : 'block'};
`;
export const Label_1 = styled(Label)`
  color: #333;
  font-size: 18px;
  font-weight: normal;
  margin-bottom: 5px;
`;