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
  padding: 0 0 20px;
`;
export const GroupActions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;
export const Scrollable = styled.div`
  height: 100%;  
  overflow-y: scroll;
  margin-right: -17px;
`;
export const Text = styled.div``;
export const ListActive = styled.div``;
export const ActiveMember = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background: #e2e2e2;
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
export const Name = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
export const CodeId = styled.span`
  font-size: 12px;
  background: #f7f2a0;
  padding: 2px 6px;
  color: #a7a7a7;
`;

export const UserName = styled.span``;

export const Column = styled.span`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const CheckBox = styled.input`

`;

export const LoadingContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export default {
  actionButton: {
    marginLeft: 3,
    marginRight: 3
  }
}