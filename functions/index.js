const functions = require("firebase-functions");
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Carousel } = require('actions-on-google');
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
const { SessionsClient } = require("dialogflow");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
});

const logoUrl = 'https://bmunz.dev/figma/bmunz.svg';
const linkUrl = 'tel:0481129786';

function welcome(agent) {
  agent.add(`Welcome to bMunz Bot`);
  agent.add(`I can help you to get Bernardo's contact details`);
  agent.add(new Suggestion(`change text color!!`));
  agent.add(new Suggestion(`contact details!!`));
  agent.add(new Suggestion(`bot stack!!`));
}

function fallback(agent) {
  console.info('<<<< fallback agent>>>>');
  agent.add(`I didn't understand`);
  agent.add(`I'm sorry, can you try again?`);
}

function contactDetails(agent) {
  console.info('<<<< contact detail agent>>>>');
  agent.add(`Contact Details List`);
  agent.add(`munzbe@gmail.com`);
  agent.add(`+61 481 129 786`);
  agent.add(`linkedin`);
  agent.add(`twitter`);
}

// function googleAssistantContactCard(agent) {
//   let conv = agent.conv()
//   console.log(agent); // Get Actions on Google library conversation object
//   conv.ask('Please choose an item:'); // Use Actions on Google library to add responses
//   conv.ask(new Carousel({
//     title: 'Google Assistant',
//     items: {
//       'WorksWithGoogleAssistantItemKey': {
//         title: 'Works With the Google Assistant',
//         description: 'If you see this logo, you know it will work with the Google Assistant.',
//         image: {
//           url: imageUrl,
//           accessibilityText: 'Works With the Google Assistant logo',
//         },
//       },
//       'GoogleHomeItemKey': {
//         title: 'Google Home',
//         description: 'Google Home is a powerful speaker and voice Assistant.',
//         image: {
//           url: imageUrl2,
//           accessibilityText: 'Google Home'
//         },
//       },
//     },
//   }));
//   // Add Actions on Google library responses to your agent's response
//   agent.add(conv);
// }

function otherContactCard(agent) {
  console.info('<<<<< otherContactCard agent>>>>>');
  agent.add(`This message is from Dialogflow's Cloud Functions !`);
  agent.add(new Card({
    title: `Contact Me`,
    imageUrl: logoUrl,
    text: `✉: munzbe@gmail.com \n\n 📞: +61 481 129 786 \n 🔗:https://www.linkedin.com/in/munzbe/ \n 🐤:https://twitter.com/moonbe77 `,
    buttonText: 'Call me',
    buttonUrl: linkUrl
  })
  );
  agent.add(new Suggestion(`change text color`));
  agent.add(new Suggestion(`Suggestion 2`));
  agent.add(new Suggestion(`bot stack`));
  agent.context.set({ name: 'followup_welcome', lifespan: 2, parameters: { name: 'toto' } });
}

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async function () {
    const { queryInput, sessionId } = request.body;
    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionClient.sessionPath("bmunz-316708", sessionId);
    const responses = await sessionClient.detectIntent({ session, queryInput });
    const result = responses[0].queryResult;
    result.fulfillmentText;
    response.send(result);
  });
});

exports.dialogflowHook = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('contact.details', otherContactCard);
  intentMap.set('contact.card', otherContactCard);

  // if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
  //   intentMap.set('contact.card', googleAssistantContactCard);
  // } else {
  //   intentMap.set('contact.card', otherContactCard);
  // }
  agent.handleRequest(intentMap);
})