import React from 'react';

class TextDisplay extends React.Component {
  _getCompletedText = () => {
    if (this.props.lineView) return '';
    return this.props.children.slice(0, this.props.index);
  }

  _getCurrentText = () => {
    let idx = this.props.index;
    let text = this.props.children;
    if (text.slice(idx).indexOf(' ') === -1) return text.slice(idx);
    return text.slice(idx, idx + text.slice(idx).indexOf(' '));
  }

  _getRemainingText = () => {
    let idx = this.props.index;
    let text = this.props.children;
    if (text.slice(idx).indexOf(' ') === -1) return '';
    let wordEnd = idx + text.slice(idx).indexOf(' ');
    if (this.props.lineView) {
      return text.slice(wordEnd).split(' ').slice(0, 5).join(' ');
    }
    return text.slice(wordEnd);
  }

  render() {
    return (
      <div className={this.props.lineView ? "textDisplay lg" : "textDisplay"}>
        {this._getCompletedText()}
        <span className={this.props.error ? "error" : "success"}>
          {this._getCurrentText()}
        </span>
        {this._getRemainingText()}
      </div>
    );
  }
}
export default TextDisplay;
