// ==UserScript==
// @name         User Muting
// @version      1.5
// @description  Remove people partially.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let mutelist = JSON.parse(localStorage.getItem("tasselUserMuting")) || [];

    if (document.getElementById("tasselJsonManagerFeedReady")) document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", loadFeed_gatzfpvu);
    if (document.getElementById("tasselJsonManagerCommentReady")) document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", loadComments_gatzfpvu);

    /* Get posts from JSON Manager and process them */
    function loadFeed_gatzfpvu() {
        let posts = [];
        let permaLinks = document.getElementsByClassName("link_post");
        if (!permaLinks) return;
        Object.values(permaLinks).forEach(function(item) {
            if (item.href.split("/")[4] === "") return;
            posts.push({
                id: item.href.split("/")[4]*1,
                post: item.parentNode.parentNode.parentNode.parentNode.parentNode
            });
        });
        processPosts_gatzfpvu(tasselJsonManager.feed.posts, posts);
    }

    /* Find and hide posts */
    function processPosts_gatzfpvu(postData, posts) {
        for (let post of postData) {
            //ignore muting if the post is in a moderated community
            if (post.community_id) {
                let community = tasselJsonManager.communities.communities.find(function(community) {
                    return community.id === post.community_id;
                });
                if (community && community.membership_type === "moderator") continue;
            }

            //match html to json
            let postElement = posts.find(function(item) {
                return (item.id === (post.original_post_id || post.id));
            });
            if (postElement === undefined) continue;
            for (let a = 0; a < 100 && !postElement.post.classList.contains("post-container"); a++) {
                postElement.post = postElement.post.parentNode;
            }
            if (postElement.post.classList.contains("tasselUserMutingProcessed")) continue;
            postElement.post.classList.add("tasselUserMutingProcessed");

            //get usernames of the post
            let user = mutelist.find(function(user) {
                return user.username === post.username;
            });
            let originalUser = mutelist.find(function(user) {
                return user.username === post.original_username;
            });
            if (user === undefined && originalUser === undefined) continue;

            let originalPost =
                user !== undefined //ignore if user is not in mutelist
            && !post.original_post_id //only count if post is not a reblog
            && post.username === user.username //only count if user matches the one from the mutelist
            && user.originalPost //only count if original posts by that user should be removed
            && post.username !== document.URL.split("/")[3]; //ignore posts on own fort
            let rebloggedFrom =
                originalUser !== undefined //ignore if user is not in mutelist
            && post.original_post_id //only count if post is a reblog
            && post.original_username === originalUser.username //only count if user matches the one from the mutelist
            && originalUser.rebloggedFrom; //only count if reblogs from that user should be removed
            let rebloggedBy =
                user !== undefined //ignore if user is not in mutelist
            && post.original_post_id //only count if post is a reblog
            && post.username === user.username //only count if user matches the one from the mutelist
            && user.rebloggedBy; //only count if reblogs by that user should be removed
            if (!originalPost && !rebloggedFrom && !rebloggedBy) continue;

            postElement.post.style.display = "none";
        }
    }

    /* Get comments from JSON Manager and process them */
    function loadComments_gatzfpvu() {
        let comments = [];
        let permaLinks = Object.values(document.getElementsByTagName("a")).filter(function(item) {
            return item.classList.contains("comment-imgs")
        });
        if (!permaLinks) return;
        permaLinks.forEach(function(item) {
            let id;
            let queryString = new URLSearchParams(item.href.split('?')[1]);
            for(let pair of queryString.entries()) {
                if (pair[0] === "comment") id = pair[1];
            }
            comments.push({
                id: parseInt(id),
                comment: item
            });
        });
        processComments_gatzfpvu(tasselJsonManager.comments.comments, comments);
    }

    /* Find and hide comments */
    function processComments_gatzfpvu(commentData, comments) {
        for (let comment of commentData) {
            //match html to json
            let commentElement = comments.find(function(item) {
                return (item.id === comment.id);
            });
            if (commentElement === undefined) continue;
            for (let a = 0; a < 100 && !commentElement.comment.classList.contains("main", "comment"); a++) {
                commentElement.comment = commentElement.comment.parentNode;
            }
            if (commentElement.comment.classList.contains("tasselUserMutingProcessed")) continue;
            commentElement.comment.classList.add("tasselUserMutingProcessed");

            //get username of the comment
            let user = mutelist.find(function(user) {
                return user.username === comment.username;
            });
            if (user === undefined) continue;

            let blockComment =
                user !== undefined //ignore if user is not in mutelist
            && comment.username === user.username //only count if user matches the one from the mutelist
            && user.comments; //only count if comment by that user should be removed
            if (!blockComment) continue;

            //commentElement.comment.style.display = "none";
            let content = commentElement.comment.getElementsByClassName("display-comment")[0];
            content.innerHTML = `
                <details>
                    <summary class="tasselUserMutingcomment">User muted</summary>
                    ${content.innerHTML}
                </details>
            `;
        }
    }

    /* Add elements to the Tassel menu */
    initTassel_gatzfpvu();
    function initTassel_gatzfpvu() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarUserMuting";
        button.innerHTML = "User Muting";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarUserMuting").addEventListener("click", displaySettings_gatzfpvu);
    }

    /* Create Tassel settings menu */
    function displaySettings_gatzfpvu() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarUserMuting").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        let table1 = document.createElement("div");
        table1.id = "tasselUserMutingSettingsTable";
        table1.innerHTML = `
            <div class="heading"><div>User</div></div>
            <div class="heading"><div>original posts</div></div>
            <div class="heading"><div>reblogged from</div></div>
            <div class="heading"><div>reblogged by</div></div>
            <div class="heading"><div>comments</div></div>
        `;
        for (let muted of mutelist) {
            table1.innerHTML += `
                <input key="username" value="${muted.username}"></input>
                <input type="checkbox" key="originalPost" ${muted.originalPost ? "checked" : ""}></input>
                <input type="checkbox" key="rebloggedFrom" ${muted.rebloggedFrom ? "checked" : ""}></input>
                <input type="checkbox" key="rebloggedBy" ${muted.rebloggedBy ? "checked" : ""}></input>
                <input type="checkbox" key="comments" ${muted.comments ? "checked" : ""}></input>
            `;
        }
        content.appendChild(table1);
        let inputs = Object.values(document.getElementById("tasselUserMutingSettingsTable").getElementsByTagName("input"));
        for (let input of inputs) {
            if (input.getAttribute("key") === "username") input.addEventListener("keyup", toggleSetting_gatzfpvu);
            else input.addEventListener("click", toggleSetting_gatzfpvu);
        }

        let button1 = document.createElement("button");
        button1.innerHTML = "Add";
        button1.classList.add("tasselButton");
        button1.addEventListener("click", function() {
            let username = document.createElement("input");
            username.setAttribute("key", "username");
            username.addEventListener("keyup", toggleSetting_gatzfpvu);
            table1.appendChild(username);
            let originalPost = document.createElement("input");
            originalPost.type = "checkbox";
            originalPost.setAttribute("key", "originalPost");
            originalPost.addEventListener("click", toggleSetting_gatzfpvu);
            table1.appendChild(originalPost);
            let rebloggedFrom = document.createElement("input");
            rebloggedFrom.type = "checkbox";
            rebloggedFrom.setAttribute("key", "rebloggedFrom");
            rebloggedFrom.addEventListener("click", toggleSetting_gatzfpvu);
            table1.appendChild(rebloggedFrom);
            let rebloggedBy = document.createElement("input");
            rebloggedBy.type = "checkbox";
            rebloggedBy.setAttribute("key", "rebloggedBy");
            rebloggedBy.addEventListener("click", toggleSetting_gatzfpvu);
            table1.appendChild(rebloggedBy);
            let comments = document.createElement("input");
            comments.type = "checkbox";
            comments.setAttribute("key", "comments");
            comments.addEventListener("click", toggleSetting_gatzfpvu);
            table1.appendChild(comments);
        });
        button1.click();
        content.appendChild(button1);
    }

    /* Summarize settings and save them */
    function toggleSetting_gatzfpvu() {
        let inputs = Object.values(document.getElementById("tasselUserMutingSettingsTable").getElementsByTagName("input"));
        mutelist = [];
        for (let a = 0; a < inputs.length; a += 5) {
            if (inputs[a].value === "") continue;
            mutelist.push({
                username: inputs[a].value,
                originalPost: inputs[a+1].checked,
                rebloggedFrom: inputs[a+2].checked,
                rebloggedBy: inputs[a+3].checked,
                comments: inputs[a+4].checked
            });
        }
        localStorage.setItem("tasselUserMuting", JSON.stringify(mutelist));
    }
})();
