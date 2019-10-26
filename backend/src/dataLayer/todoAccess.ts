import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.TODOS_INDEX_NAME) {
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient.query({
        TableName : this.todosTable,
        IndexName : this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
      }).promise()
    
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: todo
    }).promise()
    return todo
  }

  async updateTodo(todoId: string, todo: TodoUpdate): Promise<TodoUpdate> {
    const updateParams = {
        TableName: this.todosTable,
        Key: { "todoId": todoId },
        UpdateExpression: "set #n = :a, dueDate = :b, done = :c",
        ExpressionAttributeValues:{
          ":a": todo.name,
          ":b": todo.dueDate,
          ":c": todo.done
        },
        ExpressionAttributeNames:{
          "#n": "name"
        },
        ReturnValues:"UPDATED_NEW"
    }
    
    const updated = await this.docClient.update(updateParams).promise()
    return updated.Attributes as TodoUpdate  
  }

  async deleteTodo(todoId: string): Promise<string> {
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          todoId
        }
    }).promise()   
    return todoId 
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}