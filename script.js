const METRIKA_COUNTER_ID = 109235181;

function sendGoal(goalName) {
  try {
    if (typeof ym === "function") {
      ym(METRIKA_COUNTER_ID, "reachGoal", goalName);
      console.log("Цель отправлена в Метрику:", goalName);
    } else {
      console.warn("Яндекс.Метрика пока недоступна, цель не отправлена:", goalName);
    }
  } catch (error) {
    console.warn("Не удалось отправить цель в Метрику:", goalName, error);
  }
}

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

function formatRub(value) {
  if (!isFinite(value)) return "—";
  return rub.format(value);
}

function getNumber(id) {
  const element = document.getElementById(id);
  if (!element) return 0;
  return Number(element.value);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/* Переключение вкладок калькуляторов */
document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active");
    });

    document.querySelectorAll(".calculator").forEach((calculator) => {
      calculator.classList.remove("active");
    });

    button.classList.add("active");

    const targetCalculator = document.getElementById(tabName);
    if (targetCalculator) {
      targetCalculator.classList.add("active");
    }
  });
});

/* Кредитный калькулятор */
function calculateCredit(trackGoal = true) {
  const amount = getNumber("creditAmount");
  const annualRate = getNumber("creditRate");
  const months = getNumber("creditMonths");

  if (amount <= 0 || annualRate < 0 || months <= 0) {
    alert("Проверьте данные: сумма и срок должны быть больше нуля.");
    return;
  }

  const monthlyRate = annualRate / 100 / 12;

  let payment;

  if (monthlyRate === 0) {
    payment = amount / months;
  } else {
    payment = amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  }

  const total = payment * months;
  const overpay = total - amount;

  setText("creditPayment", formatRub(payment));
  setText("creditTotal", formatRub(total));
  setText("creditOverpay", formatRub(overpay));

  let hint = "";

  if (overpay > amount * 0.5) {
    hint = "Переплата довольно высокая. Возможно, стоит уменьшить срок, увеличить первый взнос или сравнить предложения банков.";
  } else if (annualRate >= 20) {
    hint = "Ставка выглядит высокой. Перед оформлением кредита стоит проверить альтернативные предложения.";
  } else {
    hint = "Расчёт выглядит умеренным, но перед оформлением кредита важно учитывать страховки, комиссии и досрочное погашение.";
  }

  setText("creditHint", hint);

  if (trackGoal) {
    sendGoal("credit_calculate");
  }
}
function getAnnuityPayment(amount, annualRate, months) {
  const monthlyRate = annualRate / 100 / 12;

  if (months <= 0) return 0;

  if (monthlyRate === 0) {
    return amount / months;
  }

  return amount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
}

function simulateLoan(principal, annualRate, monthlyPayment) {
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let months = 0;
  let totalPaid = 0;

  while (balance > 0.01 && months < 1000) {
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);

    balance = balance + interest - payment;
    totalPaid += payment;
    months += 1;
  }

  return {
    months,
    totalPaid,
    overpay: Math.max(totalPaid - principal, 0)
  };
}

