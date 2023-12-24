import React, {useState} from 'react';
import 'react-toastify/dist/ReactToastify.css';
import * as E from './styles';

export default ({ className, bodyClassName, progressClassName, closeButton, ...props }) => {
  return  (
    <E.ToastWrapper
      className={className}
      bodyClassName={bodyClassName}
      progressClassName={progressClassName}
      closeButton={<E.ToastCloseStyled/>}
      enableMultiContainer
      containerId="dispatcher-tab"
      {...props}
    />
  )
};

export const ToastContainerStyled = ({title, children, onClick = () => {}}) => <E.ToastContainerStyled onClick={onClick}>
  <E.ToastHeaderStyled>
    <E.ToastTitleStyled>{title}</E.ToastTitleStyled>

  </E.ToastHeaderStyled>
  <E.ToastContentStyled>{React.cloneElement(children)}</E.ToastContentStyled>
</E.ToastContainerStyled>