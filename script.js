const listaDeNombres = ["Jefe Magda", "Sandra", "Giovanni", "Miguel", "Lucho", "Milena", "Javier", "Ferney", "Jhonatan", "Evelin", "Edinson", "Camilo", "Iván", "Wilson", "Nelson"];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let iniciado = false;
let mostrarConfeti = false;

// Cargar nombres inmediatamente
const nombresContainer = document.getElementById('lista-nombres');
if (nombresContainer) {
    listaDeNombres.forEach(nom => {
        const div = document.createElement('div');
        div.className = 'name-item';
        div.textContent = nom;
        nombresContainer.appendChild(div);
    });
}

function activarTodo() {
    if (iniciado) return;
    iniciado = true;
    
    const capaEspera = document.getElementById('capa-espera');
    const crawl = document.getElementById('crawl');
    if(capaEspera) capaEspera.style.display = 'none';
    if(crawl) crawl.style.display = 'block';
    
    // --- MEJORA DE AUDIO PARA GITHUB ---
    const audio = document.getElementById('musica');
    if (audio) {
        audio.currentTime = 0; // Asegura que empiece desde el inicio
        audio.play().then(() => {
            console.log("Audio iniciado");
        }).catch(err => {
            console.log("Reintentando audio tras interacción...");
            // Si falla, intentamos una vez más al mover el mouse o tocar
            document.addEventListener('touchstart', () => audio.play(), {once:true});
        });
    }
    
    animate(); 
    
    // Aparece el mensaje final a los 18 segundos
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
        
        const force = type === 'firework' ? Math.random() * 12 + 5 : Math.random() * 4 + 2;
        const angle = Math.random() * Math.PI * 2;
        
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        
        this.gravity = type === 'firework' ? 0.15 : 0.06;
        this.friction = 0.96;
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.008; // Desvanecimiento más suave
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.2 - 0.1;
        
        // Tamaño para estrellas
        this.size = type === 'firework' ? 2 : Math.random() * 10 + 10;
    }

    // Método para dibujar una estrella
    drawStar(ctx, x, y, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let cx = x;
        let cy = y;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            cx = x + Math.cos(rot) * outerRadius;
            cy = y + Math.sin(rot) * outerRadius;
            ctx.lineTo(cx, cy);
            rot += step;

            cx = x + Math.cos(rot) * innerRadius;
            cy = y + Math.sin(rot) * innerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
        }
        ctx.lineTo(x, y - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        if(this.type === 'firework') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Dibujar Confeti en forma de ESTRELLAS
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2.5);
        }
        ctx.restore();
    }
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.4); 
    const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
    for (let i = 0; i < 90; i++) {
        particles.push(new Particle(x, y, color, 'firework'));
    }
}

function createConfettiStar() {
    const x = Math.random() * canvas.width;
    const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    particles.push(new Particle(x, -50, color, 'confetti'));
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fireworkChance = mostrarConfeti ? 0.15 : 0.05;
    if (Math.random() < fireworkChance) createFirework();
    
    if (mostrarConfeti && Math.random() < 0.4) {
        createConfettiStar();
        createConfettiStar();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
    
    if (particles.length > 700) particles.shift();

    requestAnimationFrame(animate);
}

window.onload = resize;
