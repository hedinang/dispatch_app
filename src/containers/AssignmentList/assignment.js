import { AxlMiniAssignmentBox } from 'axl-reactjs-ui'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'

const Assignment = props => {
    const {assignment, onClick, tags, eta, status, msg, style} = props;
    const handleClick = useCallback((e) => onClick(assignment), []);
    let badge = null;
    let finalTags = tags;

    if (!!assignment.aggregated_tags && assignment.aggregated_tags.includes("ROLLED")) {
        badge = "ROLLED";
        finalTags = tags.filter(tag => tag.plaint_text !== "ROLLED");
    }
    let driverTags = null
    const IGNORE_TAGS = ['OLD']
    if (process.env.REACT_APP_DRIVER_TAG_ENABLE.trim() === 'true' && assignment.driver && assignment.driver.tags && assignment.driver.tags.length) {
        driverTags = assignment.driver.tags.filter(t => !IGNORE_TAGS.includes(t.toUpperCase()))
    }

    return (
        <div style={{position:'relative'}}>
            <AxlMiniAssignmentBox
                tags={finalTags}
                driverTags={driverTags}
                onClick={handleClick}
                key={assignment.id} assignment={assignment}
                status={status}
                badge={badge}
                eta={eta && eta.eta ? eta : null}
                message={msg}
                style={style}
                cardStyles={{backgroundColor: !!assignment.courier_id ? 'rgba(74, 188, 78, 0.2)' : ''}}
            />
        </div>
    )
}

Assignment.propTypes = {
    assignment: PropTypes.object,
    tags: PropTypes.array,
    eta: PropTypes.object,
    status: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    msg: PropTypes.string,
    style: PropTypes.object,
}

const isArrayEqual = function(x, y) {
    return _(x).xorWith(y, _.isEqual).isEmpty();
};


function areEqual(prevProps, nextProps) {
    return prevProps.assignment.id == nextProps.assignment.id && prevProps.status == nextProps.status && 
            prevProps.eta == nextProps.eta && isArrayEqual(prevProps.tags, nextProps.tags) && 
            _.isEqual(prevProps.style, nextProps.style)
  }
  
export default React.memo(Assignment, areEqual);
