export default function getChatViewport({ layoutHeight, fullHeight, height, offsetTop, scale, inputFocused }) {
  return {
    height,
    bottom: Math.max(0, layoutHeight - height - offsetTop),
    keyboardOpen: inputFocused && scale === 1 && fullHeight - height > 120,
  };
}
