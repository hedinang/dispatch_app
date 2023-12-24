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
    container: {
        fontSize: '13px',
        lineHeight: '20px',
        backgroundColor: '#f4f4f4',
        borderRadius: '4px',
        padding: '8px',
        position: 'relative',
        // height: '152px',
        overflowY: 'auto'
    },
    label: {
        display: 'inline-block',
        minWidth: '45px',
        fontSize: '11px',
        color: '#bebfc0',
        fontWeight: 600,
        fontFamily: 'AvenirNext-DemiBold',
        marginRight: '2px'
    },
    label2: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: '14px',
        color: '#000000',
        marginRight: '5px'
    },
    label3: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: '13px',
        color: '#000000',
        marginRight: '5px'
    },
    driverPhotoContainer: {
        width: '75px',
        height: '75px',
        backgroundColor: '#d8d8d8',
        marginRight: '15px'
    },
    photo: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    defaulDriverPhoto: {
        width: '100%',
        height: '100%',
        backgroundColor: '#eee',
    },
    text: {
        fontFamily: 'AvenirNext',
        fontSize: '12px',
        color: '#000000'
    },
    driverName: {
        fontFamily: 'AvenirNext-Medium',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#000000',
        display:'flex',
        marginTop: '5px'
    },
    driverPhoto: {
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        cursor: 'pointer'
    },
    modalContainer: {},
    modalStyle: {
        display: 'flex',
        overflow: 'hidden'
    },
    wrapImages: {
        width: '100%',
        textAlign: 'center',
        lineHeight: 0
    },
    imageShipment: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    showLink: {
        fontFamily: 'AvenirNext',
        fontSize: '12px',
        color: '#4a90e2',
        textDecoration: 'underline',
        cursor: 'pointer'
    },
    divider: {
        maxWidth: '100%',
        height: '1px',
        backgroundColor: '#cfcfcf',
        margin: '10px auto'
    },
    modalDriverProfileContainer: {
        // width: 900,
        width: 'calc(100vw - 100px)',
        borderRadius: 5,
        border: 'solid 1px #cfcfcf',
        backgroundColor: '#FFF',
        padding: '15px 20px'
    },
    driverRow: {
        marginBottom: 10
    }
}
