// API URL - Detecta automáticamente local vs producción
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : (window.location.hostname === 'vercel.app' 
    ? 'http://localhost:3001'  // Cambiar esto cuando tengas backend online
    : 'http://localhost:3001');

// Toast notifications
const showToast = (msg, type='info', duration=3000)=>{
  let container = document.getElementById('toast-container');
  if(!container){ container = document.createElement('div'); container.id = 'toast-container'; container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;'; document.body.appendChild(container); }
  const toast = document.createElement('div');
  const colors = {success:'#10b981',error:'#ef4444',info:'#3b82f6',warning:'#f59e0b'};
  toast.style.cssText = `background:${colors[type]||'#3b82f6'};color:white;padding:1rem;border-radius:6px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-weight:500;animation:slideIn 0.3s ease-out;`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(()=>{toast.style.animation='slideOut 0.3s ease-out';setTimeout(()=>toast.remove(),300)},duration);
};

// CSS animations
const style = document.createElement('style');
style.textContent = `@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{to{transform:translateX(400px);opacity:0}}`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function(){
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('main-nav');
  navToggle && navToggle.addEventListener('click', ()=>{
    if(mainNav.style.display === 'block') mainNav.style.display = '';
    else mainNav.style.display = 'block';
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});
        if(window.innerWidth <= 700) mainNav.style.display = '';
      }
    })
  })

  // Email validator
  const isValidEmail = (email)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Contact form - integrado con API
  const form = document.getElementById('contact-form');
  form && form.addEventListener('submit', async function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validaciones mejoradas
    if(!name || !email || !message){ showToast('Por favor completa todos los campos', 'warning'); return; }
    if(!isValidEmail(email)){ showToast('Email inválido. Por favor verifica', 'warning'); return; }
    if(message.length < 10){ showToast('El mensaje debe tener al menos 10 caracteres', 'warning'); return; }
    
    // Enviar a API
    try{
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      
      const res = await fetch(`${API_URL}/api/contactos`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({nombre:name, email, mensaje:message})
      });
      
      if(res.ok){
        showToast('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
        form.reset();
      } else {
        showToast('Error al enviar. Intenta de nuevo.', 'error');
      }
    } catch(err){
      showToast('Error de conexión. Intenta con el correo de contacto.', 'error');
    } finally{
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = false;
      btn.textContent = 'Enviar Mensaje';
    }
  });

  // IntersectionObserver for reveal animations
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  },{threshold:0.15});
  document.querySelectorAll('.fade-in, .stat, .service-card, .testi').forEach(el=>observer.observe(el));

  // Animated counters
  const counters = document.querySelectorAll('.stat-number');
  const runCounter = el=>{
    const target = +el.getAttribute('data-target');
    let current = 0; const step = Math.max(1, Math.floor(target/80));
    const tick = ()=>{
      current += step; if(current >= target){ el.textContent = target + (el.dataset.suffix||''); }
      else{ el.textContent = current + (el.dataset.suffix||''); requestAnimationFrame(tick); }
    };
    tick();
  };
  // Start counters when stats section visible
  const statsSection = document.querySelector('.stats-section');
  if(statsSection){
    const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ counters.forEach(runCounter); io.unobserve(statsSection); } }) },{threshold:0.2});
    io.observe(statsSection);
  }

  // Testimonial simple carousel (auto-rotate)
  const testiWrap = document.getElementById('testimonials');
  if(testiWrap){
    let idx = 0; const items = testiWrap.querySelectorAll('.testi');
    const rotate = ()=>{ idx = (idx+1)%items.length; testiWrap.style.transform = `translateX(-${idx*100}%)`; };
    let rot = setInterval(rotate,4500);
    testiWrap.addEventListener('mouseenter', ()=>clearInterval(rot));
    testiWrap.addEventListener('mouseleave', ()=>rot = setInterval(rotate,4500));
  }

});