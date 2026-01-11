// Confetti animation utility for celebrations
export const triggerConfetti = (duration = 2000) => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = [];
  const particleCount = 50;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = Math.random() * 5 + 5;
      this.angle = Math.random() * Math.PI * 2;
      this.angleVel = (Math.random() - 0.5) * 0.2;
      this.decay = Math.random() * 0.015 + 0.015;
      this.alpha = 1;
      this.size = Math.random() * 6 + 4;
      this.color = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][
        Math.floor(Math.random() * 5)
      ];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // gravity
      this.angle += this.angleVel;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      particle.update();
      particle.draw(ctx);

      if (particle.alpha <= 0) {
        particles.splice(index, 1);
      }
    });

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  };

  animate();
};

export default triggerConfetti;
