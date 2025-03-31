const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const { DDB_TABLE_NAME } = process.env;

const UpdateDynamoDB = async function (id) {
  try {
    const command = new UpdateCommand({
      TableName: DDB_TABLE_NAME,
      Key: {
        PK: id,
        SK: "total",
      },
      UpdateExpression: `SET votes = if_not_exists(votes, :default_votes) + :value`,
      ExpressionAttributeValues: {
        ":default_votes": 0,
        ":value": 1,
      },
    });

    await ddb.send(command);
    console.log('Update DynamoDB Success');
    return {};
  } catch (err) {
    console.error('Update DynamoDB Error: ', err);
    throw err;
  }
}

exports.handler = async (event) => {
  try {
    console.log(JSON.stringify(event));
    
    // Process SQS messages in batch, up to 10 records in each batch
    for (const record of event.Records) {
      const messageId = record.messageId;
      console.log("MessageId: ", messageId);
        
      // SQS record body includes entire API POST request
      const recordBody = JSON.parse(record.body);
      console.log("SqsRecordBody: ", JSON.stringify(recordBody));

      // Example body from API POST request: {"id":"dog"}
      const requestBody = JSON.parse(recordBody.body);
      await UpdateDynamoDB(requestBody.id);
    }

    return;
  } catch (error) {
    console.error('Handler Error:', error);
    throw error;
  }
}