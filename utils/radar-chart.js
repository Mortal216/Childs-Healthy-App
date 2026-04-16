function getPoint(centerX, centerY, radius, angle) {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  };
}

function drawPolygon(ctx, centerX, centerY, radius, count, angleOffset) {
  for (let i = 0; i < count; i += 1) {
    const angle = angleOffset + (Math.PI * 2 * i) / count;
    const point = getPoint(centerX, centerY, radius, angle);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.closePath();
}

function drawRadarChart(page, canvasId, items, options = {}) {
  if (!page || !canvasId || !Array.isArray(items) || items.length < 3) {
    return;
  }

  const size = options.size || 320;
  const center = size / 2;
  const radius = options.radius || 102;
  const levelCount = options.levelCount || 5;
  const axisCount = items.length;
  const angleOffset = -Math.PI / 2;
  const themeColor = options.themeColor || '#FF6B8A';
  const fillColor = options.fillColor || 'rgba(255, 107, 138, 0.22)';
  const ctx = wx.createCanvasContext(canvasId, page);

  ctx.clearRect(0, 0, size, size);

  for (let level = 1; level <= levelCount; level += 1) {
    const currentRadius = (radius * level) / levelCount;
    ctx.beginPath();
    drawPolygon(ctx, center, center, currentRadius, axisCount, angleOffset);
    ctx.setStrokeStyle('#EADDE2');
    ctx.setLineWidth(level === levelCount ? 1.6 : 1);
    ctx.stroke();
  }

  items.forEach((item, index) => {
    const angle = angleOffset + (Math.PI * 2 * index) / axisCount;
    const axisPoint = getPoint(center, center, radius, angle);
    const labelPoint = getPoint(center, center, radius + 26, angle);

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(axisPoint.x, axisPoint.y);
    ctx.setStrokeStyle('#E7D8DE');
    ctx.setLineWidth(1);
    ctx.stroke();

    ctx.setFillStyle('#5B4B55');
    ctx.setFontSize(12);

    if (Math.cos(angle) > 0.25) {
      ctx.setTextAlign('left');
    } else if (Math.cos(angle) < -0.25) {
      ctx.setTextAlign('right');
    } else {
      ctx.setTextAlign('center');
    }

    ctx.setTextBaseline('middle');
    ctx.fillText(item.label, labelPoint.x, labelPoint.y);
  });

  ctx.beginPath();
  items.forEach((item, index) => {
    const safePercent = Math.max(0, Math.min(100, item.percent || 0));
    const angle = angleOffset + (Math.PI * 2 * index) / axisCount;
    const point = getPoint(center, center, (radius * safePercent) / 100, angle);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.setFillStyle(fillColor);
  ctx.fill();
  ctx.setStrokeStyle(themeColor);
  ctx.setLineWidth(2.5);
  ctx.stroke();

  items.forEach((item, index) => {
    const safePercent = Math.max(0, Math.min(100, item.percent || 0));
    const angle = angleOffset + (Math.PI * 2 * index) / axisCount;
    const point = getPoint(center, center, (radius * safePercent) / 100, angle);

    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.setFillStyle('#FFFFFF');
    ctx.fill();
    ctx.setStrokeStyle(themeColor);
    ctx.setLineWidth(2);
    ctx.stroke();
  });

  ctx.draw();
}

module.exports = {
  drawRadarChart
};
