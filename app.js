
(() => {
"use strict";
const $ = id => document.getElementById(id);
const currencies = {
AED:"UAE Dirham",AFN:"Afghan Afghani",ALL:"Albanian Lek",AMD:"Armenian Dram",AOA:"Angolan Kwanza",ARS:"Argentine Peso",AUD:"Australian Dollar",AZN:"Azerbaijani Manat",BAM:"Convertible Mark",BBD:"Barbadian Dollar",BDT:"Bangladeshi Taka",BGN:"Bulgarian Lev",BHD:"Bahraini Dinar",BIF:"Burundian Franc",BMD:"Bermudian Dollar",BND:"Brunei Dollar",BOB:"Bolivian Boliviano",BRL:"Brazilian Real",BSD:"Bahamian Dollar",BTN:"Bhutanese Ngultrum",BWP:"Botswanan Pula",BYN:"Belarusian Ruble",BZD:"Belize Dollar",CAD:"Canadian Dollar",CDF:"Congolese Franc",CHF:"Swiss Franc",CLP:"Chilean Peso",CNY:"Chinese Yuan",COP:"Colombian Peso",CRC:"Costa Rican Colón",CZK:"Czech Koruna",DJF:"Djiboutian Franc",DKK:"Danish Krone",DOP:"Dominican Peso",DZD:"Algerian Dinar",EGP:"Egyptian Pound",ETB:"Ethiopian Birr",EUR:"Euro",FJD:"Fijian Dollar",GBP:"British Pound",GEL:"Georgian Lari",GHS:"Ghanaian Cedi",HKD:"Hong Kong Dollar",HNL:"Honduran Lempira",HUF:"Hungarian Forint",IDR:"Indonesian Rupiah",ILS:"Israeli New Shekel",INR:"Indian Rupee",IQD:"Iraqi Dinar",ISK:"Icelandic Króna",JMD:"Jamaican Dollar",JOD:"Jordanian Dinar",JPY:"Japanese Yen",KES:"Kenyan Shilling",KRW:"South Korean Won",KWD:"Kuwaiti Dinar",KZT:"Kazakhstani Tenge",LBP:"Lebanese Pound",LKR:"Sri Lankan Rupee",MAD:"Moroccan Dirham",MGA:"Malagasy Ariary",MMK:"Myanmar Kyat",MNT:"Mongolian Tugrik",MUR:"Mauritian Rupee",MXN:"Mexican Peso",MYR:"Malaysian Ringgit",NGN:"Nigerian Naira",NOK:"Norwegian Krone",NPR:"Nepalese Rupee",NZD:"New Zealand Dollar",OMR:"Omani Rial",PEN:"Peruvian Sol",PHP:"Philippine Peso",PKR:"Pakistani Rupee",PLN:"Polish Złoty",QAR:"Qatari Riyal",RON:"Romanian Leu",RSD:"Serbian Dinar",RUB:"Russian Ruble",SAR:"Saudi Riyal",SEK:"Swedish Krona",SGD:"Singapore Dollar",THB:"Thai Baht",TND:"Tunisian Dinar",TRY:"Turkish Lira",TWD:"New Taiwan Dollar",TZS:"Tanzanian Shilling",UAH:"Ukrainian Hryvnia",UGX:"Ugandan Shilling",USD:"US Dollar",UYU:"Uruguayan Peso",UZS:"Uzbekistani Som",VND:"Vietnamese Dong",XAF:"Central African CFA Franc",XCD:"East Caribbean Dollar",XOF:"West African CFA Franc",XPF:"CFP Franc",ZAR:"South African Rand",ZMW:"Zambian Kwacha"
};
const pairs=["EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","NZD/USD","EUR/GBP","EUR/JPY","GBP/JPY"];
const cache=new Map(),manual=new Map();
const fmt=(n,d=2)=>new Intl.NumberFormat(undefined,{maximumFractionDigits:d}).format(n);
const money=(n,c)=>{try{return new Intl.NumberFormat(undefined,{style:"currency",currency:c,minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}catch{return `${c} ${fmt(n,2)}`}};
const positive=v=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):null;
const name=c=>currencies[c]||c;
function populateCurrency(el,selected){if(!el)return;el.innerHTML="";Object.keys(currencies).sort().forEach(c=>{let o=document.createElement("option");o.value=c;o.textContent=`${c} · ${name(c)}`;o.selected=c===selected;el.appendChild(o)})}
function populatePairs(el){if(!el)return;el.innerHTML="";pairs.forEach(p=>{let o=document.createElement("option");o.value=p;o.textContent=p;el.appendChild(o)})}
async function rates(base,force=false){let old=cache.get(base);if(!force&&old&&Date.now()-old.at<300000)return old;let res=await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,{cache:"no-store"});if(!res.ok)throw Error(`Rate provider HTTP ${res.status}`);let d=await res.json();if(d.result!=="success"||!d.rates)throw Error("Invalid provider response");let x={rates:d.rates,at:Date.now(),updated:d.time_last_update_utc||new Date().toUTCString(),provider:"Public reference-rate API"};cache.set(base,x);return x}
async function getRate(a,b,force=false){if(a===b)return {rate:1,updated:"Same currency",provider:"Identity"};let m=manual.get(`${a}/${b}`);if(m)return {rate:m,updated:"Manual input",provider:"Manual rate"};let d=await rates(a,force),r=Number(d.rates[b]);if(!Number.isFinite(r)||r<=0)throw Error(`No valid ${a}/${b} rate`);return {rate:r,updated:d.updated,provider:d.provider}}
function dot(el,mode){if(!el)return;el.classList.remove("live","manual");if(mode)el.classList.add(mode)}
function initConverter(){
 if(!$("from"))return;
 ["from","to","rateFrom","rateTo"].forEach(id=>populateCurrency($(id),id==="from"||id==="rateFrom"?"EUR":"USD"));
 const update=async(force=false)=>{
  const amount=positive($("amount").value),a=$("from").value,b=$("to").value;
  if(!amount){$("converted").value="";$("conversionHeadline").textContent="Enter a positive amount";return}
  $("rateStatus").textContent="Fetching reference rate…";
  try{let r=await getRate(a,b,force);$("converted").value=fmt(amount*r.rate,2);$("conversionHeadline").textContent=`${fmt(amount,2)} ${name(a)} = ${fmt(amount*r.rate,2)} ${name(b)}`;$("converterTimestamp").textContent=`Last updated · ${r.updated}`;$("rateStatus").textContent=`${r.provider} · 1 ${a} = ${fmt(r.rate,7)} ${b}`;dot($("rateDot"),r.provider==="Manual rate"?"manual":"live");if(r.provider==="Manual rate")$("manualRate").value=r.rate}
  catch(e){$("converted").value="Rate unavailable";$("conversionHeadline").textContent=`${name(a)} to ${name(b)} rate unavailable`;$("converterTimestamp").textContent="Last updated · No current rate";$("rateStatus").textContent=`${e.message}. Enter a manual rate to continue.`;dot($("rateDot"),"manual")}
 };
 $("amount").addEventListener("input",()=>update());["from","to"].forEach(id=>$(id).addEventListener("change",()=>update()));
 $("swap")?.addEventListener("click",()=>{let a=$("from").value;$("from").value=$("to").value;$("to").value=a;update()});
 $("showManual")?.addEventListener("click",()=>$("manualBox").classList.toggle("show"));
 $("applyManual")?.addEventListener("click",()=>{let r=positive($("manualRate").value);if(!r){$("rateStatus").textContent="Enter a rate greater than zero.";return}manual.set(`${$("from").value}/${$("to").value}`,r);update()});
 $("refresh")?.addEventListener("click",()=>{cache.clear();update(true)});
 update();
}
function initPosition(){
 if(!$("positionPair"))return;populatePairs($("positionPair"));
 const update=()=>{let bal=positive($("balance").value),risk=positive($("riskPct").value),stop=positive($("stopPips").value),pip=positive($("pipValueInput").value),step=positive($("lotStep").value),account=$("account").value;
 if(!bal||!risk||risk>100||!stop||!pip||!step){$("lots").textContent="Check inputs";return}
 let budget=bal*risk/100,lots=Math.floor((budget/(stop*pip)+1e-12)/step)*step,loss=lots*stop*pip;
 $("lots").textContent=lots>0?`${fmt(lots,3)} lots`:"Below minimum";$("riskBudget").textContent=money(budget,account);$("stopLoss").textContent=money(loss,account);$("units").textContent=lots>0?fmt(lots*100000,0):"—";$("rounding").textContent=`Down to ${fmt(step,3)}`;
 };
 ["balance","riskPct","stopPips","pipValueInput","lotStep","account","positionPair"].forEach(id=>$(id).addEventListener("input",update));update();
}
function initPip(){
 if(!$("pipPair"))return;populatePairs($("pipPair"));
 const update=()=>{let pair=$("pipPair").value,quote=pair.split("/")[1],lots=positive($("pipLots").value),conv=positive($("pipConv").value),account=$("pipAccount").value;if(!lots||!conv){$("pipResult").textContent="Check inputs";return}let size=quote==="JPY"?.01:.0001,value=100000*size*lots*conv;$("pipResult").textContent=`${money(value,account)} / pip`;$("pipExplanation").textContent=`${pair}: pip size ${size} × 100,000 units × ${fmt(lots,3)} lots × supplied quote-to-account rate ${fmt(conv,6)}.`};
 ["pipPair","pipLots","pipConv","pipAccount"].forEach(id=>$(id).addEventListener("input",update));update();
}
function initTrade(){
 if(!$("entry"))return;
 const update=()=>{let e=positive($("entry").value),s=positive($("sl").value),t=positive($("tp").value),lots=positive($("tradeLots").value),pip=positive($("tradePipValue").value),cost=Number($("costs").value),dir=$("direction").value;
 if(!e||!s||!t||!lots||!pip||!Number.isFinite(cost)||cost<0){$("rrResult").textContent="Check inputs";return}
 if(!(dir==="buy"?(s<e&&t>e):(s>e&&t<e))){$("rrResult").textContent="Invalid price direction";return}
 // EUR/USD-style demo assumption: 0.0001 pip size. This page explicitly exposes this limitation.
 let riskPips=Math.abs(e-s)/.0001,rewardPips=Math.abs(t-e)/.0001,gr=riskPips*lots*pip,gw=rewardPips*lots*pip,nl=gr+cost,nw=gw-cost;
 $("rrResult").textContent=nw>0&&nl>0?`${fmt(nw/nl,2)} : 1`:"Costs exceed reward";$("grossRisk").textContent=money(gr,$("account")?.value||"USD");$("grossReward").textContent=money(gw,$("account")?.value||"USD");$("netRisk").textContent=money(nl,$("account")?.value||"USD");$("breakeven").textContent=nl+nw>0?`${fmt(nl/(nl+nw)*100,1)}%`:"—";
 };
 ["entry","sl","tp","direction","tradeLots","costs","tradePipValue"].forEach(id=>$(id).addEventListener("input",update));update();
}
function initValidation(){
 if(!$("rateFrom"))return;
 const update=()=>{let a=$("rateFrom").value,b=$("rateTo").value,amount=Number($("rateAmount").value),r=Number($("rateValue").value);if(!Number.isFinite(amount)||amount<0||!Number.isFinite(r)||r<=0){$("rateResult").textContent="Invalid input";$("rateValidationStatus").textContent="Amount must be non-negative and rate greater than zero.";return}$("rateResult").textContent=`${fmt(amount*r,2)} ${b}`;$("rateValidationStatus").textContent=`Manual input · 1 ${a} = ${fmt(r,7)} ${b}. Input validation only; rate not independently verified.`};
 ["rateFrom","rateTo","rateAmount","rateValue"].forEach(id=>$(id).addEventListener("input",update));$("validateRateBtn")?.addEventListener("click",update);update();
}
function initPortfolio(){
 if(!$("portfolioPair"))return;populatePairs($("portfolioPair"));let trades=[];
 const update=()=>{let total=trades.reduce((s,t)=>s+t.risk,0),cur=$("portfolioCurrency").value;$("portfolioTotal").textContent=money(total,cur);$("portfolioCount").textContent=trades.length?`${trades.length} planned trade(s) · sum of entered risk amounts`:"No planned trades added.";$("portfolioList").textContent=trades.map((t,i)=>`${i+1}. ${t.pair}: ${money(t.risk,cur)}`).join(" · ")};
 $("addTrade").addEventListener("click",()=>{let risk=positive($("portfolioRisk").value);if(!risk){$("portfolioCount").textContent="Enter a risk amount greater than zero.";return}trades.push({pair:$("portfolioPair").value,risk});update()});
 $("clearTrades").addEventListener("click",()=>{trades=[];update()});$("portfolioCurrency").addEventListener("change",update);update();
}
document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
initConverter();initPosition();initPip();initTrade();initValidation();initPortfolio();
})();
