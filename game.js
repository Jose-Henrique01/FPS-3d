// ===== CONFIGURAÇÕES DO JOGO =====
const GAME_CONFIG = {
    worldSize: 2000,
    playerSpeed: 0.15,
    playerHeight: 1.7,
    mouseSensitivity: 0.005,
    gravity: 0.01,
    jumpForce: 0.3
};

// ===== ARMAS =====
const WEAPONS = {
    0: { // Pistola
        name: 'Pistola',
        damage: 25,
        fireRate: 300, // ms
        ammo: 15,
        maxAmmo: 60,
        reloadTime: 1000,
        spread: 0.02
    },
    1: { // Submetralhadora
        name: 'Submetralhadora',
        damage: 15,
        fireRate: 75,
        ammo: 30,
        maxAmmo: 120,
        reloadTime: 1500,
        spread: 0.04
    },
    2: { // Espingarda
        name: 'Espingarda',
        damage: 60,
        fireRate: 900,
        ammo: 8,
        maxAmmo: 32,
        reloadTime: 2000,
        spread: 0.1
    }
};

// ===== INIMIGOS =====
class Enemy {
    constructor(scene, position) {
        this.position = position;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 0.08;
        this.shootRange = 50;
        this.lastShot = 0;
        this.shootCooldown = 500;
        
        // Criar malha do inimigo
        const geometry = new THREE.BoxGeometry(0.8, 1.7, 0.8);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        scene.add(this.mesh);
        
        // Health bar
        this.healthBarMesh = this.createHealthBar();
        this.healthBarMesh.position.y = 1.2;
        this.mesh.add(this.healthBarMesh);
    }

    createHealthBar() {
        const group = new THREE.Group();
        
        const bgGeom = new THREE.PlaneGeometry(1.5, 0.2);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const bgMesh = new THREE.Mesh(bgGeom, bgMat);
        bgMesh.position.z = 0.1;
        group.add(bgMesh);

        const healthGeom = new THREE.PlaneGeometry(1.5, 0.2);
        const healthMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.healthBarFill = new THREE.Mesh(healthGeom, healthMat);
        this.healthBarFill.position.z = 0.15;
        group.add(this.healthBarFill);

        return group;
    }

    update(playerPosition, scene) {
        // IA - Seguir jogador
        const direction = new THREE.Vector3().subVectors(playerPosition, this.position).normalize();
        this.position.add(direction.multiplyScalar(this.speed));
        this.mesh.position.copy(this.position);

        // Mirar e atirar
        const distance = this.position.distanceTo(playerPosition);
        if (distance < this.shootRange && Date.now() - this.lastShot > this.shootCooldown) {
            this.shoot(playerPosition, scene);
            this.lastShot = Date.now();
        }

        // Atualizar health bar
        const healthPercent = this.health / this.maxHealth;
        this.healthBarFill.scale.x = healthPercent;

        // Remover inimigo se morto
        if (this.health <= 0) {
            return false;
        }
        return true;
    }

    shoot(targetPos, scene) {
        const direction = new THREE.Vector3().subVectors(targetPos, this.position).normalize();
        
        // Adicionar spread
        direction.x += (Math.random() - 0.5) * 0.3;
        direction.y += (Math.random() - 0.5) * 0.3;
        direction.z += (Math.random() - 0.5) * 0.3;
        direction.normalize();

        // Criar projétil
        const bulletGeom = new THREE.SphereGeometry(0.1, 4, 4);
        const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeom, bulletMat);
        bullet.position.copy(this.position);
        bullet.velocity = direction.multiplyScalar(1);
        scene.add(bullet);

        gameState.enemyBullets.push(bullet);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }
}

// ===== ESTADO DO JOGO =====
const gameState = {
    isRunning: false,
    isGameOver: false,
    isVictory: false,
    playerHealth: 100,
    playerMaxHealth: 100,
    currentWeapon: 0,
    currentAmmo: 30,
    currentAmmoInMag: 30,
    kills: 0,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    canShoot: true,
    isReloading: false,
    isJumping: false,
    velocityY: 0
};

