const fs = require('fs')
const path = require('path')
const { runWorker } = require('../workers/initiateWorker')

let gradeReports
let allGradeDataCache

module.exports = {
  getGradeData,
  getGradeReportsForCourses
}

loadStaticFiles()

function loadStaticFiles () {
  // Load gradeReports.json if it exists
  const gradeReportsPath = path.resolve(__dirname, './staticData/gradeReports.json')
  if (doesFileExist(gradeReportsPath)) {
    gradeReports = require(gradeReportsPath)
  }

  // Load allGradeData.json if it exists
  const allGradeDataPath = path.resolve(__dirname, './staticData/allGradeData.json')
  if (doesFileExist(allGradeDataPath)) {
    allGradeDataCache = require(allGradeDataPath)
  }
}

// function to check if a file exists
function doesFileExist (filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (err) {
    return false
  }
}

async function getGradeData () {
  if (!allGradeDataCache) {
    // Fetch data from the remote site using the worker since the JSON file doesn't exist
    allGradeDataCache = await runWorker('./jsonDataFetcher.js')
  }

  return allGradeDataCache
}

async function getGradeReportsForCourses () {
  if (!gradeReports) {
    // Compute grade reports using the worker since the JSON file doesn't exist
    gradeReports = await runWorker('./gradeReporter.js', {
      data: await getGradeData()
    })
  }

  return gradeReports
}
