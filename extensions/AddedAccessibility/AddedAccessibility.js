// ==UserScript==
// @name         Added Accessibility
// @version      1.0
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

    initEditor_pdmmlnvi();
    function initEditor_pdmmlnvi() {
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
                    editor.innerHTML = content || "";

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

    initFortStyle_pdmmlnvi();
    function initFortStyle_pdmmlnvi() {
        let areas = Object.values(document.getElementsByClassName("util-buttons"));
        for (let area of areas) {
            let button = document.createElement("button");
            button.title = "remove style";
            button.style = "border: none;background: none;width: 22px;height: 22px;margin: 0;padding: 0;";
            button.innerHTML = `<img alt="remove style" style="filter: none !important;background: white;background: radial-gradient(circle,rgb(255, 255, 255) 0%, rgba(0, 0, 0, 0) 50%);border-radius: 100%;" src="/assets/global/watch-8a83b714a3c8fd66d5a9948c2f655ca085ec6dc8f97370ebaf9b0c5b55e3a88b.svg">`;
            button.addEventListener("click", revertStyle_pdmmlnvi);
            area.appendChild(button);
        }
    }

    function revertStyle_pdmmlnvi() {
        let style = document.createElement("style")
        style.innerHTML = `
body {
    --pageBg: #2C405A !important;
    --postBorderColor: #2C405A !important;
    --postBgColor: #fff !important;
    --postFontColor: #2b2b2b !important;
    --postHeaderFooter: #232b40 !important;
    --postHeaderFont: #fff !important;
    --linkColor: #58b6dd !important;
    --iconColor: "brightness(0) saturate(100%) invert(65%) sepia(86%) saturate(377%) hue-rotate(166deg) brightness(87%) contrast(98%)" !important;
    --sidebarBgColor: #181D2B !important;
    --sidebarFontColor: #fff !important;
    --sidebarHeaderFooter: #232b40 !important;
    --tag_bg: #ececec !important;
    --blockquote_bg: #eee !important;
}
body {
    background-color: #2C405A !important;
}
/*sidebar*/
.user-sidebar .username {
    color: #fff;
}
.user-sidebar img[src$=".svg"] {
    filter: none !important;
}
#user-sidebar-expanded .follow-btn .svg-blue {
    filter: brightness(0) saturate(100%) invert(65%) sepia(86%) saturate(377%) hue-rotate(166deg) brightness(87%) contrast(98%) !important;
}
#user-sidebar-expanded .svg-purple,
#sidebar-collapsed .svg-purple {
    filter: brightness(0) saturate(100%) invert(65%) sepia(53%) saturate(603%) hue-rotate(210deg) brightness(99%) contrast(86%) !important;
}
.user-sidebar .sidebar-bottom-left a {
    color: white !important;
}
.sidebar-bottom-num-show a div {
    color: var(--linkColor) !important;
}
.user-sidebar .style-button {
    color: #F377B3 !important;
}
/*post header*/
.post.main .header .post-right .timestamp2 {
    color: #fff !important;
}
.post.main .header .svg-pink-light {
    filter: brightness(0) saturate(100%) invert(67%) sepia(96%) saturate(1357%) hue-rotate(288deg) brightness(100%) contrast(103%) !important;
}
.post.main .header .svg-blue {
    filter: brightness(0) saturate(100%) invert(65%) sepia(86%) saturate(377%) hue-rotate(166deg) brightness(87%) contrast(98%) !important;
}
.post.main .header .link_post img {
    filter: none !important;
}
/*post body*/
.post.main .post-content .tags a.tag-item {
    color: #20728D;
}
/*post footer*/
.tasselPermalinked.svg-blue,
.post-nav-left .svg-blue,
.post.main .post-nav-left img[src$=".svg"] {
    filter: brightness(0) saturate(100%) invert(65%) sepia(86%) saturate(377%) hue-rotate(166deg) brightness(87%) contrast(98%) !important;
}
.post.main .post-nav-left img.svg-pink-light {
    filter: brightness(0) saturate(100%) invert(67%) sepia(96%) saturate(1357%) hue-rotate(288deg) brightness(100%) contrast(103%) !important;
}
.post.main .post-nav .svg-purple {
    filter: brightness(0) saturate(100%) invert(65%) sepia(53%) saturate(603%) hue-rotate(210deg) brightness(99%) contrast(86%) !important;
}
.post.main .post-nav .tag-text {
    color: white;
}
#userBlogPosts .subscribed {
    filter: brightness(0) saturate(100%) invert(67%) sepia(96%) saturate(1357%) hue-rotate(288deg) brightness(100%) contrast(103%) !important;
}
/*page nav*/
.pagination li a {
    background: #fff !important;
    color: #777777 !important;
}
.pagination li a:hover {
    background-color: #18729c !important;
    border-color: #18729c !important;
    color: #fff !important;
}
.pagination li.active a {
    background-color: #e3e3e3 !important;
    color: #337ab7 !important;
}
.pagination > li > a,
.pagination > li > span {
    color: #337ab7 !important;
}
        `;
        document.head.appendChild(style);
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