function calculateEarlyRepayment(trackGoal = true) {
  const amount = getNumber("earlyAmount");
  const annualRate = getNumber("earlyRate");
  const months = getNumber("earlyMonths");
  const extra = getNumber("earlyExtra");

  if (amount <= 0 || annualRate < 0 || months <= 0 || extra <= 0) {
    alert("Проверьте данные: остаток долга, срок и сумма досрочного погашения должны быть больше нуля.");
    return;
  }

  if (extra >= amount) {
    setText("earlyCurrentPayment", "кредит можно закрыть");
    setText("earlyOldOverpay", "—");
    setText("earlyNewPayment", "0 ₽");
    setText("earlyPaymentSaving", "—");
    setText("earlyNewTerm", "0 мес.");
    setText("earlyTermSaving", "—");
    setText("earlyHint", "Сумма досрочного погашения равна или больше остатка долга. Такой платёж может полностью закрыть кредит.");

    if (trackGoal) {
      sendGoal("early_repayment_calculate");
    }

    return;
  }

  const currentPayment = getAnnuityPayment(amount, annualRate, months);
  const oldTotal = currentPayment * months;
  const oldOverpay = oldTotal - amount;

  const newPrincipal = amount - extra;

  const newPayment = getAnnuityPayment(newPrincipal, annualRate, months);
  const totalWithLowerPayment = extra + newPayment * months;
  const overpayWithLowerPayment = totalWithLowerPayment - amount;
  const paymentSaving = oldOverpay - overpayWithLowerPayment;

  const termSimulation = simulateLoan(newPrincipal, annualRate, currentPayment);
  const totalWithLowerTerm = extra + termSimulation.totalPaid;
  const overpayWithLowerTerm = totalWithLowerTerm - amount;
  const termSaving = oldOverpay - overpayWithLowerTerm;

  setText("earlyCurrentPayment", formatRub(currentPayment));
  setText("earlyOldOverpay", formatRub(oldOverpay));
  setText("earlyNewPayment", formatRub(newPayment));
  setText("earlyPaymentSaving", formatRub(Math.max(paymentSaving, 0)));
  setText("earlyNewTerm", `${termSimulation.months} мес.`);
  setText("earlyTermSaving", formatRub(Math.max(termSaving, 0)));

  let hint = "";

  if (termSaving > paymentSaving) {
    hint = "По предварительному расчёту уменьшение срока даёт большую экономию на процентах. Но если важнее снизить ежемесячную нагрузку, можно рассмотреть уменьшение платежа.";
  } else if (paymentSaving > termSaving) {
    hint = "По предварительному расчёту уменьшение платежа выглядит выгоднее, но обычно этот вариант выбирают прежде всего для снижения ежемесячной нагрузки.";
  } else {
    hint = "Оба варианта дают похожий результат. Выбор зависит от цели: быстрее закрыть кредит или снизить ежемесячную нагрузку.";
  }

  setText("earlyHint", hint);

  if (trackGoal) {
    sendGoal("early_repayment_calculate");
  }
}
/* Ипотечный калькулятор */
function calculateMortgage(trackGoal = true) {
  const price = getNumber("mortgagePrice");
  const down = getNumber("mortgageDown");
  const annualRate = getNumber("mortgageRate");
  const years = getNumber("mortgageYears");
  const income = getNumber("mortgageIncome");

  if (price <= 0 || down < 0 || annualRate < 0 || years <= 0) {
    alert("Проверьте данные: стоимость жилья и срок должны быть больше нуля, взнос не может быть отрицательным.");
    return;
  }

  if (down >= price) {
    alert("Первоначальный взнос не должен быть равен или больше стоимости жилья.");
    return;
  }

  const loan = price - down;
  const months = years * 12;

  const payment = getAnnuityPayment(loan, annualRate, months);
  const total = payment * months;
  const overpay = total - loan;

  const load = income > 0 ? payment / income * 100 : 0;
  const downPercent = down / price * 100;

  setText("mortgagePayment", formatRub(payment));
  setText("mortgageLoan", formatRub(loan));
  setText("mortgageTotal", formatRub(total));
  setText("mortgageOverpay", formatRub(overpay));
  setText("mortgageLoad", income > 0 ? `${load.toFixed(1)}%` : "—");

  let hint = "";

  if (income <= 0) {
    hint = "Расчёт выполнен без оценки нагрузки на доход. Чтобы понять комфортность платежа, укажите ежемесячный доход семьи.";
  } else if (load > 50) {
    hint = "Платёж занимает больше половины дохода. Такая нагрузка выглядит высокой. Стоит рассмотреть больший первоначальный взнос, меньшую сумму кредита или другой срок.";
  } else if (load > 35) {
    hint = "Нагрузка на доход заметная. Перед оформлением ипотеки важно оставить запас на жизнь, ремонт, страховки и непредвиденные расходы.";
  } else if (downPercent < 15) {
    hint = "Платёж выглядит умеренным, но первоначальный взнос ниже 15%. Проверьте требования банков и возможные дополнительные условия.";
  } else {
    hint = "Нагрузка выглядит относительно комфортной, но расчёт примерный. Реальные условия банка могут отличаться из-за страховок, комиссий и требований к заёмщику.";
  }

  setText("mortgageHint", hint);

  if (trackGoal) {
    sendGoal("mortgage_calculate");
  }
}

