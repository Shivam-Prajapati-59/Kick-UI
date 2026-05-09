"use client";

import { useEffect, useRef, CSSProperties } from "react";
import * as THREE from "three";

/* ─── shader sources ──────────────────────────────────────────────── */

const v = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
const p = `precision highp float; `;
const s = `precision mediump sampler2D; `;

const shaders = {
  splat: [v, `${p}${s}
uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius; varying vec2 vUv;
void main(){vec2 p=vUv-point;p.x*=aspectRatio;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.0);}`],
  advection: [v, `${p}${s}
uniform sampler2D uVelocity,uSource;uniform vec2 texelSize;uniform float dt,dissipation;varying vec2 vUv;
void main(){vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;gl_FragColor=dissipation*texture2D(uSource,coord);}`],
  divergence: [v, `${p}${s}
uniform sampler2D uVelocity;uniform vec2 texelSize;varying vec2 vUv;
vec2 vel(vec2 uv){vec2 e=vec2(1.);if(uv.x<0.){uv.x=0.;e.x=-1.;}if(uv.x>1.){uv.x=1.;e.x=-1.;}if(uv.y<0.){uv.y=0.;e.y=-1.;}if(uv.y>1.){uv.y=1.;e.y=-1.;}return texture2D(uVelocity,uv).xy*e;}
void main(){vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y);gl_FragColor=vec4(0.5*(vel(R).x-vel(L).x+vel(T).y-vel(B).y),0.,0.,1.);}`],
  curl: [v, `${p}${s}
uniform sampler2D uVelocity;uniform vec2 texelSize;varying vec2 vUv;
void main(){vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y);float vorticity=texture2D(uVelocity,R).y-texture2D(uVelocity,L).y-texture2D(uVelocity,T).x+texture2D(uVelocity,B).x;gl_FragColor=vec4(vorticity,0.,0.,1.);}`],
  vorticity: [v, `${p}${s}
uniform sampler2D uVelocity,uCurl;uniform vec2 texelSize;uniform float curlStrength,dt;varying vec2 vUv;
void main(){vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y);vec2 force=vec2(abs(texture2D(uCurl,T).x)-abs(texture2D(uCurl,B).x),abs(texture2D(uCurl,R).x)-abs(texture2D(uCurl,L).x));force=normalize(force+0.0001)*curlStrength*texture2D(uCurl,vUv).x;gl_FragColor=vec4(texture2D(uVelocity,vUv).xy+force*dt,0.,1.);}`],
  pressure: [v, `${p}${s}
uniform sampler2D uPressure,uDivergence;uniform vec2 texelSize;varying vec2 vUv;
void main(){vec2 L=clamp(vUv-vec2(texelSize.x,0.),0.,1.),R=clamp(vUv+vec2(texelSize.x,0.),0.,1.),T=clamp(vUv+vec2(0.,texelSize.y),0.,1.),B=clamp(vUv-vec2(0.,texelSize.y),0.,1.);gl_FragColor=vec4(0.25*(texture2D(uPressure,L).x+texture2D(uPressure,R).x+texture2D(uPressure,T).x+texture2D(uPressure,B).x-texture2D(uDivergence,vUv).x),0.,0.,1.);}`],
  gradientSubtract: [v, `${p}${s}
uniform sampler2D uPressure,uVelocity;uniform vec2 texelSize;varying vec2 vUv;
void main(){float pL=texture2D(uPressure,clamp(vUv-vec2(texelSize.x,0.),0.,1.)).x,pR=texture2D(uPressure,clamp(vUv+vec2(texelSize.x,0.),0.,1.)).x,pT=texture2D(uPressure,clamp(vUv+vec2(0.,texelSize.y),0.,1.)).x,pB=texture2D(uPressure,clamp(vUv-vec2(0.,texelSize.y),0.,1.)).x;gl_FragColor=vec4(texture2D(uVelocity,vUv).xy-vec2(pR-pL,pT-pB),0.,1.);}`],
  clear: [v, `${p}${s}
uniform sampler2D uTexture;uniform float value;varying vec2 vUv;
void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`],
  display: [v, `${p}
uniform sampler2D uTexture;uniform float threshold,edgeSoftness;uniform vec3 inkColor;varying vec2 vUv;
void main(){float d=clamp(length(texture2D(uTexture,vUv).rgb),0.,1.);float a=edgeSoftness>0.?smoothstep(threshold+edgeSoftness*.5,threshold-edgeSoftness*.5,d):step(threshold,d);gl_FragColor=vec4(inkColor*a,a);}`],
};

