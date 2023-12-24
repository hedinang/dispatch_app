import styled from 'styled-components';

export const HistoryInfoContainer = styled.div``;
export const HistoryInfoInner = styled.div``;

export default {
    container: {
        fontSize: '12px',
        lineHeight: '18px',
        color: 'rgb(0, 0, 0)',
        padding: 0,
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'left'
    },
    containerInnerScroll: {
        width: '100%',
        overflowY: 'scroll',
        paddingBottom: '15px'
    },
    row: {
        marginTop: '10px'
    },
    name: {
        fontFamily: 'AvenirNext-DemiBold',
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '4px',
        color: '#3b3b3b'
    },
    phone: {
        fontSize: '13px'
    },
    email: {
        fontSize: '13px',
        textAlign: 'left'
    },
    company: {
        fontFamily: 'AvenirNext-Medium'
    },
    square: {
        display: 'inline-block',
        width: '6px',
        height: '6px',
        backgroundColor: '#aaa',
        marginLeft: '8px',
        marginRight: '8px',
        marginBottom: '2px'
    },
    label: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: '11px',
        fontWeight: '600',
        color: '#bebfc0',
        marginBottom: '3px'
    },
    label2: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: '13px',
        color: '#000000',
        fontWeight: 'bold'
    },
    note: {
        fontSize: '13px',
        fontStyle: 'italic'
    },
    code: {
        fontSize: '11px',
        background: '#fff0cf',
        padding: '3px 5px',
        borderRadius: '3px',
        color: '#8c8c8c'
    },
    inboundInfo: {
        fontFamily: 'AvenirNext-Italic',
        fontSize: '10px',
        color: '#848484'
    },
    status: {
        fontFamily: 'AvenirNext-Italic',
        fontSize: '10px',
        fontStyle: 'italic',
    },
    shipmentDetailModal: {
        padding: '30px',
        borderRadius: 3,
        borderWidth: 1,
        borderColors: '##cfcfcf'
    },
    showLink: {
        fontFamily: 'AvenirNext',
        fontSize: '12px',
        color: '#4a90e2',
        textDecoration: 'underline',
        cursor: 'pointer'
    },
    axlModal: {
        width: '1000px',
        height: '800px'
    },
    header: {
        color: '#666',
        fontSize: '0.9em',
        marginBottom: '10px',
        marginTop: '18px'
    },
    modalContainer: {
      width: '1000px',
      height: '800px',
      paddingBottom: '60px',
      paddingLeft: '16px',
      paddingRight: '16px'
    },
    modalListStyle: {
      position: 'absolute',
      overflow: 'auto',
      top: '20px',
      bottom: '60px',
      left: '8px',
      right: '8px',
    },
    buttonControl: {
      minWidth: 120,
      padding: '0 15px'
    },
    formControl: {
        textAlign: 'left'
    },
    logo: {
        maxWidth: 32,
        maxHeight: 32,
        marginRight: 4,
        objectFit: 'cover',
        textAlign: 'center',
        borderRadius: '50%',
    }
}
