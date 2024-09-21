// ==UserScript==
// @name         Added Accessibility
// @version      0.2
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
                    let id = "tasselAddedAccessiblityImage" + Math.random();
                    let altInput = document.createElement("textarea");
                    altInput.classList.add("tasselAddedAccessiblityEditorInput");
                    altInput.setAttribute("image", id);
                    altInput.placeholder = "Alternative Text";
                    altInput.addEventListener("keyup", function() {
                        document.getElementById(this.getAttribute("image")).alt = this.value;
                    });
                    node.after(altInput);
                    node.id = id;
                } else {
                    let altInputs = Object.values(document.getElementsByClassName("tasselAddedAccessiblityEditorInput"));
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

    init_pdmmlnvi();
    function init_pdmmlnvi() {
        let editor = document.getElementsByClassName("main","create-post-main");
        if (editor.length > 0) {
            editor = editor[0].getElementsByClassName("fr-element","fr-view");
            if (editor.length > 0) {
                editor = editor[0];
                $.get(document.URL, function(data) {
                    let html = document.createElement("body");
                    html.innerHTML = data.substring(data.search("<body"), data.search("</body>")+7);
                    let content = Object.values(html.children).filter(function(item) {return item.classList.contains("new-post")})[0];
                    content = content.children[0].children[3].children[0];
                    content = content.children[1].value || content.children[2].value;
                    editor.innerHTML = content;

                    let imgs = Object.values(editor.getElementsByTagName("img"));
                    imgs.forEach(function(img) {
                        let id = "tasselAddedAccessiblityImage" + Math.random();
                        let altInput = document.createElement("textarea");
                        altInput.classList.add("tasselAddedAccessiblityEditorInput");
                        altInput.setAttribute("image", id);
                        altInput.placeholder = "Alternative Text";
                        altInput.value = img.alt;
                        altInput.addEventListener("keyup", function(event) {
                            if (event.keyCode == 13) {
                                event.preventDefault();
                            }
                            document.getElementById(this.getAttribute("image")).alt = this.value;
                        });
                        img.after(altInput);
                        img.id = id;
                    });
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

        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
            let modal = document.getElementById("single-post-container") || document.getElementById("reblog-modal");
            if (!modal) return;
            Object.values(modal.getElementsByTagName("img")).forEach(function(img) {
                addAltText(img);
            });
        });
    }

    function addAltText(img) {
        if (img.alt.length === 0 || img.classList.contains("svg-purple-dark") || img.classList.contains("tasselAddedAccessiblityProcessed")) return;
        img.classList.add("tasselAddedAccessiblityProcessed");
        let altText = document.createElement("p");
        altText.style = "background: var(--tag_bg); padding: 0.5em;";
        altText.innerHTML = "Alt: " + img.alt;
        img.after(altText);
    }
})();
