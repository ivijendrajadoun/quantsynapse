const $ = (id) => document.getElementById(id);

function updateConverter() {
  const amount = Number($('amount').value);
  const rate = Number($('rate').value);
  const from = $('from-currency').value;
  const to = $('to-currency').value;
  if (amount < 0 || rate < 0 || !Number.isFinite(amount * rate)) {
    $('converter-result').textContent = 'Enter a valid amount and exchange rate.';
    return;
  }
  $('converter-result').textContent = `${amount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${from} = ${(amount * rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})} ${to}`;
}

$('converter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  updateConverter();
});
$('from-currency').addEventListener('change', () => {
  const defaults = {USD: 0.92, EUR: 1.09, GBP: 1.28, INR: 0.011, JPY: 0.0067};
  const from = $('from-currency').value;
  const to = $('to-currency').value;
  const approximate = {USD:{EUR:0.92,GBP:0.78,INR:83.5,JPY:149},EUR:{USD:1.09,GBP:0.85,INR:90.8,JPY:162},GBP:{USD:1.28,EUR:1.17,INR:106.5,JPY:190},INR:{USD:0.012,EUR:0.011,GBP:0.0094,JPY:1.79},JPY:{USD:0.0067,EUR:0.0062,GBP:0.0053,INR:0.56}};
  if (from === to) $('rate').value = '1';
  else $('rate').value = (approximate[from]?.[to] ?? defaults[from] ?? 1).toString();
  updateConverter();
});
$('to-currency').addEventListener('change', () => {
  const from = $('from-currency').value, to = $('to-currency').value;
  const rates = {USD:{EUR:0.92,GBP:0.78,INR:83.5,JPY:149},EUR:{USD:1.09,GBP:0.85,INR:90.8,JPY:162},GBP:{USD:1.28,EUR:1.17,INR:106.5,JPY:190},INR:{USD:0.012,EUR:0.011,GBP:0.0094,JPY:1.79},JPY:{USD:0.0067,EUR:0.0062,GBP:0.0053,INR:0.56}};
  $('rate').value = from === to ? '1' : (rates[from]?.[to] ?? 1).toString();
  updateConverter();
});

$('position-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const balance = Number($('balance').value);
  const riskPercent = Number($('risk').value);
  const stopPips = Number($('stop-distance').value);
  const pipValue = Number($('pip-value').value);
  const riskAmount = balance * riskPercent / 100;
  const lots = riskAmount / (stopPips * pipValue);
  $('position-result').textContent = Number.isFinite(lots) && lots >= 0
    ? `Risk amount: $${riskAmount.toFixed(2)} · Estimated size: ${lots.toFixed(2)} lots`
    : 'Check your inputs and try again.';
});

$('rr-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const risk = Number($('risk-pips').value);
  const reward = Number($('reward-pips').value);
  $('rr-result').textContent = risk > 0 && reward >= 0
    ? `Risk-to-reward: 1 : ${(reward / risk).toFixed(2)}`
    : 'Enter a risk greater than zero.';
});

$('year').textContent = new Date().getFullYear();
updateConverter();