/* ─── types ───────────────────────────────────────────────────────── */

interface FluidConfig {
  simResolution: number;
  dyeResolution: number;
  curl: number;
  pressureIterations: number;
  velocityDissipation: number;
  dyeDissipation: number;
  splatRadius: number;
  forceStrength: number;
  pressureDecay: number;
  threshold: number;
  edgeSoftness: number;
  inkColor: THREE.Color;
}

interface DoubleFBO {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap: () => void;
}

/* ─── simulation class ────────────────────────────────────────────── */

class FluidSimulation {
  config: FluidConfig;
  renderer!: THREE.WebGLRenderer;
  dpr!: number;
  width!: number;
  height!: number;
  scene!: THREE.Scene;
  camera!: THREE.OrthographicCamera;
  quad!: THREE.Mesh;
  simSize!: { w: number; h: number };
  dyeSize!: { w: number; h: number };
  velocity!: DoubleFBO;
  dye!: DoubleFBO;
  divergence!: THREE.WebGLRenderTarget;
  curl!: THREE.WebGLRenderTarget;
  pressure!: DoubleFBO;
  simTexel!: THREE.Vector2;
  dyeTexel!: THREE.Vector2;
  material!: Record<string, THREE.ShaderMaterial>;
  mouse!: { x: number; y: number; velocityX: number; velocityY: number; moved: boolean };
  private _animId = 0;
  private _onResize: () => void;
  private _onMouseMove: (e: MouseEvent) => void;
  private _onTouchMove: (e: TouchEvent) => void;

