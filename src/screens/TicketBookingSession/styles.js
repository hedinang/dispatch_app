import { Colors } from 'axl-reactjs-ui';
import styled from "styled-components";

export const Panel = styled.div`
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
`;

export default {
  container: {
    minHeight: '500px',
    height: 'calc(100vh - 120px)',
    position: 'relative',
    maxWidth: '1600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  navigator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    margin: 10,
    activeItem: {
      padding: '10px 20px',
      backgroundColor: '#aeaefe',
    },
    inactiveItem: {
      padding: '10px 20px',
      textDecoration: 'none',
      color: '#222',
      backgroundColor: '#efefef'
    },
  },
  mainContent: {
    height: '100%',
    display: 'flex',
    marginLeft: '-8px',
    marginRight: '-8px'
  },
  panel: {
    height: '100%',
    padding: '10px',
    boxSizing: 'border-box',
  },
  innerBox: {
    height: '100%',
    backgroundColor: Colors.veryLightGrey,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexFlow: 'column',
  },
  topBox: {
    backgroundColor: '#fff',
    borderBottom: 'solid 1px #ccc',
    flex: '0 1 auto'
  },
  actionButton: {
    backgroundColor: '#fff',
    border: '1px solid #4a4a4a',
    borderRadius: 15,
    padding: '4px 12px',
    margin: 5,
  },
  processing: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeContent: 'center',
    zIndex: 1000,
    opacity: 0.5,
    backgroundColor: '#888',
  },
}
