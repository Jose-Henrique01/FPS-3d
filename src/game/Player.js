import * as BABYLON from '@babylonjs/core';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.camera = new BABYLON.UniversalCamera('playerCamera', new BABYLON.Vector3(0, 1.7, -30), scene);
        this.camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
        this.camera.inertia = 0.7;
        this.camera.angularSensibility = 1000;
        this.camera.checkCollisions = true;
        this.camera.collisionRadius = new BABYLON.Vector3(0.2, 0.9, 0.2);

        // Configurar physics
        this.camera.attachControl(document.getElementById('gameCanvas'), true);
        this.camera.keysUp = [];
        this.camera.keysDown = [];
        this.camera.keysLeft = [];
        this.camera.keysRight = [];

        // Player stats
        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.moveSpeed = 0.25;
        this.jumpForce = 0.15;
        this.isJumping = false;
        this.velocity = BABYLON.Vector3.Zero();
        this.isGrounded = true;

        // Gun
        this.gunMesh = this.createGun();
        this.fireRate = 100; // ms
        this.lastFireTime = 0;
        this.reloadTime = 1000; // ms
        this.isReloading = false;

        // Raycasting para detectar ground
        this.rayCast = new BABYLON.Ray(this.camera.position, new BABYLON.Vector3(0, -1, 0), 0.1);
    }

    createGun() {
        // Criar uma arma visual simples
        const gunGroup = new BABYLON.TransformNode('gunGroup', this.scene);
        gunGroup.parent = this.camera;

        // Cano da arma
        const barrel = BABYLON.MeshBuilder.CreateCylinder('barrel', {
            diameter: 0.05,
            height: 0.5
        }, this.scene);
        barrel.position = new BABYLON.Vector3(0.1, -0.1, 0.3);
        barrel.rotation.z = Math.PI / 2;
        barrel.parent = gunGroup;

        const barrelMaterial = new BABYLON.StandardMaterial('barrelMat', this.scene);
        barrelMaterial.diffuse = new BABYLON.Color3(0.2, 0.2, 0.2);
        barrel.material = barrelMaterial;

        // Coronha
        const stock = BABYLON.MeshBuilder.CreateBox('stock', {
            width: 0.08,
            height: 0.08,
            depth: 0.2
        }, this.scene);
        stock.position = new BABYLON.Vector3(0.05, -0.1, 0.05);
        stock.parent = gunGroup;
        stock.material = barrelMaterial;

        return gunGroup;
    }

    update() {
        // Verificar se está no chão
        this.checkGrounded();

        // Aplicar gravidade
        if (!this.isGrounded) {
            this.velocity.y -= 0.02;
        } else {
            this.velocity.y = 0;
        }

        // Aplicar velocidade
        this.camera.position.addInPlace(this.velocity);

        // Reset movimento
        this.velocity.x = 0;
        this.velocity.z = 0;
    }

    checkGrounded() {
        const rayOrigin = this.camera.position;
        const rayDirection = new BABYLON.Vector3(0, -1, 0);
        const rayLength = 0.1;
        const rayHit = this.scene.pickWithRay(
            new BABYLON.Ray(rayOrigin, rayDirection, rayLength),
            (mesh) => mesh.name === 'ground' || mesh.name.includes('structure') || mesh.name.includes('pillar')
        );

        this.isGrounded = rayHit !== null;
    }

    moveForward() {
        const forward = BABYLON.Vector3.Forward();
        BABYLON.Vector3.TransformCoordinatesToRef(
            forward,
            BABYLON.Matrix.RotationY(this.camera.rotation.y),
            forward
        );
        forward.normalize();
        forward.scaleInPlace(this.moveSpeed);
        this.velocity.addInPlace(forward);
    }

    moveBackward() {
        const backward = BABYLON.Vector3.Backward();
        BABYLON.Vector3.TransformCoordinatesToRef(
            backward,
            BABYLON.Matrix.RotationY(this.camera.rotation.y),
            backward
        );
        backward.normalize();
        backward.scaleInPlace(this.moveSpeed);
        this.velocity.addInPlace(backward);
    }

    moveLeft() {
        const left = BABYLON.Vector3.Left();
        BABYLON.Vector3.TransformCoordinatesToRef(
            left,
            BABYLON.Matrix.RotationY(this.camera.rotation.y),
            left
        );
        left.normalize();
        left.scaleInPlace(this.moveSpeed);
        this.velocity.addInPlace(left);
    }

    moveRight() {
        const right = BABYLON.Vector3.Right();
        BABYLON.Vector3.TransformCoordinatesToRef(
            right,
            BABYLON.Matrix.RotationY(this.camera.rotation.y),
            right
        );
        right.normalize();
        right.scaleInPlace(this.moveSpeed);
        this.velocity.addInPlace(right);
    }

    jump() {
        if (this.isGrounded && !this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
            
            setTimeout(() => {
                this.isJumping = false;
            }, 500);
        }
    }

    rotate(deltaX, deltaY) {
        // Sensibilidade do mouse
        const sensitivity = 0.002;
        
        this.camera.rotation.y -= deltaX * sensitivity;
        this.camera.rotation.x -= deltaY * sensitivity;

        // Limitar rotação vertical
        if (this.camera.rotation.x > Math.PI / 2.5) {
            this.camera.rotation.x = Math.PI / 2.5;
        }
        if (this.camera.rotation.x < -Math.PI / 2.5) {
            this.camera.rotation.x = -Math.PI / 2.5;
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastFireTime > this.fireRate && this.ammo > 0 && !this.isReloading) {
            this.ammo--;
            this.lastFireTime = now;

            // Efeito de recuo
            this.camera.position.y -= 0.01;
            setTimeout(() => {
                this.camera.position.y += 0.01;
            }, 50);
        }
    }

    reload() {
        if (!this.isReloading && this.ammo < this.maxAmmo) {
            this.isReloading = true;
            setTimeout(() => {
                this.ammo = this.maxAmmo;
                this.isReloading = false;
            }, this.reloadTime);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Efeito visual de dano
        const canvas = this.scene.getEngine().getRenderingCanvas();
        canvas.style.borderColor = 'red';
        canvas.style.borderWidth = '3px';
        
        setTimeout(() => {
            canvas.style.borderColor = 'transparent';
            canvas.style.borderWidth = '0px';
        }, 200);
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
}
