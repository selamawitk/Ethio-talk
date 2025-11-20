import { useEffect, useRef } from 'react';

export default function VoiceWave({ isRecording, audioLevel = 0 }) {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const phaseRef = useRef(0);
  const waveDataRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const pointCount = 120;

    if (waveDataRef.current.length === 0) {
      waveDataRef.current = Array(pointCount).fill(0);
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      phaseRef.current += isRecording ? 0.06 : 0.02;

      for (let i = 0; i < pointCount; i++) {
        const influence = Math.sin((i / pointCount) * Math.PI * 2 + phaseRef.current) * 0.5 + 0.5;
        const randomNoise = isRecording ? Math.random() * audioLevel * 80 : 0;
        const targetValue = influence * audioLevel * 70 + randomNoise;
        waveDataRef.current[i] = waveDataRef.current[i] * 0.7 + targetValue * 0.3;
      }

      const waveHeight = 140;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let i = 0; i < pointCount; i++) {
        const x = (i / (pointCount - 1)) * width;
        const y = centerY - waveDataRef.current[i];
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, centerY);
      ctx.closePath();
      ctx.fill();

      const gradientFill = ctx.createLinearGradient(0, centerY - waveHeight, 0, centerY + waveHeight);
      gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      gradientFill.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)');
      gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

      ctx.fillStyle = gradientFill;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let i = 0; i < pointCount; i++) {
        const x = (i / (pointCount - 1)) * width;
        const y = centerY - waveDataRef.current[i];
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, centerY);
      ctx.closePath();
      ctx.fill();

      const gradientStroke = ctx.createLinearGradient(0, 0, width, 0);
      gradientStroke.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
      gradientStroke.addColorStop(0.4, 'rgba(14, 165, 233, 0.95)');
      gradientStroke.addColorStop(0.7, 'rgba(34, 211, 238, 0.95)');
      gradientStroke.addColorStop(1, 'rgba(14, 165, 233, 0.85)');

      ctx.strokeStyle = gradientStroke;
      ctx.lineWidth = isRecording ? 5 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 25;
      ctx.shadowColor = 'rgba(14, 165, 233, 0.6)';

      ctx.beginPath();
      for (let i = 0; i < pointCount; i++) {
        const x = (i / (pointCount - 1)) * width;
        const y = centerY - waveDataRef.current[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, audioLevel]);

  return <canvas ref={canvasRef} width={800} height={300} className="w-full h-full" />;
}
