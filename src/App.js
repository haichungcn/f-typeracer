import React from "react";

import Clock from "./components/Clock";
import Footer from "./components/Footer";
import TextInput from "./components/TextInput";
import TextDisplay from "./components/TextDisplay";

require("./sass/app.scss");
require("./font-awesome/css/font-awesome.css");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wpm: 0,
      index: 0,
      value: "",
      error: false,
      errorCount: 0,
      timeElapsed: 0,
      lineView: false,
      startTime: null,
      completed: false,
      excerpt: this._randomElement(this.props.excerpts),
    };
  }
  async componentDidMount() {
    this.intervals = [];
  }

  setInterval() {
    this.intervals.push(setInterval.apply(null, arguments));
  }

  _randomElement = array => {
    return this.props.excerpts[
      Math.floor(Math.random() * this.props.excerpts.length)
    ];
  };

  _handleInputChange = e => {
    if (this.state.completed) return;

    let inputVal = e.target.value;
    let index = this.state.index;
    if (this.state.excerpt.slice(index, index + inputVal.length) === inputVal) {
      if (inputVal.slice(-1) === " " && !this.state.error) {
        this.setState({
          value: "",
          index: this.state.index + inputVal.length
        });
      } else if (index + inputVal.length === this.state.excerpt.length) {
        this.setState(
          {
            value: "",
            completed: true
          },
          function() {
            this._calculateWPM();
          }
        );
        this.intervals.map(clearInterval);
      } else {
        this.setState({
          error: false,
          value: inputVal
        });
      }
    } else {
      this.setState({
        error: true,
        value: inputVal,
        errorCount: this.state.error
          ? this.state.errorCount
          : this.state.errorCount + 1
      });
    }
  };

  _changeView = e => {
    this.setState({ lineView: !this.state.lineView });
  };

  _restartGame = () => {
    this.setState(
      {
        wpm: 0,
        index: 0,
        value: "",
        error: false,
        errorCount: 0,
        timeElapsed: 0,
        lineView: false,
        startTime: null,
        completed: false,
        excerpt: this._randomElement(this.props.excerpts)
      },
      () => this.intervals.map(clearInterval)
    );
  };

  _setupIntervals = () => {
    this.setState(
      {
        startTime: new Date().getTime()
      },
      () => {
        this.setInterval(() => {
          this.setState({
            timeElapsed: new Date().getTime() - this.state.startTime
          });
        }, 50);
        this.setInterval(() => {
          this._calculateWPM();
        }, 1000);
      }
    );
  };

  _calculateWPM = () => {
    let elapsed = new Date().getTime() - this.state.startTime;
    let wpm;
    if (this.state.completed) {
      wpm = (this.state.excerpt.split(" ").length / (elapsed / 1000)) * 60;
    } else {
      let words = this.state.excerpt.slice(0, this.state.index).split(" ")
        .length;
      wpm = (words / (elapsed / 1000)) * 60;
    }
    this.setState({
      wpm: this.state.completed ? Math.round(wpm * 10) / 10 : Math.round(wpm)
    });
  };

  render() {
    return (
      <>
        <div className="header">
          <h1>Type Racing</h1>
          <i onClick={this._restartGame} className="fa fa-lg fa-refresh"></i>
          <i className="fa fa-lg fa-bars" onClick={this._changeView}></i>
        </div>
        <TextDisplay
          index={this.state.index}
          error={this.state.error}
          lineView={this.state.lineView}
        >
          {this.state.excerpt}
        </TextDisplay>
        <TextInput
          error={this.state.error}
          value={this.state.value}
          started={!!this.state.startTime}
          setupIntervals={this._setupIntervals}
          onInputChange={this._handleInputChange}
        />
        <div className={this.state.completed ? "stats completed" : "stats"}>
          <Clock elapsed={this.state.timeElapsed} />
          <span className="wpm">{this.state.wpm}</span>
          <span className="errors">{this.state.errorCount}</span>
        </div>
        <Footer />
      </>
    );
  }
}

export default App;
