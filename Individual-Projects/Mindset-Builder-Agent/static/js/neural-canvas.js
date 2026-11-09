/**
 * Neural Network Flowing Background Canvas
 * Simulates interconnected synaptic nodes, action potentials, and neural flow.
 */
class NeuralNetworkCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.pulses = [];
    this.maxNodes = 65;
    this.connectionDist = 140;
    this.mouse = { x: null, y: null, radius: 160 };
    this.isExcited = false; // When AI is processing
    this.dpr = window.devicePixelRatio || 1;

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    this.createNodes();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // Adjust density based on screen width
    if (this.width < 768) {
      this.maxNodes = 35;
      this.connectionDist = 100;
    } else {
      this.maxNodes = 75;
      this.connectionDist = 150;
    }
  }

  createNodes() {
    this.nodes = [];
    for (let i = 0; i < this.maxNodes; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.3,
        alpha: 0.3,
        pulseVal: Math.random() * Math.PI,
        color: Math.random() > 0.4 ? '#38bdf8' : '#818cf8' // Cyan & Indigo
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createNodes();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  setExcited(active) {
    this.isExcited = !!active;
  }

  spawnActionPotential(fromNode, toNode) {
    if (this.pulses.length > 25) return;
    this.pulses.push({
      x1: fromNode.x,
      y1: fromNode.y,
      x2: toNode.x,
      y2: toNode.y,
      progress: 0,
      speed: 0.02 + Math.random() * 0.02,
      color: Math.random() > 0.5 ? '#38bdf8' : '#c084fc'
    });
  }

  update() {
    const speedMultiplier = this.isExcited ? 2.2 : 1.0;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.x += node.vx * speedMultiplier;
      node.y += node.vy * speedMultiplier;

      // Screen wrap
      if (node.x < -20) node.x = this.width + 20;
      else if (node.x > this.width + 20) node.x = -20;
      if (node.y < -20) node.y = this.height + 20;
      else if (node.y > this.height + 20) node.y = -20;

      // Mouse subtle interaction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          node.x -= (dx / dist) * force * 1.5;
          node.y -= (dy / dist) * force * 1.5;
        }
      }

      node.pulseVal += 0.02 * speedMultiplier;
      node.alpha = node.baseAlpha + Math.sin(node.pulseVal) * 0.15;
      if (this.isExcited) node.alpha = Math.min(1.0, node.alpha + 0.3);
    }

    // Update action potentials
    for (let p = this.pulses.length - 1; p >= 0; p--) {
      const pulse = this.pulses[p];
      pulse.progress += pulse.speed * speedMultiplier;
      if (pulse.progress >= 1) {
        this.pulses.splice(p, 1);
      }
    }

    // Random spontaneous action potentials
    if (Math.random() < (this.isExcited ? 0.2 : 0.03) && this.nodes.length > 2) {
      const n1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      const n2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
      if (dist < this.connectionDist) {
        this.spawnActionPotential(n1, n2);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw synaptic lines
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDist) {
          const opacity = (1 - dist / this.connectionDist) * 0.28 * (this.isExcited ? 1.8 : 1.0);
          this.ctx.beginPath();
          this.ctx.moveTo(n1.x, n1.y);
          this.ctx.lineTo(n2.x, n2.y);
          this.ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }

    // Draw action potentials (traveling spark along synapses)
    for (let i = 0; i < this.pulses.length; i++) {
      const p = this.pulses[i];
      const px = p.x1 + (p.x2 - p.x1) * p.progress;
      const py = p.y1 + (p.y2 - p.y1) * p.progress;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // Reset
    }

    // Draw neurons (nodes)
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1.0, node.alpha));
      this.ctx.shadowColor = node.color;
      this.ctx.shadowBlur = this.isExcited ? 12 : 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;
    }
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Global instance handle
window.neuralCanvas = null;
document.addEventListener('DOMContentLoaded', () => {
  window.neuralCanvas = new NeuralNetworkCanvas('neural-canvas');
});

