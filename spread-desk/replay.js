(() => {
  "use strict";
  const frames = window.SpreadExamples;
  const { $, setText, percent, showBook, showEvents, drawChart } = window.SpreadView;
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
  function netLabel(route, reached) {
    if (!reached && route.positive && Number(route.net.toFixed(2)) === target) return "<" + target.toFixed(2) + "%";
    return percent(route.net);
  }
  function record(index, time) {
    const {market, route, reached, held} = example(index);
    history.push({t:time, v:route?.net ?? null});
    history = history.slice(-45);
    const hit = reached && !held;
    if (hit && !previousHit) {
      const buy = market.offers.find(o => o.id === route.buy), sell = market.offers.find(o => o.id === route.sell);
      events.unshift({sample:true, time, net:netLabel(route, reached), profit:route.profit,
        detail:size + " USDT · " + route.method + " · Buy at ₽" + buy.price + " from " + buy.merchant + " (#" + buy.id
          + ") · Sell at ₽" + sell.price + " to " + sell.merchant + " (#" + sell.id + ")"});
      events = events.slice(0, 40);
    }
    previousHit = hit;
  }
  function render() {
    const {market, selected, route, reached, held} = example(frame);
    for (const action of ["buy", "sell"]) {
      const quote = route && market.offers.find(o => o.id === route[action]);
      setText(action + "-price", quote?.price ?? "—");
      setText(action + "-merchant", quote ? quote.merchant + " · #" + quote.id : "—");
    }
    setText("profit", route?.profit ?? "—");
    setText("net", route ? netLabel(route, reached) : "—");
    setText("decision", !route ? "No matched pair" : !reached ? "Below target" : held ? "Check resale" : "Target reached");
    for (const id of ["profit", "net"]) {
      $(id).classList.toggle("up", Boolean(route?.positive));
      $(id).classList.toggle("down", Boolean(route && route.net < 0));
    }
    setText("route-method", Number(size).toLocaleString("en-US") + " USDT" + (route ? " · " + route.method : ""));
    setText("gross", route ? percent(route.gross) : "—");
    setText("costs", route?.fees ?? "—");
    setText("route-caption", route ? "Buy outlay " + route.outlay + " · Sell proceeds " + route.proceeds
      : "No pair covers this amount on a shared payment method.");
    const resaleText = held ? "The sample account has only 150 unlocked USDT for resale." : "The sell leg uses existing unlocked USDT.";
    setText("resale", route ? resaleText : "");
    setText("availability-note", resaleText);
    $("availability-note").hidden = !(reached && held);
    const rows = market.offers.filter(o => o.side === side && (!payment || o.methods.includes(payment))).map(o => ({
      ...o, payment:o.methods.join(", "), reason:selected.reasons[o.id], matched:o.id === route?.[side],
    }));
    const rank = row => row.matched ? 0 : row.reason ? 2 : 1;
    rows.sort((a, b) => rank(a) - rank(b) || (Number(a.price) - Number(b.price)) * (side === "buy" ? 1 : -1));
    showBook(side, payment, rows);
    showEvents(events);
    setText("target-legend", target + "% threshold");
    drawChart(history, target);
    setText("play", playing ? "Pause replay" : "Play replay");
    setText("foot-source", "Fictional offers · Replay " + (playing ? "running" : "paused"));
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
  $("fees-open").onclick = () => { form.elements.target.value = target; form.elements.fees.value = preset; dialog.showModal(); };
  $("fees-close").onclick = () => dialog.close();
  form.onsubmit = e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    target = Number(form.elements.target.value); preset = form.elements.fees.value;
    dialog.close(); replayWindow();
  };
  $("play").onclick = () => { playing = !playing; nextFrame = Date.now() + interval; render(); };
  const redraw = () => drawChart(history, target);
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
