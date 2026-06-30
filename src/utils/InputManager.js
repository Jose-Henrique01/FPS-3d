export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keysPressed = {};
        this.mouseCallbacks = {};
        this.keyCallbacks = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyDown(event) {
        const key = event.key.toUpperCase();
        
        if (!this.keysPressed[key]) {
            this.keysPressed[key] = true;
            
            if (this.keyCallbacks[key]) {
                this.keyCallbacks[key].forEach(callback => {
                    if (callback.type === 'down') {
                        callback.fn();
                    }
                });
            }
        }
    }

    handleKeyUp(event) {
        const key = event.key.toUpperCase();
        this.keysPressed[key] = false;
    }

    handleMouseMove(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        const deltaX = event.movementX || event.mozMovementX || 0;
        const deltaY = event.movementY || event.mozMovementY || 0;

        if (this.mouseCallbacks['move']) {
            this.mouseCallbacks['move'].forEach(callback => {
                callback(deltaX, deltaY);
            });
        }
    }

    handleMouseDown(event) {
        if (this.mouseCallbacks['down']) {
            this.mouseCallbacks['down'].forEach(callback => {
                callback();
            });
        }
    }

    handleMouseUp(event) {
        if (this.mouseCallbacks['up']) {
            this.mouseCallbacks['up'].forEach(callback => {
                callback();
            });
        }
    }

    onKeyDown(key, callback) {
        const keyUpper = key.toUpperCase();
        if (!this.keyCallbacks[keyUpper]) {
            this.keyCallbacks[keyUpper] = [];
        }
        this.keyCallbacks[keyUpper].push({ type: 'down', fn: callback });
    }

    onKeyHeld(key, callback) {
        const checkInterval = setInterval(() => {
            const keyUpper = key === ' ' ? ' ' : key.toUpperCase();
            if (this.keysPressed[keyUpper]) {
                callback();
            }
        }, 16); // ~60fps
    }

    onMouseMove(callback) {
        if (!this.mouseCallbacks['move']) {
            this.mouseCallbacks['move'] = [];
        }
        this.mouseCallbacks['move'].push(callback);
    }

    onMouseDown(callback) {
        if (!this.mouseCallbacks['down']) {
            this.mouseCallbacks['down'] = [];
        }
        this.mouseCallbacks['down'].push(callback);
    }

    onMouseUp(callback) {
        if (!this.mouseCallbacks['up']) {
            this.mouseCallbacks['up'] = [];
        }
        this.mouseCallbacks['up'].push(callback);
    }

    isKeyPressed(key) {
        return this.keysPressed[key.toUpperCase()] || false;
    }
}
