# QuantSynapse multi-page demo

## Pages
- `index.html` — home and tool directory
- `currency-converter.html` — broad currency selector, public reference rates, manual-rate fallback
- `position-size-calculator.html` — position size estimate
- `pip-value-calculator.html` — pip value estimate
- `trade-risk-planner.html` — trade risk/reward estimate
- `rate-validation.html` — manual-rate input validation
- `portfolio-risk-checker.html` — sum planned trade risk

## Run locally
Open `index.html` in a browser, or serve the folder locally:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Important prototype limitations
- Exchange rates use a public reference-rate endpoint and may be delayed, unavailable, or restricted. They are not broker execution quotes.
- Currency selector includes a broad ISO-code list; provider support is not guaranteed for every code.
- Position size and pip value use user-entered pip-value/conversion assumptions rather than a fully instrument-aware live calculation engine.
- Trade Risk Planner currently assumes a 0.0001 pip size; it must become pair-aware before production.
- Portfolio Risk Checker sums manually entered risk values; it does not model correlations or net currency exposure.
- This is a static prototype. Test calculations and provider behavior independently before using for real trading decisions or production.