  private _resizeObserver!: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, config: FluidConfig) {
    this.config = config;
    this._onResize = () => {};
    this._onMouseMove = () => {};
    this._onTouchMove = () => {};
    this._setupRenderer(canvas);
    this._setupScene();
    this._setupTargets();
    this._setupMaterials();
    this._setupInput();
    this._loop();
  }

  _setupRenderer(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Initial size
    let width = canvas.parentElement ? canvas.parentElement.clientWidth : canvas.clientWidth;
    let height = canvas.parentElement ? canvas.parentElement.clientHeight : canvas.clientHeight;
    if (width === 0) width = window.innerWidth;
    if (height === 0) height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.dpr = this.renderer.getPixelRatio();
    this.width = width * this.dpr;
    this.height = height * this.dpr;

    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        this.renderer.setSize(width, height);
        this.width = width * this.dpr;
        this.height = height * this.dpr;
      }
    });
    
    if (canvas.parentElement) {
      this._resizeObserver.observe(canvas.parentElement);
    } else {
      this._resizeObserver.observe(canvas);
    }
  }

  _setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);
  }

  _setupTargets() {
    const { simResolution: simRes, dyeResolution: dyeRes } = this.config;
    const aspect = this.width / this.height;
    const opts: THREE.RenderTargetOptions = {
      type: THREE.HalfFloatType,
      depthBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    };
    const single = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, opts);
    const double = (w: number, h: number): DoubleFBO => ({
      read: single(w, h),
      write: single(w, h),
      swap() { [this.read, this.write] = [this.write, this.read]; },
    });
    this.simSize = { w: simRes, h: Math.round(simRes / aspect) };
    this.dyeSize = { w: dyeRes, h: Math.round(dyeRes / aspect) };
    this.velocity = double(this.simSize.w, this.simSize.h);
    this.dye = double(this.dyeSize.w, this.dyeSize.h);
    this.divergence = single(this.simSize.w, this.simSize.h);
    this.curl = single(this.simSize.w, this.simSize.h);
    this.pressure = double(this.simSize.w, this.simSize.h);
    this.simTexel = new THREE.Vector2(1 / this.simSize.w, 1 / this.simSize.h);
    this.dyeTexel = new THREE.Vector2(1 / this.dyeSize.w, 1 / this.dyeSize.h);
  }

  _setupMaterials() {
    const make = ([vert, frag]: string[], uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthWrite: false, depthTest: false });
    const tex = (): THREE.IUniform => ({ value: null });
    const num = (v = 0): THREE.IUniform => ({ value: v });
    const vec2 = (): THREE.IUniform => ({ value: new THREE.Vector2() });
    this.material = {
      splat: make(shaders.splat, { uTarget: tex(), aspectRatio: num(), radius: num(), color: { value: new THREE.Vector3() }, point: vec2() }),
      advection: make(shaders.advection, { uVelocity: tex(), uSource: tex(), texelSize: vec2(), dt: num(), dissipation: num() }),
      divergence: make(shaders.divergence, { uVelocity: tex(), texelSize: { value: this.simTexel } }),
      curl: make(shaders.curl, { uVelocity: tex(), texelSize: { value: this.simTexel } }),
      vorticity: make(shaders.vorticity, { uVelocity: tex(), uCurl: tex(), texelSize: { value: this.simTexel }, curlStrength: num(), dt: num() }),
      pressure: make(shaders.pressure, { uPressure: tex(), uDivergence: tex(), texelSize: { value: this.simTexel } }),
      gradientSubtract: make(shaders.gradientSubtract, { uPressure: tex(), uVelocity: tex(), texelSize: { value: this.simTexel } }),
      clear: make(shaders.clear, { uTexture: tex(), value: num() }),
      display: make(shaders.display, { uTexture: tex(), threshold: num(), edgeSoftness: num(), inkColor: { value: this.config.inkColor } }),
    };
  }

  _setupInput() {
    this.mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false };
    const getRect = () => this.renderer.domElement.getBoundingClientRect();
    
    const onMove = (x: number, y: number) => {
      const rect = getRect();
      const localX = x - rect.left;
      const localY = y - rect.top;
      
      // Ignore if outside the canvas bounds
      if (localX < 0 || localX > rect.width || localY < 0 || localY > rect.height) return;

      const sx = localX * this.dpr;
      const sy = localY * this.dpr;
      
      this.mouse.velocityX = (sx - this.mouse.x) * this.config.forceStrength;
      this.mouse.velocityY = (sy - this.mouse.y) * this.config.forceStrength;
      this.mouse.x = sx;
      this.mouse.y = sy;
      this.mouse.moved = true;
    };
    
    this._onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    this._onTouchMove = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); };
    
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("touchmove", this._onTouchMove, { passive: false });
  }

  _pass(mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  _splat(x: number, y: number, vx: number, vy: number) {
    const u = this.material.splat.uniforms;
    u.aspectRatio.value = this.width / this.height;
    u.point.value.set(x / this.width, 1 - y / this.height);
    u.radius.value = this.config.splatRadius / 100;
    u.uTarget.value = this.velocity.read.texture;
    u.color.value.set(vx, -vy, 0);
    this._pass(this.material.splat, this.velocity.write);
    this.velocity.swap();
    u.uTarget.value = this.dye.read.texture;
    u.color.value.set(3, 3, 3);
    this._pass(this.material.splat, this.dye.write);
    this.dye.swap();
  }

  _simulate(dt: number) {
    const m = this.material;
    m.curl.uniforms.uVelocity.value = this.velocity.read.texture;
    this._pass(m.curl, this.curl);
    m.vorticity.uniforms.uVelocity.value = this.velocity.read.texture;
    m.vorticity.uniforms.uCurl.value = this.curl.texture;
    m.vorticity.uniforms.curlStrength.value = this.config.curl;
    m.vorticity.uniforms.dt.value = dt;
    this._pass(m.vorticity, this.velocity.write);
    this.velocity.swap();
    m.divergence.uniforms.uVelocity.value = this.velocity.read.texture;
    this._pass(m.divergence, this.divergence);
    m.clear.uniforms.uTexture.value = this.pressure.read.texture;
    m.clear.uniforms.value.value = this.config.pressureDecay;
    this._pass(m.clear, this.pressure.write);
    this.pressure.swap();
    m.pressure.uniforms.uDivergence.value = this.divergence.texture;
    for (let i = 0; i < this.config.pressureIterations; i++) {
      m.pressure.uniforms.uPressure.value = this.pressure.read.texture;
      this._pass(m.pressure, this.pressure.write);
      this.pressure.swap();
    }
    m.gradientSubtract.uniforms.uPressure.value = this.pressure.read.texture;
    m.gradientSubtract.uniforms.uVelocity.value = this.velocity.read.texture;
    this._pass(m.gradientSubtract, this.velocity.write);
    this.velocity.swap();
    m.advection.uniforms.uVelocity.value = this.velocity.read.texture;
    m.advection.uniforms.uSource.value = this.velocity.read.texture;
    m.advection.uniforms.texelSize.value = this.simTexel;
    m.advection.uniforms.dt.value = dt;
    m.advection.uniforms.dissipation.value = this.config.velocityDissipation;
    this._pass(m.advection, this.velocity.write);
    this.velocity.swap();
    m.advection.uniforms.uSource.value = this.dye.read.texture;
    m.advection.uniforms.texelSize.value = this.dyeTexel;
    m.advection.uniforms.dissipation.value = this.config.dyeDissipation;
    this._pass(m.advection, this.dye.write);
    this.dye.swap();
  }

  _render() {
    const u = this.material.display.uniforms;
    u.uTexture.value = this.dye.read.texture;
    u.threshold.value = this.config.threshold;
    u.edgeSoftness.value = this.config.edgeSoftness;
    u.inkColor.value = this.config.inkColor;
    this._pass(this.material.display, null);
  }

  _loop() {
    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;
      if (this.mouse.moved) {
        this._splat(this.mouse.x, this.mouse.y, this.mouse.velocityX, this.mouse.velocityY);
        this.mouse.moved = false;
      }
      this._simulate(dt);
      this._render();
      this._animId = requestAnimationFrame(tick);
    };
    tick();
  }

  dispose() {
    cancelAnimationFrame(this._animId);
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("touchmove", this._onTouchMove);
    this.velocity.read.dispose(); this.velocity.write.dispose();
    this.dye.read.dispose(); this.dye.write.dispose();
    this.divergence.dispose(); this.curl.dispose();
    this.pressure.read.dispose(); this.pressure.write.dispose();
    Object.values(this.material).forEach((m) => m.dispose());
    this.quad.geometry.dispose();
    this.renderer.dispose();
  }
}

