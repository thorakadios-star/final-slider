/**
 * TipsterCard.js - MODIFICADO CON SOPORTE PARA ELEMENTOS DIRECTOS Y FALLBACK
 */

const TIPSTER_CARD_TEMPLATE = `
<div class="tipster-card" id="{card_id}">
  <div class="card-glow"></div>

  <div class="header">
    <div class="logo">{logo_text}</div>
    <div>
      <div class="platform">{platform_name}</div>
      <div class="subtitle">{platform_subtitle}</div>
    </div>
  </div>

  <div class="title">{titulo}</div>

  <div class="match-box">
    <div class="sport"><i class="{sport_icon}"></i> {deporte}</div>

    <div class="teams">
      <div class="team">
        <img src="{flag_local}" onerror="this.src='img/default-team.png'" crossorigin="anonymous">
        <span>{equipo_local}</span>
      </div>

      <div class="vs">vs</div>

      <div class="team">
        <span>{equipo_visitante}</span>
        <img src="{flag_visitante}" onerror="this.src='img/default-team.png'" crossorigin="anonymous">
      </div>
    </div>

    <div class="meta">
      <div>{competicion}</div>
      <div>{fecha}</div>
    </div>
  </div>

  <div class="pick-box">
    <div>
      <div class="label">PRONÓSTICO</div>
      <div class="pick-type">{tipo_pick}</div>
      <div class="pick">{pick}</div>
    </div>

    <div class="odds">{cuota}</div>
  </div>

  <div class="stake-box">
    <div>
      <div class="label">STAKE</div>
      <div class="value">{stake}</div>
    </div>

    <div>
      <div class="label">CUOTA</div>
      <div class="value">{cuota}</div>
    </div>
  </div>

  <div class="analysis">
    <div class="section-title">COMENTARIO TÉCNICO</div>
    <p>{comentario}</p>
  </div>

  <div class="badges">
    <span><i class="fa-solid fa-circle-check"></i> {tag_1}</span>
    <span><i class="fa-solid fa-clock"></i> {tag_2}</span>
    <span><i class="fa-solid fa-lock"></i> {tag_3}</span>
    <span><i class="fa-solid fa-chart-line"></i> {tag_4}</span>
  </div>

  <div class="id">ID: {pick_id}</div>
</div>
`;

let tipsterCardCounter = 0;

/**
 * Renderiza una Tipster Card
function renderTipsterCard(data, containerId = 'app') {
  tipsterCardCounter++;
  const cardId = `tipster-card-${tipsterCardCounter}`;
  
  // ESTA ES LA CORRECCIÓN CLAVE:
  let container;
  if (typeof containerId === 'string') {
    container = document.getElementById(containerId);
  } else {
    container = containerId; // Si ya es un elemento HTML, lo usamos directamente
  }
  
  if (!container) {
    // Si llegamos aquí y no hay contenedor, mostramos error limpio
    console.error(`Error: El contenedor especificado no existe en el DOM.`);
    return null;
  }
  
  const defaults = {
    logo_text: 'TS',
    platform_name: 'TrueStats',
    platform_subtitle: 'Picks Auditados',
    titulo: 'ANÁLISIS',
    deporte: 'FÚTBOL',
    sport_icon: 'fa-solid fa-futbol',
    equipo_local: 'Equipo Local',
    equipo_visitante: 'Equipo Visitante',
    flag_local: 'img/default-team.png',
    flag_visitante: 'img/default-team.png',
    competicion: 'Competición',
    fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    tipo_pick: 'Tipo de apuesta',
    pick: 'Selección',
    cuota: '1.00',
    stake: '1/10',
    comentario: 'Sin comentario adicional',
    tag_1: 'Tipster verificado',
    tag_2: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    tag_3: 'Inmutable',
    tag_4: 'Auditado',
    pick_id: `TS-${Date.now()}`
  };
  
  const cardData = { ...defaults, ...data, card_id: cardId };
  
  let html = TIPSTER_CARD_TEMPLATE;
  for (const [key, value] of Object.entries(cardData)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    html = html.replace(regex, value || '');
  }
  
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const cardElement = wrapper.firstChild;
  
  // Inyectamos la carta en el contenedor (ya sea el track del slider o un div normal)
  container.appendChild(cardElement);
  
  return cardId;
}

/**
 * Genera imagen base64
 */
async function generateImage(cardId) {
  const cardElement = document.getElementById(cardId);
  if (!cardElement || typeof html2canvas === 'undefined') return null;
  
  try {
    const canvas = await html2canvas(cardElement, {
      useCORS: true,
      backgroundColor: '#0a0f0c',
      scale: 2
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

/**
 * Envío a Telegram
 */
async function generateAndSendToTelegram(cardId, proxyUrl = 'https://truestats-proxy-production.up.railway.app') {
  const base64 = await generateImage(cardId);
  if (!base64) return false;
  
  try {
    const response = await fetch(`${proxyUrl}/telegram-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// LÓGICA DE INYECCIÓN AUTOMÁTICA EN EL SLIDER
document.addEventListener('DOMContentLoaded', () => {
    // Apuntamos al ID real que vimos en tu consola
    const sliderTrack = document.getElementById('track-1');

    if (sliderTrack) {
        // Función interna para crear la estructura de slide necesaria
        const addToSlider = (datos) => {
            const slideWrap = document.createElement('div');
            slideWrap.className = 'slide'; // Clase necesaria para tu CSS de carrusel
            sliderTrack.appendChild(slideWrap);
            renderTipsterCard(datos, slideWrap);
        };

        // SpiderTips
        addToSlider({
            logo_text: 'ST',
            platform_name: 'SpiderTips',
            platform_subtitle: 'Córners Expert',
            flag_local: 'spidertips.JPG',
            deporte: 'FÚTBOL',
            sport_icon: 'fa-solid fa-futbol',
            pick: 'Más de 8.5 Córners',
            cuota: '1.83'
        });

        // TipsAcademy
        addToSlider({
            logo_text: 'TA',
            platform_name: 'TipsAcademy',
            platform_subtitle: 'Especialista Basket',
            flag_local: 'tipsacedemy.JPG',
            deporte: 'BALONCESTO',
            sport_icon: 'fa-solid fa-basketball',
            pick: 'Lakers -5',
            cuota: '1.90'
        });

        console.log("✅ Tipsters inyectados en #track-1");
    }
});

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderTipsterCard, generateImage, generateAndSendToTelegram };
}
