import React from 'react';
import { compose } from 'recompose';
import { get, last } from 'lodash';
import { toast } from 'react-toastify';
import { observer, inject } from 'mobx-react';

import { PERMISSION_DENIED_TEXT } from '../../constants/common';

function RequestHandlerManager(props) {
  const { requestErrorHandler } = props;
  const { errors } = requestErrorHandler;

  const forbiddenErrors = errors.filter((error) => error.status === 403);
  const latestErrorUrl = get(last(forbiddenErrors), 'config.url');

  const toastId = `errors-${latestErrorUrl}`;

  const handleClose = () => requestErrorHandler.clearErrors();

  if (forbiddenErrors.length > 0) toast.error(PERMISSION_DENIED_TEXT, { containerId: 'main', toastId, hideProgressBar: true, onClose: handleClose });

  return null;
}

export default compose(inject('requestErrorHandler'), observer)(RequestHandlerManager);
