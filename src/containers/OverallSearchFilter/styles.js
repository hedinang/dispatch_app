import { Fragment } from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  display: flex;
  @media(max-width: 991px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

export const GroupField = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

export const Label = styled.label`
  display: inline-block;
  font-family: 'AvenirNext';
  font-size: 18px;
  color: #3b3b3b;
  margin: 0 10px;
  @media(max-width: 991px) {
    min-width: 110px;
    text-align: right;
  }
`;

export default {
  label: {
    display: 'inline-block',
    fontFamily: 'AvenirNext-Medium',
    fontSize: '18px',
    fontWeight: '500',
    color: '#3b3b3b',
    margin: '0 10px'
  }
}
