/**
 * The Chart Selector Thing
 */
if(document.getElementById('chart-selector')) {
  var chartSelector = new Vue({
    el:'#chart-selector',
    data: {
      chartType: 'showTabulateExpendituresByCategory',
      charts: [
        ['showTabulateExpendituresByCategory','Total Expenditures by Category'],
        ['showTabulateExpendituresByPayee','Total Expenditures by Payee']
      ]
    },
    methods: {
      getChart: function() {
        console.log('Getting chart')
        return transactions.drawChart(this.chartType)
      }
    },
    template: `
    <div id="chart-selector">
      <select id="select-chart-selector" name="charttype" v-model="chartType" v-on:change="getChart">
        <option v-for="(chartType, index) in charts" v-bind:value="chartType[0]">{{chartType[1]}}</option>
      </select>
    </div>
    `
  })
}
/**
 * The Expense Entry Form
 */
if(document.getElementById('expenseentry')) {
  var expenseEntry = new Vue({
    el:'#expenseentry',
    data: {
      accounts: [],
      expenseTypes: [],
      categories: [],
      payees: []
    },
    computed: {
      currentDate: function() {
        let d = new Date()
        let yr = d.getFullYear()
        let mo = (parseInt(d.getMonth()) + 1).toString().padStart(2, '0')
        let dy = d.getDate().toString().padStart(2,'0')
        let hr = d.getHours().toString().padStart(2,'0')
        let mi = d.getMinutes().toString().padStart(2,'0')
        return `${yr}-${mo}-${dy}T${hr}:${mi}`
      }
    },
    methods: {
      submitExpense: function() {
        return submitExpense('addexpenseform')
        .then(response => {
          if(response.response_code>299 || response.response_code>200) {
            console.log(`failed to add expense: ${response.response_code}`)
            return expenseEntry.submitted = false
            return false
          }
          console.log(`updating table`)
          return expenseEntry.submitted = true
          return tableBox.getTransactions()
        })
      },
      popup: function() {
        popupExpenseEntry()
      }
    },
    mounted: function() {
      this.$nextTick(function() {
        return get("froogle/domains")
        .then(domains => {
          console.log("domains: " + JSON.stringify(domains.result))
          return (expenseEntry.$data.accounts = domains.result)
        })
        .then(() => {
          return get("froogle/expense-types")
        })
        .then(expenseTypes => {
          console.log("expense-types: " + JSON.stringify(expenseTypes.result))
          return(expenseEntry.$data.expenseTypes = expenseTypes.result)
        })
        .then(() => {
          return get("froogle/categories")
        })
        .then(categories => {
          console.log("categories: " + JSON.stringify(categories.result))
          let categoryList = new Set()
          categories.result.forEach(category => {
            categoryList.add(category.category)
          })
          return (expenseEntry.$data.categories = Array.from(categoryList).sort())
        })
        .then(() => {
          return get("froogle/payees")
        })
        .then(payees => {
          console.log("payees: " + JSON.stringify(payees.result))
          let payeeList = new Set()
          payees.result.forEach(payee => {
            payeeList.add(payee.payee)
          })
          return (expenseEntry.$data.payees = Array.from(payeeList).sort())
        })
      })
    },
    template:`
    <div id="expenseentry">
      <div class="title" v-on:click="popup()"><i id="icon-popup" class="bigicon fas fa-chevron-circle-up"></i><i id="icon-popdown" class="bigicon fas fa-chevron-circle-down"></i>add an expense</div>
      <form id="addexpenseform" method="POST" action="/froogle/expenses/">
        <div class="fieldset">
          <div id="ff-expensetype-picker" class="formfield">
            <label for="expensetype-picker">Payment Type</label>
            <select id="expensetype-picker" class="expensetype-picker" name="expensetypeid" tabindex=1>
              <option v-for="(expenseType, index) in expenseTypes" :value="expenseType.id" :key="index">{{expenseType.name}}</option>
            </select>
          </div>
          <div id="ff-date" class="formfield">
            <label for="date">Date</label>
            <input type="datetime-local" id="date" name="date" v-bind:value="currentDate" placeholder="date" tabindex=1>
          </div>
          <div id="ff-amount" class="formfield required">
            <label for="amount">Amount</label>
            <input type="number" id="amount" name="amount" step=".01" min="0" placeholder="amount" required tabindex=1>
          </div>
          <div id="ff-provider" class="formfield">
            <label for="provider">Paid To</label>
            <input type="text" id="provider" list="payeelist" name="provider" placeholder="paid to" tabindex=1>
            <datalist id="payeelist" class="payee-picker">
              <option v-for="(payee,index) in payees" :value="payee" :key="index">{{payee}}</option>
            </datalist>
          </div>
          <div id="ff-account-picker" class="formfield">
            <label for="account-picker">Account</label>
            <select id="account-picker" class="account-picker" name="domainid" tabindex=1>
              <option v-for="(account, index) in accounts" :value="account.id" :key="index">{{account.name}}</option>
            </select>
          </div>
          <div id="ff-category-picker" class="formfield">
            <label for="category-picker">Category</label>
            <input type="text" id="category-picker" list="categorylist" name="category" placeholder="enter or pick a category" tabindex=1/>
            <datalist id="categorylist" class="category-picker">
              <option v-for="(category, index) in categories" :value="category" :key="index">{{category}}</option>
            </datalist>
          </div>
          <div id="ff-note" class="formfield">
            <label for="note">Note</label>
            <textarea id="note" name="note" class="noresize" placeholder="note" tabindex=1></textarea>
          </div>
        </div>
        <div class="fieldset">
          <div id="ff-submit" class="formfield">
            <label for="submit">Submit</label>
            <div id="submit" v-on:click="submitExpense" class="buttonstyle primary">
              <i class="fas fa-check"></i>submit
            </div>
          </div>
          <div id="ff-cancel" class="formfield">
            <label for="cancel">Cancel</label>
            <div v-on:click="popup" class="buttonstyle warning" tabindex=1>
              <i class="fas fa-arrow-left"></i>cancel
            </div>
          </div>
        </div>
      </form>
    </div>
    `
  })
}

