const knex = require('../db')
const { formatAndThrowError } = require('../utils/errorHandler')

// Which fields to include in response to the user
const userDataFieldsToIncludeInResponse = [
  'id',
  'first_name',
  'last_name',
  'email',
  'is_registered',
  'is_approved',
  'address',
  'city',
  'state',
  'zip',
  'phone',
  'created',
  'last_login',
  'ip_address'
]

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

async function getStudentById (id, fieldsToInclude = userDataFieldsToIncludeInResponse) {
  if (!id || id === ':id') {
    formatAndThrowError(400, 'Student id is required.')
  }

  const student = await knex('students').where({ id }).first()

  if (!student) formatAndThrowError(404, 'Student not found.')

  // remove those fields from student which are not in the array `fieldsToInclude`
  Object.keys(student).forEach((key) => {
    if (!fieldsToInclude.includes(key)) {
      delete student[key]
    }
  })

  return student
}
