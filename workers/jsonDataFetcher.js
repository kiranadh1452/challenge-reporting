const axios = require('axios')
const { parentPort } = require('worker_threads')

const urlOfJsonGradesData = 'https://outlier-coding-test-data.onrender.com/grades.json'

function fetchGradesData () {
  axios
    .get(urlOfJsonGradesData)
    .then(({ data }) => {
      parentPort.postMessage(data)
    })
    .catch((error) => {
      console.log(error)
      parentPort.postMessage({ error: error.message })
    })
}

fetchGradesData()
