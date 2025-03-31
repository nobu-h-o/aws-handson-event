const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({});
const { SQS_QUEUE_URL } = process.env;

const PublishSqs = async function (message) {
  try {
    const command = new SendMessageCommand({
      MessageBody: message,
      QueueUrl: SQS_QUEUE_URL
    });

    const results = await sqs.send(command);
    console.log('Publish SQS Success');
    return results;
  } catch (err) {
    console.error('Publish SQS Error: ', err);
    throw err;
  }
}

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify({ message: "Method not allowed" })
      };
    }

    const data = await PublishSqs(JSON.stringify(event));
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
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
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
}