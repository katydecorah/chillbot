# Step by step set up

Heads up! Using Amazon Web Services (AWS) is not free, but it's very inexpensive (pennies) to run this bot.

Editors note: There are probably more efficient ways to get this bot running on AWS, but with these steps (broken into three sections) you can most likely do them once and never have to touch them again. Plus, now you'll know how all these AWS resources work together for when you build your own bot :blush:!

## 🤖 Make sure the bot works

1. Clone this repo
2. From the terminal, run:
    + `npm install`
    + `npm link`
    + Set environment variables from the terminal: https://github.com/katydecorah/chillbot#set-up
3. Test it locally, run `chillbot` from your terminal: https://github.com/katydecorah/chillbot#test-locally
4. Did you get a ping in Slack?
    + Yes! Continue to the next section to deploy the bot to AWS.
    + No. [Let's troubleshoot.](#troubleshoot)

## 🔧 Create your S3 buckets

1. Open the [Cloudformation template](https://github.com/katydecorah/chillbot/blob/master/cloudformation/chillbot.template.json) and [edit this line](https://github.com/katydecorah/chillbot/blob/master/cloudformation/chillbot.template.json#L76). Replace my name, `kdecorah`, with your own unique name.
2. Navigate to AWS console: https://console.aws.amazon.com/
3. In AWS, navigate to S3.
    + Create a new bucket `name-region`. In my case it's `kdecorah-us-east-2`.
    + Create a bucket *inside* called `chillbot`. The folder structure should follow a pattern like this: `Amazon S3 > kdecorah-us-east-2 > chillbot`
4. Continue to the next (and final) section!

## 🚀 Deploy the bot to AWS and test

1. Open `chillbot/` folder in Finder and compress/zip the files in the folder.
    + 💡 You can exclude `.git`.
    + 💡 You can name the zipped file anything you'd like. If committing this code to GitHub, a good practice is to use the git SHA (that string of numbers and letters associated with the latest commit) to stay organized. To quickly retrieve the git SHA run `git log -1 --format="%H"`.
    + 👀 [Here's a how-to gif](http://i.imgur.com/zn2fxPa.gif) where I compress the files and name the zipped file after the git SHA.
2. Navigate to AWS console: https://console.aws.amazon.com/
3. Store your code with S3:
    + Upload zipped code to your chillbot bucket
4. Create permissions, parameters, and set-up Lambda with Cloudformation:
    + In AWS, navigation to Cloudformation.
    + Click the "Create Stack" button.
    + Choose template > Choose file. Select `cloudformation/chillbot.template.json`.
    + Stack name - "ChillBot" or any name that will help you remember what this code does.
    + Parameters - enter these values as described with your information.
        + 💡 `GitSha` is the name of the zipped file you uploaded to S3. For example `mycoolbotfiles.zip` would have the value `mycoolbotfiles` for this field.
    + 👀 [Here's what my stack parameters look like](http://i.imgur.com/WoPuoMD.png) - I blurred out the secret sauce.
    + Click Next
    + Click Next again (nothing you necessary to enter on this page)
    + Check "I acknowledge that AWS CloudFormation might create IAM resources."
    + Click Create
5. Once your Cloudformation stack is created, test the bot with Lambda:
    + In AWS, navigate to Lambda.
    + Click on your chillbot function to open it.
    + Click the "Test" button. A prompt will ask if you want to pass data through - you can click through this prompt.
    + In a few seconds you should either receive a ping in Slack or a message in the Lambda console indicating that you have no streak. If the bot didn't run successfully, then Lambda will also log any errors.

## ✨ You did it!

For a few bonus steps, keep reading!

## Change the scheduling

This bot runs on Saturday and Sunday mornings at 8 am EST. If you'd like to adjust the scheduling, here's how to do it:

1. You'll need to [edit this line](https://github.com/katydecorah/chillbot/blob/master/cloudformation/chillbot.template.json#L132) in the Cloudformation template.
    + Reference: http://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
2. Cloudformation - since you edited the Cloudformation template, you need to upload it to AWS again:
    + From Cloudformation, click on chillbot stack and then "Update Stack"
    + Upload the template

💡 Whenever you edit the Cloudformation template, you'll need to upload it to your Cloudformation stack.

## Make changes to index.js

Feel like tweaking the code? Go for it! One thing you may want to customize is what [type of events you'd like to exclude](https://github.com/katydecorah/chillbot/blob/master/index.js#L18-L20) from your contributions.

Once you're done editing, here's what you'll need to do to give AWS the new code:

1. Compress/zip the files once again.
2. S3 - Upload the zipped file to your chillbot folder in S3.
3. Cloudformation - Update the chillbot stack with new `GitSha` value (the zipped file name).
4. Lambda - click the "Test" button from the chillbot function to make sure everything is working.

💡 Whenever you edit `index.js`, you'll need to zip up the code, upload it to S3, and update the Cloudformation stack with the new GitSha (file name of the zipped file).

## Troubleshoot

* Do you currently have a GitHub contribution streak? Try adjusting the `streak` value.
* If you don't currently have a streak (and everything is set up correctly) the command line should read `No streak, no Slack post.` This is a good sign, it means that everything is set up correctly. You just don't have a streak right now. You can continue to the section.
* If you're in more than one Slack, be sure that you're getting the webhook for the right channel.
* Double check the Slack channel you're posting to: private channels begin with an `@` and public channels begin with a `#`.
* Make sure you GitHub username is correct - no `@` prefix.
