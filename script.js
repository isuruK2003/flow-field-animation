class Particle {
    constructor(effect) {
        this.effect = effect;
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.speedX;
        this.speedY;
        this.speedModifier = Math.floor(Math.random() * 3 + 1);
        this.history = [{ x: this.x, y: this.y }];
        this.maxLength = Math.floor(Math.random() * 200 + 10);
        this.angle = 0;
        this.timer = this.maxLength * 2;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.history[0].x, this.history[0].y);
        this.history.forEach(({ x, y }) => {
            context.lineTo(x, y);
        });
        context.stroke();
    }

    update() {
        this.timer--
        if (this.timer >= 1) {
            let x = Math.floor(this.x / this.effect.cellSize);
            let y = Math.floor(this.y / this.effect.cellSize);
            let index = y * this.effect.cols + x;

            this.angle = this.effect.flowField[index];
            this.speedX = Math.cos(this.angle);
            this.speedY = Math.sin(this.angle);

            this.x += this.speedX * this.speedModifier;
            this.y += this.speedY * this.speedModifier;

            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > this.maxLength) {
                this.history.shift()
            }
        } else if (this.history.length > 1) {
            this.history.shift();
        } else {
            this.reset();
        }
    }

    reset() {
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);
        this.history = [{ x: this.x, y: this.y }];
        this.timer = this.maxLength * 2;
    }
}

class Effect {
    constructor(canvas, noOfParticles, cellSize, curve, zoom) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = canvas.context;
        this.rows;
        this.cols;
        this.particles = [];
        this.flowField = [];
        this.noOfParticles = noOfParticles;
        this.cellSize = cellSize;
        this.curve = curve;
        this.zoom = zoom;
        this.frameId;
        this.init();
    }

    init() {
        this.rows = Math.floor(this.height / this.cellSize);
        this.cols = Math.floor(this.width / this.cellSize);

        this.flowField = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
                this.flowField.push(angle);
            }
        }

        for (let i = 0; i < this.noOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }

    renderFrame() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.particles.forEach(particle => {
            particle.draw(this.context);
            particle.update();
        });
    }

    render() {
        this.renderFrame();
        this.frameId = requestAnimationFrame(() => this.render());
    }

    cancelRender() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }
}

class Canvas {
    constructor(id, width, height, color = 'white') {
        this.width = width;
        this.height = height;

        this.elem = document.getElementById(id);
        this.context = this.elem.getContext("2d");

        this.elem.width = width;
        this.elem.height = height;

        this.context.fillStyle = color;
        this.context.strokeStyle = color;
        this.context.lineWidth = 1;
    }
}

function main() {

    const menuElem = document.getElementById("menu");
    const pinElem = document.getElementById("pin");
    const noOfParticlesElem = document.getElementById("no-of-particles");
    const cellSizeElem = document.getElementById("cell-size");
    const curveElem = document.getElementById("curve");
    const zoomElem = document.getElementById("zoom");
    const refreshElem = document.getElementById("refresh");
    const startStopElem = document.getElementById("start-stop");

    let noOfParticles = 200;
    let cellSize = 5;
    let curve = 0.8;
    let zoom = 0.04;

    let hasMenuPinned = false;
    let hasStarted = true

    let canvas = new Canvas("canvas", window.innerWidth - 1, window.innerHeight - 1);
    let effect = new Effect(canvas, noOfParticles, cellSize, curve, zoom);
    effect.render();

    noOfParticlesElem.addEventListener("change", () => {
        noOfParticles = noOfParticlesElem.value;
    });

    cellSizeElem.addEventListener("change", () => {
        cellSize = cellSizeElem.value;
    });

    curveElem.addEventListener("change", () => {
        curve = curveElem.value;
    });

    zoomElem.addEventListener("change", () => {
        zoom = zoomElem.value;
    });

    refreshElem.addEventListener("click", () => {
        effect.cancelRender();
        effect = new Effect(canvas, noOfParticles, cellSize, curve, zoom);
        effect.render();
    });

    startStopElem.addEventListener("click", () => {
        if (hasStarted) {
            effect.cancelRender();
            startStopElem.innerHTML = "Start";
        }
        else {
            effect.render();
            startStopElem.innerHTML = "Stop";
        }
        hasStarted = !hasStarted;
    });

    pinElem.addEventListener("click", () => {
        if (!hasMenuPinned) {
            menuElem.classList.add("menu-pinned");
        } else {
            menuElem.classList.remove("menu-pinned");
        }
        hasMenuPinned = !hasMenuPinned;
    });

    window.addEventListener("resize", () => {
        canvas = new Canvas("canvas", window.innerWidth - 1, window.innerHeight - 1);
        effect.cancelRender();
        effect = new Effect(canvas, noOfParticles, cellSize, curve, zoom);
        effect.render();
    });
}

window.onload = main;