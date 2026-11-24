(() => {
  "use strict";
  const {t, isRussian, locale, paymentName, offerCount, bindPage} = window.SpreadI18n;
  bindPage();
  const $ = id => document.getElementById(id);
  const setText = (id, value) => { $(id).textContent = value; };
  const clock = time => new Date(time).toLocaleTimeString(locale(), {hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23"});
  function rate(n, min = 2, max = min) {
    return n.toLocaleString(locale(), {minimumFractionDigits:min, maximumFractionDigits:max, useGrouping:false}) + (isRussian() ? " %" : "%");
  }
  const percent = n => (n > 0 ? "+" : "") + rate(n);
  function netLabel(net, target, aboveTarget) {
    if (!aboveTarget && net > 0 && Number(net.toFixed(2)) === target) return "<" + rate(target);
    return percent(net);
  }
  function units(value, digits, minimum = 0) {
    const sign = value < 0n ? "−" : "";
    const n = value < 0n ? -value : value, base = 10n ** BigInt(digits);
    const fraction = (n % base).toString().padStart(digits, "0").replace(/0+$/, "").padEnd(minimum, "0");
    return sign + (n / base).toLocaleString(locale(), {useGrouping:true}) + (fraction ? (isRussian() ? "," : ".") + fraction : "");
  }
  const rub = n => units(n, 2, 2) + " ₽";
  function limits(min, max) {
    return isRussian() ? units(min, 2) + " – " + units(max, 2) + " ₽" : "₽" + units(min, 2) + " – ₽" + units(max, 2);
  }
  function eventDetail(e) {
    return t("{size} USDT · {method} · Buy from {buyMerchant} at {buy} · Sell to {sellMerchant} at {sell}", {
      size:units(e.size, 6), method:paymentName(e.method),
      buyMerchant:e.buy.merchant + " (#" + e.buy.id + ")", buy:units(e.buy.price, 6, 2) + " ₽",
      sellMerchant:e.sell.merchant + " (#" + e.sell.id + ")", sell:units(e.sell.price, 6, 2) + " ₽",
    });
  }

  function drawChart(history, target) {
    const canvas = $("chart"), rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 3);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
    const points = history.filter(p => p.v !== null);
    const vals = [target, ...points.map(p => p.v)];
    const low = Math.min(...vals), high = Math.max(...vals), pad = Math.max(.13, (high - low) * .18);
    const bottom = low - pad, top = high + pad, x0 = 3, right = Math.max(15, w - 50), y0 = 8, y1 = h - 8;
    const y = v => y1 - (v - bottom) / (top - bottom) * (y1 - y0);
    const first = history[0]?.t || 0, last = history.at(-1)?.t || first;
    const x = t => last === first ? (x0 + right) / 2 : x0 + (t - first) / (last - first) * (right - x0);
    ctx.font = "12px Segoe UI, Arial, sans-serif"; ctx.textBaseline = "middle";
    [top, (top + bottom) / 2, bottom].forEach(v => {
      ctx.strokeStyle = "#333338"; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x0, y(v)); ctx.lineTo(right, y(v)); ctx.stroke();
      ctx.fillStyle = "#b5b5bf"; ctx.fillText(rate(v, Math.abs(v) < 100 ? 1 : 0), right + 7, y(v));
    });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "#d8b377"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y(target)); ctx.lineTo(right, y(target)); ctx.stroke(); ctx.setLineDash([]);
    let segment = [];
    function paintSegment() {
      if (!segment.length) return;
      ctx.beginPath(); segment.forEach((p, i) => i ? ctx.lineTo(x(p.t), y(p.v)) : ctx.moveTo(x(p.t), y(p.v)));
      ctx.strokeStyle = "#89abff"; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
      const p = segment.at(-1); ctx.fillStyle = "#89abff"; ctx.beginPath(); ctx.arc(x(p.t), y(p.v), 3, 0, 2 * Math.PI); ctx.fill(); segment = [];
    }
    for (const p of history) { if (p.v === null) paintSegment(); else segment.push(p); }
    paintSegment();
    if (!points.length) { ctx.font = "13px Segoe UI, sans-serif"; ctx.fillStyle = "#b5b5bf"; ctx.fillText(t("Waiting for a matched pair"), 8, y0 + 13); }
    setText("first-time", history.length ? clock(first) : "—"); setText("last-time", history.length ? clock(last) : "—");
    canvas.setAttribute("aria-label", t("Net spread over {count} observations with a threshold of {target}.", {count:points.length, target:rate(target, 0, 2)}));
  }

  function element(tag, label, className = "") {
    const node = document.createElement(tag);
    node.textContent = label;
    if (className) node.className = className;
    return node;
  }

  function showBook(bookSide, method, rows) {
    const fragment = document.createDocumentFragment();
    for (const o of rows) {
      const tr = document.createElement("tr");
      const merchant = element("div", "", "merchant-inner");
      const avatar = element("span", Array.from(o.merchant)[0].toUpperCase(), "avatar t" + (o.merchant.codePointAt(0) % 4));
      avatar.setAttribute("aria-hidden", "true");
      const identity = element("div", "", "merchant-text");
      identity.append(element("strong", o.merchant), element("small", "#" + o.id));
      merchant.append(avatar, identity);
      tr.insertCell().append(merchant);
      const price = tr.insertCell();
      price.className = "price-cell";
      price.append(o.price, element("span", "₽"));
      const quantity = tr.insertCell();
      quantity.className = "quantity";
      quantity.append(element("span", o.available + " USDT"), element("small", o.limits));
      const payment = tr.insertCell();
      payment.className = "payment-cell";
      payment.append(element("span", o.payment, "payment"));
      const status = tr.insertCell();
      status.className = "status" + (o.matched ? " matched" : "");
      status.textContent = t(o.reason || (o.matched ? "Matched" : "Eligible"));
      fragment.append(tr);
    }
    $("offers").replaceChildren(fragment);
    $("order-table").setAttribute("aria-label", t(bookSide === "buy" ? "Offers to buy USDT" : "Offers to sell USDT"));
    $("book-empty").hidden = Boolean(rows.length);
    const empty = bookSide === "buy" ? "No offers to buy USDT{method} in this snapshot." : "No offers to sell USDT{method} in this snapshot.";
    setText("book-empty", t(empty, {method:method ? t(" using {method}", {method:paymentName(method)}) : ""}));
    setText("book-count", offerCount(rows.length));
    for (const side of ["buy", "sell"]) $("side-" + side).setAttribute("aria-pressed", String(side === bookSide));
  }

  function showEvents(events) {
    const items = events.map(e => {
      const li = document.createElement("li"), time = document.createElement("time"), desc = document.createElement("div"), sub = document.createElement("small"), net = document.createElement("strong");
      time.textContent = clock(e.time); desc.textContent = t(e.sample ? "Sample threshold crossing" : "Quote threshold crossed");
      sub.textContent = eventDetail(e); desc.append(sub); net.textContent = percent(e.net) + " · " + rub(e.profit); li.append(time, desc, net); return li;
    });
    $("log").replaceChildren(...items); $("log-empty").hidden = Boolean(events.length); setText("log-count", events.length);
  }

  function selectTab(which) {
    for (const name of ["book", "log"]) {
      const active = which === name, tab = $(name + "-tab");
      tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; $(name + "-pane").hidden = !active;
    }
  }
  for (const name of ["book","log"]) {
    const tab = $(name + "-tab"); tab.onclick = () => selectTab(name);
    tab.onkeydown = e => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(e.key)) return; e.preventDefault();
      const next = e.key === "Home" ? "book" : e.key === "End" ? "log" : name === "book" ? "log" : "book";
      selectTab(next); $(next + "-tab").focus();
    };
  }

  window.SpreadView = { $, setText, clock, percent, rate, netLabel, units, rub, limits, eventDetail, showBook, showEvents, drawChart };
})();
