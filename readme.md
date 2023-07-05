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

3. **Create an API Gateway**

   In the AWS Management Console, go to the API Gateway service and create a new HTTP API. 

4. **Deploy the API**

   After creating your API, you need to deploy it to make it publicly accessible.

   In the API Gateway console, select "Deployments" from the left navigation menu. Click on "Create Deployment". 

   You'll be asked to select a "Stage". Stages are like environments (e.g., dev, test, prod). If you don't have a stage yet, create a new one, you might call it `prod` for production or `dev` for development.

   After you click "Create", your API is deployed and you're given an Invoke URL. This is the base URL of your API. 

5. **Update API URL in app.js and openapi.yaml**

   Now that you have your API URL, you need to update the `app.js` and `openapi.yaml` files in your local repository with this URL.
   Also update the logo_url in `app.js` with any image url of your choice, suggested size is 512x512.

6. **Package the application**

   Next, you need to create a zip file containing your updated application code and dependencies. You can do this with the following command:

   ```
   zip -r function.zip .
   ```

7. **Create a Lambda function**

   In the AWS Management Console, go to the Lambda service and create a new function. You can name it whatever you like, but make sure to select "Node.js" as the runtime.

8. **Upload the zip file**

   In the function code section of your Lambda function, select "Upload from" and then "Upload a .zip file". Select the `function.zip` file you created earlier.

9. **Set the handler**

    In the same section, set the handler as `index.handler`.

10. **Add environment variables (optional)**

    If you have a GitHub token you want to use, you can add it as an environment variable in the Lambda function configuration. The key should be `GITHUB_TOKEN`.

11. **Connect the API Gateway to the Lambda function**

    Now, go back to your API Gateway and set up the route to connect to your Lambda function.
    
    In the API Gateway console, select your API. Then, go to the "Routes" section. Here, you will define the routes for your API. 

    You'll want to create a catch-all route that will forward all requests to your Lambda function. To do this, click on "Create" and in the "Create Route" popup, enter `/{proxy+}` in the "Route" field. This creates a route that matches any path.

    For the "Integration target", select your Lambda function. This tells API Gateway to send requests to your Lambda function. 

    Make sure to select "ANY" as the method. This allows the route to match requests of any HTTP method (GET, POST, PUT, etc.).

12. **Install the Unverified Plugin in ChatGPT**
   
    After deploying your API, you can now install the plugin in ChatGPT as an unverified plugin.
   
    Look for the "Plugins" section and click on "Develop your own plugin".
    You will be asked to provide the API endpoint. This is the Invoke URL of the API Gateway you deployed earlier.
    The plugin will be automatically installed and you can now use it in your conversations with ChatGPT.
    Please note that the exact steps may vary depending on the interface provided by OpenAI for ChatGPT. The key point is to provide the API endpoint (the Invoke URL from API Gateway) when adding the plugin.

# **⚠️ Warning**

Do not share your API endpoint (Invoke URL): This URL is the entry point to your backend service. Sharing this URL publicly could expose your service to potential security risks and costs:

   - Unauthorized Access: If your API endpoint is public, anyone can make requests to it. This could lead to unauthorized access to any data or functionality that your API provides. If your API interacts with other services (like GitHub in this case), unauthorized users could potentially access or manipulate that data.
   - Rate Limiting: Most APIs have some form of rate limiting to prevent abuse. If your API endpoint is public, it could be hit with a large number of requests, potentially leading to your legitimate requests being rate-limited or even blocked.
   - Resource Exhaustion: Each request to your API consumes some amount of resources (CPU, memory, etc.). A large number of requests could exhaust your resources, leading to degraded performance or even downtime.
   - Costs: If you're using a cloud provider like AWS, you're charged based on the number of requests and the amount of compute time used. Unauthorized and massive use of your API could lead to unexpected costs of potentially thousand of dollars
   - Be cautious with your GitHub token: If you use a GitHub token, it will have the same permissions as your GitHub account. Be careful not to expose this token as it could lead to unauthorized access to your GitHub account. Always store sensitive information like this in secure and encrypted storage.

And that's it! Your ChatGPT GitHub plugin is now deployed on AWS Lambda and API Gateway. You can now use this API to interact with the GitHub API through ChatGPT.