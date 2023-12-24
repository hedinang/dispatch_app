import styled from 'styled-components';

export const Container = styled.div``;

export const Item = styled.div`
  position: relative;
  padding: 0px 0 5px 15px;
  &:after {
    content: '';
    width: 1px;
    height: 90%;
    display: block;
    position: absolute;
    top: 4px;
    left: 3px;
    bottom: 0;
    border-left: 0.5px dashed #5a5a5a;
  }
`;
export const Text = styled.div`
  font-family: 'AvenirNext-DemiBold';
  font-size: 12px;
  color: #4a4a4a;
`;
export const Circle = styled.div`
  width: 7px;
  height: 7px;
  display: inline-block;
  background-color: #5a5a5a;
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: 0;
  margin: auto;
  z-index: 1;
`;
export default {
  header: {
    display: 'flex',
  },
  date: {
    fontSize: '10px',
    display: 'block',
    marginTop: '5px',
  },
  contentWrapper: {
    overflow: 'hidden',
    width: '100%',
    textAlign: 'left'
  },
  noteWrapper: {
    border: '1px solid #887fff',
    borderRadius: '3px',
    padding: '7px 10px',
  },
  showLink: {
    fontFamily: 'AvenirNext',
    fontSize: '11px',
    color: '#6c62f5',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  },
  content: {
    fontFamily: 'AvenirNext',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#5a5a5a',
    whiteSpace: 'pre-line',
  },
  editBtn: {
    fontFamily: 'AvenirNext-DemiBold',
    border: 'solid 0.5px #aeaeae',
    background: '#fff',
    borderRadius: '1.5px',
    padding: '2px 12px',
    color: '#aeaeae',
    fontSize: '10px',
    marginLeft: '5px',
    cursor: 'pointer',
  },
  btnWrapper: {
    minWidth: '101px',
    textAlign: 'right'
  },
};
