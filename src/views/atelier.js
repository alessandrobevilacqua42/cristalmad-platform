/* ════════════════════════════════════════════════════════════════
   ATELIER VIEW — Layout asimmetrico, I Maestri, Il Processo
   ════════════════════════════════════════════════════════════════ */

function initLiquidFire() {
  const canvas = document.getElementById('liquid-fire-bg');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn("WebGL not supported");
    return;
  }

  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_scroll;

    float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
    float noise(vec2 st) {
        vec2 i = floor(st); vec2 f = fract(st);
        float a = random(i); float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm(vec2 st) {
        float v = 0.0; float a = 0.5; vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 5; ++i) { v += a * noise(st); st = rot * st * 2.0 + shift; a *= 0.5; }
        return v;
    }

    void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        vec2 mouse = u_mouse / u_resolution;
        mouse.x *= u_resolution.x / u_resolution.y;
        mouse.y = 1.0 - mouse.y;

        float dist = distance(st, mouse);
        float mouseEffect = smoothstep(0.5, 0.0, dist) * 0.3;

        vec2 q = vec2(0.);
        q.x = fbm(st + 0.00 * u_time);
        q.y = fbm(st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time + mouseEffect);
        r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time + u_scroll);

        float f = fbm(st + r);

        // Core MAGMA colors (deep orange, gold, fire red)
        vec3 color = mix(vec3(0.1, 0.0, 0.0), vec3(0.7, 0.1, 0.0), clamp((f*f)*4.0, 0.0, 1.0));
        color = mix(color, vec3(1.0, 0.4, 0.0), clamp(length(q), 0.0, 1.0));
        color = mix(color, vec3(1.0, 0.8, 0.1), clamp(length(r.x), 0.0, 1.0));

        gl_FragColor = vec4((f*f*f + 0.6*f*f + 0.5*f) * color, 1.0);
    }
  `;

  const vsSource = `
    attribute vec4 a_position;
    void main() { gl_Position = a_position; }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resLoc = gl.getUniformLocation(program, "u_resolution");
  const timeLoc = gl.getUniformLocation(program, "u_time");
  const mouseLoc = gl.getUniformLocation(program, "u_mouse");
  const scrollLoc = gl.getUniformLocation(program, "u_scroll");

  let mouseX = 0, mouseY = 0;
  let scrollY = window.scrollY;
  let targetScrollY = window.scrollY;
  let startTime = Date.now();
  let animationFrameId;

  const handleMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
  const handleScroll = () => { targetScrollY = window.scrollY; };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('scroll', handleScroll);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  function render() {
    if (!document.getElementById('liquid-fire-bg')) {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      return;
    }

    scrollY += (targetScrollY - scrollY) * 0.1;

    gl.uniform2f(resLoc, canvas.width, canvas.height);
    // Slow down time on mobile for slight perf gain / simpler feeling
    const timeMultiplier = window.innerWidth < 768 ? 0.0005 : 0.001;
    gl.uniform1f(timeLoc, (Date.now() - startTime) * timeMultiplier);
    gl.uniform2f(mouseLoc, mouseX, mouseY);
    gl.uniform1f(scrollLoc, scrollY * 0.002);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animationFrameId = requestAnimationFrame(render);
  }
  render();
}

