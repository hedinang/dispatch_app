import styled from 'styled-components';

export const Container = styled.div`
  text-align: left;
  width: 600px;
  max-width: 100%;
  padding: 0 15px;
`;
export const Inner = styled.div``;
export const Title = styled.div`
  font-family: AvenirNext-Bold;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: -0.09px;
  color: #4a4a4a;
  margin: 5px 0 15px;
`;
export const Label = styled.div`
  font-family: AvenirNext-DemiBold;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.07px;
  color: #707070;
  margin: 5px 0 10px;
`;
export const GroupInput = styled.div`
  margin: 5px 0 10px;
`;
export const Input = styled.div``;
export const Controls = styled.div`
  text-align: right;
`;
export const Control = styled.div``;

export default {
  buttonStyle: {
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 3,
    marginRight: 3,
    minWidth: 85,
    fontSize: 10,
    verticalAlign: 'middle',
  }
}