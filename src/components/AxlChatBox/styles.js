import styled from "styled-components";

export const Container = styled.div`
  margin-bottom: 15px;
  padding: 13px 45px 13px 5px;
  position: relative;
  max-width: 75%;
  min-width: 70px;
  margin-left: ${props => props.float ? 'auto' : '0px'};
  text-align: ${props => props.float ? 'right' : 'left'};
  padding-right: ${props => props.float ? '45px' : '0px'};
  padding-left: ${props => props.float ? '0px' : '45px'};
`;
export const Inner = styled.span`
  border-radius: 7.5px;
  padding: 7px 15px;
  max-width: 100%;
  text-align: left;
  display: inline-block;
  background-color: ${props => (props.theme && theme[props.theme.name]) ? theme[props.theme.name]['bgColor']: '#f4f5f4'};
`;
export const Text = styled.span`
  font-family: 'AvenirNext-Medium';
  font-weight: 500;
  line-height: 1.5em;
  font-size: 13px;
  word-break: break-word;
  color: ${props => (props.theme && theme[props.theme.name]) ? theme[props.theme.name]['txtColor'] : '#393060'};
`;
export const Profile = styled.div`
  min-width: 130px;
  position: absolute;
  bottom: ${props => props.theme.name !== 'me' ? '-5px' : 'inherit'};
  ${props => props.float ? 'right' : 'left'}: 0px;
  display: flex;
  align-items: flex-end;
  flex-direction: ${props => props.float ? 'row' : 'row-reverse'};
`;
export const WrapAvatar = styled.div`
  position: relative;
  min-width: 30px;
  min-height: 30px;
`;
export const Avatar = styled.div`
  display: flex;
  width: 30px;
  height: 30px;
  background: #e8e8e8;
  border-radius: 50%;
  overflow: hidden;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
export const AvatarImage = styled.img`
  width: 100%;
  height: auto;
`;
export const Name = styled.div`
  font-family: 'AvenirNext-Medium';
  letter-spacing: 0.24px;
  color: #393060;
  font-size: 9px;
  margin-right: 5px;
  text-transform: capitalize;
  margin: 0 12px;
`;
export const TS = styled.div`
  position: absolute;
  font-size: 10px;
  width: 100%;
  text-align: center;
`;
export const ImageInlineContainer = styled.div`
  cursor: pointer;
  height: 70px;
`;
export const ImageInline = styled.img`
  max-height: 50px;
`;

const theme = {
  'me': {
    bgColor: '#8178ee',
    txtColor: '#FFF'
  },
  'guest': {
    bgColor: '#f4f5f4',
    txtColor: '#393060'
  }
};

export default {}