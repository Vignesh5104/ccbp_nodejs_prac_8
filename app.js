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

const hasSearchProperty = req => {
  return req.search_q !== undefined
}
const hasStatusProperty = req => {
  return req.status !== undefined
}
const hasPriorityProperty = req => {
  return req.priority !== undefined
}
const hasPriorityAndStatusProperty = req => {
  return req.priority !== undefined && req.status !== undefined
}

//API 1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q, status, priority} = request.query

  switch (true) {
    case hasSearchProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE status = '${status}'`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}'`
      break
    case hasPriorityAndStatusProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${todoStatus}'`
      break
  }

  const todoLists = await db.all(getTodosQuery)
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
      '${todo}',
      '${priority}',
      '${status}'
    );
  `

  await db.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

//API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updateColumn = ''
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const previousTodo = await db.get(previousQuery)
  const {
    status = previousTodo.status,
    priority = previousTodo.priority,
    todo = previousTodo.todo,
  } = requestBody
  const updateQuery = `UPDATE todo 
  SET
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
  WHERE 
    id = ${todoId};
    `
  await db.run(updateQuery)
  response.send(`${updateColumn} Updated`)
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
