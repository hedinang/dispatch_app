import styled from 'styled-components';
import { AxlModal } from 'axl-reactjs-ui';

export const Container = styled.div`
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
`;
export const ModalContainer = styled(AxlModal)`
  width: 450px;
  max-width: 100%;
  border-radius: 2.5px;
  border: solid 0.5px #cfcfcf;
  background-color: #ffffff;
`;

export const GroupContainer = styled.div`
  padding-top: 10px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0px 0px 1px #888;
  margin: 10px;
`;

export const GroupHeader = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
`

export default {
  sessionItem: {
    textAlign: 'left',
    padding: 12,
    textDecoration: 'none',
    borderTop: '1px solid #e0e0e0',
  },
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
