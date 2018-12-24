const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const fs = require('fs');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
//cors
app.use(cors());
//host on the port below
app.listen(8081);

// Get all feed
app.get('/feed', function(req, resp){
    resp.send(getSocialFeedFromJSONFile());
});

//get posts summary by Id
//ref - The endpoint will at the minimum provide a GET method and accept the ID of a post and return all the aggregated notifications for that post. 
app.get('/posts/:id', function(req, resp){
    // sample post id - b1638f970c3ddd528671df76c4dcf13e
    const postId = req.params.id;
    const notificationsForPost = getNotificationsForAPost(postId);

   // if not data for a post, throw a message at the client
   if(notificationsForPost == null || notificationsForPost.length == 0){
       resp.send("Do not have any notifications for this post: " + postId);
   }

    resp.send(groupNotificationsByPostType(notificationsForPost));
});

//get summarized posts by Id
//ref - The endpoint will at the minimum provide a GET method and accept the ID of a post and return all the aggregated notifications for that post. 
app.get('/summarizedPosts/:id', function(req, resp){
    // sample post id - b1638f970c3ddd528671df76c4dcf13e
    const postId = req.params.id;
    const notificationsForPost = getNotificationsForAPost(postId);
    let notificationSummary = { };
    // if not data for a post, throw a message at the client
    if(notificationsForPost == null || notificationsForPost.length == 0){
        resp.send("Do not have any notifications for this post: " + postId);
    }

    const postDetails = notificationsForPost[0]["post"];

    // group "comments" or "likes" for a post 
    const groupedUsersByPostTypeNotifications = groupNotificationsByPostType(notificationsForPost);

    const commentSummary = concatUserNamesWithSummary(
        groupedUsersByPostTypeNotifications["Commenters"],
        ` commented on your post: "${postDetails['title']}"`);

    const likeSummary = concatUserNamesWithSummary(
        groupedUsersByPostTypeNotifications["Likers"],
        ` liked your post: "${postDetails['title']}"`);
    
    if(commentSummary){
        notificationSummary["CommentSummary"] = commentSummary;
    }

    if(likeSummary){
        notificationSummary["LikeSummary"] = likeSummary;
    }

    resp.send(notificationSummary);
});

//get summarized notifications for user
//Assumption: The given json feed is for USER (any user)
app.get('/summarizedPosts', function(req, resp){

    const notificationSummary = {
        "CommentSummary": [],
        "LikeSummary": []
    };
    
    // Get all unique post ids from the feed data
    const postIds = getUniquesPostIds();

    postIds.forEach(postId => {
        const notificationsForPost = getNotificationsForAPost(postId);
        const postDetails = notificationsForPost[0]["post"];
        // group "comments" or "likes" for a post 
        const groupedUsersByPostTypeNotifications = groupNotificationsByPostType(notificationsForPost);

        const commentSummary = concatUserNamesWithSummary(
            groupedUsersByPostTypeNotifications["Commenters"],
            ` commented on your post: "${postDetails['title']}"`);

        const likeSummary = concatUserNamesWithSummary(
            groupedUsersByPostTypeNotifications["Likers"],
            ` liked your post: "${postDetails['title']}"`);

        if(commentSummary){
            notificationSummary.CommentSummary.push(commentSummary);
        }

        if(likeSummary){
            notificationSummary.LikeSummary.push(likeSummary);
        }
    });

    resp.send(notificationSummary);
});

function groupNotificationsByPostType(notificationsForPost) {
    return notificationsForPost.reduce((grouping, n) => {
        let commentOrLike = n.hasOwnProperty("comment") ? "Commenters" : "Likers";
        (grouping[commentOrLike] = grouping[commentOrLike] || []).push(n["user"]);
        return grouping;
    }, {});
}

function getUniquesPostIds(){
    const allFeed = getSocialFeedFromJSONFile();
    const allPosts = allFeed.map(f => f["post"]["id"]);
    let uniquePostIds = [];

    allPosts.forEach(pId => {
        if(!uniquePostIds.includes(pId)){
            uniquePostIds.push(pId);
        }
    });
    return uniquePostIds;
}

function getNotificationsForAPost(postId) {
    const allFeed = getSocialFeedFromJSONFile();
    // Get feed related to the current post
    return allFeed.filter(feed => feed["post"]["id"] == postId);
}

function getSocialFeedFromJSONFile() {
    return JSON.parse(fs.readFileSync('notifications-feed.json', 'utf8'));;
}

function concatUserNamesWithSummary(userArray, summaryText){

    if(userArray != null && userArray.length > 0){
    
        // handled multiple comments by the same user
        let userArr = [];
        userArray.forEach(user => {
            if(!userArr.find(u => u.id == user.id)){
                userArr.push(user);
            }
        });

        let stringSummary = "";

        userArr.forEach((user, i) => {
            if(i > 1){
                return;
            }
            const userName = user.name ? user.name : "User";
            stringSummary = i == 0
                ? stringSummary.concat(`${userName}`)
                : stringSummary.concat(`, ${userName}`)
        });

        if (userArr.length > 2){
            const remainingCount = userArr.length - 2;

            stringSummary = remainingCount == 1
                ? stringSummary.concat(" and 1 other")
                : stringSummary.concat(` and ${remainingCount} others`)
        }

        stringSummary = stringSummary.concat(summaryText);

        return stringSummary;
    }

    return null;
}