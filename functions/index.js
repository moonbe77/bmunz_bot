const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
});

const { SessionsClient } = require("dialogflow");
const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body
    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionClient.sessionPath('bmunz-316708', sessionId);
    const responses = await sessionClient.detectIntent({ session, queryInput });

    const result = responses[0].queryResult;
    result.fulfillmentText
    response.send(result);
  })
})

// exports.dialogflowHook = functions.https.onRequest((request, response) => {

//   const agent = new WebhookClient({ request, response });
//   console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
//   function welcome(agent) {
//     agent.add(`Welcome to my agent!`);
//   }

//   let intentMap = new Map();
//   intentMap.set('Default Welcome Intent', welcome);
//   intentMap.set('Default Fallback Intent', fallback);
//   agent.handleRequest(intentMap);

//   // cors(request, response, async () => {
//   //   const { queryInput, sessionId } = request.body
//   //   const sessionClient = new SessionsClient({ credentials: serviceAccount });
//   //   const session = sessionClient.sessionPath('bmunz-316708', sessionId);
//   //   const responses = await sessionClient.detectIntent({ session, queryInput });



//   //   // const result = responses[0].queryResult;
//   //   // result.fulfillmentText

//   //   response.send('done');
//   // })
// })


