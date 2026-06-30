import * as BABYLON from '@babylonjs/core';

export class Enemy {
    constructor(position, scene, health = 100) {
        this.scene = scene;
        this.health = health;
        this.maxHealth = health;
        this.speed = 0.15;
        this.detectionRange = 50;
        this.attackRange = 5;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // ms

        // Criar mesh
        this.mesh = this.createMesh(position);
        
        // Estado
        this.state = 'IDLE'; // IDLE, CHASE, ATTACK
        this.targetPosition = new BABYLON.Vector3(position.x, position.y, position.z);
        this.moveDirection = BABYLON.Vector3.Zero();

        // Healthbar
        this.healthBar = this.createHealthBar();
    }

    createMesh(position) {
        // Corpo
        const body = BABYLON.MeshBuilder.CreateBox('enemyBody', {
            width: 0.5,
            height: 1.5,
            depth: 0.5
        }, this.scene);

        body.position = new BABYLON.Vector3(position.x, position.y, position.z);
        body.checkCollisions = true;

        const bodyMaterial = new BABYLON.StandardMaterial('enemyMat', this.scene);
        bodyMaterial.diffuse = new BABYLON.Color3(1, 0.3, 0.3);
        bodyMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
        body.material = bodyMaterial;
        body.castShadow = true;
        body.receiveShadows = true;

        // Cabeça
        const head = BABYLON.MeshBuilder.CreateSphere('enemyHead', {
            diameter: 0.4,
            segments: 8
        }, this.scene);

        head.position.y = 1;
        head.parent = body;
        head.material = bodyMaterial;
        head.castShadow = true;

        // Olhos
        const eyeMaterial = new BABYLON.StandardMaterial('eyeMat', this.scene);
        eyeMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);

        for (let i = -1; i <= 1; i += 2) {
            const eye = BABYLON.MeshBuilder.CreateSphere('eye', {
                diameter: 0.1,
                segments: 8
            }, this.scene);
            eye.position = new BABYLON.Vector3(i * 0.1, 0.2, 0.2);
            eye.parent = head;
            eye.material = eyeMaterial;
        }

        return body;
    }

    createHealthBar() {
        const healthBarTexture = new BABYLON.DynamicTexture('healthBarTexture', 256);
        const ctx = healthBarTexture.getContext();
        
        const healthBarMaterial = new BABYLON.StandardMaterial('healthBarMat', this.scene);
        healthBarMaterial.emissiveTexture = healthBarTexture;

        const healthBar = BABYLON.MeshBuilder.CreatePlane('healthBar', {
            width: 1,
            height: 0.1
        }, this.scene);

        healthBar.parent = this.mesh;
        healthBar.position.y = 1;
        healthBar.material = healthBarMaterial;
        healthBar.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return { mesh: healthBar, texture: healthBarTexture };
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        const ctx = this.healthBar.texture.getContext();
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 256, 256);
        
        ctx.fillStyle = healthPercent > 0.5 ? 'green' : (healthPercent > 0.25 ? 'orange' : 'red');
        ctx.fillRect(0, 100, 256 * healthPercent, 56);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 100, 256, 56);
        
        this.healthBar.texture.update();
    }

    update(playerPosition) {
        const distanceToPlayer = BABYLON.Vector3.Distance(this.mesh.position, playerPosition);

        if (distanceToPlayer < this.detectionRange) {
            this.state = 'CHASE';
            this.targetPosition = playerPosition;
        } else {
            this.state = 'IDLE';
        }

        // Rotacionar em direção ao alvo
        const direction = this.targetPosition.subtract(this.mesh.position);
        if (direction.length() > 0.1) {
            const angle = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = angle;
        }

        // Movimento
        if (this.state === 'CHASE' && distanceToPlayer > this.attackRange) {
            direction.normalize();
            direction.scaleInPlace(this.speed);
            this.mesh.position.addInPlace(direction);
        }

        // Ataque
        if (this.state === 'CHASE' && distanceToPlayer < this.attackRange) {
            const now = Date.now();
            if (now - this.lastAttackTime > this.attackCooldown) {
                this.lastAttackTime = now;
                // Lógica de ataque será implementada no jogo principal
            }
        }

        this.updateHealthBar();
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Efeito de knockback
        const knockback = new BABYLON.Vector3(
            (Math.random() - 0.5) * 0.2,
            0,
            (Math.random() - 0.5) * 0.2
        );
        this.mesh.position.addInPlace(knockback);
    }

    die() {
        this.health = 0;
    }
}
