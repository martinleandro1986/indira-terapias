(() => {
  'use strict';

  const config = window.INDIRA_CMS || {};
  const TYPE_MAP = {
    therapies: 'therapies',
    trainings: 'trainings',
    events: 'events',
    circles: 'events'
  };

  const normalize = (value = '') => String(value).trim();
  const lower = (value = '') => normalize(value).toLocaleLowerCase('es');
  const isActive = (value) => ['si', 'sí', 'true', '1', 'activo', 'yes'].includes(lower(value));
  const byOrder = (a, b) => Number(a.orden || 9999) - Number(b.orden || 9999);

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const safeHttpUrl = (value = '') => {
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  const safeInternalOrHttpUrl = (value = '') => {
    const raw = normalize(value);
    if (!raw) return '';
    if (/^(https?:)?\/\//i.test(raw)) return safeHttpUrl(raw);
    if (/^[a-z0-9._/-]+(?:#[a-z0-9_-]+)?$/i.test(raw)) return raw;
    return '';
  };

  const formatDate = (value = '') => {
    const raw = normalize(value);
    if (!raw) return '';
    const parsed = new Date(raw.includes('T') ? raw : `${raw}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return raw;
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed);
  };

  const meta = (...values) => values
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join('');

  const actionLink = (item) => {
    const url = safeInternalOrHttpUrl(item.inscripcion_url || item.boton_url || '');
    const label = normalize(item.boton_texto || 'Más información');
    if (!url) return '';
    const external = /^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : '';
    return `<a class="dynamic-card-link" href="${escapeHtml(url)}"${external}>${escapeHtml(label)} <i class="bi bi-arrow-up-right"></i></a>`;
  };

  const mapMarkup = (item) => {
    const mapUrl = safeHttpUrl(item.map_url || '');
    const embedUrl = safeHttpUrl(item.map_embed_url || '');
    const address = normalize(item.direccion || item.ubicacion || '');
    if (!mapUrl && !embedUrl && !address) return '';

    return `
      <div class="dynamic-map-block">
        ${address ? `<p class="dynamic-location"><i class="bi bi-geo-alt"></i>${escapeHtml(address)}</p>` : ''}
        ${embedUrl ? `<div class="dynamic-map"><iframe src="${escapeHtml(embedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa de ubicación"></iframe></div>` : ''}
        ${mapUrl ? `<a class="dynamic-map-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener"><i class="bi bi-map"></i> Cómo llegar</a>` : ''}
      </div>`;
  };

  const renderTherapy = (item) => `
    <article class="dynamic-card dynamic-card--therapy reveal is-visible">
      <p class="dynamic-eyebrow">${escapeHtml(item.categoria || 'Terapia')}</p>
      <h3>${escapeHtml(item.nombre)}</h3>
      ${item.resumen ? `<p>${escapeHtml(item.resumen)}</p>` : ''}
      <div class="dynamic-meta">${meta(item.modalidad, item.duracion, item.precio)}</div>
      ${actionLink(item)}
    </article>`;

  const renderTraining = (item) => `
    <article class="dynamic-card dynamic-card--training reveal is-visible">
      <p class="dynamic-eyebrow">${escapeHtml(item.nivel || item.tipo || 'Formación')}</p>
      <h3>${escapeHtml(item.nombre)}</h3>
      ${item.descripcion ? `<p>${escapeHtml(item.descripcion)}</p>` : ''}
      <div class="dynamic-meta">${meta(formatDate(item.fecha), item.hora, item.modalidad, item.cupos ? `Cupos: ${item.cupos}` : '', item.precio)}</div>
      ${actionLink({...item, boton_texto: item.boton_texto || 'Consultar formación'})}
    </article>`;

  const renderEvent = (item) => `
    <article class="dynamic-card dynamic-card--event reveal is-visible">
      <p class="dynamic-eyebrow">${escapeHtml(item.tipo || 'Encuentro')}</p>
      <h3>${escapeHtml(item.nombre)}</h3>
      ${item.descripcion ? `<p>${escapeHtml(item.descripcion)}</p>` : ''}
      <div class="dynamic-meta">${meta(formatDate(item.fecha), item.hora, item.modalidad, item.cupos ? `Cupos: ${item.cupos}` : '', item.precio)}</div>
      ${mapMarkup(item)}
      ${actionLink({...item, boton_texto: item.boton_texto || 'Consultar / inscribirme'})}
    </article>`;

  const renderers = { therapies: renderTherapy, trainings: renderTraining, events: renderEvent, circles: renderEvent };

  const filterForGrid = (items, type) => {
    const active = (items || []).filter((item) => isActive(item.activo)).sort(byOrder);
    if (type === 'circles') {
      return active.filter((item) => /círculo|circulo/i.test(normalize(item.tipo)));
    }
    if (type === 'events') {
      return active.filter((item) => !/círculo|circulo/i.test(normalize(item.tipo)) || lower(item.mostrar_en_eventos) === 'si');
    }
    return active;
  };

  const setSectionVisibility = (grid, hasItems) => {
    const section = grid.closest('.page-section, .home-dynamic-section');
    if (!section) return;
    section.hidden = !hasItems;
  };

  const renderAll = (data) => {
    document.querySelectorAll('.dynamic-grid[data-content-type]').forEach((grid) => {
      const type = grid.dataset.contentType;
      const sourceKey = TYPE_MAP[type];
      const items = filterForGrid(data[sourceKey], type);
      const renderer = renderers[type];
      grid.innerHTML = renderer ? items.map(renderer).join('') : '';
      setSectionVisibility(grid, items.length > 0);
    });
  };

  const fetchJson = async (url) => {
    if (!url) throw new Error('Fuente no configurada');
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    return response.json();
  };

  const loadContent = async () => {
    try {
      if (config.endpoint) {
        const remote = await fetchJson(config.endpoint);
        renderAll(remote);
        return;
      }
      throw new Error('CMS todavía no conectado');
    } catch (remoteError) {
      try {
        const fallback = await fetchJson(config.fallbackUrl || './data/content.json');
        renderAll(fallback);
      } catch (fallbackError) {
        console.warn('Indira CMS: no se pudo cargar contenido dinámico.', remoteError, fallbackError);
        renderAll({ therapies: [], trainings: [], events: [] });
      }
    }
  };

  const setupWhatsApp = () => {
    const number = normalize(config.whatsapp).replace(/\D/g, '');
    document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
      if (!number) {
        link.setAttribute('href', 'https://instagram.com/indira.terapias');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
        return;
      }
      const message = encodeURIComponent(link.dataset.whatsappMessage || 'Hola Alejandra, quisiera recibir información sobre Indira Terapias.');
      link.setAttribute('href', `https://wa.me/${number}?text=${message}`);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupWhatsApp();
    loadContent();
  });
})();
