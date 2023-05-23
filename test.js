const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

const studentWithId1 = {
  id: 1,
  first_name: 'Scotty',
  last_name: 'Quigley',
  email: 'Scotty79@hotmail.com',
  is_registered: 1,
  is_approved: 1,
  address: '241 Denesik Knolls Apt. 955',
  city: 'Buffalo',
  state: 'ME',
  zip: '04710',
  phone: '1-503-560-6954',
  created: '1628767983203.0',
  last_login: '1628770445749.0',
  ip_address: '2.137.18.155'
}

const gradesForStudentWithId1 = [
  {
    course: 'Calculus',
    grade: 50
  },
  {
    course: 'Microeconomics',
    grade: 43
  },
  {
    course: 'Statistics',
    grade: 50
  },
  {
    course: 'Astronomy',
    grade: 63
  }
]

tape('health', async function (t) {
  const url = `${endpoint}/health`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database; did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(data.success, 'should have successful healthcheck')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('get student with a valid id 1', async function (t) {
  const url = `${endpoint}/student/1`
  try {
    const { data, response } = await jsonist.get(url)
    t.equal(response.statusCode, 200, 'should have status code 200')
    t.equal(data.id, 1, 'should have id 1')
    t.deepEquals(data, studentWithId1, 'should have same data')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('get student with invalid id', async function (t) {
  const url = `${endpoint}/student/:id`
  try {
    const { response } = await jsonist.get(url)
    t.equal(response.statusCode, 400, 'should have status code 400')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('get grades report for student with a valid id 1', async function (t) {
  const url = `${endpoint}/student/1/grades`
  try {
    const { data, response } = await jsonist.get(url)
    t.equal(response.statusCode, 200, 'should have status code 200')
    t.deepEqual(data.student, studentWithId1, 'should have same student data')
    t.deepEqual(
      data.grades,
      gradesForStudentWithId1,
      'should have same grades data'
    )
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('get grades report for student with invalid id', async function (t) {
  const url = `${endpoint}/student/:id/grades`
  try {
    const { response } = await jsonist.get(url)
    t.equal(response.statusCode, 400, 'should have status code 400')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('get grades report for student with non-existing id', async function (t) {
  const url = `${endpoint}/student/9999999999999/grades`
  try {
    const { response } = await jsonist.get(url)
    t.equal(response.statusCode, 404, 'should have status code 404')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('cleanup', function (t) {
  server.closeDB()
  server.close()
  t.end()
})