/* Калькулятор накоплений */
function calculateSavings(trackGoal = true) {
  const goal = getNumber("savingsGoal");
  const current = getNumber("savingsCurrent");
  const monthly = getNumber("savingsMonthly");

  if (goal <= 0 || current < 0 || monthly <= 0) {
    alert("Проверьте данные: цель и ежемесячное пополнение должны быть больше нуля.");
    return;
  }

  const left = Math.max(goal - current, 0);
  const months = Math.ceil(left / monthly);

  const date = new Date();
  date.setMonth(date.getMonth() + months);

  const dateText = date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric"
  });

  setText("savingsMonths", months === 0 ? "цель уже достигнута" : `${months} мес.`);
  setText("savingsLeft", formatRub(left));
  setText("savingsDate", months === 0 ? "уже сейчас" : dateText);

  let hint = "";

  if (months === 0) {
    hint = "Отлично! Цель уже достигнута. Можно подумать о следующей финансовой цели.";
  } else if (months <= 6) {
    hint = "Хороший темп. Цель выглядит достижимой в ближайшее время.";
  } else if (months <= 18) {
    hint = "Цель реалистичная, но можно ускорить накопления за счёт дополнительного дохода или сокращения расходов.";
  } else {
    hint = "Срок накопления довольно длинный. Возможно, стоит увеличить ежемесячный взнос или разбить цель на этапы.";
  }

  setText("savingsHint", hint);

  if (trackGoal) {
    sendGoal("savings_calculate");
  }
}

/* Калькулятор личного бюджета */
function calculateBudget(trackGoal = true) {
  const income = getNumber("budgetIncome");
  const fixed = getNumber("budgetFixed");
  const variable = getNumber("budgetVariable");

  if (income <= 0 || fixed < 0 || variable < 0) {
    alert("Проверьте данные: доход должен быть больше нуля, расходы не могут быть отрицательными.");
    return;
  }

  const expenses = fixed + variable;
  const free = income - expenses;

  const spendRate = expenses / income * 100;
  const saveRate = free / income * 100;

  setText("budgetFree", formatRub(free));
  setText("budgetSpendRate", `${spendRate.toFixed(1)}%`);
  setText("budgetSaveRate", `${saveRate.toFixed(1)}%`);

  let hint = "";

  if (free < 0) {
    hint = "Расходы превышают доходы. Нужно срочно найти, какие траты можно сократить, или увеличить доход.";
  } else if (saveRate < 10) {
    hint = "Свободный остаток небольшой. Желательно постепенно выйти хотя бы на 10–20% накоплений от дохода.";
  } else if (saveRate < 30) {
    hint = "Неплохой баланс. Есть потенциал для накоплений и финансовой подушки.";
  } else {
    hint = "Отличный уровень свободного остатка. Можно распределить деньги между подушкой, целями и инвестициями.";
  }

  setText("budgetHint", hint);

  if (trackGoal) {
    sendGoal("budget_calculate");
  }
}

/* Калькулятор финансовой подушки */
function calculateCushion(trackGoal = true) {
  const expenses = getNumber("cushionExpenses");
  const months = getNumber("cushionMonths");
  const current = getNumber("cushionCurrent");
  const monthly = getNumber("cushionMonthly");

  if (expenses <= 0 || months <= 0 || current < 0 || monthly <= 0) {
    alert("Проверьте данные: расходы, срок подушки и ежемесячное пополнение должны быть больше нуля.");
    return;
  }

  const target = expenses * months;
  const left = Math.max(target - current, 0);
  const time = left === 0 ? 0 : Math.ceil(left / monthly);
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  setText("cushionTarget", formatRub(target));
  setText("cushionLeft", formatRub(left));
  setText("cushionTime", time === 0 ? "уже готова" : `${time} мес.`);
  setText("cushionProgress", `${progress.toFixed(1)}%`);

  let hint = "";

  if (progress >= 100) {
    hint = "Отлично! Финансовая подушка уже сформирована. Важно хранить её в доступном и надёжном инструменте.";
  } else if (progress >= 70) {
    hint = "Подушка почти готова. Осталось немного до рекомендуемого уровня.";
  } else if (progress >= 30) {
    hint = "Хорошее начало. Продолжайте регулярно откладывать, чтобы выйти на безопасный уровень.";
  } else {
    hint = "Финансовая подушка пока небольшая. Начните с цели хотя бы на 1–3 месяца расходов.";
  }

  setText("cushionHint", hint);

  if (trackGoal) {
    sendGoal("cushion_calculate");
  }
}

