import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { parseUserId } from '../../auth/utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization
  const split = authHeader.split(' ')
  const token = split[1]

  const todoId = uuid.v4()
  const userId = parseUserId(token)

  const item = {
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,  
    ...newTodo
  }

  // TODO: Implement creating a new TODO item
  await docClient.put({
    TableName: todosTable,
    Item: item
  }).promise()

  return {
    statusCode: 201,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item
    })
  }

}

