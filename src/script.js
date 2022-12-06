import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import { AdditiveAnimationBlendMode, Mesh, Texture } from 'three'


const gui = new dat.GUI();

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Floor
 */
// const floor = new THREE.Mesh(
//     new THREE.PlaneGeometry(10, 10),
//     new THREE.MeshStandardMaterial({
//         color: '#444444',
//         metalness: 0,
//         roughness: 0.5
//     })
// )
// floor.receiveShadow = true
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true


/**
 * Textures
 */

//load images
const loadingManager = new THREE.LoadingManager()

loadingManager.onStart = () =>
{
    console.log('onStart')
}
loadingManager.onLoad = () =>
{
    console.log('onLoad')
}
loadingManager.onProgress = () =>
{
    console.log('onProgress')
}
loadingManager.onError = () =>
{
    console.log('onError')
}

const textureLoader = new THREE.TextureLoader()

const colorTexture = textureLoader.load('/textures/stone_color.jpg')
const normalTexture = textureLoader.load('/textures/stone_normal.jpg')
const aoTexture = textureLoader.load('/textures/stone_ao.jpg')
const heightTexture = textureLoader.load('/textures/stone_height.jpg')

/**
 * Object
 */

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
gui.add(material, 'metalness', 0, 1, 0.01);
gui.add(material, 'roughness', 0, 1, 0.01);

const sphereGeometry = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16), material
)
sphereGeometry.position.x = -1.5
const planeGeometry = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100), material
)

const torusGeometry = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 16, 32), material
)
torusGeometry.position.x = 1.5
const meshes = [sphereGeometry, planeGeometry, torusGeometry];
meshes.forEach(mesh => {
    mesh.position.y = 1
})

scene.add(sphereGeometry, planeGeometry, torusGeometry);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    meshes.forEach(mesh => {
        mesh.rotation.y = 0.2*elapsedTime;
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

