'use strict';
(() => {
  const en = document.documentElement.lang === 'en';
  const t = (pl, english) => en ? english : pl;
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
  document.querySelector('.language-link').addEventListener('click', event => {
    const target = new URL(event.currentTarget.href);
    target.hash = location.hash;
    event.currentTarget.href = target.href;
  });
  // Preserve bookmarks to the old pipeline section.
  if (location.hash === '#pipeline') location.replace('#ai');

  const scenarios = {
    sales: {
      prompt: t('Znajdź warsztaty dla 4-latka w sobotę.', 'Find a Saturday workshop for a 4-year-old.'),
      reply: t('Sprawdzę ofertę i wolne miejsca. Przed zapisaniem poproszę Cię o potwierdzenie.', 'I’ll check the catalog and availability, then ask you to confirm before booking.'),
      steps: [
        [t('Sprawdzenie oferty', 'Check the catalog'), 'MCP · search_workshops'],
        [t('Dopasowanie terminu', 'Match availability'), t('Wiek · termin · wolne miejsca', 'Age · date · available places')],
        [t('Potwierdzenie przez człowieka', 'Human confirmation'), t('Ty podejmujesz decyzję', 'You make the decision')]
      ],
      result: t('Przykład zakończony: propozycja zajęć czeka na Twoją decyzję. Nie utworzono rezerwacji.', 'Example complete: a workshop suggestion awaits your decision. No booking was created.')
    },
    operations: {
      prompt: t('Które zadania czekają na moją decyzję?', 'Which tasks are waiting for my decision?'),
      reply: t('Sprawdzę zadania dostępne na Twoim koncie i przygotuję listę do przejrzenia.', 'I’ll check the tasks your account can access and prepare a list for review.'),
      steps: [
        [t('Sprawdzenie uprawnień', 'Check permissions'), t('Zakres dostępu Twojego konta', 'Your account’s access scope')],
        [t('Wyszukanie zadań', 'Find tasks'), t('MCP · status i osoba akceptująca', 'MCP · status and approver')],
        [t('Lista do przejrzenia', 'A list for review'), t('Priorytet · termin · kontekst', 'Priority · due date · context')]
      ],
      result: t('Przykład zakończony: podsumowanie gotowe do przejrzenia. Żadne zadanie nie zostało zmienione.', 'Example complete: a summary is ready for review. No tasks were changed.')
    },
    engineering: {
      prompt: t('Pomóż przygotować zmianę do wdrożenia.', 'Help prepare a change for deployment.'),
      reply: t('Uporządkuję kontekst zmiany, uruchomię przewidziane kontrole i przygotuję materiał do przeglądu.', 'I’ll organize the change context, run the planned checks and prepare it for review.'),
      steps: [
        [t('Kontekst i zakres', 'Context and scope'), t('Wymagania · kod · dokumentacja', 'Requirements · code · documentation')],
        [t('Automatyczne kontrole', 'Automated checks'), t('Testy · analiza statyczna', 'Tests · static analysis')],
        [t('Przegląd przez zespół', 'Team review'), t('Decyzja o wdrożeniu po weryfikacji', 'Deployment decision after review')]
      ],
      result: t('Przykład zakończony: zmiana czeka na przegląd zespołu. Nie uruchomiono prawdziwego wdrożenia.', 'Example complete: the change awaits team review. No real deployment was started.')
    }
  };
  let scenario = 'sales';
  let runId = 0;
  const runButton = document.querySelector('#demo-run');
  const demoStatus = document.querySelector('#demo-status');
  const list = document.querySelector('#workflow-steps');
  const runText = t('Uruchom przykład', 'Run the example');
  const disclaimer = t('Interaktywna ilustracja. Nie wykonuje operacji w prawdziwym systemie.', 'Interactive illustration. No actions are taken in a real system.');
  function setScenario(key) {
    runId++;
    scenario = key;
    runButton.disabled = false;
    runButton.lastElementChild.textContent = runText;
    document.querySelectorAll('[data-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenario === key)));
    document.querySelector('#demo-prompt').textContent = scenarios[key].prompt;
    document.querySelector('#demo-reply').textContent = scenarios[key].reply;
    list.replaceChildren(...scenarios[key].steps.map(([title, detail], i) => {
      const li = document.createElement('li');
      const number = document.createElement('span'); number.textContent = `0${i + 1}`;
      const copy = document.createElement('div');
      const strong = document.createElement('strong'); strong.textContent = title;
      const small = document.createElement('small'); small.textContent = detail;
      copy.append(strong, small);
      const state = document.createElement('span'); state.className = 'step-state'; state.textContent = '○'; state.setAttribute('aria-hidden', 'true');
      li.append(number, copy, state);
      return li;
    }));
    demoStatus.textContent = disclaimer;
  }
  document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => setScenario(button.dataset.scenario)));
  runButton.addEventListener('click', async () => {
    setScenario(scenario);
    const token = runId;
    const data = scenarios[scenario];
    runButton.disabled = true;
    runButton.lastElementChild.textContent = t('Przykład w toku…', 'Running example…');
    for (const [index, step] of [...list.children].entries()) {
      if (token !== runId) return;
      step.classList.add('active');
      demoStatus.textContent = `${t('Przykładowy krok', 'Sample step')} ${index + 1}/3: ${data.steps[index][0]}`;
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650));
      if (token !== runId) return;
      step.classList.remove('active');
      step.classList.add('done');
      step.querySelector('.step-state').textContent = '✓';
    }
    demoStatus.textContent = data.result;
    runButton.disabled = false;
    runButton.lastElementChild.textContent = t('Uruchom ponownie', 'Run again');
  });
  if (matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    document.querySelectorAll('.spotlight').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--mouse-y', `${event.clientY - bounds.top}px`);
      });
    });
  }

  const wpCost = document.querySelector('#wp-cost');
  const staticCost = document.querySelector('#static-cost');
  const savings = document.querySelector('#savings-value');
  const money = new Intl.NumberFormat(en ? 'en-GB' : 'pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 });
  function calculate() {
    if (!wpCost.validity.valid || !staticCost.validity.valid || wpCost.value === '' || staticCost.value === '') {
      savings.textContent = '—';
      document.querySelector('#savings-label').textContent = t('Podaj dwa koszty od 0 do 100 000 zł', 'Enter both costs between PLN 0 and 100,000');
      return;
    }
    const annual = Math.round((wpCost.valueAsNumber - staticCost.valueAsNumber) * 12);
    document.querySelector('#savings-label').textContent = annual < 0 ? t('Dodatkowy koszt roczny', 'Additional annual cost') : t('Potencjalna oszczędność roczna', 'Potential annual savings');
    savings.textContent = money.format(Math.abs(annual));
  }
  wpCost.addEventListener('input', calculate);
  staticCost.addEventListener('input', calculate);
  calculate();

  const form = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements._gotcha.value) return;
    const button = form.querySelector('[type=submit]');
    if (button.disabled) return;
    button.disabled = true;
    formStatus.className = '';
    formStatus.textContent = t('Wysyłanie wiadomości…', 'Sending your message…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      formStatus.textContent = t('Dziękuję! Wiadomość została wysłana. Odpowiem na podany adres e-mail.', 'Thank you! Your message was sent. I’ll reply to the email address you provided.');
    } catch {
      formStatus.className = 'error';
      formStatus.textContent = t('Nie udało się potwierdzić wysłania. Dane pozostały w formularzu. Spróbuj ponownie lub napisz na do@mleczki.pl.', 'Sending could not be confirmed. Your details are still in the form. Please try again or email do@mleczki.pl.');
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
})();
