const $ = (id) => document.getElementById(id);

// --- 1. Currency Converter with Live & Manual Rate Fetching ---
let isManualRate = false;

async function fetchLiveRate(from, to) {
  if (isManualRate) return;
  if (from === to) {
    $('rate').value = '1';
    updateConverterResult();
    return;
  }

  $('converter-result').textContent = 'Fetching live rate...';
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await response.json();
    if (data && data.rates && data.rates[to]) {
      $('rate').value = data.rates[to];$('rate-status').textContent = '● Live Rate Active';
      $('rate-status').className = 'rate-status-badge live';
    }
  } catch (error) {
    $('rate-status').textContent = '● Live Failed (Using Manual)';
    $('rate-status').className = 'rate-status-badge manual';
  }
  updateConverterResult();
}

function updateConverterResult() {
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

// Converter Event Listeners
['amount', 'rate'].forEach(id => $(id).addEventListener('input', () => {
  if (id === 'rate') {
    isManualRate = true;
    $('rate-status').textContent = '● Manual Rate Active';
    $('rate-status').className = 'rate-status-badge manual';$('toggle-manual-rate').textContent = 'Switch to Live Rate';
  }
  updateConverterResult();
}));

$('from-currency').addEventListener('change', () => fetchLiveRate($('from-currency').value, $('to-currency').value));$('to-currency').addEventListener('change', () => fetchLiveRate($('from-currency').value, $('to-currency').value));

$('swap-currencies').addEventListener('click', () => {
  const fromSel = $('from-currency');
  const toSel = $('to-currency');
  const temp = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value = temp;
  fetchLiveRate(fromSel.value, toSel.value);
});

$('toggle-manual-rate').addEventListener('click', () => {
  isManualRate = !isManualRate;
  if (isManualRate) {
    $('rate-status').textContent = '● Manual Rate Active';
    $('rate-status').className = 'rate-status-badge manual';$('toggle-manual-rate').textContent = 'Switch to Live Rate';
  } else {
    $('toggle-manual-rate').textContent = 'Switch to Manual Rate';
    fetchLiveRate($('from-currency').value, $('to-currency').value);
  }
});


// --- 2. Advanced Risk/Reward & Position Analysis ---
let positionType = 'long'; // 'long' or 'short'

document.querySelectorAll('.position-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.position-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    positionType = e.target.dataset.type;
    
    // Update labels contextually
    if (positionType === 'long') {
      $('sl-label').textContent = 'Stop Loss Price (below)';$('tp-label').textContent = 'Take Profit Price (above)';
    } else {
      $('sl-label').textContent = 'Stop Loss Price (above)';$('tp-label').textContent = 'Take Profit Price (below)';
    }
    calculateRiskReward();
  });
});

function calculateRiskReward() {
  const entry = Number($('entry-price').value);
  const units = Number($('position-units').value);
  const sl = Number($('stop-loss').value);
  const tp = Number($('take-profit').value);

  if (entry <= 0 || units <= 0 || sl <= 0 || tp <= 0) {
    $('res-ratio').textContent = '-';
    $('res-loss').textContent = 'Invalid inputs';$('res-profit').textContent = '-';
    return;
  }

  let riskPerUnit = 0;
  let rewardPerUnit = 0;

  if (positionType === 'long') {
    riskPerUnit = entry - sl;
    rewardPerUnit = tp - entry;
  } else {
    riskPerUnit = sl - entry;
    rewardPerUnit = entry - tp;
  }

  if (riskPerUnit <= 0 || rewardPerUnit < 0) {
    $('res-ratio').textContent = 'Check SL/TP setup';$('res-loss').textContent = '-';
    $('res-profit').textContent = '-';$('res-risk-unit').textContent = '-';
    $('res-reward-unit').textContent = '-';$('res-breakeven').textContent = '-';
    return;
  }

  const potentialLoss = riskPerUnit * units;
  const potentialProfit = rewardPerUnit * units;
  const ratio = rewardPerUnit / riskPerUnit;
  const breakEvenWinRate = (riskPerUnit / (riskPerUnit + rewardPerUnit)) * 100;

  // Update UI Elements
  $('res-ratio').textContent = `1 : ${ratio.toFixed(2)}`;
  $('res-loss').textContent = `-$${potentialLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  $('res-profit').textContent = `+$${potentialProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  $('res-risk-unit').textContent = `$${riskPerUnit.toFixed(2)}`;
  $('res-reward-unit').textContent = `$${rewardPerUnit.toFixed(2)}`;
  $('res-breakeven').textContent = `${breakEvenWinRate.toFixed(1)}%`;
}

// Attach listener inputs for RR Calculator
['entry-price', 'position-units', 'stop-loss', 'take-profit'].forEach(id => {
  $(id).addEventListener('input', calculateRiskReward);
});

// --- Initializations ---
$('year').textContent = new Date().getFullYear();
fetchLiveRate('USD', 'EUR');
calculateRiskReward();
