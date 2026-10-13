document.addEventListener('DOMContentLoaded', () => {
  // Preçário oficial verificado:
  // Base para a moradia completa (2 hóspedes): 85€/noite
  // Hóspede adicional (até 6 hóspedes): +15€/noite
  // Taxa de limpeza e preparação: 35€ (fixa por estadia)
  const BASE_PRICE = 85;
  const EXTRA_GUEST_PRICE = 15;
  const CLEANING_FEE = 35;

  const checkinInput = document.getElementById('resCheckin');
  const checkoutInput = document.getElementById('resCheckout');
  const guestsSelect = document.getElementById('resGuests');
  const firewoodCheck = document.getElementById('optFirewood');
  const basketCheck = document.getElementById('optBasket');

  const summaryNights = document.getElementById('summaryNights');
  const summaryGuests = document.getElementById('summaryGuests');
  const summaryBaseTotal = document.getElementById('summaryBaseTotal');
  const summaryCleaning = document.getElementById('summaryCleaning');
  const summaryExtras = document.getElementById('summaryExtras');
  const summaryGrandTotal = document.getElementById('summaryGrandTotal');
  const summaryPaymentMethod = document.getElementById('summaryPaymentMethod');
  const btnPayAmount = document.getElementById('btnPayAmount');

  // Elementos do titular e faturação
  const guestNameInput = document.getElementById('guestName');
  const guestEmailInput = document.getElementById('guestEmail');
  const guestPhoneInput = document.getElementById('guestPhone');
  const toggleInvoiceFields = document.getElementById('toggleInvoiceFields');
  const invoiceFieldsCollapse = document.getElementById('invoiceFieldsCollapse');
  const invoiceNifInput = document.getElementById('invoiceNif');
  const invoiceNameInput = document.getElementById('invoiceName');
  const invoiceAddressInput = document.getElementById('invoiceAddress');
  const invoicePostalInput = document.getElementById('invoicePostal');
  const invoiceCityInput = document.getElementById('invoiceCity');
  const invoiceCountrySelect = document.getElementById('invoiceCountry');

  // Elementos de pagamento
  const paymentCards = document.querySelectorAll('.payment-method-card');
  const paymentFieldsCard = document.getElementById('paymentFieldsCard');
  const paymentFieldsMbway = document.getElementById('paymentFieldsMbway');
  const paymentFieldsMultibanco = document.getElementById('paymentFieldsMultibanco');

  // Carregar parâmetros da URL se existirem
  const urlParams = new URLSearchParams(window.location.search);
  const qCheckin = urlParams.get('checkin');
  const qCheckout = urlParams.get('checkout');
  const qGuests = urlParams.get('guests');

  // Preencher datas por defeito se não fornecidas (ex: hoje + 7 dias)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekPlus2 = new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000);

  const formatDate = (d) => d.toISOString().split('T')[0];

  if (checkinInput) {
    checkinInput.value = qCheckin || formatDate(nextWeek);
    checkinInput.min = formatDate(today);
  }
  if (checkoutInput) {
    checkoutInput.value = qCheckout || formatDate(nextWeekPlus2);
    checkoutInput.min = formatDate(nextWeek);
  }
  if (guestsSelect && qGuests) {
    guestsSelect.value = qGuests;
  }

  let currentCalculatedTotal = 205;
  let currentDiffDays = 2;

  function calculate() {
    if (!checkinInput || !checkoutInput || !guestsSelect) return;

    const ci = new Date(checkinInput.value);
    const co = new Date(checkoutInput.value);
    let diffDays = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    if (isNaN(diffDays) || diffDays < 1) diffDays = 1;
    currentDiffDays = diffDays;

    const numGuests = parseInt(guestsSelect.value, 10) || 2;
    const extraGuests = Math.max(0, numGuests - 2);
    const ratePerNight = BASE_PRICE + (extraGuests * EXTRA_GUEST_PRICE);
    const baseTotal = ratePerNight * diffDays;

    let extrasTotal = 0;
    if (firewoodCheck && firewoodCheck.checked) extrasTotal += 15;
    if (basketCheck && basketCheck.checked) extrasTotal += 25;

    const grandTotal = baseTotal + CLEANING_FEE + extrasTotal;
    currentCalculatedTotal = grandTotal;

    if (summaryNights) summaryNights.textContent = `${diffDays} noite${diffDays > 1 ? 's' : ''}`;
    if (summaryGuests) summaryGuests.textContent = `${numGuests} hóspede${numGuests > 1 ? 's' : ''}`;
    if (summaryBaseTotal) summaryBaseTotal.textContent = `${baseTotal} €`;
    if (summaryCleaning) summaryCleaning.textContent = `${CLEANING_FEE} €`;
    if (summaryExtras) summaryExtras.textContent = `${extrasTotal} €`;
    if (summaryGrandTotal) summaryGrandTotal.textContent = `${grandTotal} €`;
    if (btnPayAmount) btnPayAmount.textContent = `${grandTotal} €`;
  }

  // Event Listeners de cálculo
  [checkinInput, checkoutInput, guestsSelect, firewoodCheck, basketCheck].forEach(el => {
    if (el) el.addEventListener('change', calculate);
  });

  // Atualizar mínimo de checkout dinamicamente
  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener('change', () => {
      const minCo = new Date(new Date(checkinInput.value).getTime() + 24 * 60 * 60 * 1000);
      checkoutInput.min = formatDate(minCo);
      if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
        checkoutInput.value = formatDate(minCo);
      }
      calculate();
    });
  }

  // Toggle de Faturação
  if (toggleInvoiceFields && invoiceFieldsCollapse) {
    toggleInvoiceFields.addEventListener('change', () => {
      const isChecked = toggleInvoiceFields.checked;
      invoiceFieldsCollapse.style.display = isChecked ? 'block' : 'none';
      if (isChecked && invoiceNameInput && !invoiceNameInput.value && guestNameInput && guestNameInput.value) {
        invoiceNameInput.value = guestNameInput.value;
      }
    });
  }

  // Gestão da seleção do método de pagamento
  function updatePaymentMethod() {
    const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const val = selectedRadio ? selectedRadio.value : 'Cartão de Crédito/Débito';
    const cardEl = selectedRadio ? selectedRadio.closest('.payment-method-card') : null;
    const methodType = cardEl ? cardEl.getAttribute('data-method') : 'card';

    if (summaryPaymentMethod) {
      if (methodType === 'card') summaryPaymentMethod.textContent = 'Cartão';
      else if (methodType === 'mbway') summaryPaymentMethod.textContent = 'MB WAY';
      else if (methodType === 'multibanco') summaryPaymentMethod.textContent = 'Multibanco';
      else summaryPaymentMethod.textContent = val;
    }

    if (paymentFieldsCard) paymentFieldsCard.style.display = methodType === 'card' ? 'block' : 'none';
    if (paymentFieldsMbway) paymentFieldsMbway.style.display = methodType === 'mbway' ? 'block' : 'none';
    if (paymentFieldsMultibanco) paymentFieldsMultibanco.style.display = methodType === 'multibanco' ? 'block' : 'none';
  }

  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => {
        c.classList.remove('selected');
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updatePaymentMethod();
    });
  });

  calculate();
  updatePaymentMethod();

  // Submissão do formulário de reserva com pagamento imediato
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const modal = document.getElementById('confirmationModal');
      if (!modal) return;

      const guestName = (guestNameInput && guestNameInput.value.trim()) || 'Hóspede';
      const guestEmail = (guestEmailInput && guestEmailInput.value.trim()) || '';
      const guestPhone = (guestPhoneInput && guestPhoneInput.value.trim()) || '';
      const numGuests = (guestsSelect && guestsSelect.value) || '2';
      const ciVal = (checkinInput && checkinInput.value) || '';
      const coVal = (checkoutInput && checkoutInput.value) || '';

      const modalDates = document.getElementById('modalResDates');
      const modalNights = document.getElementById('modalResNights');
      const modalName = document.getElementById('modalResName');
      const modalGuests = document.getElementById('modalResGuests');
      const modalTotal = document.getElementById('modalResTotal');
      const modalContact = document.getElementById('modalResContact');
      const modalPayment = document.getElementById('modalResPayment');
      const modalBillingRow = document.getElementById('modalResBillingRow');
      const modalBilling = document.getElementById('modalResBilling');
      const modalWhatsAppLink = document.getElementById('modalWhatsAppLink');

      if (modalDates) modalDates.textContent = `${ciVal} a ${coVal}`;
      if (modalNights) modalNights.textContent = `${currentDiffDays} noite${currentDiffDays > 1 ? 's' : ''}`;
      if (modalName) modalName.textContent = guestName;
      if (modalGuests) modalGuests.textContent = `${numGuests} Hóspede${parseInt(numGuests, 10) > 1 ? 's' : ''}`;
      if (modalTotal) modalTotal.textContent = `${currentCalculatedTotal} €`;
      if (modalContact) modalContact.textContent = `${guestEmail} • ${guestPhone}`;

      const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');
      const methodLabel = selectedRadio ? selectedRadio.value : 'Cartão de Crédito/Débito';
      if (modalPayment) modalPayment.textContent = methodLabel;

      if (toggleInvoiceFields && toggleInvoiceFields.checked && invoiceNifInput && invoiceNifInput.value.trim()) {
        if (modalBillingRow) modalBillingRow.style.display = 'block';
        const nif = invoiceNifInput.value.trim();
        const city = (invoiceCityInput && invoiceCityInput.value.trim()) || 'Figueiró dos Vinhos';
        if (modalBilling) modalBilling.textContent = `NIF: ${nif} (${city})`;
      } else {
        if (modalBillingRow) modalBillingRow.style.display = 'none';
      }

      if (modalWhatsAppLink) {
        const waMsg = encodeURIComponent(
          `Olá Dona Maria João! Acabei de concluir a reserva na Casa do Olival.\n` +
          `Titular: ${guestName}\n` +
          `Datas: ${ciVal} a ${coVal} (${currentDiffDays} noites)\n` +
          `Hóspedes: ${numGuests}\n` +
          `Valor: ${currentCalculatedTotal} € (Pago via ${methodLabel})\n` +
          `Email: ${guestEmail}`
        );
        modalWhatsAppLink.href = `https://wa.me/351912345678?text=${waMsg}`;
      }

      modal.style.display = 'flex';
    });
  }

  // Fecho do modal
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalCrossBtn = document.getElementById('closeModalCrossBtn');

  function closeModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.style.display = 'none';
    window.location.href = 'index.html';
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (closeModalCrossBtn) closeModalCrossBtn.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('confirmationModal');
      if (modal && modal.style.display === 'flex') {
        closeModal();
      }
    }
  });
});
