/**
 * TipsterCard.js
 * Renderiza una Tipster Card dinámica y genera imagen para Telegram
 * 
 * Funciones:
 * - renderTipsterCard(data, containerId) - Renderiza la card en un contenedor
 * - generateImage(cardId) - Genera imagen base64 de la card usando html2canvas
 */

// Template HTML de la Tipster Card
const TIPSTER_CARD_TEMPLATE = `
<div class="tipster-card" id="{card_id}">

  <div class="card-glow"></div>

  <div class="header">
    <div class="logo">TS</div>
    <div>
      <div class="platform">{platform_name}</div>
      <div class="subtitle">{platform_subtitle}</div>
    </div>
  </div>

  <div class="title">{titulo}</div>

  <div class="match-box">
    <div class="sport">⚽ {deporte}</div>

    <div class="teams">
      <div class="team">
        <img src="{flag_local}" crossorigin="anonymous">
        <span>{equipo_local}</span>
      </div>

      <div class="vs">vs</div>

      <div class="team">
        <img src="{flag_visitante}" crossorigin="anonymous">
        <span>{equipo_visitante}</span>
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
    <span>✔ {tag_1}</span>
    <span>🕒 {tag_2}</span>
    <span>🔒 {tag_3}</span>
    <span>📊 {tag_4}</span>
  </div>

  <div class="id">ID: {pick_id}</div>

</div>
`;

// Contador para IDs únicos de cards
let tipsterCardCounter = 0;

/**
 * Renderiza una Tipster Card en el contenedor especificado
 * @param {Object} data - Datos del pick
 * @param {string} containerId - ID del contenedor donde insertar la card
 * @returns {string} - ID de la card generada
 */
function renderTipsterCard(data, containerId = 'app') {
  // Generar ID único para esta card
  tipsterCardCounter++;
  const cardId = `tipster-card-${tipsterCardCounter}`;
  
  // Valores por defecto
  const defaults = {
    platform_name: 'TrueStats',
    platform_subtitle: 'Picks Auditados',
    titulo: 'ANÁLISIS',
    deporte: 'FÚTBOL',
    equipo_local: 'Equipo Local',
    equipo_visitante: 'Equipo Visitante',
    flag_local: '',
    flag_visitante: '',
    competicion: 'Competición',
    fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    tipo_pick: 'Tipo de apuesta',
    pick: 'Selección',
    cuota: '1.00',
    stake: '1',
    comentario: 'Sin comentario',
    tag_1: 'Tipster verificado',
    tag_2: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    tag_3: 'Inmutable',
    tag_4: 'Auditado',
    pick_id: `TS-${Date.now()}`
  };
  
  // Combinar datos con defaults
  const cardData = { ...defaults, ...data, card_id: cardId };
  
  // Reemplazar todas las variables en el template
  let html = TIPSTER_CARD_TEMPLATE;
  
  for (const [key, value] of Object.entries(cardData)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    html = html.replace(regex, value || '');
  }
  
  // Obtener el contenedor
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }
  
  // Insertar la card (sin romper el contenido existente)
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const cardElement = wrapper.firstChild;
  container.appendChild(cardElement);
  
  console.log(`✅ Tipster Card rendered: #${cardId}`);
  
  return cardId;
}

/**
 * Genera una imagen base64 de la Tipster Card usando html2canvas
 * @param {string} cardId - ID de la card a convertir en imagen
 * @returns {Promise<string>} - Imagen en formato base64
 */
async function generateImage(cardId = 'tipster-card-1') {
  const cardElement = document.getElementById(cardId);
  
  if (!cardElement) {
    console.error(`Card #${cardId} not found`);
    return null;
  }
  
  // Verificar que html2canvas está disponible
  if (typeof html2canvas === 'undefined') {
    console.error('html2canvas library not loaded. Add: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>');
    return null;
  }
  
  try {
    console.log(`📸 Generating image for #${cardId}...`);
    
    const canvas = await html2canvas(cardElement, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#0a0f0c',
      scale: 2, // Alta resolución
      logging: false,
      onclone: (clonedDoc) => {
        // Asegurar que los estilos se aplican correctamente en el clon
        const clonedCard = clonedDoc.getElementById(cardId);
        if (clonedCard) {
          clonedCard.style.position = 'relative';
          clonedCard.style.transform = 'none';
        }
      }
    });
    
    // Convertir a base64
    const base64 = canvas.toDataURL('image/png');
    
    console.log(`✅ Image generated: ${Math.round(base64.length / 1024)}KB`);
    
    return base64;
    
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

/**
 * Genera imagen y la envía a Telegram
 * @param {string} cardId - ID de la card
 * @param {string} proxyUrl - URL del proxy (Render)
 * @returns {Promise<boolean>} - true si se envió correctamente
 */
async function generateAndSendToTelegram(cardId, proxyUrl = 'https://truestats-proxy.onrender.com') {
  const base64 = await generateImage(cardId);
  
  if (!base64) {
    console.error('Failed to generate image');
    return false;
  }
  
  try {
    console.log('📤 Sending to Telegram...');
    
    const response = await fetch(`${proxyUrl}/telegram-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Sent to Telegram:', result);
    
    return true;
    
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

/**
 * Elimina una Tipster Card del DOM
 * @param {string} cardId - ID de la card a eliminar
 */
function removeTipsterCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.remove();
    console.log(`🗑️ Card removed: #${cardId}`);
  }
}

/**
 * Limpia todas las Tipster Cards de un contenedor
 * @param {string} containerId - ID del contenedor
 */
function clearTipsterCards(containerId = 'app') {
  const container = document.getElementById(containerId);
  if (container) {
    const cards = container.querySelectorAll('.tipster-card');
    cards.forEach(card => card.remove());
    console.log(`🧹 Cleared ${cards.length} cards from #${containerId}`);
  }
}

// Exportar funciones (compatible con módulos y script tradicional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderTipsterCard,
    generateImage,
    generateAndSendToTelegram,
    removeTipsterCard,
    clearTipsterCards
  };
}
