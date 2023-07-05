# GitHub Plugin for ChatGPT - AWS Manual Deploy

This repository contains a plugin for ChatGPT that interacts with the GitHub API. It can fetch information about GitHub repositories, including the list of repositories, branch and files in a repository, and the content of a specific file.

## Installation

Here are the steps to deploy this plugin on AWS Lambda and API Gateway:

1. **Clone the repository**

   First, you need to clone the repository to your local machine. You can do this with the following command:

   ```
   git clone https://github.com/carlos-lugo/chatgpt-github-plugin.git
   ```

2. **Install dependencies**

   Navigate to the cloned repository and install the necessary dependencies with:

   ```
   npm install
   ```

3. **Package the application**

   Next, you need to create a zip file containing your application code and dependencies. You can do this with the following command:

   ```
   zip -r function.zip .
   ```

4. **Create a Lambda function**

   In the AWS Management Console, go to the Lambda service and create a new function. You can name it whatever you like, but make sure to select "Node.js" as the runtime.

5. **Upload the zip file**

   In the function code section of your Lambda function, select "Upload from" and then "Upload a .zip file". Select the `function.zip` file you created earlier.

6. **Set the handler**

   In the same section, set the handler as `index.handler`.

7. **Add environment variables (optional)**

   If you have a GitHub token you want to use, you can add it as an environment variable in the Lambda function configuration. The key should be `GITHUB_TOKEN`.

8. **Create an API Gateway**

   In the AWS Management Console, go to the API Gateway service and create a new HTTP API. 


9. **Connect the API Gateway to the Lambda function**

   In the API Gateway console, select your API. Then, go to the "Routes" section. Here, you will define the routes for your API. 

   You'll want to create a catch-all route that will forward all requests to your Lambda function. To do this, click on "Create" and in the "Create Route" popup, enter `/{proxy+}` in the "Route" field. This creates a route that matches any path.

   For the "Integration target", select your Lambda function. This tells API Gateway to send requests to your Lambda function. 

   Make sure to select "ANY" as the method. This allows the route to match requests of any HTTP method (GET, POST, PUT, etc.).

10. **Deploy the API**

   After setting up your routes and integrations, you need to deploy your API to make it publicly accessible.

   In the API Gateway console, select "Deployments" from the left navigation menu. Click on "Create Deployment". 

   You'll be asked to select a "Stage". Stages are like environments (e.g., dev, test, prod). If you don't have a stage yet, create a new one, you might call it `prod` for production or `dev` for development.

   After you click "Create", your API is deployed and you're given an Invoke URL. This is the base URL of your API. You can now make requests to any of your routes by appending the route's path to this base URL.

   For example, if your Invoke URL is `https://abc123.execute-api.us-east-1.amazonaws.com/prod` and you have a route for `/{proxy+}`, you can access the function by making requests to `https://abc123.execute-api.us-east-1.amazonaws.com/prod/your-route-here`.

11. **Install the Plugin in ChatGPT**

   After deploying your API, you can now install the plugin in ChatGPT.

   - Look for the "Plugins" section and click on "Add Plugin".
   - You will be asked to provide the API endpoint. This is the Invoke URL of the API Gateway you deployed earlier.
   - The plugin will be automatically installed and you can now use it in your conversations with ChatGPT.

   Please note that the exact steps may vary depending on the interface provided by OpenAI for ChatGPT. The key point is to provide the API endpoint (the Invoke URL from API Gateway) when adding the plugin.

And that's it! Your ChatGPT GitHub plugin is now deployed on AWS Lambda and API Gateway. You can now use this API to interact with the GitHub API through ChatGPT.