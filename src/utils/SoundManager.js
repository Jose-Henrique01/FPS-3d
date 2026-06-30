export class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.soundEnabled = true;
        this.masterVolume = 0.5;
        this.sounds = {};
        
        // Criar sons usando Web Audio API
        this.initSounds();
    }

    initSounds() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
    }

    playShootSound() {
        if (!this.soundEnabled) return;
        
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        // Tom de disparo
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    playHitSound() {
        if (!this.soundEnabled) return;
        
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        // Tom de acerto
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(500, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    playReloadSound() {
        if (!this.soundEnabled) return;
        
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        // Som de recarga
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.3);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    playDeathSound() {
        if (!this.soundEnabled) return;
        
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        // Som de morte de inimigo
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        
        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }

    playWaveStartSound() {
        if (!this.soundEnabled) return;
        
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        // Som de início de wave
        for (let i = 0; i < 3; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const startTime = now + i * 0.1;
            oscillator.frequency.setValueAtTime(600 + i * 200, startTime);
            
            gainNode.gain.setValueAtTime(0.2 * this.masterVolume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
    }
}
