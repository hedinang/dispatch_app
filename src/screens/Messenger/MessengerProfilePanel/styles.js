import styled from "styled-components";

export const Container = styled.div``;
export const ProfileContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
`;
export const ProfileAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #8178ee;
  position: relative;
  overflow: hidden;
  &.client-size-1 img {
    width: 100%;
    &:nth-child(1) {top: 0; left: 0;}
  }
  &.client-size-2 img {
    width: 100%;
    &:nth-child(1) {bottom: 50%;left: 0;}
    &:nth-child(2) {top: 50%;left: 0;}
  }
  &.client-size-3 img {
    width: 50%;
    &:nth-child(1) {top:0;left:0;}
    &:nth-child(2) {top:0;right:0;}
    &:nth-child(3) {bottom:0;left:0;right:0;margin: 0 auto;}
  }
  &.client-size-4 img {
    width: 50;
    &:nth-child(1) {top:0;left:0;}
    &:nth-child(2) {top:0;right:0;}
    &:nth-child(3) {bottom:0;left:0;}
    &:nth-child(4) {bottom:0;right:0;}
  }
`;
export const DriverProfileImage = styled.img`
  max-width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  cursor: pointer;
`;
export const ProfileAvatarImage = styled.img`
  width: 50%;
  height: auto;
  position: absolute;
`;
export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
export const Text = styled.div`
  font-family: 'AvenirNext-DemiBold';
  font-size: 17.5px;
  font-weight: 600;
  color: #4a4a4a;
  margin: 0 15px;
`;
export const Title = styled(Text)``;
export const SubTitle = styled(Text)`
  font-family: 'AvenirNext-Medium';
  font-size: 12.5px;
  font-weight: 500;
  color: #4a4a4a;
`;
export const DriverID = styled(Text)`
  font-size: 12px;
`;

export const DriverProfileButton = styled.div`
  display: inline-block;
  padding: 2px 7px;
  margin: 0 5px;
  border-radius: 10px;
  border: 1px solid #4a90e2;
  font-family: AvenirNext-Medium;
  font-size: 9px;
  font-weight: 600;
  color: #4a90e2;
  cursor: pointer;
`;

export default {
  modalDriverProfileContainer: {
    width: 900,
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  }
}