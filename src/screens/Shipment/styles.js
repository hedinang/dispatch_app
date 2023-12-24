import { Colors } from 'axl-reactjs-ui';
import styled from "styled-components";
import * as M from '@material-ui/core';
import colors from "../../themes/colors";

export const Panel = styled.div`
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
`;

export const PanelMessenger = styled(Panel)`
    padding: 0;
`;

export const PanelMessengerInner = styled.div`
    box-sizing: border-box;
    height: 100%;
    border-radius: 4px;
    box-shadow: 0.5px 1px 2px 0 rgba(155, 155, 155, 0.24), 0.5px 1px 2px 0 rgba(0, 0, 0, 0.5);
    background-color: #ffffff;
    position: relative;
`;

export const AddTopicContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const AddTopicIcon = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border: 1px solid #CCC;
    border-radius: 50%;
    cursor: pointer;
    &:after,
    &:before {
        content: "";
        width: 20px;
        height: 1px;
        background: #CCC;
    }
    &:after {
        transform: rotate(90deg);
    }
`;

export const Text = styled.div`
    font-family: "AvenirNext";
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    color: #707070;
    margin-top: 15px;
`;

export const BackRoutesPanel = styled.div`
    position: absolute;
    top: 50%;
    left: 7px;
    cursor: pointer;
    width: 13px;
    height: 13px;
    border-top: 2px solid #aeaeae;
    border-left: 2px solid #aeaeae;
    z-index: 1;
    transform: rotate(-45deg);
`;

export const FilterContainer = styled.div`
    @media(max-width: 1279px) {
        display: none;
    }
    &.active {
        display: block;
    }
`;

export const Container = M.styled(M.Paper)(({theme}) => ({
    backgroundColor: colors.white,
}));

export const ChartPanelContainer = M.styled(M.Box)(({theme}) => ({
    height: theme.breakpoints.down('md') ? 46 : 325,
}));

export default {
    container: {
        minHeight: '600px',
        position: 'relative'
    },
    mainContent: {
      height: 'calc(100vh - 54px)',
      display: 'flex',
      marginLeft: '-8px',
      marginRight: '-8px'
    },
    topHeader: {
        width: '100%',
        textAlign: 'left',
        padding: '0px 10px 0 10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    topHeaderLeft: {
        display: 'flex',
        flex: 1
    },
    topHeaderRight: {
        position: 'relative',
        // zIndex: 10000
        // zIndex: 99999
    },
    panel: {
        height: '100%',
        // padding: '10px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
    },
    innerBox: {
        height: '100%',
        backgroundColor: Colors.veryLightGrey,
        overflow: 'hidden',
        position: 'relative',
        textAlign: 'left'
    },
    innerBoxShipment: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        overflow:'auto',
    },
    bottomBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        backgroundColor: '#fff',
        overflow: 'auto',
        padding: 10
    },
    boxContent: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        bottom: '325px',
    },
    bottomBoxShipment: {
        height: '325px',
        backgroundColor: '#fff',
        borderTop: 'solid 1px #ccc',
        overflow:'auto',
        maxHeight: '50%',
    },
    boxContentShipment: {
        flex: 1,
        position: 'relative',
    },
    label: {
        display: 'inline-block',
        fontFamily: 'AvenirNext-Medium',
        fontSize: '18px',
        fontWeight: '500',
        color: '#3b3b3b',
        margin: '0 10px'
    },
    AxlPanelSliderStyle: {
        top: '-7px',
        position: 'absolute',
        height: '100vh',
        right: '-8px',
        paddingTop: 0,
        zIndex: 1000
    },
    closePane: {
        position: 'absolute',
        top: '50%',
        left: '-4px',
        marginTop: '-80px',
        height: '160px',
        width: '5px',
        backgroundColor: '#e8e8e8',
        cursor: 'pointer',
        borderLeft: 'solid 1px #d8d8d8',
        borderRight: 'solid 1px #ccc'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '55px',
        boxSizing: 'border-box',
        padding: '5px 10px 5px 10px',
        backgroundColor: Colors.veryLightGrey,
        borderTop: 'solid 1px #fff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'auto'
    },

}
