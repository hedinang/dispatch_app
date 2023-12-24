import styled from "styled-components";

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

export const DayText = styled.span`
  color: #55a;
`;

export const TimeZoneText = styled.span`
    font-family: 'AvenirNext-Bold';
    font-weight: normal;
`;