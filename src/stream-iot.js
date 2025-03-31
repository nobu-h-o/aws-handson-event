const { IoTDataPlaneClient, PublishCommand } = require("@aws-sdk/client-iot-data-plane");
const { IOT_ENDPOINT, IOT_TOPIC } = process.env;

const iot = new IoTDataPlaneClient({ 
  endpoint: `https://${IOT_ENDPOINT}` // httpsスキーマを追加
});

exports.handler = async (event) => {
  try {
    console.log(JSON.stringify(event));
    console.log("IOT_ENDPOINT: ", IOT_ENDPOINT);
    console.log("IOT_TOPIC: ", IOT_TOPIC);

    const data = event.Records.map(record => {
      return {
        id: record.dynamodb.Keys.PK.S,
        votes: record.dynamodb.NewImage.votes.N
      }
    });

    // Data received from DyanmoDB stream is published to the an IoT topic for real-time updates.
    const command = new PublishCommand({
      topic: IOT_TOPIC,
      payload: Buffer.from(JSON.stringify(data))
    });

    const result = await iot.send(command);
    console.log("Result: ", JSON.stringify(result));
    
    return;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}