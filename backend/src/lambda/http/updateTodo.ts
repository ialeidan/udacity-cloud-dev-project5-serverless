import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const updateParams = {
    TableName: todosTable,
    Key: { "todoId": todoId },
      UpdateExpression: "set info.name=:name, info.dueDate=:dueDate, info.done=:done",
      ExpressionAttributeValues:{
        "name": updatedTodo.name,
        "dueDate": updatedTodo.dueDate,
        "done": updatedTodo.done
      },
      ReturnValues:"UPDATED_NEW"
    }

  const updated = await docClient.update(updateParams).promise()

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return {
    statusCode: 201,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updated
    })
  }
}
