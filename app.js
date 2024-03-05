const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started...')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initDBandServer()

//API 1
app.get('/todos/', async (request, response) => {
  let data = null
  const {search_q = '', status = '', priority = ''} = request.query

  const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE
          todo LIKE '%${search_q}%' 
          AND status = '${status}'
          AND priority = '${priority}';
    `
  const todoLists = await db.all(getTodoQuery)
  response.send(todoLists)
})

//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
    SELECT * FROM
      todo
    WHERE
      id = ${todoId};
  `
  const oneTodo = await db.get(getTodoQuery)
  response.send(oneTodo)
})

//API 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postTodoQuery = `
    INSERT INTO todo(
      id,
      todo,
      priority,
      status
    ) VALUES (
      ${id},
      '${todo}'
      '${priority}'
      '${status}'
    );
  `

  await db.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

//API 4
app.put('/todos/:todoId/', (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo} = request.body
})

//API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE
      id=${todoId};
  `

  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
