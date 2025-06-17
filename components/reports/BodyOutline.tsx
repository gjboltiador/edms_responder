import { useRef, useEffect } from 'react';

interface BodyOutlineProps {
  onInjuryMark: (x: number, y: number, isFront: boolean) => void;
  isFront: boolean;
}

export function BodyOutline({ onInjuryMark, isFront }: BodyOutlineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw body outline
    drawBodyOutline(ctx, isFront);

    // Add click handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onInjuryMark(x, y, isFront);
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [isFront, onInjuryMark]);

  const drawBodyOutline = (ctx: CanvasRenderingContext2D, isFront: boolean) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    if (isFront) {
      // Draw front view
      // Head
      ctx.ellipse(width / 2, height * 0.1, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
      
      // Torso
      ctx.moveTo(width * 0.3, height * 0.2);
      ctx.lineTo(width * 0.3, height * 0.6);
      ctx.lineTo(width * 0.7, height * 0.6);
      ctx.lineTo(width * 0.7, height * 0.2);
      ctx.closePath();

      // Arms
      ctx.moveTo(width * 0.3, height * 0.25);
      ctx.lineTo(width * 0.1, height * 0.4);
      ctx.moveTo(width * 0.7, height * 0.25);
      ctx.lineTo(width * 0.9, height * 0.4);

      // Legs
      ctx.moveTo(width * 0.4, height * 0.6);
      ctx.lineTo(width * 0.4, height * 0.9);
      ctx.moveTo(width * 0.6, height * 0.6);
      ctx.lineTo(width * 0.6, height * 0.9);
    } else {
      // Draw back view
      // Head
      ctx.ellipse(width / 2, height * 0.1, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
      
      // Torso
      ctx.moveTo(width * 0.3, height * 0.2);
      ctx.lineTo(width * 0.3, height * 0.6);
      ctx.lineTo(width * 0.7, height * 0.6);
      ctx.lineTo(width * 0.7, height * 0.2);
      ctx.closePath();

      // Arms
      ctx.moveTo(width * 0.3, height * 0.25);
      ctx.lineTo(width * 0.1, height * 0.4);
      ctx.moveTo(width * 0.7, height * 0.25);
      ctx.lineTo(width * 0.9, height * 0.4);

      // Legs
      ctx.moveTo(width * 0.4, height * 0.6);
      ctx.lineTo(width * 0.4, height * 0.9);
      ctx.moveTo(width * 0.6, height * 0.6);
      ctx.lineTo(width * 0.6, height * 0.9);
    }

    ctx.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={500}
      className="border border-gray-300 rounded-lg"
    />
  );
} 