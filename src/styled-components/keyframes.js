import { keyframes } from 'styled-components';

export const bgFadeIn = keyframes`
  0% { background-color: #2a2444; }
  50% { background-color: #887fff; }
  100% { background-color: #2a2444; }
`;

export const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;