const $ = (id) => document.getElementById(id);

const approximateRates = {
  USD: { EUR: 0.92, GBP: 0.78, INR: 83.5, JPY: 149 },
  EUR: { USD: 1.09, GBP: 0.85, INR: 90.8, JPY: 162 },
  GBP: { USD: 1.28, EUR: 1.17, INR: 106.5, JPY: 190 },
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.79 },
  JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, INR: 0.56 }
};

function getRate(from, to) {
  if (from === to) return 1;
  return approximateRates[from]?.[to] ?? 1;
}

function updateConverter() {
  const amount = Number($('amount').value);
  const rate = Number($('rate').value);
  const from = $('from-currency').value;
  const to = $('to-currency').value;

  if (amount < 0 || rate < 0 || !Number.isFinite(amount * rate)) {
    $('converter-result').textContent = 'Enter a valid amount and exchange rate.';
    return;
  }
  
  const converted = amount * rate;
  $('converter-result').textContent = `${amount.toLocaleString(undefined, {maximumFractionDigits: 4})} ${from} = ${converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})} ${to}`;
}

// Currency Converter Listeners (Real-time update)
['amount', 'rate'].forEach(id => $(id).addEventListener('input', updateConverter));

$('from-currency').addEventListener('change', () => {
  const from = $('from-currency').value;
  const to = $('to-currency').value;
  $('rate').value = getRate(from, to).toString();
  updateConverter();
});

$('to-currency').addEventListener('change', () => {
  const from = $('from-currency').value;
  const to = $('to-currency').value;
  $('rate').value = getRate(from, to).toString();
  updateConverter();
});

// Quick Swap Button for Currencies
$('swap-currencies').addEventListener('click', () => {
  const fromSelect = $('from-currency');
  const toSelect = $('to-currency');
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  $('rate').value = getRate(fromSelect.value, toSelect.value).toString();
  updateConverter();
});

// Position Size Calculator (Real-time update)
['balance', 'risk', 'stop-distance', 'pip-value'].forEach(id => {
  $(id).addEventListener('input', () => {
    const balance = Number($('balance').value);
    const riskPercent = Number($('risk').value);
    const stopPips = Number($('stop-distance').value);
    const pipValue = Number($('pip-value').value);

    if (balance < 0 || riskPercent < 0 || stopPips <= 0 || pipValue <= 0) {
      $('position-result').textContent = 'Check your inputs and try again.';
      return;
    }

    const riskAmount = balance * riskPercent / 100;
    const lots = riskAmount / (stopPips * pipValue);

    $('position-result').textContent = Number.isFinite(lots) && lots >= 0
      ? `Risk amount: $${riskAmount.toFixed(2)} · Estimated size: ${lots.toFixed(2)} lots`
      : 'Check your inputs and try again.';
  });
});

// Risk-to-Reward Calculator (Real-time update)
['risk-pips', 'reward-pips'].forEach(id => {
  $(id).addEventListener('input', () => {
    const risk = Number($('risk-pips').value);
    const reward = Number($('reward-pips').value);

    $('rr-result').textContent = risk > 0 && reward >= 0
      ? `Risk-to-reward: 1 : ${(reward / risk).toFixed(2)}`
      : 'Enter a risk greater than zero.';
  });
});

$('year').textContent = new Date().getFullYear();
updateConverter();
