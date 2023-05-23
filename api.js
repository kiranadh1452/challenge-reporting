const axios = require('axios')
const {
  sendErrorResponse
} = require('./utils/errorHandler')
const databaseHandler = require('./dataLayer/databaseHandler')

// since grades do not change and isn't much, we'll fetch them only once and then cache the record
let allGradeDataCache = null

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

async function getHealth (req, res, next) {
  try {
    const data = await databaseHandler.getHealth()
    res.json(data)
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudent (req, res, next) {
  try {
    const { id } = req.params

    const student = await databaseHandler.getStudentById(id)
    res.status(200).json(student).end()
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}

function cacheGradeData () {
  return new Promise((resolve, reject) => {
    if (allGradeDataCache) {
      return resolve()
    }

    axios
      .get('https://outlier-coding-test-data.onrender.com/grades.json')
      .then(({ data }) => {
        allGradeDataCache = data
        resolve()
      })
      .catch(reject)
  })
}

async function getStudentGradesReport (req, res, next) {
  try {
    const { id } = req.params
    const student = await databaseHandler.getStudentById(id)

    if (!allGradeDataCache) await cacheGradeData()

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
    if (!allGradeDataCache) await cacheGradeData()

    // find highest, lowest and average grade for each course
    const courseGrades = allGradeDataCache.reduce(
      (acc, { id, course, grade }) => {
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
      },
      {}
    )

    res.status(200).json(courseGrades)
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}