/**
 * The Expense Edit Form
 */
let expenseEditElement = document.getElementById('expenseedit')
if(expenseEditElement) {
  var expenseEdit = new Vue({
    el:'#expenseedit',
    data: {
      expense: {},
      expenseId: expenseEditElement.dataset.expenseid,
      accounts: [],
      expenseTypes: [],
      categories: [],
      payees: [],
      submitted: false
    },
    methods: {
      submitExpense: function() {
        return submitExpense('editexpenseform')
        .then(response => {
          if(response.response_code>299 || response.response_code<200) {
            console.log(`failed to add expense: ${response.response_code}`)
            return expenseEdit.submitted = false
          }
          console.log(`updating table`)
          return expenseEdit.submitted = true
        })
      },
      toSimpleDate: function(dateString) {
        let d = new Date(dateString)
        return d.toLocaleString();
      },
      deleteExpense: function() {
        return deleteExpense(this.expenseId)
        .then(response => {
          if(response.response_code>299 || response.response_code<200) {
            console.log(`failed to delete expense: ${response.response_code}`)
            return expenseEdit.submitted = false
          }
          console.log(`deleted expense ${this.expenseId}`)
          return expenseEdit.submitted = true
        })
      },
      goTo : function(url) {
        return document.location = url
      }
    },
    mounted: function() {
      this.$nextTick(function() {
        return get("froogle/expenses/" + expenseEdit.$data.expenseId)
        .then(data => {
          if(data.response_code===200) {
            expenseEdit.$data.expense = data.result[0]
          }
          return get("froogle/domains")
        })
        .then(domains => {
          console.log("domains: " + JSON.stringify(domains.result))
          return (expenseEdit.$data.accounts = domains.result)
        })
        .then(() => {
          return get("froogle/expense-types")
        })
        .then(expenseTypes => {
          console.log("expense-types: " + JSON.stringify(expenseTypes.result))
          return(expenseEdit.$data.expenseTypes = expenseTypes.result)
        })
        .then(() => {
          return get("froogle/categories")
        })
        .then(categories => {
          console.log("categories: " + JSON.stringify(categories.result))
          let categoryList = new Set()
          categories.result.forEach(category => {
            categoryList.add(category.category)
          })
          return (expenseEdit.$data.categories = Array.from(categoryList).sort())
        })
        .then(() => {
          return get("froogle/payees")
        })
        .then(payees => {
          console.log("payees: " + JSON.stringify(payees.result))
          let payeeList = new Set()
          payees.result.forEach(payee => {
            payeeList.add(payee.payee)
          })
          return (expenseEdit.$data.payees = Array.from(payeeList).sort())
        })
      })
    },
    template:`
    <div id="expenseedit">
      <div class="title">edit expense</div>
      <form id="editexpenseform" method="POST" v-bind:class="{ 'submitted': submitted }" v-bind:action="'/froogle/expenses/' + expenseId + '/'">
        <div class="fieldset">
          <div id="ff-expensetype-picker" class="formfield">
            <label for="expensetype-picker">Payment Type</label>
            <select id="expensetype-picker" class="expensetype-picker" name="expensetypeid">
              <option v-for="(expenseType, index) in expenseTypes" :value="expenseType.id" :key="index">{{expenseType.name}}</option>
            </select>
          </div>
          <div id="ff-date" class="formfield">
            <label for="date">Date</label>
            <input type="datetime-local" id="date" name="date" v-bind:value="expense.date" placeholder="date">
          </div>
          <div id="ff-amount" class="formfield required">
            <label for="amount">Amount</label>
            <input type="number" id="amount" name="amount" step=".01" min="0" v-bind:value="expense.amount" placeholder="amount">
          </div>
          <div id="ff-provider" class="formfield">
            <label for="provider">Paid To</label>
            <input type="text" id="provider" list="payeelist" name="provider" v-bind:value="expense.provider" placeholder="paid to">
            <datalist id="payeelist" class="payee-picker">
              <option v-for="(payee,index) in payees" :value="payee" :key="index">{{payee}}</option>
            </datalist>
          </div>
          <div id="ff-account-picker" class="formfield">
            <label for="account-picker">Account</label>
            <select id="account-picker" class="account-picker" name="domainid">
              <option v-for="(account, index) in accounts" :value="account.id" :key="index">{{account.name}}</option>
            </select>
          </div>
          <div id="ff-category-picker" class="formfield">
            <label for="category-picker">Category</label>
            <input type="text" id="category-picker" list="categorylist" name="category" v-bind:value="expense.category" placeholder="enter or pick a category" />
            <datalist id="categorylist" class="category-picker">
              <option v-for="(category, index) in categories" :value="category" :key="index">{{category}}</option>
            </datalist>
          </div>
          <div id="ff-note" class="formfield">
            <label for="note">Note</label>
            <textarea id="note" name="note" class="noresize" placeholder="note">{{expense.note}}</textarea>
          </div>
        </div>
        <div class="fieldset">
          <div id="ff-submit" class="formfield">
            <label for="submit">Submit</label>
            <div id="submit" v-on:click="submitExpense" class="buttonstyle primary">
              <i class="fas fa-check"></i>submit
            </div>
          </div>
          <div id="ff-cancel" class="formfield">
            <label for="cancel">Cancel</label>
            <div v-on:click="goTo('/froogle/expenses/')" class="buttonstyle warning">
              <i class="fas fa-arrow-left"></i>cancel
            </div>
          </div>
          <div id="ff-delete" class="formfield">
            <label for="delete">Delete Expense</label>
            <div v-on:click="deleteExpense" class="buttonstyle danger">
              <i class="far fa-trash-alt"></i>delete
            </div>
          </div>
        </div>
      </form>
    </div>
    `
  })
}

