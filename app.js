const awsServerlessExpress = require('aws-serverless-express');
const express = require("express");
const axios = require("axios");
const swaggerUi = require("swagger-ui-express");
const swaggerParser = require("swagger-parser");
const app = express();

let axiosInstance;
if (process.env.GITHUB_TOKEN) {
  axiosInstance = axios.create({
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  });
} else {
  axiosInstance = axios.create();
}

// Middleware to parse the OpenAPI specification
app.use("/api-docs", async (req, res, next) => {
    try {
        const specification = await swaggerParser.parse("./openapi.yaml");
        req.openapi = specification;
        next();
      } catch (error) {
        console.error(error);
        res.status(500).send("Error parsing OpenAPI specification");
      }
});

// Serve API documentation using Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerUrl: "/openapi.yaml" })
);

app.get("/openapi.yaml", (req, res) => {
    res.sendFile(__dirname + "/openapi.yaml");
});

app.get("/", (req, res) => {
    res.send(
        "ChatGPT plugin to get insights of a certain GitHub public repository"
      );
});

app.get("/repositories/:username", (req, res) => {
    const username = req.params.username;
    axiosInstance
      .get(`https://api.github.com/users/${username}/repos`)
      .then((response) => {
        const repositories = response.data.map((repo) => repo.name);
        res.json(repositories);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.data) {
          // Send the original error message from the GitHub API to the client
          res.status(500).send(error.response.data);
        } else {
          // If there is no original error message, send a generic error message
          res.status(500).send("Error retrieving files");
        }
      });
});

app.get("/repositories/:username/:repo/files/*", (req, res) => {
    const username = req.params.username;
    const repo = req.params.repo;
    const filePath = req.params[0];
    axiosInstance
      .get(
        `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`
      )
      .then((response) => {
        const content = Buffer.from(response.data.content, "base64").toString(
          "utf-8"
        );
        res.send(content);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.data) {
          // Send the original error message from the GitHub API to the client
          res.status(500).send(error.response.data);
        } else {
          // If there is no original error message, send a generic error message
          res.status(500).send("Error retrieving files");
        }
      });
});

const getFiles = async (username, repo, path = "") => {
    let files = [];

    try {
      const response = await axiosInstance.get(
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

app.get("/repositories/:username/:repo/files", async (req, res) => {
  const username = req.params.username;
  const repo = req.params.repo;

  try {
    const files = await getFiles(username, repo);
    res.json(files);
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data) {
      // Send the original error message from the GitHub API to the client
      res.status(500).send(error.response.data);
    } else {
      // If there is no original error message, send a generic error message
      res.status(500).send("Error retrieving files");
    }
  }
});

app.get("/user/repos", (req, res) => {
  if (!process.env.GITHUB_TOKEN) {
    return res.status(403).send("Github token not configured in AWS Lambda");
  }

  axiosInstance
    .get("https://api.github.com/user/repos")
    .then((response) => {
      const repositories = response.data.map((repo) => repo.name);
        res.json(repositories);
    })
    .catch((error) => {
      console.error(error);
      if (error.response && error.response.data) {
        // Send the original error message from the GitHub API to the client
        res.status(500).send(error.response.data);
      } else {
        // If there is no original error message, send a generic error message
        res.status(500).send("Error retrieving repositories");
      }
    });
});

app.get("/repositories/:username/:repo/branches", (req, res) => {
  const username = req.params.username;
  const repo = req.params.repo;
  axiosInstance
    .get(`https://api.github.com/repos/${username}/${repo}/branches`)
    .then((response) => {
      const branches = response.data.map((branch) => branch.name);
      res.json(branches);
    })
    .catch((error) => {
      console.error(error);
      if (error.response && error.response.data) {
        // Send the original error message from the GitHub API to the client
        res.status(500).send(error.response.data);
      } else {
        // If there is no original error message, send a generic error message
        res.status(500).send("Error retrieving branches");
      }
    });
});

app.get("/repositories/:username/:repo/branches/*/files", async (req, res) => {
  const username = req.params.username;
  const repo = req.params.repo;
  const branch = req.params[0];  // Access the branch parameter

  const url = `https://api.github.com/repos/${username}/${repo}/git/ref/heads/${branch}`;

  try {
    // Get the branch reference
    const refResponse = await axiosInstance.get(url);
    const treeSha = refResponse.data.object.sha;

    // Get the tree
    const treeUrl = `https://api.github.com/repos/${username}/${repo}/git/trees/${treeSha}?recursive=1`;
    const treeResponse = await axiosInstance.get(treeUrl);
    const files = treeResponse.data.tree.map((file) => file.path);
    res.json({files, url, treeUrl});
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data) {
      // Send the original error message from the GitHub API to the client
      res.status(500).send({message: error.response.data, url});
    } else {
      // If there is no original error message, send a generic error message
      res.status(500).send({message: "Error retrieving files", url});
    }
  }
});

app.get("/repositories/:username/:repo/contents", (req, res) => {
  const username = req.params.username;
  const repo = req.params.repo;
  const filepath = req.query.filepath;  // Get the filepath from the query string
  const branch = req.query.branch;  // Get the branch from the query string

  const url = `https://api.github.com/repos/${username}/${repo}/contents/${filepath}?ref=${branch}`;

  axiosInstance
    .get(
      `https://api.github.com/repos/${username}/${repo}/contents/${filepath}?ref=${branch}`
    )
    .then((response) => {
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      res.send(content);
    })
    .catch((error) => {
      console.error(error);
      if (error.response && error.response.data) {
        // Send the original error message from the GitHub API to the client
        res.status(500).send(error.response.data);
      } else {
        // If there is no original error message, send a generic error message
        res.status(500).send("Error retrieving file");
      }
    });
});

app.get("/.well-known/manifest.json", (req, res) => {
    const pluginInfo = {
        schema_version: "v1",
        name_for_human: "GitHub plugin",
        name_for_model: "github_plugin",
        description_for_human:
            "This plugin allows you to fetch user repositories and file contents from GitHub.",
        description_for_model:
            "This plugin enhances ChatGPT's capabilities by fetching user repositories and file contents from GitHub using the GitHub API. It allows users to inquire about the purpose or functionality of a repository. The plugin analyzes the repository's files, starting with the README file, to provide a comprehensive understanding of the repository's purpose. If the README file is absent or lacks sufficient explanation, the plugin intelligently explores other files such as index, app, main, and more to infer the repository's intended purpose. With this functionality, users can obtain detailed insights into the repositories they are interested in.",
        auth: {
            type: "none",
        },
        api: {
            type: "openapi",
            url: "<your_AWS_API_Gateway_URL>/openapi.yaml",
            is_user_authenticated: false,
        },
        logo_url:
            "<any_image_url_suggested_size_512x512>",
        contact_email: "support@example.com",
        legal_info_url: "http://www.example.com/legal",
    };
    res.json(pluginInfo);
});

// Export the app for AWS Serverless Express
module.exports = app;
