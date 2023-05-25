// TODO: For now, since the data is not changing, we are storing in memory (without any periodic refresh).
// TODO: This can be changed to use a cache like Redis and refresh periodically. Since Redis server is not provided, we are not using it.
const { runWorker } = require('../workers/initiateWorker')

let gradeReports = null
let allGradeDataCache = null

module.exports = {
  getGradeData,
  getGradeReportsForCourses
}

async function getGradeData () {
  allGradeDataCache = allGradeDataCache || await runWorker('./jsonDataFetcher.js')
  // store `allGradeDataCache` somewhere and refresh periodically, but for now, just store in memory

  return allGradeDataCache
}

async function getGradeReportsForCourses () {
  gradeReports = gradeReports || await runWorker('./gradeReporter.js', {
    data: await getGradeData()
  })
  // store `gradeReports` somewhere and refresh periodically, but for now, just store in memory

  return gradeReports
}