/**
 * The List of Attached Domains
 */
if(document.getElementById('list-domains')) {
  console.log("Found domains list box")
  var domainsList = new Vue({
    el:'#list-domains',
    data: {
      domains: []
    },
    methods: {
      updateDomainList: function() {
        return get("froogle/domains")
        .then(domains => {
          console.log("domains: " + JSON.stringify(domains.result))
          return (domainsList.$data.domains = domains.result)
        })
      }
    },
    mounted: function() {
      this.updateDomainList()
    },
    template:`
    <div id="list-domains" class="vertical">
      <a v-for="(domain,index) in domains" :id="'domain' + domain.id" :key="index" :href="'/froogle/domains/' + domain.id + '/'">{{domain.name}}</a>
    </div>
    `
  })
}

/**
 * The Errors Box
 */
if(document.getElementById('errorsbox')) {
  console.log("Found errors box")
  var errorsBox = new Vue({
    el:'#errorsbox',
    data: {
      errors: []
    },
    template:`
    <div id="errorsbox" class="messagebox errors vertical">
      <div v-for="(error, index) in errors" :key="index" v-bind:id="'err' + index" class="msg">{{error}}</div>
    </div>
    `
  })
}

/**
 * The Messages Box
 */
if(document.getElementById('messagesbox')) {
  console.log("Found messages box")
  var messagesBox = new Vue({
    el:'#messagesbox',
    data: {
      messages: []
    },
    template:`
    <div id="messagesbox" class="messagebox messages vertical">
      <div v-for="(message, index) in messages" :key="index" v-bind:id="'msg' + index" class="msg">{{message}}</div>
    </div>
    `
  })
}

/**
 * The Chart Table
 */
