process.env.LOG_GROUP = "/report/csp/test"
process.env.AWS_LAMBDA_LOG_STREAM_NAME = `unit-test-${Date.now()}`;
process.env.AWS_REGION = "eu-west-1"

const app = require('../../index.js');
const chai = require('chai');
const event = require('../../../events/event.json');
const expect = chai.expect;
var context;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await app.handler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(204);

        const result2 = await app.handler(event, context)
    });
});
