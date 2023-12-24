import React from 'react';
import * as E from "./styles";
import * as SHIPMENT_STATUS from "../../../../constants/shipmentStatus";

export default class CallCenterInfo extends React.Component {
  render() {
    const { params, milestone, title, subtitle } = this.props;
    const call_args = params.call_args || [];
    const progress = {
      [SHIPMENT_STATUS.PROCESSING]: {left: '0'},
      [SHIPMENT_STATUS.PROCESSED]: {left: '0'},
      [SHIPMENT_STATUS.RECEIVED]: {left: '25%'},
      [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: {left: '50%'},
      [SHIPMENT_STATUS.NEXT_IN_QUEUE]: {left: '75%'},
      [SHIPMENT_STATUS.REATTEMPTING]: {left: '75%'},
      [SHIPMENT_STATUS.FAILED]: {right: '0', backgroundColor: '#d0021b'},
      [SHIPMENT_STATUS.RETURNED]: {right: '0'},
      [SHIPMENT_STATUS.CANCELLED]: {right: '0', backgroundColor: '#d0021b'},
      [SHIPMENT_STATUS.DELIVERED]: {right: '0', backgroundColor: '#4abc4e'},
      [SHIPMENT_STATUS.UNDELIVERABLE_SH]: {right: '0', backgroundColor: '#d0021b'},
    };
    const isDelivered = (milestone && milestone === SHIPMENT_STATUS.DELIVERED) || null;
    const isFailed = (milestone && [SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.CANCELLED, SHIPMENT_STATUS.UNDELIVERABLE_SH].indexOf(milestone) > -1) || null;

    return <E.Container>
      <E.StatusRow>
        <E.StatusInfo>
          {title && <E.StatusContainer><E.StatusText>{title}</E.StatusText></E.StatusContainer>}
          {subtitle && <E.StatusContainer><E.StatusText>{subtitle}</E.StatusText></E.StatusContainer>}
          {milestone && <E.StatusContainer><E.StatusText>{`Status:`}</E.StatusText> <E.StatusValue>{milestone}</E.StatusValue></E.StatusContainer>}
        </E.StatusInfo>
        <E.CallInfo>
          <div><E.StatusText><E.CallText>{`(Raw) From: `}</E.CallText><E.StatusValue>{params['raw_call_from']}</E.StatusValue></E.StatusText></div>
          <div><E.StatusText><E.CallText>{`From: `}</E.CallText><E.StatusValue>{params['call_from']}</E.StatusValue></E.StatusText></div>
          <div><E.StatusText><E.CallText>{`To: `}</E.CallText><E.StatusValue>{params['call_to']}</E.StatusValue></E.StatusText></div>
          <div><E.StatusText><E.CallText>{`Session: `}</E.CallText><E.StatusValue>{params['call_session_id']}</E.StatusValue></E.StatusText></div>
          <E.BullesContainer>
            <E.CallText>{`Call arguments: `}</E.CallText>
            <E.BubbleContainer>
              {
                call_args.split("|").map((e, i1) => {
                return e.split("").map((el, i2) => {
                    return (i1 > 0 && i2 === 0) ? <E.BubbleTextSpan><E.BubbleSpan> , </E.BubbleSpan><E.BubbleText>{el}</E.BubbleText></E.BubbleTextSpan> : <E.BubbleText>{el}</E.BubbleText>
                  });
                })
              }
            </E.BubbleContainer>
            </E.BullesContainer>
        </E.CallInfo>
      </E.StatusRow>
      {milestone && <E.ProcessContainer>
        <E.Proccer style={progress[milestone]} className={`${isFailed ? 'fail' : isDelivered ? 'success' : ''}`} />
      </E.ProcessContainer>}
    </E.Container>;
  }
}