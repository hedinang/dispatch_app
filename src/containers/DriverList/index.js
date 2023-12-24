import React, { Component } from 'react';
import Moment from 'react-moment';
import {inject, observer} from "mobx-react";
import { saveAs } from 'file-saver';
import {Link} from "react-router-dom";
import * as S from './styles';
import { AxlTable, AxlPagination, AxlSearchBox, AxlButton, AxlPopConfirm, AxlTextArea, AxlModal, AxlSelect } from 'axl-reactjs-ui';
import { toast } from 'react-toastify';
import { Button, CircularProgress, FormControl, IconButton, InputAdornment, MenuItem, OutlinedInput, Select } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';

// Utils
import { DRIVER_STATUS } from '../../constants/status';

// Components
import {DriverListComponent} from "../../components/DriverList";

// Styles
import styles, * as E from './styles';

import RichTextEditor from 'react-rte';
@inject('driverListStore', 'driverStore', 'userStore', 'messengerStore')
@observer
class DriverList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quitValue: null,
      suspendValue: null,
      suspendCategory: null,
      reactivateValue: null,
      reacting: null,
      quitting: null,
      suspending: null,
      showDriverProfile: false,
      driverData: {},
      editorWarningState: RichTextEditor.createEmptyValue(),
      mapCateEmail: {},
      emailTemplateSelected: null
    }
    const {driverStore, driverListStore} = this.props;
    driverStore.getAppealCategoriesByType('suspension').then(response => {
      if (response.status === 200 && response.data.categories) {
        const categories = response.data.categories.reduce((result, cate) => {
          return [...result, {name: cate.title, value: cate.code}]
        }, [])

        const mapCateEmail = response.data.categories.reduce((result, cate) => {
          return {...result, [cate.code]: cate.email}
        }, {})
        
        this.setState({mapCateEmail});
        this.setState({categories: categories});
        this.setState({suspendCategory: categories[0].value});
        this.setState({templates: response.data.templates});
  
        const defaultEmailTemplate = response.data.categories[0].email
        this.setEmailTemplate(defaultEmailTemplate)
        this.setState({emailTemplateSelected: defaultEmailTemplate})
      }
    });



    driverStore.getAppealCategoriesByType('warning').then(response => {
      if (response.status === 200 && response.data.categories) {
        const warningCategories = [];
        response.data.categories.map((cate) => {
          warningCategories.push({name: cate.title, value: cate.code});
        })
        const template = response.data.templates.find(t => t.id == 'DRIVER_EMAIL_WARNING')
        this.setState({warningCategories: warningCategories});
        this.setState({warningCategory: warningCategories[0].value});
        this.setState({warningTemplate: template});

        var templateHtml = template['html']
        var templateHtmlConfig = templateHtml.split(/\$\{reason_text\}|\$\{tsa_violation\}/)
        this.setState({warningTemplateHtmlConfig: templateHtmlConfig});

        var str = templateHtmlConfig[0]+""+templateHtmlConfig[1]+warningCategories[0].value+templateHtmlConfig[2];
        this.setState({editorWarningState: RichTextEditor.createValueFromString(str, "html")});  
      }
    });

    driverListStore.updateFilters('DEFAULT', {
      page: driverListStore.filters && driverListStore.filters.page || 1,
      size: 20,
      order_by: driverListStore.filters && driverListStore.filters.order_by || 'id',
      desc: driverListStore.filters && driverListStore.filters.desc || true,
      q: driverListStore.filters && driverListStore.filters.q || null,
    })
  }

  setEmailTemplate = async (templateId, cb) => {
    await (() => {
      const template = this.state.templates.find(t => t.id == templateId)
      const templateHtml = template.html
      const templateHtmlConfig = templateHtml.split(/\$\{reason_code\}/)
      this.setState({templateHtmlConfig: templateHtmlConfig});
      this.setState({editorSuspensionState: RichTextEditor.createValueFromString(templateHtml, "html")});
    })()

    if (cb) await cb()
  }

  downloadCSV = (e) => {
    const {driverListStore} = this.props;
    driverListStore.csv("", (data) => {
      const blob = new Blob([data.csv], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "drivers.csv");
    })
  };

  changeSearch = (e) => {
    const {driverListStore} = this.props;
    const value = e;

    if (value !== undefined) {
      driverListStore.setFilters({
        q: value,
        page: 1
      });
    }
  };

  search = (e) => {
    const {driverListStore} = this.props;
    driverListStore.search();
  };

  quit = (item) => (e) => {
    const { driverStore, driverListStore } = this.props;
    const {quitValue} = this.state;
    if(!quitValue || quitValue[item.id] === '') return;
    this.setState({quitting: {[item.id]: true}});
    driverStore.quit(item.id, {"remark": quitValue[item.id]}, (res) => {
      if(res.status === 202) {
        this.setState({quitting: null});
        driverListStore.search();
      } else if(res.status === 401) {
        this.setState({quitting: null});
        alert('You are not authorized to do this');
      }
    });
  };

  suspend = (item) => (e) => {
    const { driverStore, driverListStore} = this.props;
    const {suspendValue, suspendCategory, templates, emailTemplateSelected, editorSuspensionState} = this.state;
    
    if(!suspendValue || !suspendCategory) {
      toast.error('You have to select a category and write an explain', {containerId: 'main'});
      return false;
    }
    this.setState({suspendValue: ""});

    if(suspendValue[item.id].length > 512) {
      toast.error('The explain is too long', {containerId: 'main'});
      return false;
    }

    if(suspendValue[item.id].length < 10) {
      toast.error('The explain is too short', {containerId: 'main'});
      return false;
    }

    if(!suspendValue || suspendValue[item.id] === '') return;
    this.setState({suspending: {[item.id]: true}});
    
    const template = templates.find(t => t.id === emailTemplateSelected)
    if (!template) {
      toast.error('Email template is not found', {containerId: 'main'});
      return false
    }

    var data = {
      "remark": suspendValue[item.id], 
      "category": suspendCategory,
      "email": {...template, html:editorSuspensionState.toString("html")}
    }

    driverStore.suspend(item.id, data, (res) => {
      if(res.status === 202) {
        this.setState({suspending: null});
        driverListStore.search();
      } else if(res.status === 401) {
        this.setState({suspending: null});
        alert('You are not authorized to do this');
      } else {
        this.setState({suspending: null});
        alert(res.data.message);
      }
    });
  };

  warning = (item) => (e) => {
    const { driverStore, driverListStore} = this.props;
    const {warningValue, warningCategory, warningTemplate, editorWarningState} = this.state;
    
    if(!warningValue || !warningCategory) {
      alert('You must select category and put explain');
      return false;
    }
    this.setState({warningValue: ""});
    if(warningValue[item.id].length > 512) {
      alert('Explain too long');
      return false;
    }

    if(warningValue[item.id].length < 10) {
      alert('Explain too short');
      return false;
    }

    if(!warningValue || warningValue[item.id] === '') return;
    
    var data = {
      "remark": warningValue[item.id], 
      "category": warningCategory,
      "email": {...warningTemplate, html:editorWarningState.toString("html")}
    }

    driverStore.warning(item.id, data, (res) => {
      if(res.status === 202) {
        alert("Sent email to this driver is successfully !");
      } else if(res.status === 401) {
        alert('You are not authorized to do this');
      } else {
        this.setState({suspending: null});
        alert(res.data.message);
      }
    });
  };

  reActivate = (item) => (e) => {
    const { driverStore, driverListStore } = this.props;
    const { reactivateValue } = this.state;

    this.setState({reactivateValue: ""});
    if(reactivateValue[item.id].length > 512) {
      alert('Explain too long');
      return false;
    }

    if(reactivateValue[item.id].length < 10) {
      alert('Explain too short');
      return false;
    }

    if(!reactivateValue || reactivateValue[item.id] === '') return;
    if(['QUIT', 'SUSPENDED'].includes(DRIVER_STATUS[item.status])) {
      this.setState({reacting: {[item.id]: true}});
      driverStore.reactivate(item.id, {"remark": reactivateValue[item.id]}, (res) => {
        if(res.status === 202) {
          this.setState({reacting: null});
          driverListStore.search();
        } else if(res.status === 401) {
          this.setState({reacting: null});
          alert('You are not authorized to do this');
        } else {
          this.setState({reacting: null});
          alert(res.data.message);
        }
      });
    }
  }

  handleQuitTextarea = (item) => (e) => {
    let value = [];
    value[item.id] = e.target.value;
    this.setState({quitValue: value});
  }

  handleSuspendTextarea = (item) => (e) => {
    const {templateHtmlConfig} = this.state
    let value = [];
    value[item.id] = e.target.value;
    this.setState({suspendValue: value});
    if (templateHtmlConfig.length == 2) {
      const reason = e.target.value ? e.target.value : '${reason_code}'
      const str = templateHtmlConfig[0] + reason + templateHtmlConfig[1]
      this.setState({editorSuspensionState: RichTextEditor.createValueFromString(str, "html")});  
    }
  }

  handleWarningTextarea = (item, template, category) => (e) => {
    let value = [];
    value[item.id] = e.target.value;
    this.setState({warningValue: value});
    var str = template[0]+e.target.value+template[1]+category+template[2];
    this.setState({editorWarningState: RichTextEditor.createValueFromString(str, "html")});  
  }

  handleSuspendCategory = (e, suspendValue) => {
    const value = e.target.value
    this.setState({suspendCategory: value})
    const emailTemplate = this.state.mapCateEmail[value]
    this.setState({emailTemplateSelected: emailTemplate})
    this.setEmailTemplate(emailTemplate, () => {
      const {templateHtmlConfig} = this.state
      let str = ""
      if (templateHtmlConfig.length == 1) {
        str += templateHtmlConfig
      } else {
        const reason = suspendValue ? suspendValue : '${reason_code}'
        str += templateHtmlConfig[0]+reason+templateHtmlConfig[1]
      }
      this.setState({editorSuspensionState: RichTextEditor.createValueFromString(str, "html")});
    })
  }

  handleWarningCategory = (value, template, remark) => {
    this.setState({warningCategory: value});
    var str = template[0]+remark+template[1]+value+template[2];
    this.setState({editorWarningState: RichTextEditor.createValueFromString(str, "html")});
  }

  setEditorWarningState = (value) => {
    this.setState({editorWarningState: value})
  }

  setEditorSuspensionState = (value) => {
    this.setState({editorSuspensionState: value})
  }

  handleReactivateTextarea = (item) => (e) => {
    let value = [];
    value[item.id] = e.target.value;
    this.setState({reactivateValue: value});
  }

  showDriverProfile = (driver) => { 
    this.props.history.push(`/drivers/${driver.id}`);
   }

  onHideDriverProfile = () => { this.setState({showDriverProfile: false}) }

  onMessageToDriver = (refId) => {
    const { messengerStore } = this.props;
    // General topic
    messengerStore.refType = 'DRIVER_GENERAL_SUPPORT';
    messengerStore.generateTopic(refId, (res) => {
      if(res.status === 200 || res.ok) {
        window.location.href = `/messenger/${res.data.id}`;
      }
    });
  }
  
  render() {
    const {driverListStore, userStore, driverStore} = this.props;
    const { reacting, quitting, suspending, driverData, showDriverProfile, categories, warningCategories, templateHtmlConfig, warningTemplateHtmlConfig, suspendCategory, warningCategory, editorWarningState, editorSuspensionState} = this.state;
    const {user} = userStore;
    const isAdminOrHr = (user && user.scopes && (user.scopes.includes('admin') || user.scopes.includes('hr')));
    const isDispatcher = user && user.scopes && (user.scopes.includes('dispatcher') || user.scopes.includes('lead-dispatcher'));
    const { filters, exporting, searching, result } = driverListStore;

    const allowRoles = ["admin", "super-admin", "lead-dispatcher"]
    const allowDriverRating = user && user.scopes ? user.scopes.some(u => allowRoles.includes(u)) : false

    const renderer = {
      id: (v, item) => <E.DriverLink onClick={() => this.showDriverProfile(item)}>{v}</E.DriverLink>,
      home_address: (v) => v.zipcode,
      signed: (v) => v ? 'TRUE' : 'FALSE',
      ssn_verified: (v) => v ? 'TRUE' : 'FALSE',
      created: (v) => <Moment interval={0} format='YYYY-MM-DD'>{v}</Moment>,
      status: (v, item) => {
        return item.status
      },
      remark: (v, item) => {
        try {
          var pieces = v.split(";");
          return (pieces[pieces.length-1]);
        }
        catch(err) {
          return v;
        }
      }
    };

    if (isAdminOrHr) {
      renderer.actions = (v, item) => {
        // values
        const quitValue = this.state.quitValue ? this.state.quitValue[item.id] : '';
        const suspendValue = this.state.suspendValue ? this.state.suspendValue[item.id] : '';
        const warningValue = this.state.warningValue ? this.state.warningValue[item.id] : '';
        const reactivateValue = this.state.reactivateValue ? this.state.reactivateValue[item.id] : '';
        // validate?
        const isQuitAvailable = this.state.quitValue && this.state.quitValue[item.id] && this.state.quitValue[item.id] !== '';
        const isSuspendAvailable = this.state.suspendValue && this.state.suspendValue[item.id] && this.state.suspendValue[item.id] !== '';
        const isReactivateAvailable = this.state.reactivateValue && this.state.reactivateValue[item.id] && this.state.reactivateValue[item.id] !== '';
        // show?
        const isEnabledReactivate = item.status && ['QUIT', 'SUSPENDED'].includes(item.status);
        const isEnabledDecline = item.status && ['BACKGROUND_APPROVED', 'ACTIVE', 'INACTIVE', 'BUSY'].includes(item.status);

        return <div style={styles.actionControls}>
          {item.user_id && <S.MessageLink
            onClick={() => this.onMessageToDriver(item.user_id)} className="fa fa-commenting-o" title={`Link to message`}/>}
          {<AxlPopConfirm
            trigger={<AxlButton tiny bg={`maize`} loading={reacting && reacting[item.id]} style={styles.actionButton}>{`Warning`}</AxlButton>}
            titleFormat={<div>{`Warning`}</div>}
            textFormat={<div><div>{`Are you sure you want to send an email to this driver`}</div></div>}
            okText={`OK`}
            onOk={this.warning(item)}
            cancelText={`Cancel`}
            onCancel={() => this.setState({reactivateValue: ""})}>
            <div style={styles.categoryWrap}>
              <AxlSelect
              options={warningCategories}
              name='category' style={{...styles.category}} 
              onSelect={(e) => {this.handleWarningCategory(e, warningTemplateHtmlConfig, warningValue)}}
              />
            </div>
            <AxlTextArea value={warningValue} name={`suspend_body`}
              placeholder={`Ensure any reasoning points to a specific violation in the TSA agreement (maybe include this as a sub-note somewhere on the page)`}
              containerStyle={styles.confirmBoxContainerStyle}
              style={{...styles.confirmBoxStyle, ...{border: !isSuspendAvailable ? '1px solid red' : ''}}} onChange={this.handleWarningTextarea(item, warningTemplateHtmlConfig, warningCategory)} fluid />            
            <RichTextEditor
              value={editorWarningState}
              onChange={this.setEditorWarningState}
              rootStyle={{ margin: 15 }}
              />
          </AxlPopConfirm>}

          {isEnabledDecline && <AxlPopConfirm
            trigger={<AxlButton tiny bg={'bluish'} loading={suspending && suspending[item.id]} disabled={!isEnabledDecline} style={styles.actionButton}>{`Suspend`}</AxlButton>}
            titleFormat={<div>{`Suspend`}</div>}
            textFormat={<div><div>Are you sure you want to Suspend this driver? </div><div> Keep in mind that if any drivers want to quit, ask them to do it by themselves in the driver-app</div></div>}
            okText={`OK`}
            onOk={this.suspend(item)}
            cancelText={`Cancel`}
            onCancel={() => this.setState({warningValue: ""})}>
            <div style={styles.categoryWrap}>
              <Select
                variant="outlined"
                id="select-category"
                defaultValue={categories && categories[0] ? categories[0].value : null}
                style={{...styles.category}}
                onChange={(e) => {this.handleSuspendCategory(e, suspendValue)}}
              > 
                {categories && categories.map(c => (
                  <MenuItem value={c.value} key={c.value}>{c.name}</MenuItem>
                ))}
              </Select>
            </div>

            <AxlTextArea value={suspendValue} name={`suspend_body`}
              placeholder={`Ensure any reasoning points to a specific violation in the TSA agreement (maybe include this as a sub-note somewhere on the page)`}
              containerStyle={styles.confirmBoxContainerStyle}
              style={{...styles.confirmBoxStyle, ...{border: !isSuspendAvailable ? '1px solid red' : ''}}} onChange={this.handleSuspendTextarea(item, templateHtmlConfig, suspendCategory)} fluid />

            <RichTextEditor
              value={editorSuspensionState}
              onChange={this.setEditorSuspensionState}
              rootStyle={{ margin: 15 }}
              />

          </AxlPopConfirm>}
          {isEnabledReactivate && <AxlPopConfirm
            trigger={<AxlButton tiny bg={`maize`} loading={reacting && reacting[item.id]} disabled={!isEnabledReactivate} style={styles.actionButton}>{`Re-Activate`}</AxlButton>}
            titleFormat={<div>{`Re-Activate`}</div>}
            textFormat={<div><div>{`Are you sure you want to Re-Activate this driver`}</div><div>Please be reminded that reactivated drivers are NOT automatically added to any pools</div></div>}
            okText={`OK`}
            onOk={this.reActivate(item)}
            cancelText={`Cancel`}
            onCancel={() => this.setState({reactivateValue: ""})}>
            <AxlTextArea value={reactivateValue} name={`reactivate_body`}
              placeholder={`Ensure any reasoning points to a specific violation in the TSA agreement (maybe include this as a sub-note somewhere on the page)`}
              containerStyle={styles.confirmBoxContainerStyle}
              style={{...styles.confirmBoxStyle, ...{border: !isReactivateAvailable ? '1px solid red' : ''}}} onChange={this.handleReactivateTextarea(item)} fluid />
          </AxlPopConfirm>}
        </div>
      }
    } else if(isDispatcher) {
      renderer.actions = (v, item) => {
        return <div style={styles.actionControls}>
          {item.user_id && <S.MessageLink
            onClick={() => this.onMessageToDriver(item.user_id)} className="fa fa-commenting-o" title={`Link to message`}/>}
        </div>
      }
    }

    return <div>
      <div style={styles.searchBar}>
        <FormControl variant="outlined" size='small' fullWidth>
          <OutlinedInput
            style={{...styles.outlinedInput}}
            id="search"
            value={filters && filters.q || ''}
            onChange={(evt) => this.changeSearch(evt.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => {
                  driverListStore.setFilters({q: null});
                  this.search();
                }}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            }
            labelWidth={0}
            onKeyDown={(evt) => {
              if (evt.key === 'Enter') {
                evt.preventDefault();
                this.search();
              }
            }}
            placeholder='Enter first name/last name/email/phone number/zipcode'
          />
        </FormControl>
        <Button variant='contained' color='primary' onClick={this.search} size='small' style={styles.searchButton}>
          {searching ? <CircularProgress size={20} color='default'/> : 'Search'}
        </Button>
      </div>
      <div style={{...styles.wrapTitle, color:'#626262'}}>
        {!!allowDriverRating && <Link to='/driver-rating-config' style={{color:'#4a90e2', fontWeight: 600, fontFamily:'AvenirNext'}}>Performance Calculations</Link>}
        <div style={{...styles.title, textAlign:'right', color:'#626262'}}>
          {result.count !== undefined ? <span>Total driver{result.count > 2 ? 's': ''}: <span style={{color: '#887fff'}}>{result.count}</span></span> : `Loading...`}
        </div>
        <i onClick={this.downloadCSV} style={styles.iconDownload} className="fa fa-download" title={`Click to download CSV`} />
      </div>
      <DriverListComponent pagination renderer={renderer} />
    </div>
  }
}

export default DriverList