export function atelierView() {
  setTimeout(() => {
    initLiquidFire();
  }, 50);

  return `
  <canvas id="liquid-fire-bg" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; opacity: 0.85; mix-blend-mode: screen;"></canvas>
  <section class="atelier-page" style="padding: var(--s-5xl) 0; position: relative;">
    <div class="container">
      
      <!-- 1. La Fornace (Hero text) -->
      <div class="animate-on-scroll" style="margin-bottom: var(--s-5xl); text-align: left;">
        <p class="section-eyebrow" style="color: var(--c-gold);">La Nostra Casa</p>
        <h1 style="font-family: var(--f-heading); font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 300; line-height: 1.1; max-width: 900px; color: var(--c-text-primary); margin-top: var(--s-sm); text-shadow: 0 4px 12px rgba(0,0,0,0.8);">
          La Fornace:<br>
          <span style="color: var(--c-gold-light);">Dove il Vetro Prende Vita</span>
        </h1>
      </div>

      <!-- Asymmetrical Grid Layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--s-4xl); align-items: center; margin-bottom: var(--s-5xl);">
        
        <!-- 2. I Maestri (Testo) -->
        <div class="animate-on-scroll" style="display: flex; flex-direction: column; justify-content: center;">
          <h2 style="font-family: var(--f-heading); font-size: 2.2rem; color: var(--c-text-primary); margin-bottom: var(--s-md); text-shadow: 0 2px 8px rgba(0,0,0,0.8);">I Maestri</h2>
          <div style="width: 40px; height: 1px; background: var(--c-gold); margin-bottom: var(--s-lg);"></div>
          <p style="color: var(--c-text-secondary); line-height: 1.8; font-size: 1rem; text-shadow: 0 1px 4px rgba(0,0,0,0.9);">
            Dietro ogni curva perfetta, ogni riflesso e ogni trasparenza c'è la mano ferma di un artigiano con decenni di esperienza. 
            I nostri maestri vetrai tramandano i segreti della lavorazione del cristallo di generazione in generazione.
          </p>
          <p style="color: var(--c-text-secondary); line-height: 1.8; font-size: 1rem; margin-top: var(--s-md); text-shadow: 0 1px 4px rgba(0,0,0,0.9);">
            Un'arte antica che richiede forza, precisione e una pazienza assoluta per dominare il fuoco e trasformarlo in bellezza.
          </p>
        </div>
        
        <!-- 2. I Maestri (Immagine placeholder sostitute con CSS Grid Photo Cards) -->
        <div class="animate-on-scroll" data-delay="150" style="position: relative;">
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-md); position: relative; z-index: 2;">
            
            <!-- Maestro Alvise -->
            <div class="glass-panel" style="aspect-ratio: 3/5; overflow: hidden; position: relative; border-radius: 8px;">
               <img src="https://images.unsplash.com/photo-1510423725597-1514cd2245b6?q=80&w=400&auto=format&fit=crop" 
                    srcset="https://images.unsplash.com/photo-1510423725597-1514cd2245b6?q=80&w=400&auto=format&fit=crop 1x, https://images.unsplash.com/photo-1510423725597-1514cd2245b6?q=80&w=800&auto=format&fit=crop 2x"
                    loading="lazy"
                    decoding="async"
                    alt="Maestro Alvise" 
                    style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(80%) sepia(30%) contrast(1.1); transition: filter 0.5s ease;"
                    onmouseover="this.style.filter='grayscale(0%) sepia(10%) contrast(1.1)'"
                    onmouseout="this.style.filter='grayscale(80%) sepia(30%) contrast(1.1)'"
               />
               <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(10,10,12,0.95), transparent); padding: 1rem;">
                  <span style="display:block; color: var(--c-gold-light); font-family: var(--f-heading); font-size: 1.1rem;">Maestro Alvise</span>
                  <span style="display:block; color: var(--c-text-muted); font-size: 0.75rem; text-transform: uppercase;">Capo Fornace</span>
               </div>
            </div>

            <!-- Maestro Lorenzo (Offset) -->
            <div class="glass-panel" style="aspect-ratio: 3/5; overflow: hidden; position: relative; border-radius: 8px; transform: translateY(-30px);">
               <img src="https://images.unsplash.com/photo-1542178229-ea21c7d2cdd2?q=80&w=400&auto=format&fit=crop" 
                    srcset="https://images.unsplash.com/photo-1542178229-ea21c7d2cdd2?q=80&w=400&auto=format&fit=crop 1x, https://images.unsplash.com/photo-1542178229-ea21c7d2cdd2?q=80&w=800&auto=format&fit=crop 2x"
                    loading="lazy"
                    decoding="async"
                    alt="Maestro Lorenzo" 
                    style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(80%) sepia(30%) contrast(1.1); transition: filter 0.5s ease;"
                    onmouseover="this.style.filter='grayscale(0%) sepia(10%) contrast(1.1)'"
                    onmouseout="this.style.filter='grayscale(80%) sepia(30%) contrast(1.1)'"
               />
               <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(10,10,12,0.95), transparent); padding: 1rem;">
                  <span style="display:block; color: var(--c-gold-light); font-family: var(--f-heading); font-size: 1.1rem;">Maestro Lorenzo</span>
                  <span style="display:block; color: var(--c-text-muted); font-size: 0.75rem; text-transform: uppercase;">Incisione a Ruota</span>
               </div>
            </div>

            <!-- Maestro Giacomo -->
            <div class="glass-panel" style="aspect-ratio: 3/5; overflow: hidden; position: relative; border-radius: 8px; transform: translateY(15px);">
               <img src="https://images.unsplash.com/photo-1629853383570-3d3cc9cc9bb5?q=80&w=400&auto=format&fit=crop" 
                    srcset="https://images.unsplash.com/photo-1629853383570-3d3cc9cc9bb5?q=80&w=400&auto=format&fit=crop 1x, https://images.unsplash.com/photo-1629853383570-3d3cc9cc9bb5?q=80&w=800&auto=format&fit=crop 2x"
                    loading="lazy"
                    decoding="async"
                    alt="Maestro Giacomo" 
                    style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(80%) sepia(30%) contrast(1.1); transition: filter 0.5s ease;"
                    onmouseover="this.style.filter='grayscale(0%) sepia(10%) contrast(1.1)'"
                    onmouseout="this.style.filter='grayscale(80%) sepia(30%) contrast(1.1)'"
               />
               <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(10,10,12,0.95), transparent); padding: 1rem;">
                  <span style="display:block; color: var(--c-gold-light); font-family: var(--f-heading); font-size: 1.1rem;">Maestro Giacomo</span>
                  <span style="display:block; color: var(--c-text-muted); font-size: 0.75rem; text-transform: uppercase;">Molatura Fine</span>
               </div>
            </div>

          </div>

          <!-- Decorazione asimmetrica retrostante -->
          <div style="position: absolute; bottom: -40px; left: -40px; width: 120%; height: 120%; background: radial-gradient(circle, rgba(201,168,76,0.18), transparent 60%); z-index: 1;"></div>
        </div>

      </div>

      <!-- 3. Il Processo -->
      <div class="animate-on-scroll" style="margin-top: var(--s-5xl); border-top: 1px solid var(--c-glass-border); padding-top: var(--s-4xl);">
        <h2 style="font-family: var(--f-heading); font-size: 2.5rem; color: var(--c-text-primary); margin-bottom: var(--s-2xl); text-align: center;">Il Processo</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--s-xl);">
          <div class="glass-panel animate-on-scroll" data-delay="0" style="padding: var(--s-2xl); border-top: 2px solid rgba(201, 168, 76, 0.3); background: rgba(10, 10, 12, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div style="font-family: var(--f-heading); font-size: 1.8rem; color: var(--c-gold-light); margin-bottom: var(--s-sm);">01. Fusione</div>
            <p style="color: var(--c-text-secondary); font-size: 0.95rem; line-height: 1.6;">Sabbia di silice pura e minerali vengono portati a 1400°C nei nostri forni per tutta la notte, fino a diventare cristallo fluido e incandescente.</p>
          </div>
          <div class="glass-panel animate-on-scroll" data-delay="150" style="padding: var(--s-2xl); border-top: 2px solid rgba(201, 168, 76, 0.3); background: rgba(10, 10, 12, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div style="font-family: var(--f-heading); font-size: 1.8rem; color: var(--c-gold-light); margin-bottom: var(--s-sm);">02. Soffiatura</div>
            <p style="color: var(--c-text-secondary); font-size: 0.95rem; line-height: 1.6;">Il maestro raccoglie il vetro incandescente sulla canna e vi soffia all'interno il respiro, creando volumi vuoti e scultorei dal perfetto spessore.</p>
          </div>
          <div class="glass-panel animate-on-scroll" data-delay="300" style="padding: var(--s-2xl); border-top: 2px solid rgba(201, 168, 76, 0.3); background: rgba(10, 10, 12, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
            <div style="font-family: var(--f-heading); font-size: 1.8rem; color: var(--c-gold-light); margin-bottom: var(--s-sm);">03. Manifattura</div>
            <p style="color: var(--c-text-secondary); font-size: 0.95rem; line-height: 1.6;">Dopo un lento raffreddamento, il pezzo viene rifinito a freddo. Molatura, incisione e lucidatura a mano per un risultato impeccabile.</p>
          </div>
        </div>
      </div>

    </div>
  </section>
  `;
}
