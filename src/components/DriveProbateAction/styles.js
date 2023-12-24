import styled from "styled-components";

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
`;

export const Inner = styled('div')`
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

export const SelectContainer = styled('div')`
  margin: 0px -5px;
  margin-bottom: 15px;
`;

export const ReviewContainer = styled('div')`
  flex: 1;
  padding: 10px 5px;
  overflow-y: scroll;
`;

export const EmptyReviewContainer = styled('div')`
  flex: 1;
  padding: 10px 5px;
  justify-content: left;
  display: flex;
  font-size: 14px;
  color: #a09f9f;
  min-height: 100px;
`;

export const ControlContainer = styled('div')`
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
`;

export const Title = styled.div`
  padding: 15px 20px;
  background: ${props => props.bgColor || "#f9ecb8"};
  color: #7b7b7b;
  font-size: 25px;
`;

export const Label = styled.p`
  font-size: 12px;
  margin: 5px 0 10px;
`;