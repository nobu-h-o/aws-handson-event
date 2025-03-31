const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const { DDB_TABLE_NAME } = process.env;

const UpdateDynamoDB = async function (id) {
  try {
      await ddb.send(new UpdateCommand({
        TableName: DDB_TABLE_NAME,
        Key: { PK: id, SK: "total" },
        UpdateExpression: "SET votes = if_not_exists(votes, :default_votes) + :value",
        ExpressionAttributeValues: {
          ":default_votes": 0,
          ":value": 1
        }
      }));
    console.log('Update DynamoDB Success');
    return {};
  } catch (err) {
    console.error('Update DynamoDB Error: ', err);
    return {};
  }
}

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  let response = {};

  if (event.httpMethod === "POST") {
    // Example body from API POST request: {"id":"dog"}
    const body = JSON.parse(event.body);
    const data = await UpdateDynamoDB(body.id);
    
    response = {
      statusCode: 200,
      // Response includes required CORS headers.
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      // Body should be JSON stringified.
      body: JSON.stringify(data),
    }
  }

  console.log("Response: ", JSON.stringify(response));
  return response;
}