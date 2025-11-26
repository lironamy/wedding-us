'use client';

import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
}

// Convert hex to normalized RGB
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
}

const Particles: React.FC<ParticlesProps> = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors = ["#ffffff", "#ffffff", "#ffffff"],
  moveParticlesOnHover = true,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      depth: false,
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    // Setup camera
    const camera = new Camera(gl, { fov: 15, near: 0.1, far: 100 });
    camera.position.z = cameraDistance;

    // Resize handler
    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };
    window.addEventListener("resize", resize);
    resize();

    // Create particles
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const palette = particleColors.map(hexToRgb);

    for (let i = 0; i < count; i++) {
      // Random spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * particleSpread;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();

      sizes[i] = 0.5 + Math.random() * 0.5 * sizeRandomness;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 3, data: randoms },
      size: { size: 1, data: sizes },
      color: { size: 3, data: colors },
    });

    const vertexShader = /* glsl */ `
      attribute vec3 position;
      attribute vec3 random;
      attribute float size;
      attribute vec3 color;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;
      uniform float uSpeed;
      uniform float uBaseSize;
      uniform vec2 uMouse;
      uniform float uHoverFactor;

      varying vec3 vColor;

      void main() {
        vColor = color;
        vec3 pos = position;

        // Animated movement
        pos.x += sin(uTime * uSpeed + random.x * 10.0) * 0.5;
        pos.y += cos(uTime * uSpeed + random.y * 10.0) * 0.5;
        pos.z += sin(uTime * uSpeed + random.z * 10.0) * 0.5;

        // Mouse influence
        pos.x += uMouse.x * uHoverFactor * random.x;
        pos.y += uMouse.y * uHoverFactor * random.y;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uBaseSize / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = /* glsl */ `
      precision highp float;
      varying vec3 vColor;
      uniform float uAlpha;

      void main() {
        vec2 uv = gl_PointCoord.xy;
        float d = length(uv - 0.5);

        if (uAlpha > 0.5) {
          float alpha = 1.0 - smoothstep(0.45, 0.5, d);
          gl_FragColor = vec4(vColor, alpha);
        } else {
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, 1.0);
        }
      }
    `;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uBaseSize: { value: particleBaseSize },
        uMouse: { value: [0, 0] },
        uHoverFactor: { value: moveParticlesOnHover ? particleHoverFactor : 0 },
        uAlpha: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    if (moveParticlesOnHover) {
      container.addEventListener("mousemove", onMouseMove);
    }

    // Animation loop
    let animationId: number;
    const animate = (t: number) => {
      animationId = requestAnimationFrame(animate);
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];

      if (!disableRotation) {
        particles.rotation.y = t * 0.0001;
        particles.rotation.x = t * 0.00005;
      }

      renderer.render({ scene: particles, camera });
    };
    animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) {
        container.removeEventListener("mousemove", onMouseMove);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ pointerEvents: moveParticlesOnHover ? 'auto' : 'none' }}
    />
  );
};

export default Particles;
