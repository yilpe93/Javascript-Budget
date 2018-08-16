var budgetCtroller = (function() {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var allExprense = [];
  var allIncomes = [];
  var totalExpenses = 0;

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      expenses: [],
      income: []
    },
    totals: {
      expenses: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === 'expenses') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'income') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      
      var ids = data.allItems[type].map(function(cur) {
        return cur.id;
      })

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      calculateTotal('income');
      calculateTotal('expenses');

      data.budget = data.totals.income - data.totals.expenses;

      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.expenses / data.totals.income) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.expenses.forEach(function(cur) {
        cur.calculatePercentage(data.totals.income);
      });
    },

    getPercentage: function() {
      var allPerc = data.allItems.expenses.map(function(cur) {
        return cur.getPercentage();
      })

      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.income,
        totalExpenses: data.totals.expenses,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data);
    }
  }
})();

/* ---------------------------------------------------------- */

var UICtroller = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dataLabel: '.budget__month'
  };

  var formatNumber = function(num, type) {
    var int, type;

    int = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    if (type === '' || type === undefined) {
      return int;
    }

    return (type === 'expenses' ? '-' : '+') + ' ' + int;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value.trim(),
        value: parseInt(document.querySelector(DOMstrings.inputValue).value),
      }
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      
      if (type === 'income') {
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle"></i></button></div></div></div>'
      } else if (type === 'expenses') {
        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="expenses-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle"></i></button></div></div></div>'
      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type) + ' &#92;');

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type = obj.budget > 0 ? type = 'income' : type ='expenses';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'expenses');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      } 
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      
      nodeListForEach(fields, function(cur, idx) {
        if (percentages[idx] > 0) {
          cur.textContent = percentages[idx] + '%';
        } else {
          cur.textContent = '---';
        }
      })
    },

    displayMonth: function() {
      var now, month, year ;
      now = new Date();
      
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      year = now.getFullYear();

      document.querySelector(DOMstrings.dataLabel).textContent = year + '년 ' + month + '월';
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  }
})();

/* ---------------------------------------------------------- */

var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };
  
  var updateBudget = function() {
    budgetCtrl.calculateBudget();

    var budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    budgetCtrl.calculatePercentages();

    var percentages = budgetCtrl.getPercentage();

    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();

      updateBudget();
      
      updatePercentages();
    }
    // budgetCtrl.testing();
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID ;
    
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 

    if (itemID) {
      splitID = itemID.split('-');  // [type, id]
      type = splitID[0];
      ID = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, ID);
      
      UICtrl.deleteListItem(itemID);

      updateBudget();

      updatePercentages();
    }
  };

  return { 
    init: function() {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }
})(budgetCtroller, UICtroller);

controller.init();