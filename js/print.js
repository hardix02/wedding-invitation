/* Fill printable kankotri from config + invite query params */
(function () {
  const QS = new URLSearchParams(location.search);
  const CODE = (window.InviteCode && QS.get('i')) ? window.InviteCode.decode(QS.get('i')) : null;
  const SIDE = CODE ? CODE.side : (/^(bride|kanya)$/i.test(QS.get('side') || '') ? 'bride' : 'groom');
  const W = Object.assign({}, window.WEDDING, SIDE === 'bride' ? (window.WEDDING.bride_side || {}) : {});
  document.documentElement.dataset.side = SIDE;

  const fill = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };
  const show = (id, on) => {
    const el = document.getElementById(id);
    if (el) el.hidden = !on;
  };

  document.getElementById('deities').innerHTML =
    (W.deities || []).map(d => `<span>${d}</span>`).join('');

  (function guestLine() {
    let q = CODE ? CODE.name : (QS.get('to') || '');
    q = q && q.replace(/[_+]/g, ' ').replace(/\s+/g, ' ').trim();
    const name = q || W.guestDefault || '';
    if (!name) { show('guest', false); return; }
    const hasTitle = /^(શ્રી|શ્રીમતી|પૂજ્ય|માનનીય|આદરણીય|ડૉ\.|સૌ\.)/.test(name);
    const prefix = (!hasTitle && W.guestPrefix) ? W.guestPrefix + ' ' : '';
    const allParam = QS.get('all');
    const wantSuffix = CODE ? CODE.all : (allParam === null ? true : allParam !== '0');
    const suffix = (wantSuffix && W.guestSuffix) ? ' ' + W.guestSuffix : '';
    document.getElementById('guest-name').textContent = prefix + name + suffix;
    show('guest', true);
  })();

  const groomFirst = SIDE !== 'bride';
  fill('groom-parents', W.groomParents || '');
  fill('bride-parents', W.brideParents || '');
  document.querySelectorAll('[data-name="groom"]').forEach(e => { e.textContent = W.groom; });
  document.querySelectorAll('[data-name="bride"]').forEach(e => { e.textContent = W.bride; });

  if (!groomFirst) {
    const stack = document.getElementById('name-stack');
    const gBlock = document.getElementById('groom-block');
    const bBlock = document.getElementById('bride-block');
    const amp = document.getElementById('amp-line');
    if (stack && gBlock && bBlock && amp) {
      stack.insertBefore(bBlock, gBlock);
      stack.insertBefore(amp, gBlock);
    }
  }

  fill('date-line', W.dateText || '');
  fill('tithi-line', W.tithi || '');
  fill('muhurat-line', W.muhurat || '');
  document.getElementById('verse').innerHTML =
    (W.verse || []).map(l => `<span>${l}</span>`).join('<br>');
  fill('inviter', W.inviter || '');
  fill('venue-title', W.venueTitle || '\u0ab6\u0ac1\u0aad \u0ab8\u0acd\u0aa5\u0ab3');
  fill('venue-name', (W.venue && W.venue.name) || '');
  fill('venue-addr', (W.venue && W.venue.address) || '');

  const tl = document.getElementById('events');
  (W.events || []).forEach((ev, i) => {
    const d = document.createElement('div');
    d.className = 'ev';
    d.innerHTML =
      `<div class="ev-num">${i + 1}</div>` +
      `<div class="ev-name">${ev.name}</div>` +
      `<div class="ev-when"><b>${ev.date}</b> · ${ev.time}</div>`;
    tl.appendChild(d);
  });

  const wellPage = document.getElementById('wellwishers-page');
  const names = W.darshanabhilashi || [];
  if (SIDE !== 'groom' || !names.length) {
    if (wellPage) wellPage.remove();
  } else {
    const split = (list, leftId, rightId) => {
      const mid = Math.ceil(list.length / 2);
      document.getElementById(leftId).innerHTML = list.slice(0, mid).map(n => `<li>${n}</li>`).join('');
      document.getElementById(rightId).innerHTML = list.slice(mid).map(n => `<li>${n}</li>`).join('');
    };
    split(names, 'darshan-left', 'darshan-right');
    split([...(W.snehadhin || []), ...(W.snehadhinYoung || [])], 'sneha-left', 'sneha-right');
  }

  fill('foot-names', groomFirst ? `${W.groom} \u2014 ${W.bride}` : `${W.bride} \u2014 ${W.groom}`);
  fill('foot-family', SIDE === 'bride' ? (W.brideFamily || '') : (W.groomFamily || ''));
  document.title = `${W.groom} \u2014 ${W.bride} | \u0a95\u0a82\u0a95\u0acb\u0aa4\u0acd\u0ab0\u0ac0 PDF`;

  document.getElementById('print-btn').addEventListener('click', () => window.print());
  if (QS.get('pdf') === '1') {
    requestAnimationFrame(() => setTimeout(() => window.print(), 350));
  }
})();
