// Set up the renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 1)

// Add the renderer to the section tag
const sectionTag = document.querySelector("section")
sectionTag.appendChild(renderer.domElement)

// Add a scene to the page
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xf52a82, 0.1, 7000)

// Add some lighting
const ambientLight = new THREE.AmbientLight(0x777777)
scene.add(ambientLight)

// Also, add a spotlight
const pointLight = new THREE.PointLight(0xffffff, 1, 0)
pointLight.position.set(500, 500, -2000)
scene.add(pointLight)

// Add a camera to the page
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.z = -3000  // move the camera back a bit

// Make a THREE.js loader: texture loader
const loader = new THREE.TextureLoader()

// Create shape
const makePlanet = function () {
    // Load in an image
    const texture = loader.load("../static/images/pic01.jpg")  //2^12x2^11
    const geometry = new THREE.SphereGeometry(700, 128, 128)
    const material = new THREE.MeshLambertMaterial({
        // color: 0x2727e6,
        map: texture
    })
    // Combine the geometry and material
    const mesh = new THREE.Mesh(geometry, material)

    // Add the shape to the scene
    scene.add(mesh)
    return mesh
}

// Make a ring
const makeRing = function (radius, color) {
    const geometry = new THREE.TorusGeometry(radius, 5, 16, 100)
    const material = new THREE.MeshBasicMaterial({
        color: color
    })
    const mesh = new THREE.Mesh(geometry, material)

    mesh.geometry.rotateX(Math.PI / 2)
    mesh.geometry.rotateZ(Math.PI / 10)

    scene.add(mesh)
    return mesh
}

// Make stars
const makeStars = function (url, num, size) {
    const texture = loader.load(url)

    let geometry = new THREE.BufferGeometry()

    // Create 5000 points randomly
    const pointCoords = []

    // Better choice of spherical coordinates
        for (let i = 0; i < num; i = i + 1) {
            // Let's use spherical coordinated
            const u = Math.random()
            const v = Math.random()
            const theta = u * 2.0 * Math.PI
            const phi = Math.acos(2.0 * v - 1.0)
            const r = (Math.cbrt(Math.random()) *100) + 1400

            const point = new THREE.Vector3() 
            const sphericalPoint = new THREE.Spherical(
                r,
                phi,
                theta
            )
            point.setFromSpherical(sphericalPoint)
            pointCoords.push(point)
    }


    // for (let i = 0; i < num; i = i + 1) {
    //     const point = new THREE.Vector3()
    //     // Let's use spherical coordinated
    //     sphericalPoint = new THREE.Spherical(
    //         900 + Math.random() * 900,
    //         2 * Math.PI * Math.random(),
    //         Math.PI * Math.random()
    //     )

    //     point.setFromSpherical(sphericalPoint)
    //     pointCoords.push(point)
    // }

    // for (let i = 0; i < 5000; i = i + 1) {
    //     const point = new THREE.Vector3(
    //         2500 * Math.random() - 1250,
    //         2500 * Math.random() - 1250,
    //         2500 * Math.random() - 1250
    //     )
    //     pointCoords.push(point)
    // }

    geometry.setFromPoints(pointCoords)

    const material = new THREE.PointsMaterial({
        // color: 0xffffff,
        size: size,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false
    })

    const points = new THREE.Points(geometry, material)

    scene.add(points)

    return points
}

// Make a moon
const makeMoon = function () {
    const texture = loader.load("../static/images/pic02.jpg")
    const geometry = new THREE.SphereGeometry(100, 64, 64)
    const material = new THREE.MeshLambertMaterial({
        map: texture
    })
    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
    return mesh
}

// Let's draw
const earth = makePlanet()

const ring1 = makeRing(1000, 0xd50ffc)
const ring2 = makeRing(1100, 0xffffff)
const ring3 = makeRing(1150, 0xffdb00)

const stars1 = makeStars("../static/images/501.png", 500, 100)
const stars2 = makeStars("../static/images/BZE.png", 500, 100)
const stars3 = makeStars("../static/images/white.png", 2000, 100)
const stars4 = makeStars("../static/images/red.png", 2000, 100)
const stars5 = makeStars("../static/images/blue.png", 2000, 100)
const flag = makeStars("../static/images/belizeflag01.png", 10, 300)
const starGroup = new THREE.Group()
starGroup.add(stars1)
starGroup.add(stars2)
starGroup.add(stars3)
starGroup.add(stars4)
starGroup.add(stars5)
starGroup.add(flag)

scene.add(starGroup)

const moon = makeMoon()
moon.translateX(-1300)
const moonGroup = new THREE.Group()
moonGroup.add(moon)
scene.add(moonGroup)

// Hold the camera position
let currentX = 0
let currentY = 0
let aimToX = 0
let aimToY = 0

// Let the camera animate
const animate = function () {
    // For mousemove and touchmove eventListeners
    const diffX = aimToX - currentX
    const diffY = aimToY - currentY
    currentX = currentX + diffX * 0.04
    currentY = currentY + diffY * 0.04

    // Camera positioning
    // camera.position.x = currentX
    // camera.position.y = currentY
    const sphereCoord = new THREE.Spherical(
        2500,
        (currentY * 0.001) - Math.PI / 2,
        (currentX * 0.001)
    )
    camera.position.setFromSpherical(sphereCoord)

    // Tell the camera to look at the SCENE
    camera.lookAt(scene.position)
    // Animate the earth
    earth.rotateY(0.004)
    // Animate the moon
    moon.rotateY(0.02)
    moonGroup.rotateY(0.007)
    // Animate the stargroup
    starGroup.rotateY(0.00011)
    // Animate the rings
    ring1.geometry.rotateY(-0.004)
    ring2.geometry.rotateY(0.002)
    ring3.geometry.rotateY(-0.003)
    // Get the renderer, and tell it to render the scene with the camera
    renderer.render(scene, camera)  // 
    // Run this function at every single frame
    requestAnimationFrame(animate)
}

animate()

//              Event Listeners

// On resize
window.addEventListener("resize", function() {
    // Update the camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    // Update the renderer as well
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// On mousedown
let isMouseDown = false
let startX = 0
let startY = 0

document.addEventListener("mousedown", function(event) {
    isMouseDown = true
    startX = event.pageX
    startY = event.pageY
    
})

// On mouseup
document.addEventListener("mouseup", function(event) {
    isMouseDown = false
    
})

// On mousemove
document.addEventListener("mousemove", function(event) {
    if (isMouseDown) {
        // aimToX = ((window.innerWidth / 2) - event.pageX) * 4
        // aimToY = ((window.innerHeight / 2) - event.pageY) * 4  
        aimToX = aimToX + ((event.pageX - startX) * 4)
        aimToY = aimToY + ((event.pageY - startY) * 4)
        startX = event.pageX
        startY = event.pageY
    }
})

// On touchmove
document.addEventListener("touchmove", function(event) {
    aimToX = ((window.innerWidth / 2) - event.pageX) * 4
    aimToY = ((window.innerHeight / 2) - event.pageY) * 4
})





