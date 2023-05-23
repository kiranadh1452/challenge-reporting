const knex = require('../db')
const { formatAndThrowError } = require('../utils/errorHandler')

module.exports = {
  getStudentById,
  getHealth
}

async function getHealth () {
  try {
    await knex('students').first()
    return { success: true }
  } catch (e) {
    console.log(e)
    return { success: false }
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
