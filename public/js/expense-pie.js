let getUniqueCategories = function(expenses) {
  let uniqueCategories = [];
  expenses.forEach(expense => {
    if(uniqueCategories.indexOf(expense.category)<0) {
      uniqueCategories.push(expense.category.name);
    }
  })
  return uniqueCategories;
}

let totalExpensesPerCategory = function(expenses) {
  let categories = getUniqueCategories(expenses);
  let totalExpenesesByCategory = {};
  const addAmounts = (accumulator,expense) => {
    // console.log("Adding: " + expense.amount + " to " + accumulator);
    return (accumulator + expense.amount);
  };
  categories.forEach(category => {
    let thisExpenseCategory = expenses.filter(expense => {
      // console.log("Checking if " + expense.category.name + " = " + category);
      return (expense.category.name==category);
    });
    // console.log(thisExpenseCategory);
    let total = thisExpenseCategory.reduce(addAmounts,0);
    totalExpenesesByCategory[category] = total;
  })
  return totalExpenesesByCategory;
}

expenseList = JSON.parse(document.getElementById('expenses').innerHTML);
expenseListTotalByCategory = totalExpensesPerCategory(expenseList);
// Looks like: {"Gas":30,"Groceries":100}

let pieCanvas = document.getElementById('expense-pie').getContext('2d');
let data = {}
data.labels = Object.keys(expenseListTotalByCategory);
data.datasets = [
  {
    label : "Total Expenses by Category",
    data : Object.values(expenseListTotalByCategory),
    backgroundColor : [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ]
  }
]

let pieChart = new Chart(pieCanvas,{
  type: 'pie',
  data: data
});