import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { compose } from 'recompose';
import { Box, FormControlLabel, Checkbox, Typography, makeStyles } from '@material-ui/core';

import TicketBookItem from './TicketBookItem';

const useStyles = makeStyles({
  ticketBookContainer: {
    overflow: 'auto',
    maxHeight: 'calc(100vh - 480px)',
  },
  selectAll: {
    display: 'block',
    paddingLeft: '11px',
    marginBottom: '10px',
  },
});

function TicketBookList(props) {
  const classes = useStyles();

  const { bookingStore } = props;
  const { activeSession, selectedAssignmentIds, selectedTicketBookIds } = bookingStore;
  const ticketBooks = _.get(activeSession, 'books', []);

  const [filterUnClaimed, setFilterUnclaimed] = useState(true);
  const [filterUnbooked, setFilterUnbooked] = useState(true);

  const visibleTicketBooks = ticketBooks
    .map((book) => {
      const tickets = book.tickets || [];
      const assignments = book.assignments || [];

      const unbooked = tickets.filter((ticket) => !ticket.holder);
      const unclaimed = tickets.filter((ticket) => ticket.holder && ticket.status !== 'CLAIMED' && ticket.status !== 'COMPLETED');
      const openAssignments = _.orderBy(
        assignments.filter((assignment) => !assignment.driver_id),
        ['tour_cost'],
        ['desc'],
      );

      return { ...book, assignments: openAssignments, unbooked, unclaimed };
    })
    .filter((book) => {
      const filterByUnbooked = filterUnbooked && book.unbooked.length > 0;
      const filterByUnclaimed = filterUnClaimed && book.unclaimed.length > 0;

      return filterByUnbooked || filterByUnclaimed;
    });

  const ticketBookIds = visibleTicketBooks.map((book) => book.id);
  const assignmentIds = visibleTicketBooks.map((book) => book.assignments.map((a) => a.id)).flat();

  const handleChangeUnClaim = (event) => {
    setFilterUnclaimed(event.target.checked);
    bookingStore.cleanupBookingSessionFormState();
  };

  const handleChangeUnBook = (event) => {
    setFilterUnbooked(event.target.checked);
    bookingStore.cleanupBookingSessionFormState();
  };

  const handleToggleCheckAll = (event) => {
    const checked = event.target.checked;

    const newSelectedAssignments = checked ? assignmentIds : [];
    const newSelectedTicketBookIds = checked ? ticketBookIds : [];

    bookingStore.setSelectedAssignments(newSelectedAssignments);
    bookingStore.setSelectedTicketBooks(newSelectedTicketBookIds);
  };

  const isCheckAll = selectedTicketBookIds.length > 0 && selectedTicketBookIds.length === visibleTicketBooks.length;
  const isIndeterminate = Boolean(selectedTicketBookIds.length && selectedTicketBookIds.length !== visibleTicketBooks.length);

  return (
    <Box>
      <Box textAlign="center">
        <FormControlLabel label="UnClaimed" control={<Checkbox size="small" checked={filterUnClaimed} onChange={handleChangeUnClaim} />} />
        <FormControlLabel label="UnBooked" control={<Checkbox size="small" checked={filterUnbooked} onChange={handleChangeUnBook} />} />
      </Box>
      <Box sx={{ padding: '0 10px' }}>
        <Typography variant="caption">{`${selectedAssignmentIds.length} assignments selected`}</Typography>
      </Box>
      <FormControlLabel label="Select all" classes={{ root: classes.selectAll }} control={<Checkbox size="small" checked={isCheckAll} indeterminate={isIndeterminate} onChange={handleToggleCheckAll} />} />
      <Box className={classes.ticketBookContainer}>
        {visibleTicketBooks.length === 0 && <Typography align="center">No data</Typography>}
        {visibleTicketBooks.map((book) => (
          <TicketBookItem key={book.name} book={book} />
        ))}
      </Box>
    </Box>
  );
}

export default compose(inject('bookingStore'), observer)(TicketBookList);
