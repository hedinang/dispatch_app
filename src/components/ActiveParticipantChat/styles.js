import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
export const Title = styled.div`
  font-family: 'AvenirNext-DemiBold';
  font-size: 20px;
  font-weight: 600;
  color: #4a4a4a;
  text-align: left;
  padding: 0 25px;
  margin: 20px 0 15px;
`;
export const Inner = styled.div`
  flex: 1;
  overflow: hidden;
  padding: 0 20px 20px;
`;
export const Scrollable = styled.div`
  height: 100%;  
  overflow-y: scroll;
  margin-right: -17px;
`;
export const Text = styled.div``;
export const ListActive = styled.div``;
export const ActiveMember = styled.div`
  text-align: left;
  margin-bottom: 15px;
  &:nth-last-child(1) {
    margin-bottom: 0;
  }
`;
export const Avatar = styled.span`
  display: inline-block;
  width: 30px;
  height: 30px;
  background: #e8e8e8;
  border-radius: 50%;
  overflow: hidden;
  text-align: center;
  vertical-align: middle;
  margin: 0 10px 0 0;
`;
export const AvatarImage = styled.img`
  width: 100%;
  height: auto;
`;
export const Name = styled.span`
  display: inline-block;
`;
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center; 
`;

export default {}