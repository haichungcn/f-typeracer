import React from 'react';

class TextInput extends React.Component {
  handleChange = e => {
    if (!this.props.started) this.props.setupIntervals();
    this.props.onInputChange(e);
  };

  render() {
    return (
      <div className="textInput">
        <input
          autoFocus
          type="text"
          ref="textInput"
          value={this.props.value}
          onChange={this.handleChange}
          placeholder="Start typing.."
          className={this.props.error ? "error" : ""}
        />
      </div>
    );
  }
}

export default TextInput;