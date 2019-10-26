import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getTodos(token: string): Promise<TodoItem[]> {
    const userId = parseUserId(token)
    return await todoAccess.getTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,  
    ...createTodoRequest
  })
}

export async function updateTodo(
    updatedTodo: UpdateTodoRequest,
    todoId: string
): Promise<TodoUpdate> {
    const todo: TodoUpdate = {...updatedTodo}
    return await todoAccess.updateTodo(todoId, todo)
}

export async function deleteTodo(
    todoId: string
): Promise<string> {
    return await todoAccess.deleteTodo(todoId)
}