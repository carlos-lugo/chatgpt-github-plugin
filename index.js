const axios = require('axios');
const swaggerParser = require('swagger-parser');
const fs = require('fs');
const path = require('path');

const getFiles = async (username, repo, path = "") => {
  let files = [];

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repo}/contents/${path}`
    );

    for (const file of response.data) {
      if (file.type === "dir") {
        files.push({
          name: file.name,
          files: await getFiles(username, repo, file.path),
        });
      } else if (file.type === "file") {
        files.push(file.name);
      }
    }

    return files;
  } catch (error) {
    console.error(error);
  }
};

exports.handler = async (event, context) => {
    let response = {};
    const { httpMethod, pathParameters, queryStringParameters } = event;

    try {
        if (httpMethod === 'GET') {
            if (pathParameters && pathParameters.username) {
                if (pathParameters.repo) {
                    if (queryStringParameters && queryStringParameters.filepath) {
                        const filePath = queryStringParameters.filepath;
                        const responseAxios = await axios.get(`https://api.github.com/repos/${pathParameters.username}/${pathParameters.repo}/contents/${filePath}`);
                        const content = Buffer.from(responseAxios.data.content, "base64").toString("utf-8");
                        response = {
                            statusCode: 200,
                            body: JSON.stringify(content),
                        };
                    } else {
                        const files = await getFiles(pathParameters.username, pathParameters.repo);
                        response = {
                            statusCode: 200,
                            body: JSON.stringify(files),
                        };
                    }
                } else {
                    const responseAxios = await axios.get(`https://api.github.com/users/${pathParameters.username}/repos`);
                    const repositories = responseAxios.data.map((repo) => repo.name);
                    response = {
                        statusCode: 200,
                        body: JSON.stringify(repositories),
                    };
                }
            } else if (queryStringParameters && queryStringParameters.openapi) {
                const specification = await swaggerParser.parse("./openapi.yaml");
                response = {
                    statusCode: 200,
                    body: JSON.stringify(specification),
                };
            } else {
                response = {
                    statusCode: 200,
                    body: "ChatGPT plugin to get insights of a certain GitHub public repository",
                };
            }
        } else {
            response = {
                statusCode: 400,
                body: 'Invalid Request',
            };
        }
    } catch (err) {
        console.error(err);
        response = {
            statusCode: 500,
            body: 'Error processing your request',
        };
    }

    return response;
};
