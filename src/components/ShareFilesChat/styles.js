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
  margin-right: -20px;
`;
export const Scrollable = styled.div`
  height: 100%;  
  overflow-y: scroll;
`;
export const GridFlex = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;
export const Flex = styled.div`
  width: 25%;
  overflow: hidden;
`;
export const ImageContainer = styled.div`
  background-color: #d8d8d8;
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
`;
export const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
`;
export const BackButton = styled.span`
  display: inline-block;
  margin-right: 10px;
  font-size: 27px;
  color: #989898;
  font-weight: normal;
  width: 25px;
  height: 25px;
  text-align: center;
  cursor: pointer;
  vertical-align: -2px;
  line-height: 0px;
`;
export const LoadingContainer = styled.div`
  flex: 1;
  align-items: center;
  justify-content: center;
  display: flex;
`;

export default  {}