const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 100;
const connectionDistance = 150;
const mouseConnectionDistance = 200;
const particleSpeed = 0.5;

let mouse = {
    x: null,
    y: null,
    radius: 200
};

// Colors
const colors = ['#00f0ff', '#7000ff', '#00ff88'];

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * particleSpeed;
        this.vy = (Math.random() - 0.5) * particleSpeed;
        this.radius = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseX = this.x;
        this.baseY = this.y;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction (gravity/repulsion)
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Gentle push away from mouse
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                
                this.x -= forceDirectionX * force * 2;
                this.y -= forceDirectionY * force * 2;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    
    // Adjust particle count based on screen size
    const count = Math.floor((width * height) / 15000);
    const finalCount = Math.min(count, 150); // Cap it for performance

    for (let i = 0; i < finalCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Clear canvas with a slightly transparent black to create trail effect
    ctx.fillStyle = 'rgba(3, 3, 5, 1)';
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance/connectionDistance * 0.1})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        // Connect to mouse
        if (mouse.x != null) {
            let dx = particles[i].x - mouse.x;
            let dy = particles[i].y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseConnectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `${particles[i].color}${Math.floor((1 - distance/mouseConnectionDistance) * 255).toString(16).padStart(2, '0')}`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

// Event Listeners
window.addEventListener('resize', () => {
    init();
});

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Start
init();
animate();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Interactive Glossy 3D effect for update-visual
const updateVisual = document.querySelector('.update-visual');
const updateImg = updateVisual ? updateVisual.querySelector('img') : null;
const updateShine = updateVisual ? updateVisual.querySelector('.shine') : null;

if (updateVisual && updateImg && updateShine) {
    updateVisual.addEventListener('mousemove', (e) => {
        const rect = updateVisual.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        // Calculate percentages relative to center
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = x - xc;
        const dy = y - yc;
        
        // Rotate values (max 10 degrees tilt to prevent excessive distortion)
        const tiltX = -(dy / yc) * 10;
        const tiltY = (dx / xc) * 10;
        
        // Apply 3D rotation to the image
        updateImg.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
        updateImg.style.boxShadow = `${-tiltY * 2}px ${tiltX * 2}px 35px rgba(0, 240, 255, 0.25)`;
        
        // Move the shine overlay reflection (glassy diagonal sweep)
        const shineX = ((x / rect.width) - 0.5) * 60; // range from -30% to 30%
        const shineY = ((y / rect.height) - 0.5) * 60; // range from -30% to 30%
        updateVisual.style.setProperty('--shine-x', `${shineX}%`);
        updateVisual.style.setProperty('--shine-y', `${shineY}%`);
    });
    
    updateVisual.addEventListener('mouseleave', () => {
        // Reset transformation when mouse leaves
        updateImg.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        updateImg.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.4)';
        // Reset shine position variables
        updateVisual.style.setProperty('--shine-x', '0%');
        updateVisual.style.setProperty('--shine-y', '0%');
    });
}
