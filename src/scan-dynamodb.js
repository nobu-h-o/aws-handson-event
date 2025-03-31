const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const { DDB_TABLE_NAME } = process.env;

const ScanDynamoDB = async function () {
  try {
    const command = new ScanCommand({
      TableName: DDB_TABLE_NAME
    });
    
    const results = await ddb.send(command);
    console.log('Scan DynamoDB Success');
    return results.Items.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error('Scan DynamoDB Error: ', err);
    throw err;
  }
}

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  
  try {
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify({ message: "Method not allowed" })
      };
    }

    const data = await ScanDynamoDB();
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Handler Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
}