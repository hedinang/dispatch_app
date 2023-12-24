import styled from "styled-components";

export const Container = styled.div``;
export const Inner = styled.div``;
export const Box = styled.div`
  border-radius: 1px;
  background-color: #f7f7f7;
  padding: 8px 10px;
  margin: 5px 0 10px;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
export const Column = styled(Row)`
  flex-direction: column;
`;
export const Flex = styled.div`
  flex: 1;
`;
export const Text = styled.div`
  font-family: 'AvenirNext-Medium';
  font-size: 12px;
  font-weight: 500;
  color: #4a4a4a;
  margin-bottom: 5px;
`;
export const Date = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  font-size: 13px;
`;
export const Label = styled(Text)`
  color: #9b9b9b;
  font-size: 11;
`;
export const CustomerName = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  font-weight: 600;
  font-size: 16px;
`;
export const Link = styled.div`
  color: #4a90e2;
  font-size: 13px;
  text-decoration: underline;
  padding: 0 5px;
  font-weight: normal;
  font-family: 'AvenirNext-Medium';
  cursor: pointer;
`;
export const PadContainer = styled.div`
  padding: 0 5px;
`;
export const StatusText = styled.div`
  font-family: 'AvenirNext-DemiBoldItalic';
  font-size: 13px;
  font-weight: 600;
  font-style: italic;
  color: #4abc4e;
`;
export const HL = styled.span`
  display: inline-block;
  font-family: 'AvenirNext-DemiBoldItalic';
  font-size: 10px;
  font-weight: 600;
  font-style: italic;
  color: #4a4a4a;
  border-radius: 4px;
  background-color: #fff0cf;
  vertical-align: middle;
  margin: 0 3px;
  padding: 3px 8px;
  line-height: 1;
`;
export const ClientAvatar = styled.img`
  max-width: 100%;
  max-height: 100%;
`;
export const ClientContainer = styled.div`
  width: 25px;
`;
export const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  margin: auto;
`;
export const ImageContainer = styled.div`
  width: 40px;
`;
export const SliderContainer = styled.div`
  width: 500px;
  //height: 800px;
  max-width: calc(100vw - 150px);
  max-height: calc(100vh - 100px);
`;
export const SliderInner = styled.div`
  width: 100%;
  height: 800px;
  max-height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
`;
export const ImageSliderContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background: #747171;
`;
export const DescContainer = styled.div`
  padding: 10px 20px;
  background-color: #d8d8d8;
  text-align: center;
  font-family: 'AvenirNext-Medium';
  font-size: 10px;
  font-weight: 500;
  color: #4a4a4a;
`;
export const ButtonContainer = styled.div`
  text-align: center;
  margin-top: 10px;
`;
export const AddressContainer = styled.div`
  width: 500px;
`;
export const MapContainer = styled.div`
  height: 200px;
  width: 100%;
`;

export default {
  modalStyle: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  }
}