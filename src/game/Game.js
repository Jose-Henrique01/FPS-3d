import * as BABYLON from '@babylonjs/core';
import { Scene } from './Scene';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { UI } from './UI';
import { InputManager } from '../utils/InputManager';
import { SoundManager } from '../utils/SoundManager';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.player = null;
        this.enemies = [];
        this.ui = null;
        this.inputManager = null;
        this.soundManager = null;
        this.gameState = 'MENU'; // MENU, PLAYING, GAME_OVER
        this.wave = 1;
        this.kills = 0;
        this.gameTime = 0;
        this.waveEnemyCount = 3;
        
        this.init();
    }

    async init() {
        // Criar cena
        this.scene = new Scene(this.engine);
        this.scene.create();

        // Criar player
        this.player = new Player(this.scene.getScene());

        // Criar UI
        this.ui = new UI();
        this.ui.updateHUD(100, 30, 30, 0, 1);

        // Criar Input Manager
        this.inputManager = new InputManager(this.canvas);
        this.setupInputHandlers();

        // Criar Sound Manager
        this.soundManager = new SoundManager(this.scene.getScene());

        // Setup resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        // Game loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.getScene().render();
        });
    }

    setupInputHandlers() {
        // Disparo
        this.inputManager.onMouseDown(() => {
            if (this.gameState === 'PLAYING') {
                this.player.shoot();
                this.soundManager.playShootSound();
                this.checkEnemyHits();
            }
        });

        // Recarregar
        this.inputManager.onKeyDown('R', () => {
            if (this.gameState === 'PLAYING') {
                this.player.reload();
                this.soundManager.playReloadSound();
            }
        });

        // Pular
        this.inputManager.onKeyDown(' ', () => {
            if (this.gameState === 'PLAYING') {
                this.player.jump();
            }
        });

        // Menu/Pausa
        this.inputManager.onKeyDown('Escape', () => {
            if (this.gameState === 'PLAYING') {
                this.pauseGame();
            } else if (this.gameState === 'MENU') {
                this.startGame();
            }
        });

        // Movimento
        this.inputManager.onKeyHeld('W', () => {
            if (this.gameState === 'PLAYING') {
                this.player.moveForward();
            }
        });

        this.inputManager.onKeyHeld('S', () => {
            if (this.gameState === 'PLAYING') {
                this.player.moveBackward();
            }
        });

        this.inputManager.onKeyHeld('A', () => {
            if (this.gameState === 'PLAYING') {
                this.player.moveLeft();
            }
        });

        this.inputManager.onKeyHeld('D', () => {
            if (this.gameState === 'PLAYING') {
                this.player.moveRight();
            }
        });

        // Mouse look
        this.inputManager.onMouseMove((deltaX, deltaY) => {
            if (this.gameState === 'PLAYING') {
                this.player.rotate(deltaX, deltaY);
            }
        });
    }

    update() {
        if (this.gameState === 'PLAYING') {
            this.gameTime += this.engine.getDeltaTime() / 1000;

            // Atualizar player
            this.player.update();

            // Atualizar inimigos
            this.enemies.forEach((enemy, index) => {
                enemy.update(this.player.camera.position);
                
                // Verificar colisão com player
                if (BABYLON.Vector3.Distance(enemy.mesh.position, this.player.camera.position) < 2) {
                    this.player.takeDamage(10);
                    this.soundManager.playHitSound();
                }

                // Remover inimigos mortos
                if (enemy.health <= 0) {
                    this.scene.getScene().removeMesh(enemy.mesh);
                    this.enemies.splice(index, 1);
                    this.kills++;
                    this.soundManager.playDeathSound();
                }
            });

            // Verificar se wave foi completada
            if (this.enemies.length === 0 && this.gameTime > 2) {
                this.nextWave();
            }

            // Verificar se player morreu
            if (this.player.health <= 0) {
                this.gameOver();
            }

            // Atualizar UI
            this.ui.updateHUD(
                this.player.health,
                this.player.ammo,
                this.player.maxAmmo,
                this.kills,
                this.wave
            );

            // Atualizar radar
            this.ui.updateRadar(this.player.camera.position, this.enemies);
        }
    }

    checkEnemyHits() {
        const rayOrigin = this.player.camera.position;
        const rayDirection = BABYLON.Vector3.Forward();
        BABYLON.Vector3.TransformCoordinatesToRef(rayDirection, BABYLON.Matrix.RotationYawPitchRoll(
            this.player.camera.rotation.y,
            this.player.camera.rotation.x,
            0
        ), rayDirection);

        const rayLength = 100;
        const ray = new BABYLON.Ray(rayOrigin, rayDirection, rayLength);

        this.enemies.forEach(enemy => {
            const hit = ray.intersectsMesh(enemy.mesh);
            if (hit && this.player.ammo > 0) {
                enemy.takeDamage(25);
                this.soundManager.playHitSound();
                
                // Efeito visual
                this.createHitEffect(hit.hit.position);
            }
        });
    }

    createHitEffect(position) {
        const effect = BABYLON.MeshBuilder.CreateSphere('hitEffect', { diameter: 0.1 }, this.scene.getScene());
        effect.position = position;
        effect.material = new BABYLON.StandardMaterial('hitMat', this.scene.getScene());
        effect.material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);

        setTimeout(() => {
            this.scene.getScene().removeMesh(effect);
        }, 100);
    }

    spawnEnemies() {
        const enemyCount = this.waveEnemyCount + Math.floor(this.wave / 2);
        
        for (let i = 0; i < enemyCount; i++) {
            const angle = (Math.PI * 2 * i) / enemyCount;
            const distance = 15 + Math.random() * 10;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = 1;

            const enemy = new Enemy(
                { x, y, z },
                this.scene.getScene(),
                100 + this.wave * 20
            );
            
            this.enemies.push(enemy);
        }
    }

    nextWave() {
        this.wave++;
        this.gameTime = 0;
        this.waveEnemyCount = Math.min(this.waveEnemyCount + 2, 10);
        this.spawnEnemies();
        this.soundManager.playWaveStartSound();
    }

    startGame() {
        this.gameState = 'PLAYING';
        this.wave = 1;
        this.kills = 0;
        this.gameTime = 0;
        this.waveEnemyCount = 3;
        this.enemies = [];
        
        // Esconder menu
        document.getElementById('menu').classList.add('menu-hidden');
        document.getElementById('gameOverScreen').classList.add('game-over-hidden');
        
        // Reset player
        this.player.health = 100;
        this.player.ammo = 30;
        
        // Spawnar primeiro wave
        this.spawnEnemies();
        
        // Lock pointer
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
        this.canvas.requestPointerLock();
    }

    pauseGame() {
        this.gameState = 'MENU';
        document.getElementById('menu').classList.remove('menu-hidden');
    }

    gameOver() {
        this.gameState = 'GAME_OVER';
        const gameOverScreen = document.getElementById('gameOverScreen');
        document.getElementById('finalScore').textContent = this.kills;
        gameOverScreen.classList.remove('game-over-hidden');
        
        // Unlock pointer
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        document.exitPointerLock();
    }

    restartGame() {
        // Remover todos os inimigos
        this.enemies.forEach(enemy => {
            this.scene.getScene().removeMesh(enemy.mesh);
        });
        this.enemies = [];
        
        this.startGame();
    }

    showSettings() {
        alert('Configurações:\n\n- Sensibilidade do mouse: Ajustável via InputManager\n- Volume: Ajustável via SoundManager\n- Qualidade dos gráficos: Varia com o dispositivo');
    }
}
