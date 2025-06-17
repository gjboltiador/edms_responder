export const drawBodyOutline = (ctx: CanvasRenderingContext2D, isFront: boolean) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  
  // Head
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.1, width * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  
  // Neck
  ctx.beginPath();
  ctx.moveTo(width / 2 - width * 0.03, height * 0.18);
  ctx.lineTo(width / 2 + width * 0.03, height * 0.18);
  ctx.lineTo(width / 2 + width * 0.04, height * 0.22);
  ctx.lineTo(width / 2 - width * 0.04, height * 0.22);
  ctx.closePath();
  ctx.stroke();
  
  // Torso
  ctx.beginPath();
  ctx.moveTo(width / 2 - width * 0.15, height * 0.22);
  ctx.lineTo(width / 2 + width * 0.15, height * 0.22);
  ctx.lineTo(width / 2 + width * 0.12, height * 0.5);
  ctx.lineTo(width / 2 - width * 0.12, height * 0.5);
  ctx.closePath();
  ctx.stroke();

  if (isFront) {
    // Front view specific details
    // Arms
    ctx.beginPath();
    ctx.moveTo(width / 2 - width * 0.15, height * 0.22);
    ctx.lineTo(width / 2 - width * 0.25, height * 0.35);
    ctx.moveTo(width / 2 + width * 0.15, height * 0.22);
    ctx.lineTo(width / 2 + width * 0.25, height * 0.35);
    ctx.stroke();
  } else {
    // Back view specific details
    // Shoulder blades
    ctx.beginPath();
    ctx.arc(width / 2 - width * 0.08, height * 0.25, width * 0.03, 0, Math.PI * 2);
    ctx.arc(width / 2 + width * 0.08, height * 0.25, width * 0.03, 0, Math.PI * 2);
    ctx.stroke();
  }
}; 