// ===== THREE.JS SETUP =====
let scene, camera, renderer;
let controls = {};
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let playerPosition = new THREE.Vector3(0, GAME_CONFIG.playerHeight, 0);
let playerVelocity = new THREE.Vector3();

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 500, 1000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(playerPosition);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);

    // Terreno
    const groundGeom = new THREE.PlaneGeometry(GAME_CONFIG.worldSize, GAME_CONFIG.worldSize);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.castShadow = true;
    ground.receiveShadow = true;
    scene.add(ground);

    // Construções (obstáculos)
    createBuildings();

    // Inimigos
    createEnemies();

    // Eventos
    setupEventListeners();
}

function createBuildings() {
    for (let i = 0; i < 15; i++) {
        const x = (Math.random() - 0.5) * GAME_CONFIG.worldSize * 0.8;
        const z = (Math.random() - 0.5) * GAME_CONFIG.worldSize * 0.8;
        const width = 20 + Math.random() * 30;
        const height = 10 + Math.random() * 30;
        const depth = 20 + Math.random() * 30;

        const buildingGeom = new THREE.BoxGeometry(width, height, depth);
        const buildingMat = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5)
        });
        const building = new THREE.Mesh(buildingGeom, buildingMat);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
    }
}

function createEnemies() {
    for (let i = 0; i < 5; i++) {
        let x, z, distance;
        do {
            x = (Math.random() - 0.5) * GAME_CONFIG.worldSize * 0.8;
            z = (Math.random() - 0.5) * GAME_CONFIG.worldSize * 0.8;
            distance = Math.sqrt(x * x + z * z);
        } while (distance < 100); // Distância mínima do jogador

        const enemy = new Enemy(scene, new THREE.Vector3(x, GAME_CONFIG.playerHeight, z));
        gameState.enemies.push(enemy);
    }
    updateScoreBoard();
}

function setupEventListeners() {
    // Teclado
    document.addEventListener('keydown', (e) => {
        controls[e.key.toLowerCase()] = true;

        // Trocar arma
        if (e.key === '1') switchWeapon(0);
        if (e.key === '2') switchWeapon(1);
        if (e.key === '3') switchWeapon(2);

        // Recarregar
        if (e.key.toLowerCase() === 'r') reload();

        // Pular
        if (e.key === ' ' && !gameState.isJumping) {
            gameState.velocityY = GAME_CONFIG.jumpForce;
            gameState.isJumping = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        controls[e.key.toLowerCase()] = false;
    });

    // Mouse
    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Rotação da câmera
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(camera.quaternion);

        euler.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -e.movementX * GAME_CONFIG.mouseSensitivity);
        camera.quaternion.setFromEuler(euler);

        euler.setFromQuaternion(camera.quaternion);
        euler.rotateAround(new THREE.Vector3(1, 0, 0), -e.movementY * GAME_CONFIG.mouseSensitivity);
        camera.quaternion.setFromEuler(euler);
    });

    document.addEventListener('click', shoot);
    document.addEventListener('pointerlockchange', () => {
        if (gameState.isRunning && !gameState.isGameOver && !gameState.isVictory) {
            document.body.requestPointerLock();
        }
    });

    // Menu
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('settingsBtn').addEventListener('click', toggleControls);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('menuBtn').addEventListener('click', backToMenu);
    document.getElementById('restartBtn2').addEventListener('click', startGame);
    document.getElementById('menuBtn2').addEventListener('click', backToMenu);

    // Weapon selector
    document.querySelectorAll('.weapon-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            const weaponIndex = parseInt(slot.dataset.weapon);
            switchWeapon(weaponIndex);
        });
    });

    // Resize
    window.addEventListener('resize', onWindowResize);

    // Pointer lock
    document.getElementById('gameContainer').addEventListener('click', () => {
        if (gameState.isRunning && !gameState.isGameOver && !gameState.isVictory) {
            document.body.requestPointerLock();
        }
    });
}

function toggleControls() {
    const controlsDiv = document.getElementById('controls');
    controlsDiv.classList.toggle('hidden');
}

