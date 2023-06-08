const express = require("express");
const axios = require("axios");
const swaggerUi = require("swagger-ui-express");
const swaggerParser = require("swagger-parser");
const app = express();

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
  axios
    .get(`https://api.github.com/users/${username}/repos`)
    .then((response) => {
      const repositories = response.data.map((repo) => repo.name);
      res.json(repositories);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error retrieving repositories");
    });
});

app.get("/repositories/:username/:repo/files/*", (req, res) => {
  const username = req.params.username;
  const repo = req.params.repo;
  const filePath = req.params[0];
  axios
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
      res.status(500).send("Error retrieving file content");
    });
});

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

app.get("/repositories/:username/:repo/files", async (req, res) => {
  const username = req.params.username;
  const repo = req.params.repo;

  try {
    const files = await getFiles(username, repo);
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving files");
  }
});

// Add entry point for /.well-known/manifest.json
app.get("/.well-known/ai-plugin.json", (req, res) => {
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
      url: "https://sdbquq-3000.csb.app/openapi.yaml",
      is_user_authenticated: false,
    },
    logo_url:
      "https://img.favpng.com/15/4/18/budgerigar-bird-parrot-parakeet-clip-art-png-favpng-3ehJdY4H8aPTKiDvvpqY4sNRW.jpg",
    contact_email: "support@example.com",
    legal_info_url: "http://www.example.com/legal",
  };
  res.json(pluginInfo);
});

app.listen(3000, () => {
  console.log("Servidor en funcionamiento en el puerto 3000");
});
