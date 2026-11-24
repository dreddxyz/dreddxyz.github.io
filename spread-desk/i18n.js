(() => {
  "use strict";
  const russian = Object.assign(Object.create(null), {
    "Spread Desk · P2P market demo": "Spread Desk · Демо P2P-рынка",
    "Try a Paycat USDT/RUB spread monitor with fictional P2P offers.": "Посмотрите, как меняется спред USDT/RUB на Paycat, на примере учебных P2P-объявлений.",
    "Market views": "Разделы рынка",
    "Market": "Рынок",
    "Alert history": "История сигналов",
    "Demo prices": "Демо-цены",
    "Alert settings": "Настройки сигнала",
    "Best matched prices for the sample trade": "Подобранные цены для учебной сделки",
    "Buy price": "Цена покупки",
    "Sell price": "Цена продажи",
    "Estimated profit": "Расчётная прибыль",
    "Waiting": "Ожидание данных",
    "Price breakdown": "Расчёт сделки",
    "Gross spread": "Спред до комиссий",
    "Estimated fees": "Расчётные комиссии",
    "Net spread history": "Спред после комиссий",
    "Sample P2P offers": "Учебные P2P-объявления",
    "Show offers to": "Направление сделки",
    "Buy USDT": "Купить USDT",
    "Sell USDT": "Продать USDT",
    "Amount": "Объём",
    "Payment": "Способ оплаты",
    "All payments": "Все способы",
    "SBP": "СБП",
    "Bank transfer": "Банковский перевод",
    "1,000 USDT": "1 000 USDT",
    "Merchant": "Мерчант",
    "Price": "Цена",
    "Available / limits": "Доступно / лимиты",
    "Payment method": "Способ оплаты",
    "For this trade": "Для этой сделки",
    "Matched": "В паре",
    "Eligible": "Подходит",
    "Out of date": "Цена устарела",
    "Outside RUB limits": "Сумма вне лимитов",
    "Too little USDT": "Недостаточно USDT",
    "Conditions unmet": "Условия не выполнены",
    "Other payment method": "Другой способ оплаты",
    "Below one kopek": "Меньше копейки",
    "Offers to buy USDT": "Объявления для покупки USDT",
    "Offers to sell USDT": "Объявления для продажи USDT",
    "No offers to buy USDT{method} in this snapshot.": "В этой выборке нет объявлений для покупки USDT{method}.",
    "No offers to sell USDT{method} in this snapshot.": "В этой выборке нет объявлений для продажи USDT{method}.",
    " using {method}": " со способом оплаты «{method}»",
    "Open Paycat": "Открыть Paycat",
    "Fictional offers": "Учебные объявления",
    "Fictional offers · Replay running": "Учебные объявления · Демо запущено",
    "Fictional offers · Replay paused": "Учебные объявления · Демо на паузе",
    "Pause replay": "Приостановить демо",
    "Play replay": "Продолжить демо",
    "Close": "Закрыть",
    "Alert when net spread reaches (%)": "Порог спреда после комиссий (%)",
    "Sample fees": "Комиссии в примере",
    "0.20% on each side": "По 0,20 % на покупку и продажу",
    "0.20% on each side + ₽10": "По 0,20 % на покупку и продажу + 10 ₽",
    "No fees": "Без комиссий",
    "Save settings": "Сохранить",
    "Enter a percentage from 0 to 100 with up to two decimal places.": "Введите процент от 0 до 100, максимум с двумя знаками после запятой.",
    "Target reached": "Порог достигнут",
    "Below target": "Ниже порога",
    "Check resale": "Проверьте возможность продажи",
    "No matched pair": "Нет подходящей пары",
    "Buy outlay {outlay} · Sell proceeds {proceeds}": "Затраты на покупку {outlay} · Выручка от продажи {proceeds}",
    "No pair covers this amount on a shared payment method.": "Нет двух объявлений на этот объём с общим способом оплаты.",
    "The sample account has only 150 unlocked USDT for resale.": "На учебном счёте для продажи доступно только 150 USDT.",
    "The sell leg uses existing unlocked USDT.": "Для продажи используются ранее разблокированные USDT.",
    "{target} threshold": "Порог {target}",
    "Waiting for a matched pair": "Ожидание подходящей пары",
    "Net spread over {count} observations with a threshold of {target}.": "История чистого спреда. Число наблюдений — {count}. Порог — {target}.",
    "Sample threshold crossing": "Учебный сигнал",
    "Quote threshold crossed": "Спред достиг порога",
    "No sample offers crossed your alert threshold.": "В этом примере спред ещё не достиг заданного порога.",
    "{size} USDT · {method} · Buy from {buyMerchant} at {buy} · Sell to {sellMerchant} at {sell}": "{size} USDT · {method} · Покупка у {buyMerchant} по {buy} · Продажа мерчанту {sellMerchant} по {sell}",
  });
  const paymentNames = {SBP:"СБП", "Bank transfer":"Банковский перевод"};
  let lang = "en";
  const labels = [];
  const russianPlural = new Intl.PluralRules("ru");
  const isRussian = () => lang === "ru";
  const locale = () => isRussian() ? "ru-RU" : "en-US";
  const inputText = value => isRussian() ? String(value).replace(".", ",") : String(value);
  function readDecimal(value) {
    let text = value.trim();
    if (!isRussian()) return text;
    if (/^\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?$/.test(text)) text = text.replace(/[ \u00a0\u202f]/g, "");
    return text.replace(",", ".");
  }
  const fromUrl = () => new URL(location.href).searchParams.get("lang") === "ru" ? "ru" : "en";
  function t(key, values = {}) {
    const message = isRussian() && Object.hasOwn(russian, key) ? russian[key] : key;
    return message.replace(/\{(\w+)\}/g, (original, field) => Object.hasOwn(values, field) ? String(values[field]) : original);
  }
  function paymentName(method) {
    return isRussian() && Object.hasOwn(paymentNames, method) ? paymentNames[method] : method;
  }
  function offerCount(count) {
    if (!isRussian()) return count + (count === 1 ? " offer" : " offers");
    const form = russianPlural.select(count);
    const noun = {one:"объявление", few:"объявления", many:"объявлений", other:"объявления"}[form];
    return count + " " + noun;
  }
  function apply(next) {
    lang = next;
    document.documentElement.lang = next;
    for (const {node, attribute, original} of labels) {
      const translated = original.replace(/\S(?:[\s\S]*\S)?/, key => t(key));
      if (attribute) node.setAttribute(attribute, translated);
      else node.nodeValue = translated;
    }
    const link = document.getElementById("language-switch");
    const other = isRussian() ? "en" : "ru";
    const destination = new URL(location.href);
    if (other === "en") destination.searchParams.delete("lang");
    else destination.searchParams.set("lang", other);
    link.href = destination.href; link.lang = other; link.hreflang = other;
    link.textContent = isRussian() ? "English" : "Русский";
    link.setAttribute("aria-label", isRussian() ? "Switch to English" : "Переключить на русский");
    document.querySelector("[data-paycat-market]").href = "https://paycat.com/" + lang + "/p2p";
    document.dispatchEvent(new Event("spread-languagechange"));
  }
  function bindPage() {
    // Capture authored labels once, before the first replay or user-supplied quote.
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest("script, style, noscript") && Object.hasOwn(russian, node.nodeValue.trim())) {
        labels.push({node, original:node.nodeValue});
      }
    }
    for (const node of document.querySelectorAll("[aria-label], meta[name=description]")) {
      const attribute = node.tagName === "META" ? "content" : "aria-label";
      const original = node.getAttribute(attribute);
      if (Object.hasOwn(russian, original)) labels.push({node, attribute, original});
    }
    const link = document.getElementById("language-switch");
    link.addEventListener("click", e => {
      if (e.button !== 0 || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
      try { history.pushState(null, "", link.href); } catch { return; }
      e.preventDefault();
      apply(fromUrl());
    });
    window.addEventListener("popstate", () => { if (fromUrl() !== lang) apply(fromUrl()); });
    apply(fromUrl());
  }
  window.SpreadI18n = {t, isRussian, locale, paymentName, offerCount, bindPage, inputText, readDecimal,
    addRussian: entries => Object.assign(russian, entries)};
})();
