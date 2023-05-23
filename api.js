const axios = require('axios')

const knex = require('./db')

const {
  sendErrorResponse,
  formatAndThrowError
} = require('./utils/errorHandler')

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
    await knex('students').first()
    res.json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudentById (id) {
  if (!id || id === ':id') {
    formatAndThrowError(400, 'Student id is required.')
  }

  const student = await knex('students').where({ id }).first()

  if (!student) formatAndThrowError(404, 'Student not found.')

  delete student.password_hash
  return student
}

async function getStudent (req, res, next) {
  try {
    const { id } = req.params

    const student = await getStudentById(id)
    res.status(200).json(student).end()
  } catch (e) {
    sendErrorResponse(e, req, res, next)
  }
}

async function getStudentGradesReport (req, res, next) {
  try {
    const { id } = req.params
    const student = await getStudentById(id)

    if (!allGradeDataCache) {
      // if grades are not cached, fetch them from the server
      const { data } = await axios.get(
        'https://outlier-coding-test-data.onrender.com/grades.json'
      )
      allGradeDataCache = data
    }

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
  throw new Error('This method has not been implemented yet.')
}
