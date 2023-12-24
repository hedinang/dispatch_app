import React, { Fragment } from 'react';
import Rating from 'react-rating';
import {inject, observer} from "mobx-react";
import { AxlPanel, AxlCheckbox, AxlTextArea, AxlButton } from 'axl-reactjs-ui';
import {IconButton, Box, RadioGroup, FormControlLabel, Radio, withStyles, CircularProgress } from "@material-ui/core";
import {ThumbDown as ThumbDownIcon, ThumbUp as ThumbUpIcon} from "@material-ui/icons";
import _ from 'lodash';
import { toast } from 'react-toastify';

import styles, * as E from './styles';
import { dataThumbDown, dataThumbUp } from '../../constants/thumbs';
import { toastMessage } from '../../constants/toastMessage';
import { getClientSetting } from '../../stores/api';

const RadioFeedback = withStyles({
  root: {
    color: '#8d8d8d',
  },
})((props) => <Radio color="primary" {...props} size='small'/>);

const FormControlLabelFeedback = withStyles({
  label: {
    fontSize: 12.5,
    color: '#8d8d8d',
  },
})((props) => <FormControlLabel {...props} />);

const renderRadio = (data) => (
  data.map(item => (
    <Box flexBasis='50%' key={item.imputID}>
      <FormControlLabelFeedback value={item.value} control={<RadioFeedback />} label={item.title} />
    </Box>
  ))
)

@inject('shipmentStore')
@observer
export default class ShipmentFeedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groupThumbDowns: [],
      isLoading: false,
    }
  }

  componentDidMount() {
    const { shipmentStore} = this.props;
    if(!shipmentStore || !shipmentStore.selectedShipment || !shipmentStore.selectedShipment.client_id) return;

    this.setState({isLoading : true});
    getClientSetting(shipmentStore.selectedShipment.client_id).then(res => {
      this.setState({isLoading : false});
      if(!res || !res.ok || !res.data) {
        this.setState({groupThumbDowns: dataThumbDown});
        return;
      };
      const {tracking_settings} = res.data;
      const negativeFeedbacks = tracking_settings && tracking_settings.negative_feedbacks;
      const newIcons = negativeFeedbacks && negativeFeedbacks.split(',').map(item => {
        const splitByAtSign = item.split('@');
        return {
          src: splitByAtSign[1],
          title: splitByAtSign[0],
          imputID: splitByAtSign[0].toLowerCase().replace(/\s/g, '_'),
          value: splitByAtSign[0],
        }
      }) || [];

      const groups = Object.entries(_.groupBy([...dataThumbDown, ...newIcons], 'src')).map(([k, values]) => ({
        src: values[0].src,
        title: values.map(v => v.title).join("/"),
        imputID: values[0].imputID,
        value: values.map(v => v.value).join("/"),
      })) || [];
      this.setState({groupThumbDowns: groups});
    })
  }

  addFeedBack = (e) => {
    const {toggleFeedback} = this.props;
    const {selectedStop} = this.props.shipmentStore;

    this.props.shipmentStore.addFeedback(selectedStop.id, (res) => {
      if (!res || !res.ok) {
        toast.error(res && res.data && (res.data.error || res.data.message || toastMessage.ERROR_SAVING), {containerId: 'main'})
        return;
      }
      toast.success(toastMessage.SAVED_SUCCESS, {containerId: 'main'});
      toggleFeedback()
    });
  };

  render() {
    const {feedbackForm, addingFeedback} = this.props.shipmentStore;
    const thumb = feedbackForm.getField('thumb', null);
    const disabledAddFeedback = thumb === null || ((!feedbackForm.getField('tags', []) || feedbackForm.getField('tags', []).length === 0) && (!feedbackForm.getField('comment', '') || feedbackForm.getField('comment', '').length < 5));

    return <E.Container>
      <E.Inner>
        <E.Row style={{alignItems: 'center'}}>
          <E.Label>{`Rate:`}</E.Label>
          <E.Content>
            {/*<Rating initialRating={feedbackForm.getField('rating', 0)} onChange={feedbackForm.handlerRating('rating')} emptySymbol={<img src="/assets/images/star-periwinkle-empty.png" />} fullSymbol={<img src="/assets/images/star-periwinkle-full.png" />} />*/}
            <Box component="span" pr={1}>
              <IconButton size="small" onClick={() => feedbackForm.handlerRating('thumb')(true)}>
                <ThumbUpIcon fontSize="small" style={{color: !!thumb ? '#4abc4e' : undefined}} />
              </IconButton>
            </Box>
            <Box component="span" px={1}>
              <IconButton size="small" onClick={() => feedbackForm.handlerRating('thumb')(false)}>
                <ThumbDownIcon fontSize="small" style={{color: thumb === false ? '#d0021b' : undefined}} />
              </IconButton>
            </Box>
          </E.Content>
        </E.Row>
        {this.state.isLoading && <Box display='flex' justifyContent='center'><CircularProgress size={20} /></Box>}
        {[true, false].includes(thumb) && !this.state.isLoading && (
          <Fragment>
            <E.Row>
              <E.Label>{`Tags:`}</E.Label>
              <E.Content>
                <AxlPanel>
                  <RadioGroup name="tags" value={feedbackForm.getField('tags', []) && feedbackForm.getField('tags', [])[0] || ''} onChange={feedbackForm.handlerRadio} >
                    <Box display='flex' flexWrap='wrap'>
                      {!!thumb && renderRadio(dataThumbUp)}
                      {thumb === false && renderRadio(this.state.groupThumbDowns)}
                    </Box>
                  </RadioGroup>
                </AxlPanel>
              </E.Content>
            </E.Row>
            <E.Row>
              <E.Label>{`Comment:`}</E.Label>
              <E.Content>
                <AxlTextArea onChange={feedbackForm.handlerTextarea} name='comment' value={feedbackForm.getField('comment', '')} placeholder={`Add comment...`} style={styles.textarea} fluid />
              </E.Content>
            </E.Row>
            <E.Row>
              <E.Label />
              <E.Content>
                <AxlButton loading={addingFeedback} onClick={this.addFeedBack} disabled={disabledAddFeedback} compact bg={`bluish`}>{`Add Feedback`}</AxlButton>
                <AxlButton onClick={() => {
                  feedbackForm.rollbackData();
                  this.props.onClose && this.props.onClose();
                }} compact bg={`borBluish`}>{`Cancel`}</AxlButton>
              </E.Content>
            </E.Row>
          </Fragment>
        )}
      </E.Inner>
    </E.Container>
  }
}
