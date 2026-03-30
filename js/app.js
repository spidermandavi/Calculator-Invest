// ===== Global State =====
const state = {
  currentView: 'home',
  calcExpression: '',
  calcResult: '0',
  valueRows: []
};

// ===== View Switching =====
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewName).classList.add('active');
  state.currentView = viewName;
}

// Home card clicks
document.getElementById('calculator-card').addEventListener('click', () => switchView('calculator-view'));
document.getElementById('value-card').addEventListener('click', () => switchView('value-view'));

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', () => switchView('home-view')));

// ===== Basic Calculator =====
const calcExpressionEl = document.getElementById('calc-expression');
const calcResultEl = document.getElementById('calc-result');

document.querySelectorAll('.calculator-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch(action) {
      case 'number':
        state.calcExpression += value;
        break;
      case 'operator':
        if(state.calcExpression && !/[+\-*/]$/.test(state.calcExpression)) {
          state.calcExpression += value;
        }
        break;
      case 'clear':
        state.calcExpression = '';
        state.calcResult = '0';
        break;
      case 'delete':
        state.calcExpression = state.calcExpression.slice(0,-1);
        break;
      case 'percent':
        if(state.calcExpression) {
          state.calcExpression = '(' + state.calcExpression + ')/100';
        }
        break;
      case 'equals':
        try {
          state.calcResult = eval(state.calcExpression) || '0';
          state.calcExpression = state.calcResult.toString();
        } catch(e) {
          state.calcResult = 'Error';
        }
        break;
    }

    calcExpressionEl.textContent = state.calcExpression;
    calcResultEl.textContent = state.calcResult;
  });
});

// ===== Value Change Calculator =====
const valueContainer = document.getElementById('value-rows-container');
const addRowBtn = document.getElementById('add-row-btn');
const unitSummaryEl = document.getElementById('unit-summary');
const valueSummaryEl = document.getElementById('value-summary-text');

function createValueRow() {
  const row = document.createElement('div');
  row.classList.add('value-row');

  row.innerHTML = `
    <input type="number" placeholder="First Units" class="first-units">
    <input type="number" placeholder="Second Units" class="second-units">
    <input type="number" placeholder="Price per Unit" class="price-unit">
    <button class="remove-row">X</button>
  `;

  row.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateValues);
  });

  row.querySelector('.remove-row').addEventListener('click', () => {
    row.remove();
    updateValues();
  });

  valueContainer.appendChild(row);
}

addRowBtn.addEventListener('click', createValueRow);

// Auto add initial row
createValueRow();

function updateValues() {
  const rows = document.querySelectorAll('.value-row');
  let totalFirst = 0, totalSecond = 0, totalValueBefore = 0, totalValueAfter = 0;
  let allPricesFilled = true;

  rows.forEach(row => {
    const first = parseFloat(row.querySelector('.first-units').value) || 0;
    const second = parseFloat(row.querySelector('.second-units').value) || 0;
    const price = parseFloat(row.querySelector('.price-unit').value);
    totalFirst += first;
    totalSecond += second;

    if(isNaN(price)) allPricesFilled = false;
    else {
      totalValueBefore += first * price;
      totalValueAfter += second * price;
    }
  });

  // Unit summary
  const diffUnits = totalSecond - totalFirst;
  const percentUnits = totalFirst ? (diffUnits / totalFirst * 100).toFixed(2) : 0;
  unitSummaryEl.textContent = `Units → Before: ${totalFirst}, After: ${totalSecond}, Diff: ${diffUnits}, %: ${percentUnits}%`;

  // Value summary
  if(allPricesFilled && rows.length > 0) {
    const diffValue = totalValueAfter - totalValueBefore;
    const percentValue = totalValueBefore ? (diffValue / totalValueBefore * 100).toFixed(2) : 0;
    valueSummaryEl.textContent = `Value → Before: ${totalValueBefore.toFixed(2)}, After: ${totalValueAfter.toFixed(2)}, Diff: ${diffValue.toFixed(2)}, %: ${percentValue}%`;
  } else {
    valueSummaryEl.textContent = "Value calculation requires price in all rows";
  }
}
