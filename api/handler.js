'use strict';

module.exports.hello = async (event, context) => {
  console.log('hello handler!');
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v3.0! Your function executed successfully!',
      event,
      context,
    }),
  };
};
