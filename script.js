const listaDeNombres = ["Jefe Magda", "Sandra", "Giovanni", "Miguel", "Lucho", "Milena", "Javier", "Ferney", "Jhonatan", "Evelin", "Edinson", "Camilo", "Iván", "Wilson", "Nelson"];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let iniciado = false;
let mostrarConfeti = false;

// Cargar nombres inmediatamente
const nombresContainer = document.getElementById('lista-nombres');
listaDeNombres.forEach(nom => {
    const div = document.createElement('div');
    div.className = 'name-item';
    div.textContent = nom;
    nombresContainer.appendChild(div);
});

function activarTodo() {
    if (iniciado) return;
    iniciado = true;
    
    document.getElementById('capa-espera').style.display = 'none';
    document.getElementById('crawl').style.display = 'block';
    
    const audio = document.getElementById('musica');
    if (audio) audio.play().catch(() => console.log("Audio en espera..."));
    
    animate(); 
    
    // MENSAJE FINAL RÁPIDO: 18 segundos
    setTimeout(() => {
        const msgFinal = document.getElementById('mensaje-final');
        if(msgFinal) msgFinal.style.display = 'flex';
        mostrarConfeti = true;
    }, 18000); 
}

let particles = [];
function resize() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y, color, type) {
        this.x = x; 
        this.y = y; 
        this.color = color; 
        this.type = type;
        
        // Mejora: Explosiones con más fuerza y variedad
        const force = type === 'firework' ? Math.random() * 12 + 4 : Math.random() * 4 + 2;
        const angle = Math.random() * Math.PI * 2;
        
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        
        this.gravity = type === 'firework' ? 0.12 : 0.05;
        this.friction = 0.96; // Para que las chispas se frenen con elegancia
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        
        // Mejora: Confeti con rotación y oscilación
        this.tilt = Math.random() * 10;
        this.tiltAngleIncremental = Math.random() * 0.1 + 0.05;
        this.tiltAngle = 0;
        
        this.w = type === 'firework' ? 3 : Math.random() * 8 + 6;
        this.h = type === 'firework' ? 3 : Math.random() * 6 + 4;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        
        // Oscilación del confeti
        if (this.type === 'confetti') {
            this.tiltAngle += this.tiltAngleIncremental;
            this.tilt = Math.sin(this.tiltAngle) * 12;
            this.x += Math.sin(this.tiltAngle); // Movimiento zig-zag
        }
        
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        if(this.type === 'firework') {
            // Chispas con brillo (Glow)
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Confeti con rotación 3D simulada
            ctx.translate(this.x + this.tilt, this.y);
            ctx.rotate(this.tiltAngle);
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        }
        ctx.restore();
    }
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.4); // Solo en la parte superior
    const color = `hsl(${Math.random() * 360}, 100%, 65%)`;
    const count = 80; // Más chispas por explosión
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, 'firework'));
    }
}

function createConfetti() {
    // Confeti cae desde arriba en todo el ancho
    const x = Math.random() * canvas.width;
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    particles.push(new Particle(x, -20, color, 'confetti'));
}

function animate() {
    // Estela de movimiento (Motion Blur)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Probabilidad de fuegos (más frecuente al final)
    const fireworkChance = mostrarConfeti ? 0.15 : 0.08;
    if (Math.random() < fireworkChance) createFirework();
    
    // Confeti abundante al final
    if (mostrarConfeti && Math.random() < 0.6) {
        createConfetti();
        createConfetti(); // Doble dosis para que se vea lleno
    }

    // Dibujar y limpiar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}
