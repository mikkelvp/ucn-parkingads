'use strict'

import React from 'react'
import Slider from 'react-rangeslider'

class GetParkingLotsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: [],
      email: '',
      maxDistance: 2
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.validateEmail = this.validateEmail.bind(this)
    this.onEmailChange = this.onEmailChange.bind(this)
    this.handleDistanceChange = this.handleDistanceChange.bind(this)
  }

  componentWillMount() {
    if (!navigator.geolocation) {
      return;
    }

    var self = this

    function success(pos) {
      var userLocation = [pos.coords.longitude, pos.coords.latitude]
      self.setState({userLocation: userLocation})
    }

    function error(err) {
      console.log(err)
    }

    navigator.geolocation.getCurrentPosition(success, error)
    
  }

  onSubmit() {
    var now = new Date()
    // Limit requests to one per minute
    if (this.state.sent && now.getTime() - this.state.sent.getTime() < 60 * 1000 ) {
      return;
    }

    var req = new Request('/api/parking/distance')
    var init = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    }
    fetch(req, init)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.success) {
          this.setState({sent: new Date()})
        }
      })
  }

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  onEmailChange(e) {
    if (this.validateEmail(e.target.value)) {
      this.setState({email: e.target.value})
    } else {
      this.setState({email: ''})
    }
  }

  handleDistanceChange(value) {
    this.setState({maxDistance: value})
  }

  render() {
    return (
      <div className="get-parking-lots">
        <h1>Get available nearby parking lots</h1>
        <div className="input-field">
          <input type="email" placeholder="Email address" id="email" name="email" autoComplete="home email" onChange={this.onEmailChange} />
        </div>
        <Slider
          min={0.1}
          max={10}
          value={this.state.maxDistance}
          step={0.1}
          orientation="horizontal"
          onChange={this.handleDistanceChange} />
          
        <p className="distance">
          Within:
          <span> {this.state.maxDistance.toFixed(1)}km</span>
        </p>
        <button className="button green" disabled={!(this.state.email && this.state.userLocation.length === 2)} onClick={this.onSubmit}>Submit</button>
      </div>
    )
  }
}

GetParkingLotsComponent.displayName = 'GetParkingLotsComponent'

export default GetParkingLotsComponent