const path = require('path')
const { Worker } = require('worker_threads')

module.exports = {
  runWorker
}

function runWorker (fileName, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, fileName), {
      workerData: data
    })

    worker.on('message', (message) => {
      if (message.error) {
        reject(new Error(message.error))
      } else {
        resolve(message)
      }
      worker.terminate()
    })

    worker.on('error', (err) => {
      reject(err)
      worker.terminate()
    }
    )

    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
    })
  })
}
