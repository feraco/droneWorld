import { Vector2, Vector3 } from 'three'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PubSub from '../events'
import { camera } from '../index'

let pilotDrone

class HUD extends Component {
  constructor (props) {
    super(props)
    this.state = { 
      altitude: 0,
      speed: 0,
      velocity: new Vector3(),
      position: new Vector3(),
      pitch: 0,
      roll: 0,
      yaw: 0
    }
  }

  componentDidMount () {
    PubSub.publish('x.hud.mounted')
  }

  update (newState) {
    this.setState({
      ...newState
    })
  }

  render () {
    return (
      <div>
        <div id='flight-data'>
          <div className='data-panel'>
            <h3>Flight Data</h3>
            <div className='data-row'>
              <span>Altitude:</span>
              <span>{this.state.altitude.toFixed(1)} m</span>
            </div>
            <div className='data-row'>
              <span>Speed:</span>
              <span>{this.state.speed.toFixed(1)} m/s</span>
            </div>
            <div className='data-row'>
              <span>Position:</span>
              <span>X: {this.state.position.x.toFixed(1)}</span>
            </div>
            <div className='data-row'>
              <span></span>
              <span>Y: {this.state.position.y.toFixed(1)}</span>
            </div>
            <div className='data-row'>
              <span></span>
              <span>Z: {this.state.position.z.toFixed(1)}</span>
            </div>
            <div className='data-row'>
              <span>Velocity:</span>
              <span>{this.state.velocity.length().toFixed(1)} m/s</span>
            </div>
            <div className='data-row'>
              <span>Pitch:</span>
              <span>{(this.state.pitch * 180 / Math.PI).toFixed(1)}°</span>
            </div>
            <div className='data-row'>
              <span>Roll:</span>
              <span>{(this.state.roll * 180 / Math.PI).toFixed(1)}°</span>
            </div>
          </div>
        </div>
        <div id='controls-info'>
          <div className='controls-panel'>
            <h3>Flight Controls</h3>
            <div className='control-section'>
              <h4>Movement</h4>
              <div className='control-row'>
                <span className='key'>W</span>
                <span>Forward</span>
              </div>
              <div className='control-row'>
                <span className='key'>S</span>
                <span>Backward</span>
              </div>
              <div className='control-row'>
                <span className='key'>A</span>
                <span>Yaw Left</span>
              </div>
              <div className='control-row'>
                <span className='key'>D</span>
                <span>Yaw Right</span>
              </div>
              <div className='control-row'>
                <span className='key'>R</span>
                <span>Up</span>
              </div>
              <div className='control-row'>
                <span className='key'>F</span>
                <span>Down</span>
              </div>
            </div>
            <div className='control-section'>
              <h4>Camera</h4>
              <div className='control-row'>
                <span className='key'>Mouse</span>
                <span>Look Around</span>
              </div>
              <div className='control-row'>
                <span className='key'>Q</span>
                <span>Roll Left</span>
              </div>
              <div className='control-row'>
                <span className='key'>E</span>
                <span>Roll Right</span>
              </div>
            </div>
            <div className='control-section'>
              <h4>Other</h4>
              <div className='control-row'>
                <span className='key'>P</span>
                <span>Toggle Autopilot</span>
              </div>
              <div className='control-row'>
                <span className='key'>Space</span>
                <span>Pause/Resume</span>
              </div>
              <div className='control-row'>
                <span className='key'>T</span>
                <span>Switch Terrain</span>
              </div>
              <div className='control-row'>
                <span className='key'>C</span>
                <span>Log Position</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const camVec = new Vector3()
const hudLoop = (timestamp) => {
  if (!pilotDrone) return
  
  const localX = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
  const localY = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
  const rollAngle = (
    Math.PI / 2 - camera.up.angleTo(localX) * Math.sign(camera.up.dot(localY))
  )
  camera.rollAngle = rollAngle
  const pitch = camera.up.dot(camera.getWorldDirection(camVec))
  camera.pitch = pitch
  
  hudElement.update({
    altitude: pilotDrone.userData.altitude || 0,
    speed: pilotDrone.userData.speed || 0,
    velocity: pilotDrone.userData.velocity || new Vector3(),
    position: camera.position,
    pitch: pitch,
    roll: rollAngle
  })
}

PubSub.subscribe('x.hud.mounted', () => {
  PubSub.publish('x.loops.push', hudLoop)
  hudElement.mounted = true
})

PubSub.subscribe('x.drones.pilotDrone.loaded', (msg, data) => {
  pilotDrone = data.pilotDrone
})

const hudElement = ReactDOM.render(
  <HUD />,
  document.getElementById('hud')
)