function switchWeapon(index) {
    gameState.currentWeapon = index;
    gameState.currentAmmo = WEAPONS[index].ammo;
    gameState.currentAmmoInMag = WEAPONS[index].ammo;
    updateWeaponDisplay();

    document.querySelectorAll('.weapon-slot').forEach(slot => {
        slot.classList.remove('active');
    });
    document.querySelector(`[data-weapon="${index}"]`).classList.add('active');
}

function shoot() {
    if (!gameState.isRunning || gameState.isGameOver || gameState.isVictory || !gameState.canShoot || gameState.isReloading) return;

    const weapon = WEAPONS[gameState.currentWeapon];
    
    if (gameState.currentAmmoInMag <= 0) {
        reload();
        return;
    }

    gameState.canShoot = false;
    gameState.currentAmmoInMag--;

    // Raycast para atirar
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let intersection of intersects) {
        // Procurar inimigo pai
        let obj = intersection.object;
        while (obj.parent && obj !== scene) {
            for (let enemy of gameState.enemies) {
                if (obj === enemy.mesh || obj.parent === enemy.mesh) {
                    enemy.takeDamage(weapon.damage);
                    
                    // Criar efeito de sangue
                    createBloodEffect(intersection.point);
                    
                    if (enemy.health <= 0) {
                        gameState.kills++;
                        updateScoreBoard();
                    }
                    break;
                }
            }
            obj = obj.parent;
        }
    }

    updateWeaponDisplay();

    setTimeout(() => {
        gameState.canShoot = true;
    }, weapon.fireRate);
}

function reload() {
    if (gameState.isReloading || gameState.currentAmmo <= 0) return;

    gameState.isReloading = true;
    const weapon = WEAPONS[gameState.currentWeapon];

    setTimeout(() => {
        const ammoToReload = Math.min(weapon.ammo, gameState.currentAmmo);
        gameState.currentAmmoInMag = ammoToReload;
        gameState.currentAmmo -= ammoToReload;
        gameState.isReloading = false;
        updateWeaponDisplay();
    }, weapon.reloadTime);
}

function createBloodEffect(position) {
    const particleGeom = new THREE.SphereGeometry(0.2, 4, 4);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const particle = new THREE.Mesh(particleGeom, particleMat);
    particle.position.copy(position);
    scene.add(particle);

    setTimeout(() => scene.remove(particle), 500);
}

function updatePlayerMovement() {
    const moveSpeed = GAME_CONFIG.playerSpeed;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(camera.up, forward).normalize();

    if (controls['w']) playerVelocity.add(forward.multiplyScalar(moveSpeed));
    if (controls['s']) playerVelocity.add(forward.multiplyScalar(-moveSpeed));
    if (controls['a']) playerVelocity.add(right.multiplyScalar(moveSpeed));
    if (controls['d']) playerVelocity.add(right.multiplyScalar(-moveSpeed));

    // Gravidade
    gameState.velocityY -= GAME_CONFIG.gravity;
    playerVelocity.y = gameState.velocityY;

    // Limites do mapa
    const limit = GAME_CONFIG.worldSize / 2;
    playerPosition.x = Math.max(-limit, Math.min(limit, playerPosition.x + playerVelocity.x));
    playerPosition.z = Math.max(-limit, Math.min(limit, playerPosition.z + playerVelocity.z));

    // Colisão com o chão
    if (playerPosition.y <= GAME_CONFIG.playerHeight) {
        playerPosition.y = GAME_CONFIG.playerHeight;
        gameState.velocityY = 0;
        gameState.isJumping = false;
    } else {
        playerPosition.y += playerVelocity.y;
    }

    camera.position.copy(playerPosition);
    playerVelocity.multiplyScalar(0.95);
}

function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        if (!enemy.update(playerPosition, scene)) {
            scene.remove(enemy.mesh);
            gameState.enemies.splice(i, 1);
        } else {
            // Verificar colisão com projéteis
            for (let j = gameState.bullets.length - 1; j >= 0; j--) {
                const bullet = gameState.bullets[j];
                if (enemy.mesh.position.distanceTo(bullet.position) < 1) {
                    scene.remove(bullet);
                    gameState.bullets.splice(j, 1);
                    break;
                }
            }
        }
    }

    if (gameState.enemies.length === 0 && !gameState.isVictory) {
        endGameVictory();
    }
}

