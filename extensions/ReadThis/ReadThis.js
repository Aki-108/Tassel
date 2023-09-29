// ==UserScript==
// @name         Read This
// @version      0.1
// @description  Open read-more's anywhere.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* Initialize */
    document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
        let links = Object.values(document.getElementById("post-view-modal").getElementsByClassName("link_post"));
        let originalView = document.getElementById("post-view-modal").getElementsByClassName("tasselReadMoreOldPost");
        if (originalView.length) {
            originalView[0].classList.remove("tasselReadMoreOldPost");
            document.getElementById("post-view-modal").getElementsByClassName("post-container")[0].classList.remove("tasselReadThisProcessed");
            document.getElementById("post-view-modal").getElementsByClassName("tasselReadMoreNewPost")[0].remove();
        }
        processPosts([tasselJsonManager.modal.json], links);
    });
    document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
        let links = Object.values(document.getElementsByClassName("link_post"));
        links = links.filter(function(item) {
            return !item.classList.contains("tasselPermalinked");
        });
        processPosts(tasselJsonManager.feed.posts, links);
    });

    function processPosts(posts, links) {//get HTML elements for posts
        posts.forEach(function(post) {
            if (post.content.indexOf("[READ-MORE]") === -1) return;

            //match data with an HTML element
            let postElement = links.filter(function(item) {
                if (!item.href) return;
                return item.href.split("/")[4] == (post.original_post_id || post.id);
            });
            if (!links.length) postElement = Object.values(document.getElementsByClassName("post-container"));

            postElement.forEach(function(postEl) {//get root element
                for (let a = 0; a < 100; a++, postEl = postEl.parentNode) {
                    if (postEl.classList.contains("post-container")) break;
                }
                if (postEl.classList.contains("tasselReadThisProcessed")) return;
                postEl.classList.add("tasselReadThisProcessed");

                let fullPost = document.createElement("div");
                fullPost.classList.add("tasselReadMoreNewPost");
                let contentFormated = post.content.replaceAll("[READ-MORE]", "<details class='tasselReadMoreNewBlock'><summary>Read This...</summary>");
                contentFormated = contentFormated.replaceAll("[/READ-MORE]", "</details>");
                fullPost.innerHTML = contentFormated;

                let content = postEl.getElementsByClassName("content")[0].children[0];
                content.classList.add("tasselReadMoreOldPost");
                content.after(fullPost);
            });
        });
    }
})();
