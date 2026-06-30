export class UI {
    constructor() {
        this.radarCanvas = document.getElementById('radarCanvas');
        this.radarCtx = this.radarCanvas.getContext('2d');
        this.radarCtx.canvas.width = 150;
        this.radarCtx.canvas.height = 150;
    }

    updateHUD(health, ammo, maxAmmo, kills, wave) {
        document.getElementById('health').textContent = Math.max(0, Math.floor(health));
        document.getElementById('ammo').textContent = ammo;
        document.getElementById('maxAmmo').textContent = maxAmmo;
        document.getElementById('kills').textContent = kills;
        document.getElementById('wave').textContent = wave;

        // Mudar cor do health se estiver baixo
        const healthElement = document.getElementById('health');
        if (health > 50) {
            healthElement.style.color = '#00ff00';
        } else if (health > 25) {
            healthElement.style.color = '#ff9900';
        } else {
            healthElement.style.color = '#ff0000';
        }
    }

    updateRadar(playerPosition, enemies) {
        const ctx = this.radarCtx;
        const centerX = this.radarCanvas.width / 2;
        const centerY = this.radarCanvas.height / 2;
        const radarScale = 0.003; // Escala do radar

        // Limpar canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);

        // Desenhar círculos de alcance
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40 * i / 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Desenhar direções
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.font = '10px Arial';
        ctx.fillText('N', centerX - 5, 10);

        // Desenhar player
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Desenhar inimigos
        enemies.forEach(enemy => {
            const relativePos = {
                x: enemy.mesh.position.x - playerPosition.x,
                z: enemy.mesh.position.z - playerPosition.z
            };

            const radarX = centerX + relativePos.x * radarScale;
            const radarY = centerY + relativePos.z * radarScale;

            // Verificar se está dentro do radar
            if (Math.abs(radarX - centerX) < 75 && Math.abs(radarY - centerY) < 75) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(radarX, radarY, 3, 0, Math.PI * 2);
                ctx.fill();

                // Desenhar direção
                const angle = Math.atan2(relativePos.z, relativePos.x);
                ctx.strokeStyle = '#ff0000';
                ctx.beginPath();
                ctx.moveTo(radarX, radarY);
                ctx.lineTo(
                    radarX + Math.cos(angle) * 5,
                    radarY + Math.sin(angle) * 5
                );
                ctx.stroke();
            }
        });

        // Desenhar borda
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);
    }

    showMessage(message, duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 20px 40px;
            border: 2px solid #00ff00;
            border-radius: 5px;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px #00ff00;
            z-index: 50;
        `;
        messageEl.textContent = message;
        document.getElementById('ui').appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, duration);
    }
}
