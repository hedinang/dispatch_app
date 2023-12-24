import styled from "styled-components";

export const Container = styled.div``;
export const Inner = styled.div`
  text-align: left;
  margin-bottom: 15px;
  border: 1px solid rgb(228,228,228);
  border-radius: 5px;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 30px;
`;
export const Col = styled.div`
  flex: 1;
`;
export const Col_Right = styled(Col)`
  display: flex;
  justify-content: flex-end;
`;
export const Title = styled.div`
  font-size: 20px;
  color: #4a4a4a;
  font-family: 'AvenirNext-Medium';
  margin-bottom: 10px;
  line-height: 32px;
  background: #f4f4f4;
  padding: 10px 30px;
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
export const Text_0 = styled.div`
  font-size: 20px;
  color: #4a4a4a;
  font-family: 'AvenirNext-Medium';
  margin-bottom: 10px;
  line-height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;
export const Text_1 = styled.div``;
export const Text_2 = styled.span`
  font-size: 9px;
  background: #fbf6c0;
  color: gray;
  display: inline-block;
  padding: 0px 6px;
  margin: 0 10px;
  border-radius: 3px;
`;
export const ViewDispatchButton = styled.a`
  width: 73px;
  height: 50px;
  border-radius: 3px;
  background-color: rgb(157,165,182);
  color: rgb(255,255,255);
  font-size: 13px;
  font-family: AvenirNext;
  font-weight: 300;
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  text-align: center;
  text-decoration: none;
  justify-content: center;
  align-items: center;
`;

export default {}