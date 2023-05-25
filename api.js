const { sendErrorResponse } = require('./utils/errorHandler')
const databaseHandler = require('./dataLayer/databaseHandler')
const { getGradeData, getGradeReportsForCourses } = require('./dataLayer/cacheHandler')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
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

    const allGradeData = await getGradeData()

    // Find the matching grade record for the student and trim id from each record to avoid duplicacy
    const grades = allGradeData
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
    const report = await getGradeReportsForCourses()
    return res.status(200).json(report)
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}
