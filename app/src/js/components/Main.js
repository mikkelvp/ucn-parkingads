import React from 'react'
import GetParkingLotsComponent from './GetParkingLotsComponent'

class AppComponent extends React.Component {
  render() {
    return (
      <div className="container">
        <GetParkingLotsComponent />
      </div>
    )
  }
}

AppComponent.defaultProps = {}

export default AppComponent