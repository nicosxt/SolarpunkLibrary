import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'



// import gsap from 'gsap'
// import * as dat from 'dat.gui'

//console.log(DRACOLoader);

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Objects
const objects = [];

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
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Debug
 */
const gui = new dat.GUI()




/**
 * Material
 */
 const houseMaterial = new THREE.MeshStandardMaterial({
    color: '#fff200'
})


gltfLoader.load('/models/EXP_houses.glb',(gltf) =>
    {
        console.log(gltf);
        //const path = gltf.scene.getObjectByName('EXP_Path');
        // const water = gltf.scene.getObjectByName('EXP_Water');
        // const biogas = gltf.scene.getObjectByName('EXP_Biogas');
        // const house = gltf.scene.getObjectByName('EXP_House');
        //const forest = gltf.scene.getObjectByName('EXP_forest');
        //console.log(gltf.scene.children[4].children[0]);
        
        //path.setMaterials(houseMaterial);
        const material1 = new THREE.MeshStandardMaterial( {
            color: "#8f49d5",
            roughness: 0.5,
            metalness: 0.5
          } );
        const material2 = new THREE.MeshStandardMaterial( {
            color: "#91d549",
            roughness: 0.5,
            metalness: 0.5
          } );
        const material3 = new THREE.MeshStandardMaterial( {
            color: "#497fd5",
            roughness: 0.5,
            metalness: 0.5
          } );


        //iterate over each child of the scene
        gltf.scene.traverse(( obj ) => {
            if(obj instanceof THREE.Mesh){
                console.log(obj.name);
                if(obj.name == 'EXP_Path'){
                    obj.material = material1;
                }
                if(obj.name == 'EXP_Water'){
                    obj.material = material2;
                }
                if(obj.name == 'EXP_Biogas'){
                    obj.material = material3;
                }
            }
        });

        
        //const multiMaterial = new THREE.MeshFaceMaterial([material1, material2, material3]);
        const multiMaterial = [material1, material2, material3];

        // for ( var i = 0, l = multiMaterial.length; i < l; i ++ ) {

		// 	console.log(multiMaterial[i]);

		// }

        // forest.traverse( function (child) {
        //     //console.log("get " + gltf.scene.children[4].children[0]);
        //     if ( child instanceof THREE.Mesh ) {
        //         console.log(child.name);
        //         child.material = material1;
        //         //console.log("get " + child.children[4].children[0]);
        //         //child.children[1].material = material2;
        //         //child.getObjectByName("Cube_001").material = material1;
        //     }
    
        // } );

        scene.add(gltf.scene);


    },
    (progress) =>
    {
        //console.log(progress)
    },
    (error) =>
    {
        //console.log(error)
    }
)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

