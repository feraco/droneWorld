import {
  hudElement
} from '../hud'
import { clamp } from '../utils'

class AutoPilot {
  constructor (ship, controls, active) {
    this.ship = ship
    this.controls = controls
    this.active = active
    this.target = null
    this.pointerElement = document.getElementById('pointer')
  }

  toggle () {
    this.active = !this.active
  }

  update (delta) {
    if (!this.active) return
    // Simple autopilot - just fly forward
    this.controls.moveState.forward = 1
    this.controls.mousemove({ pageX: 0, pageY: 0 })
  }
}

export default AutoPilot
