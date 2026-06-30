import * as BABYLON from '@babylonjs/core';

export class Scene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
    }

    create() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

        // Câmera (será substituída pelo player)
        const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 5, -30), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas(), true);

        // Iluminação
        this.setupLighting();

        // Ambiente
        this.setupEnvironment();

        // Skybox
        this.setupSkybox();

        return this.scene;
    }

    setupLighting() {
        // Luz principal
        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), this.scene);
        light.intensity = 0.8;

        // Luz direcional para sombras
        const shadowLight = new BABYLON.PointLight('shadowLight', new BABYLON.Vector3(20, 30, 20), this.scene);
        shadowLight.intensity = 0.6;
        shadowLight.range = 100;

        // Luz ambiente
        const ambientLight = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.4;
    }

    setupEnvironment() {
        // Ground
        const groundMaterial = new BABYLON.StandardMaterial('groundMat', this.scene);
        groundMaterial.diffuse = new BABYLON.Color3(0.4, 0.4, 0.4);
        groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, this.scene);
        ground.material = groundMaterial;
        ground.receiveShadows = true;
        ground.checkCollisions = true;

        // Estruturas de cobertura
        this.createStructures();
    }

    createStructures() {
        const structures = [
            { pos: { x: -20, y: 2, z: 0 }, size: { w: 5, h: 4, d: 5 } },
            { pos: { x: 20, y: 2, z: 0 }, size: { w: 5, h: 4, d: 5 } },
            { pos: { x: 0, y: 2, z: -20 }, size: { w: 5, h: 4, d: 5 } },
            { pos: { x: 0, y: 2, z: 20 }, size: { w: 5, h: 4, d: 5 } },
            { pos: { x: -15, y: 1, z: 15 }, size: { w: 3, h: 2, d: 3 } },
            { pos: { x: 15, y: 1, z: -15 }, size: { w: 3, h: 2, d: 3 } },
        ];

        const structureMaterial = new BABYLON.StandardMaterial('structureMat', this.scene);
        structureMaterial.diffuse = new BABYLON.Color3(0.6, 0.6, 0.6);
        structureMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

        structures.forEach((struct, index) => {
            const box = BABYLON.MeshBuilder.CreateBox(`structure_${index}`, {
                width: struct.size.w,
                height: struct.size.h,
                depth: struct.size.d
            }, this.scene);

            box.position = new BABYLON.Vector3(struct.pos.x, struct.pos.y, struct.pos.z);
            box.material = structureMaterial;
            box.receiveShadows = true;
            box.checkCollisions = true;
            box.castShadow = true;
        });

        // Criar pilares decorativos
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4;
            const distance = 30;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            const pillar = BABYLON.MeshBuilder.CreateCylinder(`pillar_${i}`, {
                diameter: 1.5,
                height: 10
            }, this.scene);

            pillar.position = new BABYLON.Vector3(x, 5, z);
            pillar.material = structureMaterial;
            pillar.receiveShadows = true;
            pillar.checkCollisions = true;
        }
    }

    setupSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMat', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.15, 0.2);
        
        skybox.material = skyboxMaterial;
    }

    getScene() {
        return this.scene;
    }
}