if(document.getElementById('chart-table')) {
  console.log("Found chart table")
  var tableBox = new Vue({
    el:'#chart-table',
    data: {
      transactions: []
    },
    computed: {
      getByDate: function() {
        console.log("getting expenses by DATE")
        return this.$data.transactions.sort((record1,record2) => {
          return (record1.date < record2.date) ? 1 : -1
        })
      }
    },
    methods:{
      toCurrency: function(num) {
        return parseFloat(num).toFixed(2)
      },
      toSimpleDate: function(dateString) {
        let d = new Date(dateString)
        return d.toLocaleString();
      },
      goTo: function(url) {
        goTo(url)
      },
      getTransactions: function() {
        return get('froogle/expenses')
        .then(expenses => {
          console.log("expenses: " + JSON.stringify(expenses.result))
          return this.$data.transactions = expenses.result
        })
      }
    },
    template:`
    <table id="chart-table">
      <thead>
        <tr>
          <th class="col l1">Date</th>
          <th class="col l2">Category</th>
          <th class="col l1">Amount</th>
          <th class="col l2">Paid To</th>
          <th class="col l3">Account</th>
          <th class="col l4">User</th>
          <th class="col l4">Note</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction,index) in getByDate" :key="index" v-bind:id="index" v-on:click="goTo('/froogle/expenses/' + transaction.id + '/')">
          <td class="col l1">{{toSimpleDate(transaction.date)}}</td>
          <td class="col l2">{{transaction.category}}</td>
          <td class="col l1 jright">{{toCurrency(transaction.amount)}}</td>
          <td class="col l2">{{transaction.provider}}</td>
          <td class="col l3">{{transaction.name}}</td>
          <td class="col l4">{{transaction.email}}</td>
          <td class="col l4">{{transaction.note}}</td>
        </tr>
      </tbody>
    </table>
    `
  })
}

/**
 * Vue Components
 */

/**
 * FETCHING FUNCTIONS
 * 
 * 'fetching' is just calling out to the server and getting the data.
 * There is no processing except transforming the data to JSON.
 */
function get(target, queryString) {
  if(!target) return false
  let qS = (queryString) ? queryString : ``
  let url = `/${target}/json/${qS}`
  console.log(`Fetching URL: ${url}`)
  return fetch(url)
  .then(response => {
    return response.json()
  })
  .then(response => {
    if(response.errors) errorsBox.$data.errors = response.errors
    if(response.messages) messagesBox.$data.messages = response.messages
    return response
  })
  .catch(e => {
    console.log("Err: " + JSON.stringify(e))
  })
}

function post(target,data) {
  if(!target) return false
  console.log(`Fetching URL: ${target}`)
  return fetch(target, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: data
  })
  .then(response => {
    return response.json()
  })
  .then(response => {
    if(response.errors) errorsBox.$data.errors = response.errors
    if(response.messages) messagesBox.$data.messages = response.messages
    return response
  })
  .catch(e => {
    console.log("Err: " + JSON.stringify(e))
  })
}

function del(target,data) {
  if(!target) return false
  console.log(`Deleting URL: ${target}`)
  return fetch(target, {
    method: 'DELETE',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrer: 'no-referrer',
    body: data
  })
  .then(response => {
    return response.json()
  })
  .then(response => {
    if(response.errors) errorsBox.$data.errors = response.errors
    if(response.messages) messagesBox.$data.messages = response.messages
    return response
  })
  .catch(e => {
    console.log("Err: " + JSON.stringify(e))
  })
}

function addDomain() {
  console.log("Trying to add domain")
  let form = document.getElementById('form_adddomain')
  let formData = new FormData(form)
  return post("/froogle/domains/",formData)
  .then(response => {
    console.log("Did we get here?")
  })
  .catch(e => {
    return console.log('POST of new domain didnt work')
  })
}

function updateDomain(domainId) {
  console.log("Trying to edit domain")
  let form = document.getElementById('form_editdomain')
  let formData = new FormData(form)
  return post(`/froogle/domains/${domainId}/`,formData)
  .then(response => {
    console.log("Did we get here?")
  })
  .catch(e => {
    return console.log('POST of new domain didnt work')
  })
}

/**
 * UTILITY FUNCTIONS
 */
function deleteExpense(expenseId) {
  return del(`/froogle/expenses/${expenseId}/json/`)
  .then(response => {
    return response;
  })
}

