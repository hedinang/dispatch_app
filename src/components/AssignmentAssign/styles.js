import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div``;

export default {
  Container: {
    padding: '15px 0'
  },
  HeaderTitle: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 26,
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
    fontSize: 13,
    fontFamily: 'AvenirNext-Medium',
    color: '#848484',
    letterSpacing: '0.3px',
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 10,
    textAlign: 'left'
  },
  GroupField: {
    textAlign: 'left'
  },
  Field: {
    marginBottom: 5,
    paddingLeft: 15,
    paddingRight: 15
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
    marginTop: 15
  },
  buttonControl: {
    minWidth: 150
  }
}
