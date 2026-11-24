(() => {
  "use strict";
  const frames = window.SpreadExamples;
  const {t, locale, paymentName, inputText, readDecimal} = window.SpreadI18n;
  const { $, setText, percent, rate, netLabel, units, rub, limits, showBook, showEvents, drawChart } = window.SpreadView;
  let size = "100", payment = "", side = "buy", preset = "standard", target = 4;
  let frame = 11, playing = true, previousHit = false, history = [], events = [];
  const interval = 6000;
  let nextFrame = Date.now() + interval;

  function example(index) {
    const market = frames[index % frames.length];
    const selected = market.cases[size];
    const route = selected.results[payment][preset];
    const reached = Boolean(route?.positive && route.thresholdLimit >= Math.round(target * 100));
    const held = selected.resale === "locked";
    return {market, selected, route, reached, held};
  }
  // The public fixtures contain precomputed en-US amounts. Only their display changes.
  function scaled(value, digits) {
    const [whole, fraction = ""] = value.replace(/[₽,\s]/g, "").split(".");
    return BigInt(whole + fraction.padEnd(digits, "0"));
  }
  function eventOffer(offer) {
    return {id:offer.id, merchant:offer.merchant, price:scaled(offer.price, 6)};
  }
  function record(index, time) {
    const {market, route, reached, held} = example(index);
    history.push({t:time, v:route?.net ?? null});
    history = history.slice(-45);
    const hit = reached && !held;
    if (hit && !previousHit) {
      const buy = market.offers.find(o => o.id === route.buy), sell = market.offers.find(o => o.id === route.sell);
      events.unshift({sample:true, time, net:route.net, profit:scaled(route.profit, 2), size:scaled(size, 6),
        method:route.method, buy:eventOffer(buy), sell:eventOffer(sell)});
      events = events.slice(0, 40);
    }
    previousHit = hit;
  }
  function render() {
    const {market, selected, route, reached, held} = example(frame);
    for (const action of ["buy", "sell"]) {
      const quote = route && market.offers.find(o => o.id === route[action]);
      setText(action + "-price", quote ? units(scaled(quote.price, 6), 6, 2) : "—");
      setText(action + "-merchant", quote ? quote.merchant + " · #" + quote.id : "—");
    }
    setText("profit", route ? rub(scaled(route.profit, 2)) : "—");
    setText("net", route ? netLabel(route.net, target, reached) : "—");
    setText("decision", t(!route ? "No matched pair" : !reached ? "Below target" : held ? "Check resale" : "Target reached"));
    for (const id of ["profit", "net"]) {
      $(id).classList.toggle("up", Boolean(route?.positive));
      $(id).classList.toggle("down", Boolean(route && route.net < 0));
    }
    setText("route-method", Number(size).toLocaleString(locale(), {useGrouping:true}) + " USDT" + (route ? " · " + paymentName(route.method) : ""));
    setText("gross", route ? percent(route.gross) : "—");
    setText("costs", route ? rub(scaled(route.fees, 2)) : "—");
    setText("route-caption", route ? t("Buy outlay {outlay} · Sell proceeds {proceeds}", {outlay:rub(scaled(route.outlay, 2)), proceeds:rub(scaled(route.proceeds, 2))})
      : t("No pair covers this amount on a shared payment method."));
    const resaleText = t(held ? "The sample account has only 150 unlocked USDT for resale." : "The sell leg uses existing unlocked USDT.");
    setText("resale", route ? resaleText : "");
    setText("availability-note", resaleText);
    $("availability-note").hidden = !(reached && held);
    const rows = market.offers.filter(o => o.side === side && (!payment || o.methods.includes(payment))).map(o => {
      const [min, max] = o.limits.split(" – ").map(value => scaled(value, 2));
      return {...o, numericPrice:Number(o.price), price:units(scaled(o.price, 6), 6, 2), available:units(scaled(o.available, 6), 6),
        limits:limits(min, max), payment:o.methods.map(paymentName).join(", "), reason:selected.reasons[o.id], matched:o.id === route?.[side]};
    });
    const rank = row => row.matched ? 0 : row.reason ? 2 : 1;
    rows.sort((a, b) => rank(a) - rank(b) || (a.numericPrice - b.numericPrice) * (side === "buy" ? 1 : -1));
    showBook(side, payment, rows);
    showEvents(events);
    setText("target-legend", t("{target} threshold", {target:rate(target, 0, 2)}));
    drawChart(history, target);
    setText("play", t(playing ? "Pause replay" : "Play replay"));
    setText("foot-source", t(playing ? "Fictional offers · Replay running" : "Fictional offers · Replay paused"));
  }
  function replayWindow() {
    history = []; events = []; previousHit = false;
    const now = Date.now();
    for (let i = Math.max(0, frame - 11); i <= frame; i++) record(i, now - (frame - i) * interval);
    nextFrame = now + interval;
    render();
  }
  for (const action of ["buy", "sell"]) $("side-" + action).onclick = () => { side = action; render(); };
  $("amount").onchange = e => { size = e.target.value; replayWindow(); };
  $("payment").onchange = e => { payment = e.target.value; replayWindow(); };
  const dialog = $("fee-dialog"), form = $("fee-form");
  $("fees-open").onclick = () => { form.elements.target.value = inputText(target); form.elements.target.setCustomValidity(""); form.elements.fees.value = preset; dialog.showModal(); };
  $("fees-close").onclick = () => dialog.close();
  form.noValidate = true;
  form.elements.target.oninput = () => form.elements.target.setCustomValidity("");
  form.onsubmit = e => {
    e.preventDefault();
    const field = form.elements.target, raw = readDecimal(field.value);
    const valid = /^\d{1,3}(?:\.\d{1,2})?$/.test(raw) && Number(raw) <= 100;
    field.setCustomValidity(valid ? "" : t("Enter a percentage from 0 to 100 with up to two decimal places."));
    if (!form.reportValidity()) return;
    target = Number(raw); preset = form.elements.fees.value;
    dialog.close(); replayWindow();
  };
  $("play").onclick = () => { playing = !playing; nextFrame = Date.now() + interval; render(); };
  const redraw = () => drawChart(history, target);
  document.addEventListener("spread-languagechange", render);
  $("quote-details").addEventListener("toggle", redraw);
  if (window.ResizeObserver) new ResizeObserver(redraw).observe($("chart").parentElement);
  else window.addEventListener("resize", redraw);
  replayWindow();
  setInterval(() => {
    const now = Date.now();
    if (!playing || document.hidden || now < nextFrame) return;
    record(++frame, now); nextFrame = now + interval; render();
  }, 500);
})();
