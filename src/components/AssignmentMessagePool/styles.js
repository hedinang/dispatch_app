import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div`
  padding: 30px 20px;
`;

export default {
  HeaderTitle: {
    fontFamily: 'AvenirNext-Bold',
    fontSize: 28,
    lineHeight: '1.3em',
    color: '#4a4a4a',
    marginBottom: 20,
    textAlign: 'center',
    paddingLeft: '15px',
    paddingRight: '15px'
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
    paddingLeft: 15,
    paddingRight: 15
  },
  GroupTitle: {
    fontSize: 10,
    fontFamily: 'AvenirNext-Medium',
    color: '#848484',
    letterSpacing: '0.3px',
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 10,
    textAlign: 'left'
  },
  GroupField: {
    marginBottom: 20,
    textAlign: 'left'
  },
  Field: {
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15
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
  TextField: {
    resize: 'vertical',
    minHeight: 275
  },
}