/* ИИ-помощник */
function askAssistant() {
  const input = document.getElementById("userQuestion");
  if (!input) return;

  const question = input.value.trim();

  if (!question) return;

  addMessage(question, "user");
  sendGoal("assistant_question");

  const answer = generateAssistantAnswer(question);

  setTimeout(() => {
    addMessage(answer, "bot");
  }, 400);

  input.value = "";
}

function addMessage(text, type) {
  const chatWindow = document.getElementById("chatWindow");
  if (!chatWindow) return;

  const message = document.createElement("div");

  message.className = `message ${type}`;
  message.textContent = text;

  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function generateAssistantAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes("досроч") || q.includes("погаш")) {
  return "При досрочном погашении обычно сравнивают два варианта: уменьшить ежемесячный платёж или сократить срок кредита. Уменьшение срока чаще даёт большую экономию на процентах, а уменьшение платежа снижает нагрузку на бюджет.";
}
  if (text.includes("ипотек")) {
  return "Ипотечный калькулятор поможет оценить примерный ежемесячный платёж, сумму кредита, переплату и нагрузку на доход. Для расчёта укажите стоимость жилья, первоначальный взнос, ставку, срок и доход семьи.";
}

  if (q.includes("кредит") || q.includes("ипотек") || q.includes("платёж") || q.includes("платеж")) {
    return "Если речь про кредит, начните с расчёта ежемесячного платежа и переплаты. Важно сравнить не только ставку, но и страховки, комиссии и возможность досрочного погашения.";
  }

  if (q.includes("накоп") || q.includes("собрать") || q.includes("цель") || q.includes("отлож")) {
    return "Для накоплений лучше определить точную цель, срок и ежемесячную сумму. Если срок получается слишком длинным, можно увеличить взнос, сократить расходы или найти дополнительный доход.";
  }

  if (q.includes("бюджет") || q.includes("расход") || q.includes("доход") || q.includes("траты")) {
    return "Для бюджета начните с трёх цифр: доход, обязательные расходы и переменные расходы. Хорошая цель — откладывать хотя бы 10–20% дохода.";
  }

  if (q.includes("подуш")) {
    return "Финансовая подушка — это запас денег на непредвиденные ситуации. Обычно ориентируются на 3–6 месяцев обязательных расходов.";
  }

  if (q.includes("инвест") || q.includes("вклад") || q.includes("деньги")) {
    return "Перед инвестициями обычно стоит сначала собрать финансовую подушку на 3–6 месяцев расходов. После этого можно сравнивать вклады, облигации и другие инструменты с учётом риска.";
  }

  return "Пока я работаю в демо-режиме. Лучше всего я отвечаю на вопросы про кредиты, накопления, финансовую подушку и личный бюджет. Попробуйте задать вопрос чуть конкретнее.";
}

/* Cookie banner */
function acceptCookies() {
  const banner = document.getElementById("cookieBanner");

  if (banner) {
    banner.classList.remove("show");
    banner.style.display = "none";
  }

  try {
    localStorage.setItem("calcpilotCookiesAccepted", "true");
  } catch (error) {
    console.warn("Не удалось сохранить согласие cookies:", error);
  }
}

function initCookieBanner() {
  const banner = document.getElementById("cookieBanner");

  if (!banner) return;

  let accepted = false;

  try {
    accepted = localStorage.getItem("calcpilotCookiesAccepted") === "true";
  } catch (error) {
    accepted = false;
  }

  if (!accepted) {
    banner.classList.add("show");
  }
}

/* Делаем функции доступными для кнопок onclick */
window.calculateCredit = calculateCredit;
window.calculateEarlyRepayment = calculateEarlyRepayment;
window.calculateMortgage = calculateMortgage;
window.calculateSavings = calculateSavings;
window.calculateBudget = calculateBudget;
window.calculateCushion = calculateCushion;
window.askAssistant = askAssistant;
window.acceptCookies = acceptCookies;

/* Стартовые расчёты без отправки целей в Метрику */
try {
  calculateCredit(false);
calculateEarlyRepayment(false);
calculateMortgage(false);
calculateSavings(false);
calculateBudget(false);
calculateCushion(false);
} catch (error) {
  console.warn("Ошибка при стартовом расчёте:", error);
}

initCookieBanner();
