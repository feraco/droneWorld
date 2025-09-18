import keyboardJS from 'keyboardjs'
import nipplejs from 'nipplejs'
import lock from 'pointer-lock'
import { mobileAndTabletcheck } from '../utils/isMobile'
import FlyControls from '../modules/FlyControls'
import PubSub from '../events'
import { scene, camera, renderer } from '../index'
import { Vector3 } from 'three'
import AutoPilot from './autopilot'

const controls = {
  module: null,
  setAcceleration (value) {
    if (this.module && value !== this.module.acceleration) {
      this.module.acceleration = value
      console.log('acceleration set to ', value)
    }
  }
}
const isMobile = mobileAndTabletcheck()
const controlsInitialized = false
const initControls = (msg, data) => {
  if (controlsInitialized) return
  if (isMobile) {
    document.getElementById('touchPane').style.display = 'block'
    const touchPaneLeft = window.document.getElementsByClassName('touchPaneLeft')[0]
    const nippleLook = nipplejs.create({
      zone: touchPaneLeft,
      mode: 'static',
      position: { left: '30%', top: '90%' },
      color: 'white'
    })

    // display touch buttons
    Array.from(document.getElementsByClassName('touchButton')).forEach(el => {
      el.style.display = 'block'
    })
    // hide verbose text
    document.getElementById('verbosePane').style.display = 'none'

    controls.module = new FlyControls(camera, touchPaneLeft, nippleLook)
  } else {
    const pointer = lock(renderer.domElement)
    controls.module = new FlyControls(camera, renderer.domElement, undefined, pointer)
  }

  controls.module.update(0)

  const autoPilot = new AutoPilot(camera, controls.module, false)
  keyboardJS.bind('p', e => autoPilot.toggle())

  PubSub.publishSync('x.loops.unshift', (timestamp, delta) => {
    autoPilot.update(timestamp, delta)
    controls.module.update(delta)
  })

  const pilotDrone = data.pilotDrone

  // keyboardJS.bind('p', e => {
  //   if (isMobile) { return }
  //   const NewControlsClass = controls.module.constructor.name === 'OrbitControls' ? FlyControls : OrbitControls
  //   console.log('controlsClass', NewControlsClass)
  //   controls.module.dispose()
  //   const newModule = new NewControlsClass(camera, controlsElement)
  //   window.controls = newModule
  //   controls.module = newModule
  //   controls.module.update(0)

  //   if (NewControlsClass === OrbitControls) {
  //     let cam = pilotDrone.position.clone()
  //     newModule.target.set(cam.x, cam.y, cam.z)
  //   }
  // })

  keyboardJS.bind('c', e => {
    console.log(camera.position)
  })

  keyboardJS.bind('r', e => {
    if (controls.module.constructor.name === 'OrbitControls') {
      controls.module.autoRotate = !controls.module.autoRotate
    }
  })

  keyboardJS.bind('space', e => {
    PubSub.publishSync('x.toggle.play')
  })
}
PubSub.subscribe('x.drones.pilotDrone.loaded', initControls)

const tmpVec = new Vector3()
PubSub.subscribe('x.drones.collision.terrain.pilotDrone', (msg, terrainNormal) => {
  controls.setAcceleration(0)
  tmpVec.copy(controls.module.velocity).applyQuaternion(camera.quaternion)
  tmpVec.reflect(terrainNormal)
  tmpVec.add(camera.position)
  controls.module.velocity = camera.worldToLocal(tmpVec)
  setTimeout(() => { controls.setAcceleration(60) }, 1000)
})

export default controls
