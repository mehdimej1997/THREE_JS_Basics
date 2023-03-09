import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const GuiControl = useCallback(
    ({ sphere, option, perspective, light }: any) => {
      const gui = new GUI();

      const lightFolder = gui.addFolder("Light");
      lightFolder.add(light.position, "x", -20, 20);
      lightFolder.add(light.position, "y", -20, 20);
      lightFolder.add(light.position, "z", -20, 20);
      lightFolder.add(light.rotation, "z", 0, 2 * Math.PI);
      lightFolder.add(light, "intensity", 0, 5);

      const sphereFolder = gui.addFolder("Sphere");
      sphereFolder.add(sphere.position, "x", -10, 10);
      sphereFolder.add(sphere.position, "y", -10, 10);
      sphereFolder.add(sphere.position, "z", -10, 10);
      sphereFolder.add(option, "wireframe").onChange((e) => {
        sphere.material.wireframe = e;
      });
      sphereFolder.add(option, "speed", 0, 0.1);
      sphereFolder.addColor(option, "sphereColor").onChange((e) => {
        sphere.material.color.set(e);
      });

      const cameraFolder = gui.addFolder("Camera");
      cameraFolder.add(perspective.position, "z", 0, 10);
      sphereFolder.open();
      cameraFolder.open();
      lightFolder.open();
      return gui;
    },
    []
  );

  useEffect(() => {
    let step = 5;
    const option = {
      sphereColor: "#f18040",
      speed: 0.01,
      wireframe: false,
    };
    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const perspective = new THREE.PerspectiveCamera(
      45,
      innerWidth / innerHeight,
      0.1,
      1000
    );
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    ref.current?.appendChild(renderer.domElement);

    // Set the 🎥 position
    perspective.position.set(0, 30, 30);

    // Create The Floor
    const planGeometry = new THREE.PlaneGeometry(30, 30);
    const planMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    planGeometry.rotateX(0.5 * Math.PI);

    const sphereGeometry = new THREE.SphereGeometry(5, 50, 50);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0xf18040,
    });

    const plane = new THREE.Mesh(planGeometry, planMaterial);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // sphere.position.set(2, 10, 0);

    // * GUI Control 🎮
    function animateRotation() {
      step += option.speed;
      sphere.position.y = 5 * Math.abs(Math.sin(step)) + 5;
      renderer.render(scene, perspective);
    }

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight,
      5
    );

    directionalLight.position.set(-30, 20, 0);

    scene.add(directionalLight, plane, sphere, directionalLightHelper);
    renderer.setAnimationLoop(animateRotation);

    // SHADOW
    plane.receiveShadow = true;
    sphere.castShadow = true;
    directionalLight.castShadow = true;

    // Control Camera
    const gui = GuiControl({
      sphere,
      option,
      perspective,
      light: directionalLight,
    });
    const orbit = new OrbitControls(perspective, renderer.domElement);
    orbit.update();
    return () => {
      ref.current?.removeChild(renderer.domElement);
      renderer.clear();
      scene.clear();
      perspective.clear();
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
