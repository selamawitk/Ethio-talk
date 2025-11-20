import { useEffect, useRef } from 'react';

export default function OrbVisualization() {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const particles = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / 100,
        radius: 80 + Math.random() * 40,
        speed: 0.001 + Math.random() * 0.002,
        size: 1 + Math.random() * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      rotationRef.current += 0.005;

      particles.forEach((particle, index) => {
        particle.angle += particle.speed;

        const waveOffset = Math.sin(rotationRef.current * 2 + index * 0.1) * 20;
        const currentRadius = particle.radius + waveOffset;

        const x =
          centerX +
          Math.cos(particle.angle + rotationRef.current) * currentRadius;
        const y =
          centerY +
          Math.sin(particle.angle + rotationRef.current) * currentRadius;

        const gradient = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          particle.size * 2
        );
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.6)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full"
    />
  );
}
