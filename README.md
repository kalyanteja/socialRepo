# socialRepo
Fetches aggregate notifications (social feed by types like, comment etc.)

#### API end points

/feed
- It gets all the feed data i.e same as your notifications-feed.json file.

/summarizedPosts
- Gets aggregated summary of notifications per post for the user (doesn't take user input becasue we do not have data per user now)

/summarizedPosts/:id
- Gets sumarized aggregated notification per type for a given post id

/posts/:id
- Gets aggregated notification per type for a given post id

#### Deployment steps

1. make sure you have NPM and Node installed
2. clone the repo from https://github.com/kalyanteja/socialRepo
3. npm install 
4. node app.js
5. api is hosted on local port 8081 and can be accessed via the above endpoints.

#### Hosting in AWS

1. Create an Elastic Beanstalk instace chosing Node.js as paltform
2. Upload zip (consisting app.js, notifications-feed.json, package.json)
3. Make sure you have the right security configuartion (i.e allowing all outbound traffic to all ports etc.)
4. Deploy - your api should be up & ready!

#### Here's my api end point hosted on AWS ec2
http://socialapi-env.ydxaivf6hk.eu-west-2.elasticbeanstalk.com