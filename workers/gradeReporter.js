const { parentPort, workerData } = require('worker_threads')

const data = workerData.data

try {
  const formattedData = data.reduce((acc, { id, course, grade }) => {
    acc[course] = acc[course] || {
      highest: grade,
      lowest: grade,
      average: grade,
      count: 0
    }

    acc[course].highest = Math.max(acc[course].highest, grade)
    acc[course].lowest = Math.min(acc[course].lowest, grade)
    acc[course].average =
      (acc[course].average * acc[course].count + grade) /
      (acc[course].count + 1)
    acc[course].count++

    return acc
  }, {})

  parentPort.postMessage({ data: formattedData })
} catch (e) {
  parentPort.postMessage({ error: e.message })
}
