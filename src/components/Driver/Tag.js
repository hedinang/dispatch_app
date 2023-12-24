import React from 'react';

function Tag({ children, fontSize, bgColor, color }) {
  if (process.env.REACT_APP_DRIVER_TAG_ENABLE.trim() === 'false') return <React.Fragment></React.Fragment>

  const fSize = fontSize ? fontSize : 10;
  const backgroundColor = bgColor ? bgColor : '#a2d55c';
  const textColor = color ? color : '#fff';
  const IGNORE_TAGS = ['OLD']
  const tags = children && children.filter(t => !IGNORE_TAGS.includes(t.toUpperCase()));
  return (
    <React.Fragment>
      {tags && tags.map((tag, i) => (
        <div key={i} style={{ transform: 'skew(-20deg)', backgroundColor, padding: '2px 10px', color: '#fff', marginLeft: 5 }}>
          <div style={{ transform: 'skew(20deg)', color: textColor, marginBottom: 0, fontSize: fSize }}>{tag}</div>
        </div>
      ))}
    </React.Fragment>
  );
}

export default Tag;
