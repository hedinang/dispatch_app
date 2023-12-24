import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
export const Flex = styled.div`
  flex: 1;
`;
export const Inner = styled(Container)`
  flex: 1;
  flex-flow: row wrap;
`;
export const Button = styled.button`
  height: 20px;
  padding: 0px 10px;
  margin: 0 3px 3px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 #cccccc;
  background-color: #4a90e2;
  border: none;
  box-sizing: border-box;
  color: #FFF;
  font-size: 11px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  outline: none;
`;
export const ButtonMessage = styled(Button)`
  background-color: #6c62f5;
`;
export const Text = styled.span`
  flex: 1;
  margin: 0 5px;
  font-family: 'AvenirNext-DemiBold';
  font-size: 12px;
  line-height: 14px;
`;
export const TextMessage = styled(Text)`
  margin-top: -2px;
`;
export const LabelContainer = styled.span`
  font-size: 18px;
  margin-right: 10px;
  color: #8d8d8d;
`;
export const ClearText = styled.span`
  font-family: 'AvenirNext-DemiBold';
  font-size: 12px;
  font-weight: 600;
  color: #4a90e2;
  cursor: pointer;
`;
export const ImageMessage = styled.img`
  height: 12px;
`;