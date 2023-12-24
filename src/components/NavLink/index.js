import React from 'react';
import { Link } from 'react-router-dom';

function joinClassnames(...classnames) {
  return classnames.filter((i) => i).join(' ');
}

const NavLink = (props) => {
  const { className: classNameProp, otherActive, to, location, ...rest } = props;
  const { pathname } = location;
  let isActive = false;
  if (to !== '/') {
    isActive = !!pathname.match(props.to);
  } else if (pathname === to) {
    isActive = true;
  } else {
    isActive = !!pathname.match(otherActive);
  }
  const className = isActive ? joinClassnames(classNameProp, 'active') : classNameProp;
  const newProps = {
    className,
    to,
    ...rest,
  };
  return <Link {...newProps} />;
};

export default NavLink;