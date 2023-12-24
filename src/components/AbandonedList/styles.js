import styled from "styled-components";

export const ZButton = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
export const Dropdown = styled.div`
  min-width: 120px;
  position: absolute;
  top: 100%;
  right: 0;
  background: #FFF;
  z-index: 1;
`;
export const Item = styled.a`
  display: block;
  padding: 7px 10px;
  border-bottom: 1px solid #CCC;
  text-decoration: none;
  color: #666;
  &:hover {
    text-decoration: underline;
  }
`;

export default {
  container: {
    position: 'absolute',
    overflow: 'auto',
    top: '54px',
    bottom: '60px',
    left: '8px',
    right: '8px',
  },
  buttons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    height: '60px',
    backgroundColor: '#fff'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    height: '54px',
    padding: '8px',
    boxSizing: 'border-box'
  },
  highlightCell: {
    backgroundColor: 'rgba(136, 127, 255, 0.1)'
  },
  cellHeader: {
    color: 'rgb(74, 74, 74)',
    fontFamily: '"AvenirNext-Bold"',
    fontSize: 11,
  },
  selected: {
    backgroundColor: '#b2d4f5'
  },
  suspended: {
    textDecoration: 'line-through',
    backgroundColor: 'lightgray'
  },
  warning: {
    backgroundColor: '#fde8d4',
  },
  notFound: {
    textAlign: 'center',
    padding: 20,
    color: '#aaa'
  },
  dsp: {
    backgroundColor: 'rgba(74, 188, 78, 0.2)',
  }
}