const indexedDB = window.indexedDB

let db
const request = indexedDB.open('budgetApp', 1)

request.onupgradeneeded = (event) => {
  let db = event.target.result
  db.createObjectStore('pendingTransactions', { autoIncrement: true })
}

request.onsuccess = (event) => {
  db = event.target.result
  if (navigator.online) {
    pushToDB()
  } else {
    // getAllTransactions()
  }
}

function getAllTransactions() {
  const transaction = db.transaction('pendingTransactions', 'readwrite')
  const transactionStore = transaction.objectStore('pendingTransactions')

  const getAll = transactionStore.getAll()
  getAll.onsuccess = () => {
    transactions.push(...getAll.result)
    populateChart()
    populateTable()
    populateTotal()
  }
}

function saveRecord(transfer) {
  const transaction = db.transaction('pendingTransactions', 'readwrite')
  const transactionStore = transaction.objectStore('pendingTransactions')
  transactionStore.add(transfer)
}

function pushToDB() {
  const transaction = db.transaction('pendingTransactions', 'readwrite')
  const transactionStore = transaction.objectStore('pendingTransactions')

  const getAll = transactionStore.getAll()

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction('pendingTransactions', 'readwrite')
          const transactionStore = transaction.objectStore(
            'pendingTransactions'
          )
          transactionStore.clear()
        })
    }
  }
}

window.addEventListener('online', pushToDB)