/* ─── CSS-var → THREE.Color helper ───────────────────────────────── */

/**
 * Resolves a CSS custom property (e.g. "--foreground") or any valid
 * CSS color string (e.g. "#fff", "rgb(0,255,128)") to a THREE.Color.
 * Falls back to white if resolution fails.
 */
function resolveCssColor(value: string, fallback = "#ffffff"): THREE.Color {
  if (value.startsWith("--")) {
    // Read the computed CSS variable from the document root
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue(value)
      .trim();
    return new THREE.Color(computed || fallback);
  }
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color(fallback);
  }
}

/* ─── Public props ────────────────────────────────────────────────── */

export interface CursorWebFluidProps {
  /**
   * Ink color for the fluid trail.
   * - Pass a CSS variable name like `"--foreground"` or `"--primary"` to use theme tokens.
   * - Pass any valid CSS color string like `"#ff0080"` or `"rgb(255,0,128)"`.
   * @default "--foreground"
   */
  inkColor?: string;

  /**
   * Resolution of the velocity simulation grid.
   * Higher = more detail, lower = better performance.
   * @default 256
   */
  simResolution?: number;

  /**
   * Resolution of the dye (ink) texture.
   * @default 1024
   */
  dyeResolution?: number;

  /**
   * Curl / vorticity strength — how much the fluid spins.
   * @default 25
   */
  curl?: number;

