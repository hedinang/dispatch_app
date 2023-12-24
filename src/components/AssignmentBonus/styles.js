import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div``;

export default {
  Container: {
    padding: '15px'
  },
  HeaderTitle: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 30,
    lineHeight: '1.3em',
    color: '#4a4a4a',
    marginBottom: 20,
    textAlign: 'center',
  },
  GroupPanel: {
    marginBottom: 5,
    textAlign: 'left'
  },
  Title: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 14,
    color: '#96979a',
    marginBottom: 15,
    textAlign: 'left',
  },
  GroupTitle: {
    fontSize: 13,
    fontFamily: 'AvenirNext-Medium',
    color: '#848484',
    letterSpacing: '0.3px',
    marginBottom: 10,
    textAlign: 'left'
  },
  GroupField: {
    marginBottom: 20,
    textAlign: 'left'
  },
  Field: {
    marginBottom: 15,
  },
  TextField: {
    resize: 'vertical',
    minHeight: 135
  },
  labelHours: {
    fontSize: 10,
    color: '#96979a',
    fontFamily: 'AvenirNext-DemiBold'
  },
  FieldButton: {
    marginBottom: 0
  },
  buttonControl: {
    minWidth: 150
  },
  errorMsg: {
    textAlign: 'center',
    color: 'red',
  }
}
