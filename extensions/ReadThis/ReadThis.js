// ==UserScript==
// @name         Read This
// @version      0.3
// @description  Open read-more's anywhere.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).readThis || {maxHeight: 800, shortHeight: 500};

    /* Initialize */
    initTassel_icigqyni();
    document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
        //undo changes from previous modal opening
        let links = Object.values(document.getElementById("post-view-modal").getElementsByClassName("link_post"));
        let originalView = document.getElementById("post-view-modal").getElementsByClassName("tasselReadThisOldPost");
        if (originalView.length) {
            originalView[0].classList.remove("tasselReadThisOldPost");
            document.getElementById("post-view-modal").getElementsByClassName("post-container")[0].classList.remove("tasselReadThisProcessed");
            document.getElementById("post-view-modal").getElementsByClassName("tasselReadThisNewPost")[0].remove();
        }
        processPosts_icigqyni([tasselJsonManager.modal.json], links);
    });
    document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
        //get HTML elements for posts
        let links = Object.values(document.getElementsByClassName("link_post"));
        links = links.filter(function(item) {
            return !item.classList.contains("tasselPermalinked");
        });
        processPosts_icigqyni(tasselJsonManager.feed.posts, links);
    });

    function processPosts_icigqyni(posts, links) {
        addDetails_icigqyni(posts, links);
        shortenPosts_icigqyni(links);
    }

    /* Turn READ-MORE's into collapsable detail-elements */
    function addDetails_icigqyni(posts, links) {
        posts.forEach(function(post) {
            //exit when there is no READ-MORE in the post
            if (post.content.indexOf("[READ-MORE]") === -1) return;

            //match data with an HTML element
            let postElement = links.filter(function(item) {
                if (!item.href) return;
                return item.href.split("/")[4] == (post.original_post_id || post.id);
            });
            if (!links.length) postElement = Object.values(document.getElementsByClassName("post-container"));

            postElement.forEach(function(postEl) {
                //get root element
                for (let a = 0; a < 100; a++, postEl = postEl.parentNode) {
                    if (postEl.classList.contains("post-container")) break;
                }
                if (postEl.classList.contains("tasselReadThisProcessed")) return;
                postEl.classList.add("tasselReadThisProcessed");

                //create a new text-body without READ-MORE's
                let fullPost = document.createElement("div");
                fullPost.classList.add("tasselReadThisNewPost");
                let contentFormated = post.content.replaceAll("[READ-MORE]", "<details class='tasselReadThisNewBlock'><summary>Read This...</summary>");
                contentFormated = contentFormated.replaceAll("[/READ-MORE]", "</details>");
                fullPost.innerHTML = contentFormated;

                let content = postEl.getElementsByClassName("content")[0].children[0];
                content.classList.add("tasselReadThisOldPost");
                content.after(fullPost);
            });
        });
    }

    /* Cutdown long posts */
    function shortenPosts_icigqyni(links) {
        links.forEach(function(link) {
            //get root element
            let postElement = link;
            for (let a = 0; a < 100; a++, postElement = postElement.parentNode) {
                if (postElement.classList.contains("post-container")) break;
            }
            if (postElement.classList.contains("tasselReadThisProcessed2")) return;
            postElement.classList.add("tasselReadThisProcessed2");

            //find text-body
            let content = postElement.getElementsByClassName("content");
            if (content.length) content = content[0];
            else content = null;

            let contentHeight = 0;
            if (content) contentHeight = content.getBoundingClientRect().height;

            //find media-body (images, embeds, ...)
            let media = postElement.getElementsByClassName("media");
            if (media.length) media = media[0];
            else media = null;

            let mediaHeight = 0;
            if (media && media.style.display !== "none") mediaHeight = media.getBoundingClientRect().height;

            //exit if the post is short or collapsed
            if (contentHeight + mediaHeight < settings.maxLength) return;
            if (content && content.classList.contains("advancedBlacklistHidden")) return;

            //add a button to open shortened posts
            let button = document.createElement("div");
            button.innerHTML = `
                <div class="tasselReadThisFade"></div>
                <div class="tasselReadThisOpen">
                    <button>Read This</button>
                </div>
            `;
            (content || media).after(button);
            button.children[1].children[0].addEventListener("click", function() {
                this.parentNode.parentNode.style.display = "none";
                this.parentNode.parentNode.parentNode.getElementsByClassName("content")[0].style.maxHeight = "unset";
                this.parentNode.parentNode.parentNode.getElementsByClassName("content")[0].style.display = "block";
                let media = this.parentNode.parentNode.parentNode.getElementsByClassName("media");
                if (media.length) media[0].style.maxHeight = "unset";
            });

            //do the actual shortening
            if (media) {
                media.classList.add("tasselReadThisShort");
                media.style.maxHeight = settings.shortLength + "px";
            }
            if (content) {
                content.classList.add("tasselReadThisShort");
                let contentMaxHeight = Math.max(settings.shortLength - mediaHeight, 0);
                if (contentMaxHeight > 0) content.style.maxHeight = contentMaxHeight + "px";
                else content.style.display = "none";
            }
        });
    }

    /* Add elements to the Tassel menu */
    function initTassel_icigqyni() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (!tasselSidebar) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarReadThis";
        button.innerHTML = "Read This";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarReadThis").addEventListener("click", displaySettings_icigqyni);
    }

    /* Create Tassel settings menu */
    function displaySettings_icigqyni() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarReadThis").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        let label1 = document.createElement("label");
        label1.setAttribute("for", "tasselReadThisMaxLengthInput");
        label1.innerHTML = `Shorten posts that are longer than
            <input id="tasselReadThisMaxLengthInput" type="number" min="0" step="20" value="${settings.maxLength}"></input>
            px.
        `;
        content.appendChild(label1);
        content.lastChild.children[0].addEventListener("change", function() {
            settings.maxLength = this.value;
            saveSettings_icigqyni();
        });

        let label2 = document.createElement("label");
        label2.setAttribute("for", "tasselReadThisShortLengthInput");
        label2.innerHTML = `Shorten posts to
            <input id="tasselReadThisShortLengthInput" type="number" min="0" step="20" value="${settings.shortLength}"></input>
            px.
        `;
        content.appendChild(label2);
        content.lastChild.children[0].addEventListener("change", function() {
            settings.shortLength = this.value;
            saveSettings_icigqyni();
        });
    }

    function saveSettings_icigqyni() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.readThis = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }
})();
