import styled from 'styled-components';
import { AxlModal } from 'axl-reactjs-ui';

export const Container = styled.div``;
export const ModalContainer = styled(AxlModal)`
  width: 450px;
  max-width: 100%;
  border-radius: 2.5px;
  border: solid 0.5px #cfcfcf;
  background-color: #ffffff;
`;

export default {
  modalContainer: {
    width: 900,
    maxWidth: '100%',
    borderRadius: 5,
    border: 'solid 1px #cfcfcf',
    backgroundColor: '#FFF',
    padding: '15px 20px'
  },
  driverRow: {
    marginBottom: 10
  }
}