function updateBullets() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        bullet.position.add(bullet.velocity);

        if (Math.abs(bullet.position.x) > GAME_CONFIG.worldSize / 2 || Math.abs(bullet.position.z) > GAME_CONFIG.worldSize / 2) {
            scene.remove(bullet);
            gameState.bullets.splice(i, 1);
        }
    }

    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        bullet.position.add(bullet.velocity);

        if (bullet.position.distanceTo(playerPosition) < 0.5) {
            gameState.playerHealth -= 10;
            scene.remove(bullet);
            gameState.enemyBullets.splice(i, 1);

            if (gameState.playerHealth <= 0) {
                endGameOver();
            }
        } else if (Math.abs(bullet.position.x) > GAME_CONFIG.worldSize / 2 || Math.abs(bullet.position.z) > GAME_CONFIG.worldSize / 2) {
            scene.remove(bullet);
            gameState.enemyBullets.splice(i, 1);
        }
    }
}

function updateWeaponDisplay() {
    const weapon = WEAPONS[gameState.currentWeapon];
    document.getElementById('weaponName').textContent = weapon.name;
    document.getElementById('weaponDamage').textContent = weapon.damage + ' DMG';
    document.getElementById('currentAmmo').textContent = gameState.currentAmmoInMag;
    document.getElementById('maxAmmo').textContent = gameState.currentAmmo;
}

function updateHealthDisplay() {
    const healthPercent = Math.max(0, gameState.playerHealth / gameState.playerMaxHealth) * 100;
    document.getElementById('health').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = gameState.playerHealth + '/' + gameState.playerMaxHealth;
}

function updateScoreBoard() {
    document.getElementById('enemyCount').textContent = gameState.enemies.length;
}

function updateMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = canvas.width / GAME_CONFIG.worldSize;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Desenhar mapa
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar jogador
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Desenhar inimigos
    ctx.fillStyle = '#ff0000';
    for (let enemy of gameState.enemies) {
        const x = centerX + (enemy.position.x - playerPosition.x) * scale;
        const y = centerY + (enemy.position.z - playerPosition.z) * scale;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Desenhar borda
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function startGame() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');

    gameState.isRunning = true;
    gameState.isGameOver = false;
    gameState.isVictory = false;
    gameState.playerHealth = gameState.playerMaxHealth;
    gameState.kills = 0;
    gameState.currentAmmo = 60;
    gameState.currentAmmoInMag = 30;

    playerPosition.set(0, GAME_CONFIG.playerHeight, 0);
    playerVelocity.set(0, 0, 0);
    gameState.velocityY = 0;

    gameState.enemies = [];
    gameState.bullets = [];
    gameState.enemyBullets = [];

    // Limpar cena
    scene.children = scene.children.filter(child => {
        if (child instanceof THREE.Light || child.geometry instanceof THREE.PlaneGeometry) {
            return true;
        }
        if (child.geometry instanceof THREE.BoxGeometry) {
            return true;
        }
        return false;
    });

    createEnemies();
    switchWeapon(0);
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
    document.body.requestPointerLock();

    animate();
}

function endGameOver() {
    gameState.isGameOver = true;
    gameState.isRunning = false;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();

    document.getElementById('gameOverMessage').textContent = 'Você foi derrotado!';
    document.getElementById('killCount').textContent = 'Abates: ' + gameState.kills;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function endGameVictory() {
    gameState.isVictory = true;
    gameState.isRunning = false;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();

    document.getElementById('victoryMessage').textContent = 'Parabéns! Você é o último sobrevivente!';
    document.getElementById('finalKillCount').textContent = 'Abates: ' + gameState.kills;
    document.getElementById('victoryScreen').classList.remove('hidden');
}

function backToMenu() {
    gameState.isRunning = false;
    gameState.isGameOver = false;
    gameState.isVictory = false;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();

    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (gameState.isRunning && !gameState.isGameOver && !gameState.isVictory) {
        updatePlayerMovement();
        updateEnemies();
        updateBullets();
        updateHealthDisplay();
        updateMinimap();
    }

    renderer.render(scene, camera);
}

// Inicializar jogo
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
});