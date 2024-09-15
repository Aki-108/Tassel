// ==UserScript==
// @name         For Accessibility
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Accessibility Tools
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let editorObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            mutationRecord.addedNodes.forEach(function(node) {
                if (node.tagName === "IMG" && node.id.length === 0) {
                    let id = "tasselForAccessiblityImage" + Math.random();
                    let altInput = document.createElement("textarea");
                    altInput.classList.add("tasselForAccessiblityEditorInput");
                    altInput.setAttribute("image", id);
                    altInput.placeholder = "alt text";
                    altInput.addEventListener("keyup", function() {
                        document.getElementById(this.getAttribute("image")).alt = this.value;
                    });
                    console.log(altInput);
                    node.after(altInput);
                    node.id = id;
                    console.log(node);
                } else {
                    let altInputs = Object.values(document.getElementsByClassName("tasselForAccessiblityEditorInput"));
                    altInputs.forEach(function(input) {
                        input.value = document.getElementById(input.getAttribute("image")).alt;
                        input.addEventListener("keyup", function() {
                            document.getElementById(this.getAttribute("image")).alt = this.value;
                        });
                    });
                }
            });
        });
    });

    window.setTimeout(init_pdmmlnvi, 0);
    function init_pdmmlnvi() {
        let editor = document.getElementsByClassName("main","create-post-main");
        if (editor.length > 0) {
            editor = editor[0].getElementsByClassName("fr-element","fr-view");
            if (editor.length > 0) {
                editor = editor[0];
                console.log(document.getElementById("post_content").value);
                $.get(document.URL, function(data) {
                    console.log("data fetched!!!");
                    let html = document.createElement("body");
                    html.innerHTML = data.substring(data.search("<body>")+6, data.search("</body>"));
                    let content = html.children[21].children[0].children[3].children[0].children[1].value;
                    editor.innerHTML = content;
                })
                .fail(function() {
                    console.log("failed");
                });
                editorObserver.observe(editor, {
                    childList: true,
                    subtree: true
                });
            }
        }

        document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
            let post = document.getElementsByClassName("post main");
            if (post.length === 0) return;
            Object.values(post[0].getElementsByTagName("img")).forEach(function(img) {
                addAltText(img);
            });
        });

        document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", function() {
            let comments = document.getElementById("comments");
            if (!comments) return;
            Object.values(comments.getElementsByTagName("img")).forEach(function(img) {
                addAltText(img);
            });
        });

        document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
            let feed = document.getElementById("homeFeedCtrlId") || document.getElementById("userBlogPosts") || document.getElementById("communityPostsFeed") || document.getElementById("searchFeedCtrl") || document.getElementById("drafts-page") || document.getElementById("queuedPostsCtrlId");
            if (!feed) return;
            Object.values(feed.getElementsByTagName("img")).forEach(function(img) {
                addAltText(img);
            });
        });
    }

    function addAltText(img) {
        if (img.alt.length === 0 || img.classList.contains("svg-purple-dark")) return;
        let altText = document.createElement("p");
        altText.style = "background: var(--tag_bg); padding: 0.5em;";
        altText.innerHTML = "Alt: " + img.alt;
        img.after(altText);
    }
})();
