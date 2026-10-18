// CSS-ээр нуугдсан (.hero .visual{display:none}) боловч эх markup-ийг хадгалав.
export default function HeroVisual() {
  return (
    <div className="visual" aria-label="Creative illustration of connected technology skills">
      <div className="grid" />
      <span className="visual-label">THE POSSIBILITIES ARE ENDLESS</span>
      <div className="orbit" />
      <div className="orbit two" />
      <div className="orbit three" />
      <div className="core">&lt;/&gt;</div>
      <div className="float f1"><b>⌘</b> Python & automation</div>
      <div className="float f2"><b>✳</b> Artificial intelligence</div>
      <div className="float f3"><b>▥</b> Data & analytics</div>
      <div className="float f4"><b></b> Your next big idea</div>
      <span className="visual-bottom">A LITTLE CURIOSITY. A LOT OF POSSIBILITY.</span>
    </div>
  );
}
