import React from "react";

import Clock from "./components/Clock";
import Footer from "./components/Footer";
import TextInput from "./components/TextInput";
import TextDisplay from "./components/TextDisplay";

require("./sass/app.scss");
require("./font-awesome/css/font-awesome.css");

class App extends React.Component {
  constructor(props) {
    const existingToken = sessionStorage.getItem("token");
    const accessToken =
      window.location.search.split("=")[0] === "?api_key"
        ? window.location.search.split("=")[1]
        : null;

    if (accessToken) {
      sessionStorage.setItem("token", accessToken);
    }
    super(props);

    this.state = {
      user: null,
      token: existingToken || accessToken,
      wpm: 0,
      index: 0,
      value: "",
      error: false,
      errorCount: 0,
      timeElapsed: 0,
      lineView: false,
      startTime: null,
      completed: false,
      excerpt: {body: ''},
      placeHolderText:"Start by type here..."
    };
  }

  async componentDidMount() {
    this.intervals = [];
    this.getUserInfo();
    this.getExcerpts();
    // this.setupCurrentUser();
  }

  async getUserInfo() {
    const res = await fetch('https://127.0.0.1:5000/getuser', {
      headers : {
        "Content-Type": "application/json",
        "Authorization": `Token ${this.state.token}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      console.log(data)
      this.setState({user:data})
    }
  }

  async handleLogOut() {
    const res = await fetch('https://127.0.0.1:5000/logout', {
      headers : {
        "Content-Type": "application/json",
        "Authorization": `Token ${this.state.token}`
      }
    })

    if (res.ok) {
      const data = await res.json()
      if (data.success === true) {
        sessionStorage.clear('token')
        this.setState({
          user:null,
          token:null
        })
      }
    }
  }


  setInterval() {
    this.intervals.push(setInterval.apply(null, arguments));
  }

  _randomElement = array => {
    return array[
      Math.floor(Math.random() * array.length)
    ];
  };

  _handleInputChange = e => {
    if (this.state.completed) {
      return;
    }
    let inputVal = e.target.value;
    let index = this.state.index;
    if (this.state.excerpt.body.slice(index, index + inputVal.length) === inputVal) {
      if (inputVal.slice(-1) === " " && !this.state.error) {
        this.setState({
          value: "",
          index: this.state.index + inputVal.length
        });
      } else if (index + inputVal.length === this.state.excerpt.body.length) {
        this.setState(
          {
            placeHolderText : "Enter to start over...",
            value: "",
            completed: true
          },
          this._calculateWPM
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

  _handleKeyPress = e => {
    if (this.state.completed) {
      console.log('still running', e.keyCode, e.key)
      if (e.keyCode === 13) {
        this._restartGame()
      }
    }
  }

  _changeView = e => {
    this.setState({ lineView: !this.state.lineView });
  };

  _restartGame = () => {
    this.getExcerpts()
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
        placeHolderText:"Start by type here..."
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
        this.setInterval(this._calculateWPM, 1000);
      }
    );
  };

  postScore = async (wpm, elapsed) => {
    const resp = await fetch("https://127.0.0.1:5000/scores", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.state.token}`
      },
      body: JSON.stringify({
        wpm,
        time: elapsed,
        errorCount: this.state.errorCount,
        excerpt_id: this.state.excerpt.id,
        user_id: this.state.user.user_id
      })
    });
    const data = await resp.json();
    if (data.code === 200) {
    } else {
      this.setState({ error: "Could not post score" });
    }
  };

  getExcerpts = async () => {
    const response = await fetch("https://127.0.0.1:5000/excerpts");
    if (response.ok) {
      const data = await response.json();
      console.log(data)
      this.setState({
        excerpts : data,
        excerpt : this._randomElement(data)
      });
    } 
  };

  _calculateWPM = () => {
    const elapsed = new Date().getTime() - this.state.startTime;
    let wpm;
    if (this.state.completed) {
      wpm = (this.state.excerpt.body.split(" ").length / (elapsed / 1000)) * 60;
      this.postScore(wpm, elapsed);
    } else {
      let words = this.state.excerpt.body.slice(0, this.state.index).split(" ")
        .length;
      wpm = (words / (elapsed / 1000)) * 60;
    }
    this.setState({
      wpm: this.state.completed ? Math.round(wpm * 10) / 10 : Math.round(wpm)
    });
  };

  renderGame = () => {
    return (
      <>
        <TextDisplay
          index={this.state.index}
          error={this.state.error}
          lineView={this.state.lineView}
          placeHolderText={this.state.placeHolderText}
        >
          {this.state.excerpt.body}
        </TextDisplay>
        <TextInput
          error={this.state.error}
          value={this.state.value}
          started={!!this.state.startTime}
          setupIntervals={this._setupIntervals}
          placeHolderText={this.state.placeHolderText}
          onInputChange={this._handleInputChange}
          onKeyPressed= {this._handleKeyPress}
        />
        <div className={this.state.completed ? "stats completed" : "stats"}>
          <Clock elapsed={this.state.timeElapsed} />
          <span className="wpm">{this.state.wpm}</span>
          <span className="errors">{this.state.errorCount}</span>
        </div>
      </>
    )
  }

  renderSignin = () => {
    return (
      <div classname="signin">
          <h1>Please Sign In</h1>
          <input 
            autoFocus
            placeholder="Email"
          />
          <input 
          />
      </div>
    )
  }

  render() {
    // console.log('sdfsdfsdfsdfsdf', this.state.token)
    if (!this.state.user) return <button onClick={()=>{window.location.replace('https://127.0.0.1:5000/login/facebook')}}>LOGIN WITH FACEBOOK</button>
    else return (
      <>
        <div className="header">
          <h1>Type Racing</h1>
          <i onClick={()=>{this.handleLogOut()}} className="fa fa-lg fa-sign-out"></i>
          {/* <i onClick={this._restartGame} className="fa fa-lg fa-bars"></i> */}
          <i onClick={this._restartGame} className="fa fa-lg fa-refresh"></i>
          <i className="fa fa-lg fa-bold" onClick={this._changeView}></i>
          {this.state.token && this.state.token.length > 1 ? (
            <div><h4>Welcome back, <a href="#" class="contrast bold" onClick={()=>{this.handleLogOut()}}>{this.state.user.user_name}</a></h4></div>
          ) : (
            <div> Sign In</div>
          )}
        </div>
        {this.state.token && this.state.token.length > 1 ? this.renderGame() : this.renderSignin()} 
        <Footer />
      </>
    );
  }
}

export default App;