function submitExpense(formId) {
  console.log(`attempting to submit expense`)
  let submitExpensePromise = Promise.resolve()

  return submitExpensePromise.then(() => {
    let form = document.getElementById(formId)
    if(!form) {
      let e = new Error("form does not exist")
      e.name = "FormError"
      throw e
    }
    return formId
  })
  .then(formId => {
    let formElements = document.querySelectorAll(`#${formId}:not(.disabled) .formfield.required > input, #${formId}:not(.disabled) .formfield.required > textarea, #${formId}:not(.disabled) .formfield.required > select`)
    let invalidElements = []
    formElements.forEach(element => {
      if(element.value==='') {
        invalidElements.push([element.name, element.getAttribute('id')])
        element.classList.add("invalid")
      }
    })
    if(invalidElements.length>0) {
      let e = new Error("Entry did not validate. Check for any missing required fields.")
      e.name = "ValidationError"
      throw e
    }
    return submitForm(formId)
  })
  .then(response => {
    console.log(response.response_code)
    return response
  })
  .catch(e => {
    if(e.name === "ValidationError") alert(e.message)
    return false
  })
}

function submitForm(formId) {
  console.log(`attempting submit of form: ${formId}`)
  let form = document.getElementById(formId)
  if(!form) {
    console.log(`couldn't find form: ${formId}`)
    return false
  }
  let formAction = form.getAttribute('action')
  let formMethod = form.getAttribute('method')
  let formData = new FormData(form)
  console.log(`Form: ${formId} action: ${formAction} method: ${formMethod}`)
  return post(formAction,formData)
  .then(response => {
    console.log("I think we've done it")
    return response
  })
  .catch(e => {
    return console.log('submit of form failed')
  })
}

function goTo(url) {
  document.location = url;
}

let transactions = {
  expenses: [],
  getExpenditures: function() {
    return get('froogle/expenses')
    .then(expenses => {
      console.log("expenses: " + JSON.stringify(expenses.result))
      this.expenses = expenses.result
      return this.expenses
    })
  },
  showTabulateExpendituresByCategory: function() {
    let categoryTabulation = {}
    return this.getExpenditures()
    .then(expenditures => {
      this.expenses.forEach(expense => {
        if(!categoryTabulation.hasOwnProperty(expense.category)) categoryTabulation[expense.category] = 0
        categoryTabulation[expense.category] += parseFloat(expense.amount)
      })
      console.log("tabulated: " + JSON.stringify(categoryTabulation))
      return categoryTabulation
    })
  },
  showTabulateExpendituresByPayee: function() {
    return this.getExpenditures()
    .then(expenditures => {
      let payeeTabulation = {}
      this.expenses.forEach(expense => {
        if(!payeeTabulation.hasOwnProperty(expense.provider)) payeeTabulation[expense.provider] = 0
        payeeTabulation[expense.provider] += parseFloat(expense.amount)
      })
      console.log("tabulated: " + JSON.stringify(payeeTabulation))
      return payeeTabulation
    })
  },
  sortByDate: function(record1, record2) {
    return (record1.date < record2.date) ? 1 : -1
  },
  drawTable: function(sortFunction) {
    tableBox.transactions = this.expenses.sort(sortFunction)
  },
  drawChart: function(chartType) {
    if(!this.hasOwnProperty(chartType)) {
      console.log('No valid chart type specified')
      return false
    }
    return this[chartType]()
    .then(categories => {
      console.log("AFTER FETCH OF chartType(): " + JSON.stringify(categories))
      let tabulatedExpenses = new google.visualization.DataTable()
      tabulatedExpenses.addColumn('string','Category')
      tabulatedExpenses.addColumn('number','Expenditures')
      for (let key in categories) {
        if (categories.hasOwnProperty(key)) {
          tabulatedExpenses.addRow([key,categories[key]]);
        }
      }
      let chart = new google.visualization.PieChart(document.getElementById('chart-month-expenses'))
      let chartOptions = {
        backgroundColor: 'transparent',
        title: 'Expenditures',
        is3D: true,
        legend: {alignment: 'center', position: 'bottom'},
        chartArea: {height: '100%', width: '100%'}
      }
      this.drawTable(this.sortByDate)
      chart.draw(tabulatedExpenses, chartOptions)
    })
  }
}

function flipCard() {
  document.getElementById("chart-card").classList.toggle("flip")
}

function popupExpenseEntry() {
  document.getElementById("bottompopup").classList.toggle("popup")
}

var chartType = 'showTabulateExpendituresByCategory'

if(document.querySelector(".chart")) {
  google.charts.load("current", {packages:["corechart"]})
  google.charts.setOnLoadCallback(function() {
    transactions.drawChart(chartType)
  })
}

if(document.querySelector("#expensetable #chart-table")) {
  // Might be able to wrap this into a Promise
  get('froogle/expenses')
  .then(expenses => {
    return tableBox.transactions = expenses.result
  })
}

