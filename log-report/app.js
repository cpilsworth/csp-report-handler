import CloudWatchLogs from "aws-sdk/clients/cloudwatchlogs";

let logs = new CloudWatchLogs();

const group = process.env.LOG_GROUP;
const stream = process.env.AWS_LAMBDA_LOG_STREAM_NAME;

/** @type string */
let seq;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.handler = async (event, context) => {
  console.log(JSON.stringify(event));
  try {
    if (!seq) {
      await createLogStream(logs, group, stream);
    }

    const result = await logEvent(logs, group, stream, seq, event.body);
    seq = result.nextSequenceToken;

    return {
      statusCode: 204,
      body: "",
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

/**
 * Create the log stream for a lambda instance
 * @param {CloudWatchLogs} logs - api client
 * @param {string} group - log group name
 * @param {string} stream - log stream name
 */
async function createLogStream(logs, group, stream) {
  var params = {
    logGroupName: group,
    logStreamName: stream,
  };
  return logs.createLogStream(params).promise();
}

/**
 * Log the given event
 * @param {CloudWatchLogs} logs - log api client
 * @param {string} group - log group name
 * @param {string} stream - log stream name
 * @param {string=} seq - log sequence token, null for first call
 * @param {string} event - event description
 */
async function logEvent(logs, group, stream, seq, event) {
  let params = {
    logEvents: [
      {
        message: event,
        timestamp: Date.now(),
      },
    ],
    logGroupName: group,
    logStreamName: stream,
    sequenceToken: seq,
  };
  if (seq) {
    params = { ...params, sequenceToken: seq };
  }
  console.log(params);
  return logs.putLogEvents(params).promise();
}
