import styled from 'styled-components';
import { Colors, STATUS_COLOR_CODE } from 'axl-reactjs-ui'

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


export const Container = styled.div`
  boz-sizing: border-box;
  border-radius: 3px;
  box-shadow: 0px 0px 1px #888;
  min-height: 80px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  position: relative;
  margin: 10px 1px;
  font-family: 'AvenirNext-Medium';
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  color: #3b3b3b;
  margin-bottom: 5px;
`;

export const Inner = styled.div`
  padding: 16px 10px 4px;
  background-color: white;
`;

export const ContainerTag = styled.div`
  padding: 7px 15px;
  border-top: solid 1px #eaeaea;
  background-color: #f2f3f2;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row
`;

export const Col = styled.div`
  flex: 1;
`;

export const Text = styled.div`
  font-family: 'AvenirNext-Medium';
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  color: #3b3b3b;
  margin-bottom: 5px;

  &.text-left { text-align: left; }
  &.text-center { text-align: center; }
  &.text-right { text-align: right; }
`;

export const SmallText = styled.span`
  font-size: 10px;
  font-weight: 300;
  color: #3b3b3b;
  display: inline-block;
`;

export const DayText = styled.span`
  color: #55a;
`;

export const TimeZoneText = styled.span`
    font-family: 'AvenirNext-Bold';
    font-weight: normal;
`;

export const Failer = styled.div`
  display: inline-block;
  padding: 2px 7px;
  border-radius: 3px;
  font-family: "AvenirNext-Medium";
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #ffffff;
  background-color: ${Colors.dustyRed}
`;

export const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background-color: ${Colors.gray};
  display: flex;
  flex-direction: row;
`;

export const Panel = styled.span`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: transparent;
`;

export const MoreLink = styled.div`
  color: #887fff;
  &:hover {
    color: #1453e4;
  }
`;

export const ETA = styled.div`
  display: inline-block;
  padding: 2px 7px;
  border-radius: 9px;
  min-width: 74px;
  font-family: "AvenirNext-Medium";
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  color: #ffffff;
  background-color: #666;
`;

export const Ribbon = styled.div`
    position: absolute;
    top: 0;
    right: 60px;
    bottom: 0;
    margin: auto;
    font-size: 9px;
    color: blue;
    padding: 0px 8px;
    transform: rotate(45deg);
    border: 1px solid blue;
    border-radius: 1px;
    height: 22px;
    line-height: 22px;
`;


export default {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    list: {
        flex: 1
    },
    text: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    box: {
        regular: {
            height: 81,
            backgroundColor: '#efefef',
            marginBottom: 6,
        },
        extra1: {
            height: 105,
            backgroundColor: '#efefef',
            marginBottom: 6,
        }
    },
    statuses: {
        UNASSIGNED: {
          backgroundColor: Colors.gray
        },
        PENDING: {
          backgroundColor: Colors.redishOrange
        },
        ACTIVE: {
          backgroundColor: Colors.redishOrange
        },
        IN_PROGRESS: {
          backgroundColor: Colors.redishOrange
        },
        COMPLETED: {
          backgroundColor: Colors.darkPastelGreen
        }
      },
      PanelStatus: {
        DP: { backgroundColor: STATUS_COLOR_CODE.IN_PROGRESS },
        PP: { backgroundColor: STATUS_COLOR_CODE.PENDING },
        'D-': { backgroundColor: STATUS_COLOR_CODE.PENDING },
        PS: { backgroundColor: STATUS_COLOR_CODE.IN_PROGRESS },
        DF: { backgroundColor: STATUS_COLOR_CODE.FAILED },
        DS: { backgroundColor: STATUS_COLOR_CODE.SUCCEEDED },
        DL: { backgroundColor: STATUS_COLOR_CODE.LATE },
        DE: { backgroundColor: STATUS_COLOR_CODE.EARLY },
      }
    
}
