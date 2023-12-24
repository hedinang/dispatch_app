import styled from "styled-components";
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  box-shadow: -1px 1px 5px 2px rgba(141, 141, 141, 0.24);
  border: solid 0.5px #979797;
  top: 60px;
  right: 0px;
  width: 500px;
  max-width: 100%;
  box-sizing: border-box;
  z-index: 999;
  background-color: ${Colors.white};
  ${props => props.nofly ? ContainerFlyStyle.nofly : ContainerFlyStyle.fly}
  @media(max-width: 1280px) {  
    width: auto;
    max-width: 500px;
  }
  @media(max-width: 960px) {
    max-width: 90%;
    ${props => ContainerFlyStyle.fly}
  }
`;

const ContainerFlyStyle = {
  fly: `
    position: absolute;
    height: 600px;
    max-height: calc(100% - 200px);      
  `,
  nofly: `
    position: static;
    height: 100%;
    max-height: 100%;
    border-right: none;
    border-bottom: none;
  `
}

export default {}