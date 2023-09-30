// ==UserScript==
// @name         Read This
// @version      0.2
// @description  Open read-more's anywhere.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let maxHeight = 200;

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
        addDetails(posts, links);
        shortenPosts(links);
    }

    function addDetails(posts, links) {
        posts.forEach(function(post) {
            if (post.content.indexOf("[READ-MORE]") === -1) return;

            //match data with an HTML element
            let postElement = links.filter(function(item) {
                if (!item.href) return;
                return item.href.split("/")[4] == (post.original_post_id || post.id);
            });
            if (!links.length) postElement = Object.values(document.getElementsByClassName("post-container"));

            postElement.forEach(function(postEl) {
                for (let a = 0; a < 100; a++, postEl = postEl.parentNode) {//get root element
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

    function shortenPosts(links) {
        links.forEach(function(link) {
            let postElement = link;
            for (let a = 0; a < 100; a++, postElement = postElement.parentNode) {//get root element
                if (postElement.classList.contains("post-container")) break;
            }
            if (postElement.classList.contains("tasselReadThisProcessed2")) return;
            postElement.classList.add("tasselReadThisProcessed2");

            let content = postElement.getElementsByClassName("content")[0];
            let contentHeight = content.getClientRects();
            contentHeight = contentHeight.length ? contentHeight = contentHeight[0].height : contentHeight = 0;
            let media = postElement.getElementsByClassName("media");
            media = media.length ? media[0] : null
            let mediaHeight = media && media.style.display !== "none" ? media.getClientRects()[0].height : 0;

            let button = document.createElement("div");
            button.innerHTML = `
                <div style="height: 100px;margin-top:-99px;background:transparent;position: relative;background: linear-gradient(0deg, var(--postHeaderFooter) 0%, transparent 100%);"></div>
                <div style="display: flex;justify-content: center;padding: .5em;background-color: var(--postHeaderFooter);">
                    <button class="tempClass" style="background: none;border: none;color: var(--linkColor);">Read This</button>
                </div>
            `;

            if (contentHeight + mediaHeight < maxHeight) return;
            content.after(button);
            content.classList.add("tasselReadThisShort");
            let contentMaxHeight = Math.max(maxHeight - mediaHeight, 0);
            if (contentMaxHeight > 0) content.style.maxHeight = contentMaxHeight + "px";
            else content.style.display = "none";
            if (media) {
                media.classList.add("tasselReadThisShort");
                media.style.maxHeight = maxHeight + "px";
            }

            Object.values(document.getElementsByClassName("tempClass")).forEach(function(item) {
                item.addEventListener("click", function() {
                    this.parentNode.parentNode.style.display = "none";
                    this.parentNode.parentNode.parentNode.getElementsByClassName("content")[0].style.maxHeight = "unset";
                    this.parentNode.parentNode.parentNode.getElementsByClassName("content")[0].style.display = "block";
                    this.parentNode.parentNode.parentNode.getElementsByClassName("media")[0].style.maxHeight = "unset";
                });
            });
        });
    }
})();
