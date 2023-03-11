import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";
import stars from "./assets/img/stars.jpg";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState({
    light: {
      positionX: 0,
      positionY: 10,
      positionZ: 0,
      intensity: 1,
      distance: 25,
      penumbra: 1,
      decay: 1,
      angle: 1,
    },
    camera: { positionX: 0, positionY: 10, positionZ: 10 },
  });
  const [windowSize, setWindowSize] = useState<{ x: number; y: number }>({
    x: innerWidth,
    y: innerHeight,
  });

  const GuiControl = useCallback(({ sphere, option, camera, light }: any) => {
    const gui = new GUI();

    const lightFolder = gui.addFolder("Light");
    lightFolder.add(light.position, "x", -5, 5).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, positionX: e } };
      })
    );
    lightFolder.add(light.position, "y", 2, 10).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, positionY: e } };
      })
    );
    lightFolder.add(light.position, "z", -5, 5).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, positionZ: e } };
      })
    );
    lightFolder.add(light, "intensity", 0, 10).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, intensity: e } };
      })
    );
    lightFolder.add(light, "distance", 0, 50).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, distance: e } };
      })
    );
    lightFolder.add(light, "penumbra", 0, 1).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, penumbra: e } };
      })
    );
    lightFolder.add(light, "decay", -1, 1).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, decay: e } };
      })
    );
    lightFolder.add(light, "angle", 0, 1).onChange((e) =>
      setOptions((prev: any) => {
        return { ...prev, light: { ...prev.light, angle: e } };
      })
    );

    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(camera.position, "z", 0, 10).onChange((e) => {
      setOptions((prev: any) => {
        return { ...prev, camera: { ...prev.camera, positionZ: e } };
      });
    });
    cameraFolder.add(camera.position, "y", 0, 10).onChange((e) => {
      setOptions((prev: any) => {
        return { ...prev, camera: { ...prev.camera, positionY: e } };
      });
    });
    cameraFolder.add(camera.position, "x", 0, 10).onChange((e) => {
      setOptions((prev: any) => {
        return { ...prev, camera: { ...prev.camera, positionX: e } };
      });
    });

    return gui;
  }, []);

  // const mouseEvent = useCallback((mouse: THREE.Vector2, event: MouseEvent) => {
  //   mouse.x = (event.clientX / innerWidth) * 2 - 1;
  //   mouse.y = (event.clientY / innerHeight) * 2 - 1;
  // }, []);

  // const onMouseClick = useCallback(
  //   (
  //     raycaster: THREE.Raycaster,
  //     mouse: THREE.Vector2,
  //     camera: THREE.Camera,
  //     scene: THREE.Scene,
  //     targetMesh: THREE.Mesh
  //   ) => {
  //     raycaster.setFromCamera(mouse, camera);
  //     var isIntersected = raycaster.intersectObjects(scene.children);
  //     isIntersected.forEach((item) => {
  //       if (item.object.uuid === targetMesh.uuid) {
  //         console.log(item.object);
  //       }
  //     });
  //   },
  //   []
  // );

  useEffect(() => {
    let step = 0;
    const sphereOptions = {
      speed: 0.01,
      wareframe: false,
    };

    const {
      positionX,
      positionY,
      positionZ,
      intensity,
      distance,
      penumbra,
      decay,
      angle,
    } = options.light;

    const {
      positionX: cameraX,
      positionY: cameraY,
      positionZ: cameraZ,
    } = options.camera;

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
    // const grid = new THREE.GridHelper(10, 25);

    // ! Source Light
    const spotLight = new THREE.SpotLight(
      0xefff00,
      intensity,
      distance,
      angle,
      penumbra,
      decay
    );
    // const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0xfff);
    spotLight.position.set(positionX, positionY, positionZ);

    // ! Texture Loader
    const textureLoader = new THREE.TextureLoader();
    // scene.background = textureLoader.load(stars);
    const cuberTextureLoader = new THREE.CubeTextureLoader();
    scene.background = cuberTextureLoader.load([
      stars,
      stars,
      stars,
      stars,
      stars,
      stars,
    ]);

    const cameraHelper = new THREE.CameraHelper(camera);

    // ! RENDER SHADERS IN THE SCENE
    // scene.add(sphereMesh, planeMesh, grid, spotLight, spotLightHelper);
    scene.add(sphereMesh, planeMesh, spotLight);
    camera.position.set(cameraX, cameraY, cameraZ);

    sphereMesh.castShadow = true;
    spotLight.castShadow = true;
    planeMesh.receiveShadow = true;
    camera.castShadow = true;

    // * CONTROL
    // const orbit = new OrbitControls(camera, renderer.domElement);
    // orbit.update();

    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener("mousedown", (event) => {
      mouse.x = (event.clientX / innerWidth) * 2 - 1;
      mouse.y = (event.clientY / innerHeight) * 2 - 1;
      rayCaster.setFromCamera(mouse, camera);
      var intersected = rayCaster.intersectObjects(scene.children);

      intersected.map((item) => {
        console.log(item.object.position, sphereMesh.position);
        if (item.object.id === sphereMesh.id) {
          // console.log(item.object);
        }
      });
    });

    // ! RENDER THE SCENE & CAMERA
    function animate() {
      step += sphereOptions.speed;
      renderer.render(scene, camera);
      sphereMesh.position.y = Math.abs(Math.PI * Math.sin(step)) + 1;
    }
    renderer.setAnimationLoop(animate);

    const gui = GuiControl({
      light: spotLight,
      camera: camera,
    });

    return () => {
      gui.destroy();
      renderer.forceContextLoss();
      ref.current?.removeChild(renderer.domElement);
      window.removeEventListener("mousedown", () => {});
    };
  }, [windowSize]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWindowSize({ x: innerWidth, y: innerHeight });
    });
    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return <div ref={ref} className="App"></div>;
}

export default App;
