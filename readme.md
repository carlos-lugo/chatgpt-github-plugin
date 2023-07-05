# GitHub Plugin for ChatGPT - AWS Manual Deploy

This repository contains a plugin for ChatGPT that interacts with the GitHub API. It can fetch information about GitHub repositories, including the list of repositories, branch and files in a repository, and the content of a specific file.

## Installation

Here are the steps to deploy this plugin on AWS Lambda and API Gateway:

1. **Clone the repository**

   First, you need to clone the repository to your local machine. You can do this with the following command:

   ```
   git clone https://github.com/carlos-lugo/chatgpt-github-plugin.git
   ```

   Then, switch to the `aws-manual-deploy` branch:

   ```
   git checkout aws-manual-deploy
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

   In the routes section of your API, create a new route for each endpoint in your application. Set the integration target to the ARN of your Lambda function.

10. **Deploy the API**

    Finally, you need to deploy your API. In the deployments section of your API, create a new deployment. Once the deployment is complete, you will be given a URL for your API.

And that's it! Your ChatGPT GitHub plugin is now deployed on AWS Lambda and API Gateway. You can now use this API to interact with the GitHub API through ChatGPT.