import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { datadogRum } from '@datadog/browser-rum';

const rumApplicationId = process.env.REACT_APP_RUM_APPLICATION_ID;
const rumClientToken = process.env.REACT_APP_RUM_CLIENT_TOKEN;

if (rumApplicationId && rumClientToken) {
  datadogRum.init({
    applicationId: rumApplicationId,
    clientToken: rumClientToken,
    site: 'datadoghq.com',
    service:'dispatch',
    env: process.env.REACT_APP_RUM_ENV,
    version: process.env.REACT_APP_RUM_VERSION,
    sampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input'
  });
  datadogRum.startSessionReplayRecording();
}

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
