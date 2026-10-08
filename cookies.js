/*
 * Consentimento de cookies — marcoaureliopsicologo.com.br
 *
 * Este arquivo precisa ser carregado ANTES da tag do Google (gtag.js),
 * sem "async" nem "defer". Ele:
 *  1. começa com todos os cookies do Google bloqueados (modo de consentimento);
 *  2. libera os cookies só depois que o visitante clica em "Aceitar";
 *  3. nunca libera anúncios personalizados / remarketing;
 *  4. lembra a escolha por 12 meses e permite mudar pela página de privacidade.
 */
(function () {
  var CHAVE = 'consentimento_cookies';
  var VALIDADE_MS = 365 * 24 * 60 * 60 * 1000;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // 1. Padrão: tudo negado até o visitante escolher
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);

  function lerEscolha() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      if (!bruto) return null;
      var dado = JSON.parse(bruto);
      if (!dado || !dado.escolha || !dado.data) return null;
      if (Date.now() - dado.data > VALIDADE_MS) return null;
      return dado.escolha;
    } catch (e) {
      return null;
    }
  }

  function salvarEscolha(escolha) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ escolha: escolha, data: Date.now() }));
    } catch (e) { /* navegador sem armazenamento: a escolha vale só nesta visita */ }
  }

  function aplicar(escolha) {
    var ok = escolha === 'aceito' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: ok,
      ad_user_data: ok,
      analytics_storage: ok,
      ad_personalization: 'denied' // remarketing sempre desligado
    });
  }

  var escolhaSalva = lerEscolha();
  if (escolhaSalva) aplicar(escolhaSalva);

  // 2. Aviso na tela
  var CSS = '' +
    '#aviso-cookies{position:fixed;left:0;right:0;bottom:0;z-index:1000;' +
    'background:#1B3A2D;color:#F5F2EC;border-top:1px solid rgba(201,168,76,0.35);' +
    'padding:0.75rem 1.25rem calc(0.75rem + env(safe-area-inset-bottom,0px));' +
    'box-shadow:0 -4px 20px rgba(0,0,0,0.18);font-family:"DM Sans",system-ui,sans-serif;' +
    'font-weight:300;font-size:0.82rem;line-height:1.5;display:flex;align-items:center;' +
    'justify-content:center;gap:1rem;flex-wrap:wrap}' +
    '#aviso-cookies p{margin:0;max-width:640px;flex:1 1 280px}' +
    '#aviso-cookies a{color:#C9A84C}' +
    '#aviso-cookies .botoes{display:flex;gap:0.5rem;flex:0 0 auto}' +
    '#aviso-cookies button{font:inherit;font-weight:500;font-size:0.72rem;letter-spacing:0.08em;' +
    'text-transform:uppercase;padding:0.55rem 1rem;border-radius:2px;cursor:pointer}' +
    '#aviso-cookies .recusar{background:transparent;color:#F5F2EC;border:1px solid rgba(245,242,236,0.4)}' +
    '#aviso-cookies .aceitar{background:#C9A84C;color:#FDFBF7;border:1px solid #C9A84C}' +
    '#aviso-cookies button:focus-visible{outline:2px solid #C9A84C;outline-offset:3px}' +
    '@media (max-width:600px){#aviso-cookies{font-size:0.76rem;gap:0.6rem;padding-top:0.6rem}' +
    '#aviso-cookies .botoes{width:100%}#aviso-cookies .botoes button{flex:1;padding:0.5rem}}';

  function mostrarAviso() {
    if (document.getElementById('aviso-cookies')) return;

    if (!document.getElementById('aviso-cookies-css')) {
      var estilo = document.createElement('style');
      estilo.id = 'aviso-cookies-css';
      estilo.textContent = CSS;
      document.head.appendChild(estilo);
    }

    var caixa = document.createElement('div');
    caixa.id = 'aviso-cookies';
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-live', 'polite');
    caixa.setAttribute('aria-label', 'Aviso de cookies');
    caixa.innerHTML =
      '<p>Usamos cookies do Google para medir visitas e anúncios, sem anúncios personalizados. ' +
      '<a href="/privacidade.html">Saiba mais</a></p>' +
      '<div class="botoes">' +
      '<button type="button" class="recusar">Recusar</button>' +
      '<button type="button" class="aceitar">Aceitar</button>' +
      '</div>';

    caixa.querySelector('.aceitar').addEventListener('click', function () { escolher('aceito'); });
    caixa.querySelector('.recusar').addEventListener('click', function () { escolher('recusado'); });

    document.body.appendChild(caixa);
  }

  function escolher(escolha) {
    salvarEscolha(escolha);
    aplicar(escolha);
    var caixa = document.getElementById('aviso-cookies');
    if (caixa) caixa.remove();
  }

  // Usado pelo botão "Alterar preferências de cookies" da página de privacidade
  window.abrirPreferenciasCookies = function () {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    mostrarAviso();
  };

  if (!escolhaSalva) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mostrarAviso);
    } else {
      mostrarAviso();
    }
  }
})();
