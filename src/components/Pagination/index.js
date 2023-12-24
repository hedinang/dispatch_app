import React, { useState, useEffect } from 'react';
import Pagination from '@material-ui/lab/Pagination';
import { Button } from '@material-ui/core';
import { ChevronRight } from '@material-ui/icons';
import { usePaginationItemStyles, rootStyle } from './styles';

const AdminPagination = (props) => {
  let { total, size, onChange, setPage, forceUpdatePage, ...otherProps } = props;
  const [input, setInput] = useState('');
  const [newPage, setNewPage] = useState(1);
  const classed = rootStyle();
  const count = Math.ceil(total / size);
  usePaginationItemStyles();

  const handleChangeInput = (e) => {
    e.preventDefault();
    const { value } = e.target;
    setInput(parseInt(value, 10));
  };
  const handleChangePage = (e, number) => {
    onChange(e, number);
    setNewPage(number);
    forceUpdatePage = number - 1;
  };

  const handleGoPage = (e) => {
    const goPageValue = input > count ? count : input;
    onChange(e, goPageValue);
    setNewPage(goPageValue);
    forceUpdatePage = goPageValue - 1;
    setInput('');
  };

  if (total <= size) return null;

  // Handle force update page number
  if (!isNaN(forceUpdatePage) && forceUpdatePage != newPage - 1) {
    setNewPage(forceUpdatePage + 1);
  }

  return (
    <div className={classed.root}>
      <Pagination onChange={handleChangePage} count={count} page={newPage} {...otherProps} />
      <div className={classed.goTo}>
        <div className={classed.text}>Go to page</div>
        <input type="number" className={classed.input} onChange={handleChangeInput} value={input} min={1} />
        <Button onClick={handleGoPage} size="small" className={classed.button} endIcon={<ChevronRight className={classed.rightIcon} />}>
          Go
        </Button>
      </div>
    </div>
  );
};
AdminPagination.defaultProps = {
  total: 0,
  size: 0,
};

export default React.memo(AdminPagination);
