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

function calculateCredit() {
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
}

function calculateSavings() {
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
}

function calculateBudget() {
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
}

function askAssistant() {
  const input = document.getElementById("userQuestion");
  const question = input.value.trim();

  if (!question) return;

  addMessage(question, "user");

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

calculateCredit();
calculateSavings();
calculateBudget();
