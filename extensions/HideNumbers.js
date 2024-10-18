// ==UserScript==
// @name         Hide Numbers
// @version      1.1
// @description  Hide any number on Pillowfort
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).hideNumbers || {own:{},other:{}};

    init_yxhjqepn();
    function init_yxhjqepn() {
        initTassel_yxhjqepn();
        hideNumbersSidebar_yxhjqepn();

        if (settings.own.comment
            || settings.own.reblog
            || settings.own.like
            || settings.other.comment
            || settings.other.reblog
            || settings.other.like
           ) {
            document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", function() {
                //get HTML elements for posts
                let links = Object.values(document.getElementsByClassName("link_post"));
                links = links.filter(function(item) {
                    return !item.classList.contains("tasselPermalinked");
                });
                hideNumbersPosts_yxhjqepn(tasselJsonManager.feed.posts, links);
            });
            document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
                //get HTML elements for posts
                let links = Object.values(document.getElementsByClassName("timestamp2"));
                links = links.filter(function(item) {
                    return !item.classList.contains("tasselPermalinked");
                });
                hideNumbersPosts_yxhjqepn([tasselJsonManager.post.json], links);
            });
            document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
                //get HTML elements for posts
                let links = Object.values(document.getElementById("post-view-modal").getElementsByClassName("link_post"));
                links = links.filter(function(item) {
                    return !item.classList.contains("tasselPermalinked");
                });
                hideNumbersPosts_yxhjqepn([tasselJsonManager.modal.json], links);
            });
        }
        if (settings.commentLikes) {
            document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", function() {
                //modal
                if (document.getElementById("post-view-modal")) {
                    let likes = Object.values(document.getElementById("post-view-modal").getElementsByClassName("comment-like-button"));
                    likes.forEach(function(item) {
                        if (item.children.length) {
                            item.children[item.children.length-1].style.display = "none";
                        }
                    });
                } else {
                    //other
                    let likes = Object.values(document.getElementsByClassName("comment-like-button"));
                    likes.forEach(function(item) {
                        if (item.children.length) {
                            item.children[item.children.length-1].style.display = "none";
                        }
                    });
                }
            });
        }
    }

    function hideNumbersSidebar_yxhjqepn() {
        let sidebar = document.getElementById("expanded-bar-container");
        //sidebar top
        if (settings.draft) {
            let drafts = getElementByHref_yxhjqepn(sidebar, "/drafts");
            if (drafts) drafts[0].getElementsByClassName("sidebar-num")[0].style.visibility = "hidden";
        }
        if (settings.queue) {
            let queue = getElementByHref_yxhjqepn(sidebar, "/queued_posts");
            if (queue) queue[0].getElementsByClassName("sidebar-num")[0].style.visibility = "hidden";
        }
        if (settings.inbox || settings.inboxZero) {
            let inbox = getElementByHref_yxhjqepn(sidebar, "/messages");
            if (inbox) {
                let num = inbox[0].getElementsByClassName("sidebar-num")[0];
                if (settings.inbox) {
                    num.style.visibility = "hidden";
                } else if (settings.inboxZero) {
                    if (num.textContent == 0) num.style.visibility = "hidden";
                }
            }
        }
        if (settings.subscription || settings.subscriptionZero) {
            let num = document.getElementById("postSubscriberNotificationCounter");
            if (num && settings.subscription) {
                num.style.visibility = "hidden";
            } else if (num && settings.subscriptionZero) {
                if (num.textContent == 0) num.style.visibility = "hidden";
            }
        }
        if (settings.notification || settings.notificationZero) {
            let notification = getElementByHref_yxhjqepn(sidebar, "/notifs_dash");
            if (notification) {
                let num = notification[0].getElementsByClassName("sidebar-num")[0];
                if (settings.notification) {
                    num.style.visibility = "hidden";
                } else if (settings.notificationZero) {
                    if (num.textContent == 0) num.style.visibility = "hidden";
                }
            }
        }

        //sidebar bottom
        if (settings.followers) {
            let followers = getElementByHref_yxhjqepn(sidebar, "/followers");
            if (followers) {
                let num = followers[0].getElementsByClassName("sidebar-bottom-num")[0];
                num.style.visibility = "hidden";
            }
        }
        if (settings.following) {
            let following = getElementByHref_yxhjqepn(sidebar, "/following");
            if (following) {
                let num = following[0].getElementsByClassName("sidebar-bottom-num")[0];
                num.style.visibility = "hidden";
            }
        }
        if (settings.mutuals) {
            let mutuals = getElementByHref_yxhjqepn(sidebar, "/mutuals");
            if (mutuals) {
                let num = mutuals[0].getElementsByClassName("sidebar-bottom-num")[0];
                num.style.visibility = "hidden";
            }
        }
        if (settings.donation) {
            let donation = getElementByHref_yxhjqepn(sidebar, "/donations");
            if (donation) {
                let num = donation[0].getElementsByClassName("sidebar-bottom-num")[0];
                num.style.visibility = "hidden";
            }
        }
    }

    /* Filter posts into posts by oneself and posts by others */
    function hideNumbersPosts_yxhjqepn(posts, links) {
        if (settings.own.comment
            || settings.own.reblog
            || settings.own.like
           ) {
            let ownPosts = posts.filter(function(item) {
                return item.mine;
            });
            hideNumbersPostsFiltered_yxhjqepn(ownPosts, links, settings.own)
        }
        if (settings.other.comment
            || settings.other.reblog
            || settings.other.like
           ) {
            let otherPosts = posts.filter(function(item) {
                return !item.mine;
            });
            hideNumbersPostsFiltered_yxhjqepn(otherPosts, links, settings.other)
        }
    }

    /* Hide the numbers on a list of posts */
    //posts: json of posts
    //links: html of posts
    //filter: what to hide
    function hideNumbersPostsFiltered_yxhjqepn(posts, links, filter) {
        posts.forEach(function(post) {
            //match data with an HTML element
            let postElement = links.filter(function(item) {
                if (item.classList.contains("timestamp2")) return true;
                if (!item.href) return;
                return item.href.split("/")[4] == (post.original_post_id || post.id);
            });
            if (!links.length) postElement = Object.values(document.getElementsByClassName("post-container"));

            postElement.forEach(function(postEl) {
                //get root element
                for (let a = 0; a < 100; a++, postEl = postEl.parentNode) {
                    if (postEl.classList.contains("post-container")) break;
                }
                if (postEl.classList.contains("tasselHideNumbersProcessed")) return;
                postEl.classList.add("tasselHideNumbersProcessed");

                let nav = postEl.getElementsByClassName("post-nav-left")[0];
                if (filter.comment) {
                    let comment = Object.values(nav.getElementsByTagName("a")).filter(function(item) {
                        let icon = item.getElementsByTagName("img")[0];
                        return icon.getAttribute("src").includes("comments");
                    });
                    comment[0].getElementsByClassName("tag-text")[0].style.display = "none";
                }
                if (filter.reblog) {
                    let reblog = Object.values(nav.getElementsByTagName("a")).filter(function(item) {
                        let icon = item.getElementsByTagName("img")[0];
                        return icon.getAttribute("src").includes("repost");
                    });
                    reblog[0].getElementsByClassName("tag-text")[0].style.display = "none";
                }
                if (filter.like) {
                    let like = Object.values(nav.getElementsByTagName("a")).filter(function(item) {
                        let icon = item.getElementsByTagName("img")[0];
                        return icon.getAttribute("src").includes("heart");
                    });
                    like[0].getElementsByClassName("tag-text")[0].style.display = "none";
                }
            });
        });
    }

    /* Find anchor objects with a specific link */
    function getElementByHref_yxhjqepn(parent, href) {
        if (!parent) return null;
        let results = Object.values(parent.getElementsByTagName("a")).filter(function(item) {
            return item.getAttribute("href") === href;
        });
        if (results.length) return results
        return null;
    }

    /* Add elements to the Tassel menu */
    function initTassel_yxhjqepn() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarHideNumbers";
        button.innerHTML = "Hide Numbers";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarHideNumbers").addEventListener("click", displaySettings_yxhjqepn);
    }

    /* Create Tassel settings menu */
    function displaySettings_yxhjqepn() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarHideNumbers").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        let title1 = document.createElement("h2");
        title1.innerHTML = "Sidebar";
        content.appendChild(title1);

        content.appendChild(createSwitch_yxhjqepn("Hide Draft Count", settings.draft ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.draft = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Queue Count", settings.queue ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.queue = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Inbox Count when Zero", settings.inboxZero ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.inboxZero = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Inbox Count", settings.inbox ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.inbox = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Subscription Count when Zero (Post Subscriber Extension)", settings.subscriptionZero ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.subscriptionZero = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Subscription Count (Post Subscriber Extension)", settings.subscription ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.subscription = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Notification Count when Zero", settings.notificationZero ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.notificationZero = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Notification Count", settings.notification ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.notification = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Followers Count", settings.followers ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.followers = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Following Count", settings.following ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.following = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Mutuals Count", settings.mutuals ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.mutuals = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Funding Percent", settings.donation ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.donation = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(document.createElement("hr"));

        let title2 = document.createElement("h2");
        title2.innerHTML = "Own Posts";
        content.appendChild(title2);

        content.appendChild(createSwitch_yxhjqepn("Hide Comment Count", settings.own.comment ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.own.comment = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Reblog Count", settings.own.reblog ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.own.reblog = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Like Count", settings.own.like ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.own.like = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(document.createElement("hr"));

        let title3 = document.createElement("h2");
        title3.innerHTML = "Other Posts";
        content.appendChild(title3);

        content.appendChild(createSwitch_yxhjqepn("Hide Comment Count", settings.other.comment ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.other.comment = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Reblog Count", settings.other.reblog ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.other.reblog = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(createSwitch_yxhjqepn("Hide Like Count", settings.other.like ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.other.like = this.checked;
            saveSettings_yxhjqepn();
        });
        content.appendChild(document.createElement("hr"));

        let title4 = document.createElement("h2");
        title4.innerHTML = "Miscellaneous";
        content.appendChild(title4);

        content.appendChild(createSwitch_yxhjqepn("Hide Comment Like Count", settings.commentLikes ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.commentLikes = this.checked;
            saveSettings_yxhjqepn();
        });
    }

    function saveSettings_yxhjqepn() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.hideNumbers = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    function createSwitch_yxhjqepn(title="", state="") {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" ${state}>
          <label for="${id}">${title}</label>
        `;
        return toggle;
    }
})();
