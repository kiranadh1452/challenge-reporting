const { runWorker } = require('./workers/initiateWorker')
const { sendErrorResponse } = require('./utils/errorHandler')
const databaseHandler = require('./dataLayer/databaseHandler')

// since grades do not change and isn't much, we'll fetch them only once and then cache the record
let gradeReports = null
let allGradeDataCache = null

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

// helper function to fetch grades data and cache it
async function cacheGradeData () {
  if (!allGradeDataCache) {
    allGradeDataCache = await runWorker('./jsonDataFetcher.js')
  }
}

async function getHealth (req, res, next) {
  try {
    const data = await databaseHandler.getHealth()
    return res.json(data)
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudent (req, res, next) {
  try {
    const { id } = req.params

    const student = await databaseHandler.getStudentById(id)
    return res.status(200).json(student).end()
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}

async function getStudentGradesReport (req, res, next) {
  try {
    const { id } = req.params
    const student = await databaseHandler.getStudentById(id)

    await cacheGradeData()

    // Find the matching grade record for the student and trim id from each record to avoid duplicacy
    const grades = allGradeDataCache
      .filter((grade) => grade.id === parseInt(id))
      .map(({ course, grade }) => ({ course, grade }))

    if (!grades.length) {
      return res
        .status(404)
        .json({ message: 'Grades not found for the student.', student })
    }

    return res.status(200).json({ student, grades })
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}

async function getCourseGradesReport (req, res, next) {
  try {
    await cacheGradeData()

    // check if we already have the grade reports cached, if not then calculate it
    gradeReports = gradeReports || await runWorker('./gradeReporter.js', {
      data: allGradeDataCache
    })

    return res.status(200).json(gradeReports)
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}
