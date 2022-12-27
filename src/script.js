import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import { AdditiveAnimationBlendMode, Mesh, Texture, Vector3 } from 'three'


/**
 * Base
 */
const canvas = document.querySelector('canvas.webgl')
const gui = new dat.GUI();
const scene = new THREE.Scene()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
function initiateLights(){
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.camera.left = - 7
    directionalLight.shadow.camera.top = 7
    directionalLight.shadow.camera.right = 7
    directionalLight.shadow.camera.bottom = - 7
    directionalLight.position.set(5, 5, 5)
}
initiateLights();

scene.add(ambientLight)
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
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.01, 2000)
camera.position.set(22, 14, 22)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
//controls.enableRotate = true;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
//const matcapTexture = textureLoader.load('/textures/matcap4.png')
const objTexture = textureLoader.load('/textures/textures.jpg');
const plotTextureEmpty = textureLoader.load('/textures/green_frame.png');
const plotTextureSelected = textureLoader.load('/textures/green.jpg');
const commonTextureEmpty = textureLoader.load('/textures/white_frame.png');

/**
 * Material
 */
const objectMat = new THREE.MeshStandardMaterial({map: objTexture})
objectMat.metalness = 0.4
objectMat.roughness = 0.55
gui.add(objectMat, 'metalness', 0, 1, 0.01);
gui.add(objectMat, 'roughness', 0, 1, 0.01);
objectMat.map.flipY = false;

const plotMatEmpty = new THREE.MeshBasicMaterial({map: plotTextureEmpty})
plotMatEmpty.transparent = true;
plotMatEmpty.alphaMap = plotTextureEmpty;
const plotMatSelected = new THREE.MeshBasicMaterial({color: "#07ffa8"})

const commonMat = new THREE.MeshStandardMaterial({map: commonTextureEmpty})
commonMat.transparent = true;
commonMat.alphaMap = commonTextureEmpty;

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Skybox
 */
let skyboxObject;
gltfLoader.load('/models/skybox_cylinder.glb',(gltf) =>
    {
        

        //iterate over each child of the scene + set materials
        gltf.scene.traverse(( obj ) => {
            if(obj instanceof THREE.Mesh){
                skyboxObject = obj
                console.log(obj);
            }
        });

        const skyGradient = textureLoader.load('/textures/gradient.jpg')
        const material3 = new THREE.MeshBasicMaterial( {
            map: skyGradient
          } );

          skyboxObject.material = material3;
          console.log(skyboxObject.scale);
          skyboxObject.scale.set(100,100,100);

        scene.add(gltf.scene);

    },
    (progress) =>
    {
       //console.log(progress)
    },
    (error) =>
    {
       console.log(error)
    }
)


//let allObjects = [];
let houses = [];
let plots = [];
gltfLoader.load('/models/objects.gltf',(gltf) =>
    {
        //iterate over each child of the scene + set materials
        gltf.scene.traverse(( obj ) => {
            if(obj instanceof THREE.Mesh){
                if(obj.name.includes("House")){
                    houses.push(obj);
                    obj.material = objectMat;
                }else if(obj.name.includes("Plot")){
                    plots.push(obj);
                    obj.material = plotMatEmpty;
                }else if(obj.name.includes("Common")){
                    obj.material = commonMat;
                }
            }
        });

        for(let i = 0; i < houses.length; i++){
            //console.log(houses[i]);
            houses[i].visible = (i == 0);            
        }
        scene.add(gltf.scene);
    },
    (progress) =>
    {
       //console.log(progress)
    },
    (error) =>
    {
       console.log(error)
    }
)

/**
 * KeyPress
 */
let visibleIndex = 0;
document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
      case 37: // left arrow
        // Handle left arrow key press
        console.log("left");

        incrementIndex(false);

        break;
      case 39: // right arrow
        // Handle right arrow key press
        console.log("right");
        incrementIndex(true);
        break;
    }
    for(let i = 0; i < houses.length; i++){
        console.log(houses[i]);
        houses[i].visible = (i == visibleIndex);
        
    }
  });

function incrementIndex(isPositive){
    if(isPositive)
       visibleIndex++;
    else
        visibleIndex--;

    visibleIndex = (visibleIndex + houses.length) % houses.length;
}

/**
 * Game Logic
 */
let selectedPlot = null;
document.addEventListener('mouseup', onMouseUp, false);
function onMouseUp(e){
    console.log("mouse up");
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const intersects = [];
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    raycaster.intersectObjects( scene.children, true, intersects );
    
    if(intersects.length > 0){
        console.log("hit");
        // console.log(intersects[0].object);
        intersects.forEach(obj => {
            console.log(obj);
            if(obj.object.name.includes("Plot")){
                selectPlot(obj.object);
            }
        });
    }
}

function selectPlot(plot){

    //reset last selectPlot
    if(selectedPlot)
        selectedPlot.material = plotMatEmpty;

    plot.material = plotMatSelected;
    selectedPlot = plot;

}


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
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Update
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

