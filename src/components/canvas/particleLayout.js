const X_OFFSET = [2.7, -2.7, 2.5, 0, 2.6, -2.6];

export function particleLayout({ width, height, fov, distance, shape, bounds }) {
  const compact = width <= 900;
  const viewHeight = 2 * Math.tan(fov * Math.PI / 360) * distance;
  const viewWidth = viewHeight * width / height;
  if (!compact) return { compact, scale: 1, x: shape === 0 ? viewWidth / 4 : X_OFFSET[shape], y: 0 };

  // Fit the entire logo; rotating shapes use their bounding sphere for safe margins.
  const modelWidth = shape === 0 ? bounds.width : bounds.diameter;
  const modelHeight = shape === 0 ? bounds.height : bounds.diameter;
  return {
    compact,
    scale: Math.min(1, viewWidth * .84 / modelWidth, viewHeight * .42 / modelHeight),
    x: 0,
    y: shape === 0 ? viewHeight * .12 : 0,
  };
}
