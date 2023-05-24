const axios = require('axios')
const { parentPort, workerData } = require('worker_threads')

axios
  .get(workerData.url)
  .then(({ data }) => {
    parentPort.postMessage(data)
  })
  .catch((error) => {
    console.log(error)
    parentPort.postMessage({ error: error.message })
  })