  /**
   * Number of pressure solver iterations per frame.
   * Higher = more accurate, lower = better performance.
   * @default 50
   */
  pressureIterations?: number;

  /**
   * How quickly velocity dissipates each frame (0–1).
   * Values closer to 1 keep trails longer.
   * @default 0.95
   */
  velocityDissipation?: number;

  /**
   * How quickly the dye/ink fades each frame (0–1).
   * Values closer to 1 keep ink visible longer.
   * @default 0.95
   */
  dyeDissipation?: number;

  /**
   * Radius of the fluid splat on cursor interaction.
   * @default 0.275
   */
  splatRadius?: number;

  /**
   * Multiplier for the cursor velocity force applied to the fluid.
   * @default 7.5
   */
  forceStrength?: number;

  /**
   * How much pressure is retained each frame (0–1).
   * @default 0.75
   */
  pressureDecay?: number;

  /**
   * Display threshold for the ink rendering.
   * @default 1.0
   */
  threshold?: number;

  /**
   * Softness of ink edges (0 = hard, >0 = feathered).
   * @default 0.0
   */
  edgeSoftness?: number;

  /**
   * CSS mix-blend-mode applied to the canvas.
   * `"difference"` inverts colours under the trail (great for light/dark themes).
   * `"normal"` renders opaque ink over content.
   * @default "difference"
   */
  blendMode?: CSSProperties["mixBlendMode"];

  /**
   * z-index of the canvas overlay.
   * @default 100
   */
  zIndex?: number;

  /**
   * When true the canvas fills its nearest positioned parent instead of the viewport.
   * Useful for contained demo previews.
   * @default false (fixed, covers full viewport)
   */
  contained?: boolean;

  /** Extra inline styles forwarded to the canvas element. */
  style?: CSSProperties;

  /** Extra class names forwarded to the canvas element. */
  className?: string;
}

/* ─── React component ─────────────────────────────────────────────── */

export default function CursorWebFluid({
  inkColor = "--foreground",
  simResolution = 256,
  dyeResolution = 1024,
  curl = 25,
  pressureIterations = 50,
  velocityDissipation = 0.95,
  dyeDissipation = 0.95,
  splatRadius = 0.275,
  forceStrength = 7.5,
  pressureDecay = 0.75,
  threshold = 1.0,
  edgeSoftness = 0.0,
  blendMode = "difference",
  zIndex = 100,
  contained = false,
  style,
  className,
}: CursorWebFluidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resolvedInkColor = resolveCssColor(inkColor);

    const config: FluidConfig = {
      simResolution,
      dyeResolution,
      curl,
      pressureIterations,
      velocityDissipation,
      dyeDissipation,
      splatRadius,
      forceStrength,
      pressureDecay,
      threshold,
      edgeSoftness,
      inkColor: resolvedInkColor,
    };

    const sim = new FluidSimulation(canvas, config);
    return () => sim.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inkColor,
    simResolution,
    dyeResolution,
    curl,
    pressureIterations,
    velocityDissipation,
    dyeDissipation,
    splatRadius,
    forceStrength,
    pressureDecay,
    threshold,
    edgeSoftness,
  ]);

  const canvasStyle: CSSProperties = {
    position: contained ? "absolute" : "fixed",
    inset: 0,
    width: contained ? "100%" : "100vw",
    height: contained ? "100%" : "100vh",
    pointerEvents: "none",
    zIndex,
    mixBlendMode: blendMode,
    ...style,
  };

  return <canvas ref={canvasRef} className={className} style={canvasStyle} />;
}
