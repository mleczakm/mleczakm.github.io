'use strict';
(() => {
  // Mobile menu
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  const closeMenu = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // Cost calculator: 2% commission on paid sales, no subscription or payment-provider fees
  const COMMISSION = 0.02;
  const salesInput = document.querySelector('#monthly-sales');
  const feeOutput = document.querySelector('#calc-fee');
  const netOutput = document.querySelector('#calc-net');
  const money = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });
  function calculate() {
    if (!salesInput.validity.valid || salesInput.value === '') {
      feeOutput.textContent = '—';
      netOutput.textContent = '—';
      return;
    }
    const sales = salesInput.valueAsNumber;
    const fee = Math.round(sales * COMMISSION * 100) / 100;
    feeOutput.textContent = money.format(fee);
    netOutput.textContent = money.format(sales - fee);
  }
  salesInput.addEventListener('input', calculate);
  calculate();

  // Call scheduler: next working days, one-hour slots 7:00-20:00
  const WORK_START_HOUR = 7;
  const WORK_END_HOUR = 20;
  const DAYS_TO_CHECK = 7;
  const daysRow = document.querySelector('#daysRow');
  const slotsGrid = document.querySelector('#slotsGrid');
  const monthLabel = document.querySelector('#month-label');
  const selectionOutput = document.querySelector('#selectionOutput');
  const datetimeInput = document.querySelector('#form-datetime');
  const scheduler = document.querySelector('.scheduler');
  let selectedDate = null;
  let selectedHour = null;

  const pad = n => String(n).padStart(2, '0');
  const localISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function workingDays() {
    const days = [];
    for (let i = 0; i < DAYS_TO_CHECK; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) days.push(date);
    }
    return days;
  }

  function updateOutput() {
    if (selectedDate && selectedHour !== null) {
      selectionOutput.replaceChildren('Wybrany termin: ');
      const date = document.createElement('strong'); date.textContent = selectedDate;
      const time = document.createElement('strong'); time.textContent = `${pad(selectedHour)}:00–${pad(selectedHour + 1)}:00`;
      selectionOutput.append(date, ' w godz. ', time);
      datetimeInput.value = `${selectedDate} ${pad(selectedHour)}:00`;
      scheduler.classList.remove('invalid');
    } else {
      selectionOutput.textContent = 'Wybierz datę i godzinę';
      datetimeInput.value = '';
    }
  }

  function renderSlots() {
    slotsGrid.replaceChildren();
    for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot-btn';
      button.textContent = `${pad(hour)}:00 – ${pad(hour + 1)}:00`;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        slotsGrid.querySelectorAll('.slot-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        selectedHour = hour;
        updateOutput();
      });
      slotsGrid.append(button);
    }
  }

  function renderDays() {
    const days = workingDays();
    daysRow.replaceChildren();
    selectedDate = null;
    selectedHour = null;
    if (days.length) monthLabel.textContent = days[0].toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    days.forEach((date, index) => {
      const iso = localISO(date);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'day-btn' + (index === 0 ? ' active' : '');
      button.setAttribute('aria-pressed', String(index === 0));
      const name = document.createElement('span'); name.className = 'day-name'; name.textContent = date.toLocaleDateString('pl-PL', { weekday: 'short' });
      const num = document.createElement('span'); num.className = 'day-date'; num.textContent = date.getDate();
      button.append(name, num);
      if (index === 0) selectedDate = iso;
      button.addEventListener('click', () => {
        daysRow.querySelectorAll('.day-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        selectedDate = iso;
        selectedHour = null;
        renderSlots();
        updateOutput();
      });
      daysRow.append(button);
    });
    renderSlots();
    updateOutput();
  }
  renderDays();

  // Contact form (Formspree, with native POST fallback without JavaScript)
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[0-9\s\-.()]{9,}$/;

  function setStatus(text, kind) {
    status.className = kind || '';
    status.textContent = text;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.elements._gotcha.value) return;
    const button = form.querySelector('[type=submit]');
    if (button.disabled) return;

    let valid = true;
    form.querySelectorAll('[required]:not([type=hidden])').forEach(field => {
      const bad = !field.value.trim()
        || (field.type === 'email' && !emailRegex.test(field.value.trim()))
        || (field.type === 'tel' && !phoneRegex.test(field.value.trim()));
      field.classList.toggle('invalid', bad);
      if (bad) valid = false;
    });
    if (!datetimeInput.value) { scheduler.classList.add('invalid'); valid = false; }
    if (!valid) {
      setStatus('Uzupełnij wszystkie wymagane pola w poprawnym formacie, w tym termin rozmowy.', 'error');
      return;
    }

    button.disabled = true;
    setStatus('Wysyłanie wiadomości…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      renderDays();
      setStatus('Dziękuję! Prośba o konsultację została wysłana. Potwierdzę termin w odpowiedzi.', 'success');
    } catch {
      setStatus('Nie udało się potwierdzić wysłania. Dane pozostały w formularzu. Spróbuj ponownie lub napisz na do@mleczki.pl.', 'error');
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
  form.addEventListener('input', event => event.target.classList.remove('invalid'));
})();
