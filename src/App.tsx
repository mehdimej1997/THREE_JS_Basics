import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState<{ x: number; y: number }>({
    x: innerWidth,
    y: innerHeight,
  });

  const GuiControl = useCallback(({ sphere, option, camera, light }: any) => {
    const gui = new GUI();

    const lightFolder = gui.addFolder("Light");
    lightFolder.add(light.position, "x", -5, 5);
    lightFolder.add(light.position, "y", 2, 10);
    lightFolder.add(light.position, "z", -5, 5);

    lightFolder.add(light, "intensity", 0, 10);
    lightFolder.add(light, "distance", 0, 50);
    lightFolder.add(light, "penumbra", 0, 1);
    lightFolder.add(light, "decay", -1, 1);
    lightFolder.add(light, "angle", 0, 1);

    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(camera.position, "z", 0, 10);
    cameraFolder.open();
    lightFolder.open();
    return gui;
  }, []);

  useEffect(() => {
    let step = 0;
    const options = {
      speed: 0.01,
      wareframe: false,
    };

    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      windowSize.x / windowSize.y,
      1,
      500
    );
    renderer.setSize(windowSize.x, windowSize.y);
    renderer.shadowMap.enabled = true;
    ref.current?.appendChild(renderer.domElement);

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xbc6c25,
      side: THREE.DoubleSide,
    });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotateX(0.5 * Math.PI);
    const grid = new THREE.GridHelper(10, 25);

    // ! Source Light
    const spotLight = new THREE.SpotLight(0xefff00, 1, 25, 1, 1, 1);
    const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0xfff);
    spotLight.position.y = 10;

    // ! RENDER SHADERS IN THE SCENE
    scene.add(sphereMesh, planeMesh, grid, spotLight, spotLightHelper);
    camera.position.set(0, 10, 10);

    sphereMesh.castShadow = true;
    spotLight.castShadow = true;
    planeMesh.receiveShadow = true;
    camera.castShadow = true;

    // * CONTROL
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

    // ! RENDER THE SCENE & CAMERA
    function animate() {
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 1000 / 25);
      step += options.speed;
      spotLightHelper.update();
      sphereMesh.position.y = Math.abs(Math.PI * Math.sin(step)) + 1;
      renderer.render(scene, camera);
    }
    animate();

    const gui = GuiControl({
      light: spotLight,
      camera: camera,
    });

    return () => {
      ref.current?.removeChild(renderer.domElement);
      gui.destroy();
    };
  }, [windowSize]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWindowSize({ x: innerWidth, y: innerHeight });
    });
    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  return <div ref={ref} className="App"></div>;
}

export default App;
