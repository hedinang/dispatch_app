import React, { Component } from 'react';
import { AxlTable, AxlButton, AxlPagination, AxlModal, AxlSearchBox, AxlMultiSelect, AxlPopConfirm } from 'axl-reactjs-ui';
import styles, * as E from './styles';
import Moment from 'react-moment';
import { inject, observer } from 'mobx-react';
import { Link } from "react-router-dom";
import QuizResult from '../../components/QuizResult/index';
import { REGIONS_STATE } from '../../constants/regions';

@inject('driverRegistrationStore')
@observer
class DriverRegistrationList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            actionId: null,
            showAction: false,
            showingQuiz: false,
            showFreezeOption: false,
            freezeDriversSelected: [],
            isCloseModal: false,
            selectedRegistration: {},
            coveredRegions: []
        };
        this.node = [];
        // this.handleClickOutside = this.handleClickOutside.bind(this);
        this.setRegion = this.setRegion.bind(this)
    }

    componentDidMount() {
        const { driverRegistrationStore } = this.props
        driverRegistrationStore.loadRecords();
        // document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        // document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        const that = this;
        const checkInside = this.node && this.node.map(node => node).filter( node => node && node.contains(event.target)).length;
        if (!checkInside) {
            this.setState({actionId: null, showAction: false});
        }
    };

    onSelectPage(page) {
        const { driverRegistrationStore } = this.props
        driverRegistrationStore.selectPage(page)
    }

    showQuiz(registration) {
        this.setState({
            showingQuiz: true,
            selectedRegistration: registration
        })
    }

    sendBackgroundCheck(registration) {
        const { driverRegistrationStore } = this.props
        let r = window.confirm("Are you sure you want to manually send background check request!");
        if (r === true) {
            driverRegistrationStore.sendBackgroundCheck(registration)
        }
    }

    manualApprove = (registration) => (e) => {
      const { driverRegistrationStore } = this.props;
      driverRegistrationStore.manualApprove(registration);
    };

    requiz = (registration) => (e) => {
        const { driverRegistrationStore } = this.props;
        driverRegistrationStore.requiz(registration);
    };

    copyToClipboard = (registration) => (e) => {
        const el = document.createElement('textarea');
        el.value = registration.driver.background_invite_url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("Background URL copied to clipboard");
    };

    resendBackgroundRequestURL = (registration) => (e) => {
        const { driverRegistrationStore } = this.props;
        driverRegistrationStore.resendBackgroundRequestURL(registration);
    };

    toggleAction = (registration) => (e) => {
        this.setState({actionId: registration.driver.id, showAction: !this.state.showAction});
    };

    changeSearch = (e) => {
      const {driverRegistrationStore} = this.props;
      const value = e;

      this.setState({q: value})
    };

    search = (e) => {
      const {driverRegistrationStore} = this.props;
      driverRegistrationStore.setQuery(this.state.q);
    };

    setRegion(regions) {
        const { driverRegistrationStore } = this.props
        let f = regions && regions.length > 0 ? regions[0].value : null
        driverRegistrationStore.setRegion(f)
    }

    setStatus(status) {
        const { driverRegistrationStore } = this.props
        let f = status && status.length > 0 ? status[0].value : null
        driverRegistrationStore.setStatus(f)
    }

    setStates(states) {
        const { driverRegistrationStore } = this.props
        let f = states && states.length > 0 ? states[0].value : null
        driverRegistrationStore.setState(f)
    }

    emoji(position, driverId = null) {
        if (!position || position.trim === '') {
            return "--";
        }
        switch(position.toUpperCase().split("_")[0]) {
            case "UNFILLED": return "-";
            case "STARTED": return "✍️";
            case "MODIFIED": return "✍️";
            case "FINISHED": return "✔️";
            case "FROZEN": return this._unfrozenConfirmation(driverId);
            case "SEALED": return "✅";
            case "AUTO": return "👍";
            case "MANUALLY": return "👍🏼";
            case "MANUAL": return "👍🏻";
            case "REJECTED": return "👎️";
            case "UNFROZEN": return "🤔"
        }
        return "--";
    }

    _unfrozen = (driverId) => {
        if(!driverId) return false;

        const { driverRegistrationStore } = this.props;
        driverRegistrationStore.unfrozen(driverId, res => {
            if(res.ok || res.status === 204) {
                driverRegistrationStore.loadRecords();
            }
        });
    }

    _unfrozenConfirmation = (driverId) => {
        const { isCloseModal, freezeDriversSelected, showFreezeOption } = this.state;

        return <AxlPopConfirm
          main
          isClose={isCloseModal}
          lastChild
          trigger={<E.FreezeeButton>🥶</E.FreezeeButton>}
          titleFormat={<div>{`UNFREEZE?`}</div>}
          textFormat={<div>{`Please  confirm if you would like to unfreeze this driver to have the background check started.`}</div>}
          okText={`UNFREEZE and run immediately`}
          onOk={() => this._unfrozen(driverId)}
          controlText={`UNFREEZE  and wait for driver to confirm interest`}
          onControl={this._getCoveredRegions}
          cancelText={`NO !!`}
          styleContainer={{overflow: 'visible'}}
          onCancel={() => console.log('onCancel')}>
            {!!this.state.coveredRegions.length && <E.FreezeFilterOptions>
                <AxlMultiSelect
                  multiple
                  isClear={false}
                  isClearable={false}
                  placeholderButtonLabel="all state"
                  onChange={(v) => this._freezeDriverSelected(v)}
                  placeholder="Filter by state"
                  options={ this.state.coveredRegions }
                  style={styles.filterStateOption}
                  customStyle={{menuList: {maxHeight: 150, textAlign: 'left'}}}
                />
                <AxlButton tiny bg={`pink`} onClick={() => this._unfreezeForDriver(driverId, freezeDriversSelected)}>{`Submit`}</AxlButton>
            </E.FreezeFilterOptions>}
        </AxlPopConfirm>
    }

    _getCoveredRegions = () => {
        const { driverRegistrationStore } = this.props;

        driverRegistrationStore.getCoveredRegions(res => {
            if(res.ok || res.status === 200) {
                this.setState({
                    coveredRegions: res.data.map(region => {
                        return { label: region.name, value: region.id }
                    })
                });
            }
        });
    }

    _unfreezeForDriver = (driverId = null, regions = []) => {
        if(!driverId) return false;

        const { driverRegistrationStore } = this.props;
        driverRegistrationStore.unfreezeDriver(driverId, regions, res => {
            if(res.ok || res.status === 204) {
                driverRegistrationStore.loadRecords();
                // Clear options and close modal
                this.setState({
                    isCloseModal: true,
                    showFreezeOption: false,
                    freezeDriversSelected: []
                });
            }
        });
    }

    _freezeDriverSelected(values) {
        this.setState({freezeDriversSelected: values.map(v => v.value)});
    }

    render() {
        const areaOptions = [
            { label: '[SFO] Bay Area', value: 'SFO'},
            { label: '[LAX] Los Angeles', value: 'LAX'},
            { label: '[SDLAX] San Diego', value: 'SDLAX'},
            { label: '[SMF] Sacramento', value: 'SMF'},
            { label: '[PDX] Portland', value: 'PDX'},
            { label: '[PHX] Phoenix', value: 'PHX'},
            { label: '[SEA] Seattle', value: 'SEA'},
            { label: '[JFK] New York', value: 'JFK'},
            { label: '[DFW] Dallas', value: 'DFW'},
            { label: '[HOU] Houston', value: 'HOU'},
            { label: '[AUS] Austin', value: 'AUS'},
            { label: '[PHL] Philadelphia', value: 'PHL'},
            { label: '[EWR] New Jersey', value: 'EWR'},
            { label: '[CHI] Chicago', value: 'CHI'},
            { label: '[MKE] Milwaukee', value: 'MKE'},
            // {label: '[CCO1] FL - Merritt Island', value: 'CCO1'},
            // {label: '[FND1] FL - Destin', value: 'FND1'},
            // {label: '[FND2] FL - Niceville', value: 'FND2'},
            // {label: '[FND3] FL - Fort Walton Beach', value: 'FND3'},
            // {label: '[FND4] FL - Navarre', value: 'FND4'},
            // {label: '[LNC1] NC - Leland', value: 'LNC1'},
            // {label: '[MAL1] AL - Daphne', value: 'MAL1'},
            // {label: '[MAL2] AL - Robertsdale', value: 'MAL2'},
            // {label: '[MAL3] AL - Foley', value: 'MAL3'},
            // {label: '[MAL4] AL - Gulf Shores', value: 'MAL4'},
            // {label: '[MBP1] FL - Palm Bay', value: 'MBP1'},
            // {label: '[MBP2] FL - Melbourne', value: 'MBP2'},
            // {label: '[MSC1] SC - North Myrtle Beach', value: 'MSC1'},
            // {label: '[MSC2] SC - Conway', value: 'MSC2'},
            // {label: '[PNC1] FL - Callaway', value: 'PNC1'},
            // {label: '[PNC2] FL - Lynn Haven', value: 'PNC2'},
            // {label: '[PNC3] FL - Panama City Beach', value: 'PNC3'},
            // {label: '[PNS1] FL - Pensacola', value: 'PNS1'},
            // {label: '[PSL1] FL - Port St. Lucie', value: 'PSL1'},
            // {label: '[PSL2] FL - Fort Pierce', value: 'PSL2'},
            // {label: '[PSL3] FL - Stuart', value: 'PSL3'},
            // {label: '[TTV1] FL - Titusville', value: 'TTV1'},
            // {label: '[VBS1] FL - Vero Beach', value: 'VBS1'},
            // {label: '[VBS2] FL - Sebastian', value: 'VBS2'},
        ];

        const statusOptions = [
            { label: 'BACKGROUND STARTED', value: 'BACKGROUND_STARTED' },
            { label: 'BACKGROUND REQUESTED', value: 'BACKGROUND_REQUESTED' },
            { label: 'BACKGROUND REJECTED', value: 'BACKGROUND_REJECTED' },
            { label: 'BACKGROUND APPROVED', value: 'BACKGROUND_APPROVED' },
            { label: 'CREATED', value: 'CREATED' },
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'SUSPENDED', value: 'SUSPENDED' }
        ];

        const { driverRegistrationStore } = this.props;
        const { searchResult, manualApproving, requizing, resendingBGURL, loadingRecords, regStatusFilter, stateFilter, areaFilter } = driverRegistrationStore;
        const that = this;

        if (!searchResult) return <div></div>

        const { registrations } = searchResult;
        console.log('registrations', JSON.parse(JSON.stringify(registrations)));
        return <div style={{...styles.container}}>
            <div style={styles.searchBar}>
                <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
                <AxlButton loading={loadingRecords} onClick={this.search} bg={'periwinkle'} style={styles.searchButton} >Search</AxlButton>
                <div style={styles.wrapFilter}>
                    <div style={styles.filterLabel}>Filter by: </div>
                    <AxlMultiSelect
                        placeholderButtonLabel="all regions"
                        showValues={true}
                        singular={true}
                        allowAll={true}
                        onChange={(v) => this.setRegion(v)}
                        placeholder="Filter by region"
                        options={ areaOptions }
                        style={styles.filterOptions}
                    />
                    {/*<AxlMultiSelect*/}
                    {/*    placeholderButtonLabel="all status"*/}
                    {/*    showValues={true}*/}
                    {/*    singular={true}*/}
                    {/*    allowAll={true}*/}
                    {/*    onChange={(v) => this.setStatus(v)}*/}
                    {/*    placeholder="Filter by status"*/}
                    {/*    options={ statusOptions }*/}
                    {/*    style={styles.filterOptions}*/}
                    {/*/>*/}
                    <AxlMultiSelect
                        placeholderButtonLabel="all state"
                        showValues={true}
                        singular={true}
                        allowAll={true}
                        onChange={(v) => this.setStates(v)}
                        placeholder="Filter by state"
                        options={ REGIONS_STATE }
                        style={styles.filterOptions}
                    />
                </div>
            </div>
            <div style={styles.list}>
                <AxlTable>
                    <AxlTable.Header>
                        <AxlTable.Row>
                            <AxlTable.HeaderCell style={styles.highlightCell}>Registered TS</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell style={styles.highlightCell}>Couriers</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell style={styles.highlightCell}>ID</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell style={styles.highlightCell}>Name</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Phone</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Email</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Location</AxlTable.HeaderCell>
                            {/*<AxlTable.HeaderCell>Grade</AxlTable.HeaderCell>*/}
                            <AxlTable.HeaderCell>Personal</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Vehicle</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>SSN</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>BgCheck Submission</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>BgCheck Decision</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Contract Submission</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Contract Decision</AxlTable.HeaderCell>
                        </AxlTable.Row>
                    </AxlTable.Header>
                    <AxlTable.Body>
                        { registrations && registrations.map((registration, index) => {
                            const backgroundCheckerExoId = registration.record.background_checker_data.exo_id || registration.driver.background_worker_id;
                            const backgroundCheckerExoStatus = registration.record.background_checker_data.exo || registration.record.background_checker_data.exo_state || registration.record.background_checker_data.exo_status || registration.driver.background_exo_status || registration.driver.background_status || "begin";
                            const personalInfo = this.emoji((registration.record.phase || {}).personal_info);
                            const vehicleInfo = this.emoji((registration.record.phase || {}).vehicle_info);
                            const ssnInfo = this.emoji((registration.record.phase || {}).ssn);
                            const bcSubmissionInfo = this.emoji((registration.record.phase || {}).background_check_submission);
                            const contractSubmissionInfo = this.emoji((registration.record.phase || {}).contract_submission);
                            const bcDecision = this.emoji((registration.record.phase || {}).background_check_decision, registration.driver.id);
                            const contractDecision = this.emoji((registration.record.phase || {}).contract_decision);
                            return <AxlTable.Row key={registration.record.id}>
                                <AxlTable.Cell style={styles.highlightCell}><Moment interval={0} format={'DD MMM, HH:mm'}>{registration.record.ts}</Moment></AxlTable.Cell>
                                <AxlTable.Cell style={styles.highlightCell}>{registration.courier_companies}</AxlTable.Cell>
                                <AxlTable.Cell style={styles.highlightCell}>{registration.driver.id}</AxlTable.Cell>
                                <AxlTable.Cell style={styles.highlightCell}>{registration.driver.first_name} {registration.driver.last_name}</AxlTable.Cell>
                                <AxlTable.Cell>{registration.driver.phone_number}</AxlTable.Cell>
                                <AxlTable.Cell>{registration.driver.email}</AxlTable.Cell>
                                <AxlTable.Cell>{registration.driver.home_address.state} {registration.driver.home_address.zipcode}</AxlTable.Cell>
                                {/*<AxlTable.Cell>{registration.record.quiz_grade && <AxlButton*/}
                                {/*  tiny={true} style={{width: '30px'}} circular={true}*/}
                                {/*  disabled={!(registration.quiz && registration.quiz.questionnaire)}*/}
                                {/*  bg={ !!registration.quiz && (registration.record.quiz_grade >= registration.quiz.questionnaire.pass_threshold) ? 'bluish' : 'none'} onClick={ () => {*/}
                                {/*    if(registration.quiz && registration.quiz.questionnaire) {*/}
                                {/*        return this.showQuiz(registration);*/}
                                {/*    } else {*/}
                                {/*        return false;*/}
                                {/*    }*/}
                                {/*} }>{registration.record.quiz_grade}</AxlButton> }</AxlTable.Cell>*/}
                                <AxlTable.Cell>{personalInfo}</AxlTable.Cell>
                                <AxlTable.Cell>{vehicleInfo}</AxlTable.Cell>
                                <AxlTable.Cell>{ssnInfo}</AxlTable.Cell>
                                <AxlTable.Cell>{bcSubmissionInfo}</AxlTable.Cell>
                                <AxlTable.Cell>{bcDecision} {backgroundCheckerExoId ? <a target="_blank" href={`https://partners.turning.io/workers/${backgroundCheckerExoId}`}>{backgroundCheckerExoId}</a> : backgroundCheckerExoId}</AxlTable.Cell>
                                <AxlTable.Cell>{contractSubmissionInfo}</AxlTable.Cell>
                                <AxlTable.Cell>{contractDecision}</AxlTable.Cell>
                                {/*<AxlTable.Cell>*/}
                                {/*<div style={styles.edit} ref={(node) => this.node[index] = node}>*/}
                                {/*    <b keyname={index} onClick={this.toggleAction(registration)}>...</b>*/}
                                {/*    <div style={{...styles.dropdown, display: this.state.showAction && this.state.actionId === registration.driver.id ? 'block' : 'none'}}>*/}
                                {/*        <span style={styles.arrow} />*/}
                                {/*        <div style={styles.inner}>*/}
                                {/*          {registration.driver.background_status && !NOT_ALLOW_APPROVE_DRIVER_STATUS.includes(registration.driver.background_status) && <AxlButton loading={manualApproving} tiny style={{width: '80px'}} onClick={this.manualApprove(registration)}>Approve</AxlButton>}*/}
                                {/*          {registration.driver.background_status && NOT_ALLOW_APPROVE_DRIVER_STATUS.includes(registration.driver.background_status) && <AxlButton disabled tiny style={{width: '80px'}} onClick={this.manualApprove(registration)}>Approve</AxlButton>}*/}
                                {/*        </div>*/}
                                {/*      <div style={styles.inner}>*/}
                                {/*        {registration.record.status && !NOT_ALLOW_REQUIZ_DRIVER_STATUS.includes(registration.record.status) && <AxlButton loading={requizing} tiny style={{width: '80px'}} onClick={this.requiz(registration)}>Send Quiz</AxlButton>}*/}
                                {/*        {registration.record.status && NOT_ALLOW_REQUIZ_DRIVER_STATUS.includes(registration.record.status) && <AxlButton disabled tiny style={{width: '80px'}}>Send Quiz</AxlButton>}*/}

                                {/*      </div>*/}
                                {/*      <div style={styles.inner}>*/}
                                {/*        {registration.driver.background_invite_url && <AxlButton  tiny style={{width: '80px'}} onClick={this.copyToClipboard(registration)}>Copy BG.URL</AxlButton>}*/}
                                {/*      </div>*/}
                                {/*      <div style={styles.inner}>*/}
                                {/*        {registration.driver.background_invite_url && ['emailed', null].includes(registration.driver.background_exo_status) && registration.driver.background_status && !NOT_ALLOW_RESEND_BACKGROUND_REQUEST_URL.includes(registration.driver.background_status) && <AxlButton loading={resendingBGURL} tiny style={{width: '80px'}} onClick={this.resendBackgroundRequestURL(registration)}>Send BG.URL</AxlButton>}*/}
                                {/*      </div>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*</AxlTable.Cell>*/}
                            </AxlTable.Row>;
                        }) }
                    </AxlTable.Body>
                </AxlTable>
            </div>
            <div style={styles.paginationContainer}>
                <AxlPagination onSelect = { this.onSelectPage.bind(this) } current={searchResult.page} total={searchResult.total_pages}></AxlPagination>
            </div>
            { this.state.showingQuiz && <AxlModal style={{width: '1000px', height: '800px'}}>
                <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: '70px', overflow: 'auto'}}>
                    <QuizResult registration={this.state.selectedRegistration} />
                </div>
                <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', textAlign: 'center'}}>
                    { (this.state.selectedRegistration.record.status !== 'BACKGROUND_SENT' && !this.state.selectedRegistration.driver.background_worker_id) && <AxlButton style={{width: '200px'}} onClick={ () => this.sendBackgroundCheck(this.state.selectedRegistration) }>Send Background Check</AxlButton> }
                    <AxlButton style={{width: '200px'}} bg={'red'} onClick={() => this.setState({showingQuiz: false})}>Close</AxlButton>
                </div>
            </AxlModal>}
        </div>
    }
}

export default DriverRegistrationList
