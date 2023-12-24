import styled from 'styled-components';

export const Container = styled.div`
  text-align: left;
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  margin-right: -34px;
  padding-right: 17px;
`;
export const InnerContainer = styled.div`
  padding: 20px;
`;
export const BoxMargin = styled.div`
  margin: 10px 0;
`;
export const Box = styled.div`
  padding: 10px 15px;
  border-radius: 6px;
  background-color: #f4f4f4;
  margin: 10px 0;
`;
export const AssignmentNoteBox = styled(Box)`
  cursor: pointer;
`;
export const MapContainer = styled.div`
  height: 200px;
`;
export const Text = styled.div`
  font-family: AvenirNext;
  font-size: 13px;
  color: #4a4a4a;
  margin-bottom: 5px;
`;
export const Text_1 = styled.span`
  font-family: 'AvenirNext-DemiBold';
  font-size: 22px;
  color: #4a4a4a;
  font-weight: 500;
  vertical-align: middle;
  line-height: 0;
`;
export const Text_2 = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  font-size: 18px;
  color: #8d8d8d;
  margin: 5px 0;
`;
export const Text_3 = styled(Text)`
  color: #5a5a5a;
  font-size: 14px;
  text-align: right;
`;
export const Text_4 = styled(Text)`
  font-size: 16px;
  text-align: right;
`;
export const Text_5 = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
`;
export const Text_6 = styled(Text)`
  font-family: AvenirNext-MediumItalic;
  font-size: 11px;
  font-weight: 500;
  font-style: italic;
  color: #6c62f5;
`;
export const Text_7 = styled(Text)`
  margin-bottom: 0;
`;
export const Text_8 = styled(Text)``;
export const AssignmentNote = styled(Text)`
  color: #6c62f5;
  font-size: 13px;
  vertical-align: middle;
  margin: 0;
`;
export const Label = styled.label`
  font-family: AvenirNext-Medium;
  font-size: 11px;
  font-weight: 600;
  color: #4a4a4a;
`;
export const AssignmentIdLabel = styled.span`
  font-family: 'AvenirNext-DemiBoldItalic';
  font-size: 10px;
  font-weight: 600;
  font-style: italic;
  color: #4a4a4a;
  border-radius: 3px;
  background-color: #cdc9fe;
  display: inline-block;
  margin: 0 10px;
  padding: 2px 5px;
  vertical-align: middle;
`;
export const Flex = styled.div`
  display: flex;
`;
export const Flex_Row = styled(Flex)`
  flex-direction: row;
`;
export const Flex_Row_Center = styled(Flex_Row)`
  align-items: center;
`;
export const Flex_Column = styled(Flex)`
  flex-direction: column;
`;
export const Flex_Item_Full = styled.div`
  flex: 1;
`;
export default {}