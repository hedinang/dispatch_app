import React, { useState } from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Typography, Checkbox, makeStyles } from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { TICKET_STATUS } from '../../constants/colors';

const useStyles = makeStyles({
  container: {
    '& + &': {
      marginTop: '1rem',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  clickable: {
    display: 'flex',
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
  },
  showMore: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: 300,
    paddingRight: '1rem',
    fontFamily: 'AvenirNext',
    color: '#808080',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  counter: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
    paddingLeft: '44px',
    fontSize: 12,
  },
  assignments: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem',
    padding: '5px 16px 5px 44px',
  },
  assignment: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: '2px',
    minWidth: '100px',
    cursor: 'pointer',
    color: 'rgb(34, 34, 34)',
    backgroundColor: '#f4f4f4',
    boxShadow: 'rgb(68, 68, 68) 0px 0px 1px',
    '&.active': {
      backgroundColor: '#ffeaea',
    },
  },
  label: {
    display: 'block',
    textAlign: 'right',
    fontWeight: 600,
    fontFamily: 'AvenirNext-Medium',
  },
  cost: {
    display: 'block',
    textAlign: 'right',
    fontSize: 10,
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  checkbox: {
    padding: '4px',
  },
});

const TicketBookItem = (props) => {
  const classes = useStyles();
  const { book, bookingStore } = props;

  const [open, setOpen] = useState(true);

  const { name, assignments } = book;
  const { selectedAssignmentIds, selectedTicketBookIds } = bookingStore;
  const assignmentIds = assignments.map((a) => a.id);
  const selectedIds = assignmentIds.filter((id) => selectedAssignmentIds.includes(id));

  const isCheckAll = selectedTicketBookIds.includes(book.id);
  const indeterminate = Boolean(selectedIds.length && selectedIds.length !== assignmentIds.length);

  const handleChangeCheckAll = (event) => {
    const checked = event.target.checked;
    const selectedBookIds = checked ? [...selectedTicketBookIds, book.id] : selectedTicketBookIds.filter((id) => id !== book.id);
    const newAssignmentIds = checked ? [...selectedAssignmentIds, ...assignmentIds] : selectedAssignmentIds.filter((id) => !assignmentIds.includes(id));

    bookingStore.setSelectedAssignments(newAssignmentIds);
    bookingStore.setSelectedTicketBooks(selectedBookIds);
  };

  const handleChangeCheckbox = (checked, assignmentId) => {
    const newAssignmentIds = checked ? [...selectedAssignmentIds, assignmentId] : selectedAssignmentIds.filter((id) => id !== assignmentId);
    bookingStore.setSelectedAssignments(newAssignmentIds);

    const isEqualCheckAll = assignmentIds.every((id) => newAssignmentIds.includes(id));
    const isEqualUnCheckAll = assignmentIds.some((id) => !newAssignmentIds.includes(id));

    if (isEqualCheckAll) bookingStore.setSelectedTicketBooks(Array.from(new Set([...selectedTicketBookIds, book.id])));
    if (isEqualUnCheckAll) bookingStore.setSelectedTicketBooks(selectedTicketBookIds.filter((id) => id !== book.id));
  };

  const handleToggle = () => setOpen(!open);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Checkbox color="secondary" size="small" checked={isCheckAll} indeterminate={indeterminate} onChange={handleChangeCheckAll} />
        <div className={classes.clickable} onClick={handleToggle}>
          {open ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
          <span className={classes.name}>{name}</span>
        </div>
        <span className={classes.showMore} onClick={handleToggle}>
          {open ? 'Show less' : 'Show more'}
        </span>
      </div>
      <div className={classes.counter}>
        <span style={TICKET_STATUS.PENDING}>UnClaimed [{book.unclaimed.length}]</span>
        <span style={TICKET_STATUS.UNBOOKED}>UnBooked [{book.unbooked.length}]</span>
      </div>
      {open && (
        <div className={classes.assignments}>
          {assignments.length === 0 ? (
            <Typography variant="caption">
              No data
            </Typography>
          ) : (
            assignments.map((assignment) => {
              const checked = selectedAssignmentIds.includes(assignment.id);

              return (
                <div key={assignment.id} className={classes.assignment} onClick={() => handleChangeCheckbox(!checked, assignment.id)}>
                  <Checkbox size="small" classes={{ root: classes.checkbox }} checked={checked} onChange={(event) => handleChangeCheckbox(event.target.checked, assignment.id)} />
                  <div className={classes.right}>
                    <span className={classes.label}>{assignment.label}</span>
                    <span className={classes.cost}>{`Cost: $${assignment.tour_cost} | Bonus: $${assignment.bonus || 0}`}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default compose(inject('bookingStore'), observer)(TicketBookItem);
