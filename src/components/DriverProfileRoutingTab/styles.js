import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  width: 100%;
`;
export const PaymentTabs = styled.div`
  margin: 10px 0 0;
  width: 100%;
`;
export const Label = styled.div`
  font-size: 12px;
  color: #bebfc0;
  font-family: 'AvenirNext-DemiBold';
  margin-bottom: 10px;
`;
export const Text = styled.div`
  font-family: 'AvenirNext';
  font-size: 13px;
  color: #000000;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.break {
    white-space: normal;
    word-break: break-all;
  }
`;
export const Text_1 = styled(Text)`
  font-size: 14px;
`;
export const Text_2 = styled(Text)`
  font-family: 'AvenirNext-Italic';
  color: #4a4a4a;
  font-style: italic;
`;
export const Text_3 = styled(Text)`
  color: #4abc4e;
  font-size: 20px;
  font-family: 'AvenirNext-DemiBold';
`;
export const Text_4 = styled(Text)`
  color: #4abc4e;
  font-size: 11px;
`;
export const Text_5 = styled(Text)`
  font-family: 'AvenirNext-Italic';
  font-size: 13px;
  font-style: italic;
  color: #4a4a4a;
`;
export const Text_6 = styled(Text)`
  font-family: 'AvenirNext-Medium';
  font-size: 14px;
  color: #4a4a4a;
  font-weight: 500;
`;
export const Text_7 = styled(Text)`
  font-family: 'AvenirNext-DemiBold';
  font-size: 15px;
  color: #5a5a5a;
  font-weight: 600;
  text-decoration: underline;
  margin-bottom: 10px;
`;
export const AmountText = styled(Text_1)`
  color: #4abc4e;
`;
export const AssignmentName = styled.div`
  font-size: 20px;
  color: #4a4a4a;
  font-family: 'AvenirNext-Medium';
  margin-bottom: 10px;
  line-height: 20px;
`;
export const TicketPrice = styled.div`
  display: inline-block;
  color: #4abc4e;
  margin-left: 5px;
`;
export const ViewDispatchButton = styled.a`
  width: auto;
  padding: 7px 15px;
  border-radius: 3px;
  background-color: rgb(157,165,182);
  color: rgb(255,255,255);
  font-size: 13px;
  font-family: AvenirNext;
  font-weight: 300;
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  text-align: center;
  text-decoration: none;
  justify-content: center;
  align-items: center;
`;
export const PendingItems = styled.div``;
export const PendingItem = styled.div``;
export const DueItems = styled.div`
  text-align: left;
  padding: 10px 20px;
`;
export const DueItem = styled.div``;
export const PanelTitle = styled.div`
  padding: 7px 15px;
  background-color: #a0aab7;
  font-family: 'AvenirNext-DemiBold';
  font-size: 13px;
  color: #fff;
  text-align: center;
  text-transform: uppercase;
`;
export const NoActiveSuspension = styled.div`
  padding: 30px 15px;
  text-align: center;
`;
export const MoreLink = styled.span`
  margin-left: 5px;
  cursor: pointer;
  color: #887fff;
  &:hover {
    color: #1453e4;
  }
`;

export const PaymentDueDetailContainer = styled.div`
  margin: 10px 0;
`;

export const PaymentDueDetail = styled.div`
  font-family: "AvenirNext-MediumItalic";
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  color: #5a5a5a;
  margin: 10px 0;
  b {  
    font-family: 'AvenirNext-DemiBoldItalic';
  }
  span {
    font-family: 'AvenirNext-DemiBoldItalic';
    font-size: 11px;
    font-weight: 600;
    font-style: italic;
    color: #4a4a4a;
    padding: 2px 10px;
    margin: 0 3px;
    display: inline-block;
    vertical-align: middle;
    background-color: #cdc9fe;
    border-radius: 3px;
  }
`;

export default {
  Row_1: {
    padding: '15px 15px 15px 30px',
    textAlign: 'left',
    alignItems: 'flex-start',
    borderBottom: 'solid 1px #e4e4e4'
  },
  Row_2: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  ColPadd: {
    paddingLeft: 5,
    paddingRight: 5
  },
  textRed: {
    color: '#d63031'
  },
  disabled: {
    opacity: 0.3
  },
  loadingStyle: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    margin: 'auto'
  }
}
