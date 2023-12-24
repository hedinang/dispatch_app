import styled from 'styled-components';

export const GroupControl = styled.div`
    padding-left: 5px;
    padding-right: 5px;
    display: flex;
    flex-direction: row;
`;
export const GroupControlLeft = styled.div`
    margin-right: auto;
    display: flex;
`;

export const GroupButtons = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow-y: hidden;
    justify-content: space-between;
    -webkit-overflow-scrolling: touch;
    align-items: center;
`;

export const DayText = styled.span`
  color: #55a;
`;

export const TimeZoneText = styled.span`
    font-family: 'AvenirNext-Bold';
    font-weight: normal;
`;

export const LoadingContainer = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    margin: auto;
    z-index: 9;
    background: #0000002b;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export default {
    container: {
        paddingTop: '10px',
        paddingBottom: '50px',
        paddingLeft: '10px',
        paddingRight: '10px',
        textAlign: 'left'
    },
    header: {
        marginBottom: '5px',
        alignItems: 'center'
    },
    statusBox: {
        fontFamily: 'AvenirNext-Italic',
        fontSize: '10px',
        color: '#848484',
        fontStyle: 'italic',
        fontWeight: '300'
    },
    status: {
        fontWeight: '400',
        fontSize: '12px',
        // color: Colors.maize
    },
    assignButton: {
        position: 'absolute',
        top: '12px',
        right: '12px'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        padding: '8px',
        boxSizing: 'border-box',
        backgroundColor: '#fff'
    },
    highlightCode: {
        backgroundColor: 'rgba(136, 127, 255, 0.5)',
        display: 'inline-block',
        padding: '4px 7px',
        margin: '2px 4px 2px 4px',
        borderRadius: '3px',
        color: '#3b3b3b',
        fontSize: '10px'
    },
    generalInfoTitle: {
        marginBottom: '10px'
    },
    generalInfoValue: {
        marginBottom: '10px'
    },
    label: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: '10px',
        fontWeight: '600',
        color: '#bebfc0',
        marginBottom: '3px'
    },
    title: {
      fontFamily: 'AvenirNext-DemiBold',
      fontSize: '16px',
      fontWeight: '600',
      color: '#4a4a4a'
    },
    text: {
        fontFamily: 'AvenirNext',
        fontSize: '10px',
        color: '#000000'
    },
    axlModal: {
        width: '1100px',
        height: '800px'
    },
    axlAssignmentBonusModal: {
        width: 600,
        maxHeight: 600,
        minHeight: 200,
    },
    feedbackModal: {
        width: '400px',
    },
    completeButtons: {
        marginTop: '3px',
        justifyContent: 'flex-start',
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 3,
        borderRadius: 3,
        backgroundColor: 'white',
        zIndex: 1,
    },
    isCompleteButtons: {
        marginTop: '3px',
        justifyContent: 'flex-start',
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 1,
    },
    claimcode: {
        borderRadius: '5px',
        backgroundColor: 'rgba(136, 127, 255, 0.15)'
    },
    timewindow: {},
    axlAddShipmentModal: {
        width: '650px',
        height: 'auto'
    },
    axlConfirmationModal: {
        height: '200px',
        width: '400px',
        padding: '0px 20px 60px 20px',
        textAlign: 'center'
    },
    box: {
        padding: '10px 7px'
    },
    textRight: {
        textAlign: 'right'
    },
    groupControl: {
        paddingLeft: 0,
        paddingRight: 0,
        lineHeight: 0,
        borderRadius: 0
    },
    groupControlFirst: {
        marginRight: '-1px'
    },
    groupControlLast: {
        marginLeft: '-1px'
    },
    modalHeader: {
        color: '#666',
        fontSize: '0.9em',
        marginBottom: '10px',
        textAlign: 'center',
        backgroundColor: '#eff0f0',
        cursor: 'pointer',
    },
    modalHeaderTab : {
        padding: '15px',
        fontWeight: 600,
    },
    modalHeaderTabSelected: {
        backgroundColor: '#6c62f5',
        color: '#fff',
    },
    modalContainer: {
      width: '1000px',
      height: '800px',
      paddingBottom: '60px',
      paddingLeft: '16px',
      paddingRight: '16px'
    },
    modalBody: {
        position: 'relative',
        height: 'calc(100% - 56px)',
    },
    modalListStyle: {
      position: 'absolute',
      overflow: 'auto',
      top: '20px',
      bottom: '60px',
      left: '8px',
      right: '8px',
    }, 
    codebox: {
        border: '1px solid #ddd',
        padding: '5px 15px 5px 5px',
        marginBottom: '10px',
        position: 'relative'
    },
    copybtn: {
        position: 'absolute',
        top: '-10px',
        right: '-10px'
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
    text: {
        fontFamily: 'AvenirNext',
        fontSize: '12px',
        color: '#000000'
    },
    returnStopAdd:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    spinReturnStop:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        height: '6rem',
        alignItems: 'center'
    },
    okButton:{
        width: '20%',
        backgroundColor: '#76C520',
        color: 'white'
    },
    cancelButton:{
        width: '20%',
        backgroundColor: '#FA6725',
        color: 'white'
    },
    returnStopButtonList:{
        display:'flex',
        flexDirection:'row',
        gap:'2%',
        justifyContent:'center'
    },
    button: {
      minHeight: 31,
      marginRight: 4,
      minWidth: 96, 
    }
}
