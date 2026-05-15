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
  return Number(document.getElementById(id).value);
}

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
    document.getElementById(tabName).classList.add("active");
  });
});

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

  document.getElementById("creditPayment").textContent = formatRub(payment);
  document.getElementById("creditTotal").textContent = formatRub(total);
  document.getElementById("creditOverpay").textContent = formatRub(overpay);

  let hint = "";

  if (overpay > amount * 0.5) {
    hint = "Переплата довольно высокая. Возможно, стоит уменьшить срок, увеличить первый взнос или сравнить предложения банков.";
  } else if (annualRate >= 20) {
    hint = "Ставка выглядит высокой. Перед оформлением кредита стоит проверить альтернативные предложения.";
  } else {
    hint = "Расчёт выглядит умеренным, но перед оформлением кредита важно учитывать страховки, комиссии и досрочное погашение.";
  }

  document.getElementById("creditHint").textContent = hint;
  if (trackGoal) {
  sendGoal("credit_calculate");
}
}

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

  document.getElementById("savingsMonths").textContent =
    months === 0 ? "цель уже достигнута" : `${months} мес.`;

  document.getElementById("savingsLeft").textContent = formatRub(left);
  document.getElementById("savingsDate").textContent =
    months === 0 ? "уже сейчас" : dateText;

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

  document.getElementById("savingsHint").textContent = hint;
 if (trackGoal) {
  sendGoal("savings_calculate");
}
}

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

  document.getElementById("budgetFree").textContent = formatRub(free);
  document.getElementById("budgetSpendRate").textContent = `${spendRate.toFixed(1)}%`;
  document.getElementById("budgetSaveRate").textContent = `${saveRate.toFixed(1)}%`;

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

  document.getElementById("budgetHint").textContent = hint;

  if (trackGoal) {
    sendGoal("budget_calculate");
  }
}

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

  document.getElementById("cushionTarget").textContent = formatRub(target);
  document.getElementById("cushionLeft").textContent = formatRub(left);

  document.getElementById("cushionTime").textContent =
    time === 0 ? "уже готова" : `${time} мес.`;

  document.getElementById("cushionProgress").textContent =
    `${progress.toFixed(1)}%`;

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

  document.getElementById("cushionHint").textContent = hint;

  if (trackGoal) {
    sendGoal("cushion_calculate");
  }
}

  const target = expenses * months;
  const left = Math.max(target - current, 0);
  const time = left === 0 ? 0 : Math.ceil(left / monthly);
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  document.getElementById("cushionTarget").textContent = formatRub(target);
  document.getElementById("cushionLeft").textContent = formatRub(left);
  document.getElementById("cushionTime").textContent =
    time === 0 ? "уже готова" : `${time} мес.`;
  document.getElementById("cushionProgress").textContent =
    `${progress.toFixed(1)}%`;

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

  document.getElementById("cushionHint").textContent = hint;

  if (trackGoal) {
    sendGoal("cushion_calculate");
  }
}
}

function askAssistant() {
  const input = document.getElementById("userQuestion");
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
  const message = document.createElement("div");

  message.className = `message ${type}`;
  message.textContent = text;

  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function generateAssistantAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes("кредит") || q.includes("ипотек") || q.includes("платёж") || q.includes("платеж")) {
    return "Если речь про кредит, начните с расчёта ежемесячного платежа и переплаты. Важно сравнить не только ставку, но и страховки, комиссии и возможность досрочного погашения.";
  }

  if (q.includes("накоп") || q.includes("собрать") || q.includes("цель") || q.includes("отлож")) {
    return "Для накоплений лучше определить точную цель, срок и ежемесячную сумму. Если срок получается слишком длинным, можно увеличить взнос, сократить расходы или найти дополнительный доход.";
  }

  if (q.includes("бюджет") || q.includes("расход") || q.includes("доход") || q.includes("траты")) {
    return "Для бюджета начните с трёх цифр: доход, обязательные расходы и переменные расходы. Хорошая цель — откладывать хотя бы 10–20% дохода.";
  }

  if (q.includes("инвест") || q.includes("вклад") || q.includes("деньги")) {
    return "Перед инвестициями обычно стоит сначала собрать финансовую подушку на 3–6 месяцев расходов. После этого можно сравнивать вклады, облигации и другие инструменты с учётом риска.";
  }

  return "Пока я работаю в демо-режиме. Лучше всего я отвечаю на вопросы про кредиты, накопления и личный бюджет. Попробуйте задать вопрос чуть конкретнее.";
}

calculateCredit(false);
calculateSavings(false);
calculateBudget(false);
calculateCushion(false);

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

initCookieBanner();

