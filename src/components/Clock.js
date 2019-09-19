import React from 'react';

const Clock = props => {
  var elapsed = Math.round(props.elapsed / 100);
  var timer = elapsed / 10 + (elapsed % 10 ? "" : ".0");
  return <span className="timer">{timer}</span>;
}

export default Clock