import styled from 'styled-components';
import { Colors } from 'axl-reactjs-ui';

export const Container = styled.div``;
export default {
  Field: {
    color: '#707070',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 10,
  },
  container: {
    padding: '20px'
  },
  headerTitle: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 18,
    lineHeight: '1.3em',
    color: '#4a4a4a',
    marginBottom: 20,
  },
  GroupPanel: {
    marginBottom: 20
  },
  TextField: {
    display: 'block',
    resize: 'vertical',
    minHeight: 135,
    backgroundColor: '#FFF',
    fontSize: '17px',
    boxSizing: 'border-box',
    borderRadius: '3px',
    padding: '4px 14px 4px 8px',
    border: 'solid 1px #ccc',
  },
  FieldButton: {
    marginLeft: 10,
  },
  buttonControl: {
    minWidth: 150,
    padding: 0
  }
}
