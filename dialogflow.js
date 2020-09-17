const dialogflow = require("dialogflow");
const uuid = require("uuid");
const config = require("./config");

const sessionIds = new Map();

function setSessionAndUser(senderID) {
  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v1());
  }
}

const credentials = {
  client_email: config.GOOGLE_CLIENT_EMAIL,
  private_key: config.GOOGLE_PRIVATE_KEY,
};

const sessionClient = new dialogflow.SessionsClient({
  projectId: config.GOOGLE_PROJECT_ID,
  credentials,
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function sendToDialogFlow(sender, msg, params) {
  let textToDialogFlow = msg;
  setSessionAndUser(sender);
  try {
    const sessionPath = sessionClient.sessionPath(
      config.GOOGLE_PROJECT_ID,
      sessionIds.get(sender)
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textToDialogFlow,
          languageCode: config.DF_LANGUAGE_CODE,
        },
      },
      queryParams: {
        payload: {
          data: params,
        },
      },
    };
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    let defaultResponses = [];
    if (result.action !== "input.unknown") {
      result.fulfillmentMessages.forEach((element) => {
        if (element.platform === source) {
          defaultResponses.push(element);
        }
      });
    }
    if (defaultResponses.length > 0) {
      result.fulfillmentMessages = defaultResponses;
      return result;
    }
    return result;
    // console.log("se enviara el resultado: ", result);
  } catch (e) {
    console.log("error");
    console.log(e);
  }
}

module.exports = {
  sendToDialogFlow,
};
