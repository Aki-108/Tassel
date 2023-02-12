// ==UserScript==
// @name         Post Subscriber V2
// @version      2.0
// @description  Get notified when there are new comments in a post.
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @updateURL    https://raw.githubusercontent.com/Aki-108/pf-post-subscriber/main/main.js
// @downloadURL  https://raw.githubusercontent.com/Aki-108/pf-post-subscriber/main/main.js
// @supportURL   https://www.pillowfort.social/posts/2878877
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let modalTimeout = null;
    let subscribed = false;
    let thisPost = {};
    thisPost.visited = new Date().getTime();

    let tasselSettings = JSON.parse(localStorage.getItem("tasselSettings2")).tassel;
    let settings = (JSON.parse(localStorage.getItem("tasselSettings2")) || {});
    if (settings.postSubscriber) {
        settings = settings.postSubscriber;
        localStorage.removeItem("postSubscriberColor");
        localStorage.removeItem("postSubscriberInterval");
        localStorage.removeItem("tasselPostSubLoadingIndicator");
    } else {
        settings = {
            "color": localStorage.getItem("postSubscriberColor") || "#ff7fc5",
            "interval": localStorage.getItem("postSubscriberInterval")*1 || 1200000,
            "loadingIndicator": localStorage.getItem("tasselPostSubLoadingIndicator") === "false" ? false : true
        };
        saveSettings_ltapluah();
    }
    let subscriptions = (JSON.parse(localStorage.getItem("tasselPostSubscriber")) || {});
    if (subscriptions.subscriptions) {
        localStorage.removeItem("postSubscriberTime");
        localStorage.removeItem("postsubscriptions");
        localStorage.removeItem("postsubscriptiondata");
    } else {
        subscriptions.lastCheck = localStorage.getItem("postSubscriberTime")*1;
        subscriptions.subscriptions = [];
        let list1 = [];
        if (localStorage.getItem("postsubscriptions")) {
            let list = localStorage.getItem("postsubscriptions").split(",");
            list.forEach(function(value){
                list1.push(value.split(";"));
            });
        }
        let list2 = [];
        if (localStorage.getItem("postsubscriptiondata")) {
            let list = localStorage.getItem("postsubscriptiondata").split(",");
            list.forEach(function(value){
                list2.push(value.split(";"));
            });
        }
        list1.forEach(function(item, index) {
            let entry = {};
            entry.id = item[0]*1;
            entry.visited = item[3]*1;
            entry.author = list2[index][1].split(": ")[0];
            let title = list2[index][1].substring(list2[index][1].search(": ")+2);
            entry.title = title.substring(0, title.length-26);
            entry.timestamp = new Date(title.substring(title.length-24, title.length-1).replace("@", "").replace(".", "")).getTime();
            entry.comments = item[2]*1;
            entry.commentsSeen = item[1]*1;
            subscriptions.subscriptions.push(entry);
        });
        saveSubscriptions_ltapluah();
    }

    let icon = document.createElement("div");
    icon.innerHTML = "<svg style='filter:var(--iconColor);overflow:visible;' class='sidebar-img' viewBox='0 0 14 14' style='overflow:visible;'><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M5.5 13.5h-3q-2 0 -2 -2v-8.5q0 -2 2 -2h8.5q2 0 2 2v5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 4h7.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 7h4.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 10h4'></path><g xmlns='http://www.w3.org/2000/svg' transform='scale(0.5),translate(10,10)'><path xmlns='http://www.w3.org/2000/svg' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.6px'></path></g></svg>";
    let iconUnsub = "<svg style='filter:var(--iconColor);' width='20px' height='23px' viewBox='0 0 20 20'><path xmlns='http://www.w3.org/2000/svg' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.7px' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z'/><path stroke='#58b6dd' stroke-width='2px' d='M3 3l14 17'/></svg>";

    let commentContainer = document.getElementsByClassName("comments-container")[0];
    let postModal = document.getElementById("post-view-modal");
    let styleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (commentContainer) {//for single posts
                initComments_ltapluah();
            }
            if (postModal != null && postModal.classList.contains("in")) {
                initModal_ltapluah();
            }
        });
    });

    //start initialization
    if (document.getElementsByClassName("sidebar-expanded").length > 0) {
        init_ltapluah();
    } else {
        waitForKeyElements(".sidebar-expanded", init_ltapluah);
    }
    function init_ltapluah() {
        if (document.getElementsByClassName("postSubscriberIcon").length > 0) return;
        initSidebar_ltapluah();
        initTassel_ltapluah();
        initSinglePost_ltapluah();

        if (commentContainer) {
            styleObserver.observe(commentContainer, {
                childList: true
            });
        }
        if (postModal) {
            styleObserver.observe(postModal, {
                attributes: true,
                attributeFilter: ["style"]
            });
        }

        //start checking for new comments
        checkAll_ltapluah();
        window.setInterval(checkAll_ltapluah, 600000);//check every ten minutes
    }

    /* Save list of active extensions to local storage */
    function saveSettings_ltapluah() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.postSubscriber = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    /* Save list of active extensions to local storage */
    function saveSubscriptions_ltapluah() {
        localStorage.setItem("tasselPostSubscriber", JSON.stringify(subscriptions));
    }

    //when viewing a post in the modal
    function initModal_ltapluah() {
        let navigation = postModal.getElementsByClassName("post-nav-left")[0];

        //wait before editing the modal because Pillowfort changes its content asynchronous
        //TODO waitforkeyelement
        modalTimeout = setTimeout(function() {

            //check if this post is subscribed
            thisPost.id = postModal.getElementsByClassName("link_post")[0].href.substring(36)*1;
            subscribed = subscriptions.subscriptions.find(function(item) {
                return item.id === thisPost.id;
            }) ? true : false;

            //get posts information in preparation for a new subscription
            $.getJSON(`https://www.pillowfort.social/posts/${thisPost.id}/json`, function(data) {
                thisPost.comments = thisPost.commentsSeen = data.comments_count;
                thisPost.author = data.username || "ERROR";
                thisPost.title = data.title || "";
                thisPost.timestamp = new Date(data.created_at).getTime() || null;
                thisPost.edited = data.last_edited_at || null;
                thisPost.visited = new Date().getTime();
            });

            if (subscribed) {
                document.getElementById("postSubscriberPostModal").firstChild.classList.add("svg-pink-light");
                document.getElementById("postSubscriberPostModal").firstChild.firstChild.lastChild.firstChild.style.fill = "rgb(88, 182, 221)";
            } else {
                document.getElementById("postSubscriberPostModal").firstChild.classList.remove("svg-pink-light");
                document.getElementById("postSubscriberPostModal").firstChild.firstChild.lastChild.firstChild.style.fill = "none";
            }

        }, 500);

        if (document.getElementById("postSubscriberPostModal")) return;
        //add button to post navigation
        let subscriptionNav = document.createElement("span");
        subscriptionNav.id = "postSubscriberPostModal";
        subscriptionNav.title = subscribed ? "unsubscribe" : "subscribe";
        subscriptionNav.classList.add("nav-tab");
        subscriptionNav.style.cursor = "pointer";
        subscriptionNav.appendChild(icon.cloneNode(true));
        subscriptionNav.firstChild.firstChild.style.width = "22px";
        subscriptionNav.addEventListener("click", toggleSubscription_ltapluah);
        navigation.appendChild(subscriptionNav);
    }

    //runs everytime the comment section is loaded
    function initComments_ltapluah() {
        if (subscribed) {
            highlightComments_ltapluah();

            //remeber when the comments were viewed to detect new ones accordingly
            //source: https://stackoverflow.com/a/14746878
            window.addEventListener("beforeunload", function(evt) {
                evt.returnValue = '';
                let subscription = subscriptions.subscriptions.find(function(item) {
                    return item.id === thisPost.id;
                });
                subscription.comments = subscription.commentsSeen = thisPost.comments;
		subscription.visited = thisPost.visited;
                saveSubscriptions_ltapluah();
            });
        }
    }

    //add elements when viewing a post with its perma-link
    function initSinglePost_ltapluah() {
        if (document.URL.search("/posts/") != 29) return;

        //check if this post is subscribed
        let postID = document.URL.substring(36);
        if (postID.indexOf("/") >= 0) postID = postID.substring(0, postID.indexOf("/"));
        if (postID.indexOf("?") >= 0) postID = postID.substring(0, postID.indexOf("?"));
        thisPost.id = postID*1;
        subscribed = subscriptions.subscriptions.find(function(item) {
            return item.id === thisPost.id;
        }) ? true : false;

        //add button to post navigation
        let postNav = document.getElementsByClassName("post-nav")[0];
        let subscriptionNav = document.createElement("span");
        subscriptionNav.id = "postSubscriberToggle";
        subscriptionNav.title = subscribed ? "unsubscribe" : "subscribe";
        subscriptionNav.classList.add("nav-tab");
        subscriptionNav.style.cursor = "pointer";
        subscriptionNav.appendChild(icon.cloneNode(true));
        subscriptionNav.firstChild.firstChild.style.width = "22px";
        subscriptionNav.addEventListener("click", toggleSubscription_ltapluah);
        postNav.appendChild(subscriptionNav);
        if (subscribed) {
            document.getElementById("postSubscriberToggle").firstChild.classList.add("svg-pink-light");
            document.getElementById("postSubscriberToggle").firstChild.firstChild.lastChild.firstChild.style.fill = "rgb(88, 182, 221)";
        }

        //get posts information in preparation for a new subscription
        $.getJSON(`https://www.pillowfort.social/posts/${thisPost.id}/json`, function(data) {
            thisPost.comments = thisPost.commentsSeen = data.comments_count;
            thisPost.author = data.username || "ERROR";
            thisPost.title = data.title || "";
            thisPost.timestamp = new Date(data.created_at).getTime() || null;
            thisPost.edited = data.last_edited_at || null;
            thisPost.visited = new Date().getTime();
        });
    }

    //add elements to the sidebar
    function initSidebar_ltapluah() {
        //add button to collapsed sidebar
        let sidebarSmall = document.getElementsByClassName("sidebar-collapsed")[1];
        let subscriptionSmall = document.createElement("a");
        subscriptionSmall.href = "";//add a link to comply with accessibility requirements but don't open the link
        subscriptionSmall.addEventListener("click", function(event) {
            event.preventDefault();
        });
        subscriptionSmall.classList.add("postSubscriberIcon", "sidebar-icon");
        subscriptionSmall.title = "Subscriptions";
        subscriptionSmall.appendChild(icon.cloneNode(true));
        subscriptionSmall.children[0].style.height = "40px";
        subscriptionSmall.children[0].children[0].style.transition = "transform 2s";
        subscriptionSmall.children[0].children[0].style.transform = "rotate(0deg)";
        subscriptionSmall.children[0].children[0].classList.add("postSubscriberSpinner");
        let notificationBubble = document.createElement("div");
        notificationBubble.setAttribute("style", "background:#F377B3;width:8px;height:8px;border-radius:10px;position:relative;top:-10px;right:-35px;display:none;");
        notificationBubble.id = "postSubscriberNotificationBubble";
        subscriptionSmall.children[0].appendChild(notificationBubble);
        subscriptionSmall.addEventListener("click", showPopup_ltapluah);
        sidebarSmall.insertBefore(subscriptionSmall, sidebarSmall.children[3]);

        //add button to expanded sidebar
        let sidebarBig = document.getElementsByClassName("sidebar-expanded")[1];
        sidebarBig.children[8].firstChild.style.paddingBottom = "0";
        let subscriptionBigWrapper = document.createElement("a");
        subscriptionBigWrapper.href = "";//add a link to comply with accessibility requirements but don't open the link
        subscriptionBigWrapper.addEventListener("click", function(event) {
            event.preventDefault();
        });
        subscriptionBigWrapper.addEventListener("click", showPopup_ltapluah);
        let subscriptionBig = document.createElement("div");
        if (tasselSettings.shortenSidebar) {
            subscriptionBig.style.marginTop = "8px";
            subscriptionBig.style.marginBottom = "8px";
        }
        subscriptionBig.classList.add("postSubscriberIcon", "sidebar-topic");
        subscriptionBig.appendChild(icon.cloneNode(true).children[0]);
        subscriptionBig.children[0].style.transition = "all 2s";
        subscriptionBig.children[0].style.transform = "rotate(0deg)";
        subscriptionBig.children[0].classList.add("postSubscriberSpinner");
        subscriptionBig.innerHTML += "Subscriptions";
        let counter = document.createElement("div");
        counter.classList.add("sidebar-num");
        counter.style.paddingTop = "7px";
        if (tasselSettings.hideZero) counter.style.display = "none";
        counter.id = "postSubscriberNotificationCounter";
        counter.innerHTML = "0";
        subscriptionBig.appendChild(counter);
        subscriptionBigWrapper.appendChild(subscriptionBig);
        sidebarBig.insertBefore(subscriptionBigWrapper, sidebarBig.children[3]);

        //make sidebar bigger but only if Tassel isn't installed
        if (document.getElementById("tasselModalSidebar") != null) return;
        document.getElementsByClassName("sidebar site-sidebar")[0].style.marginTop = "10px";
        document.getElementById("expanded-bar-container").style.maxHeight = "calc(100vh - 100px)";
        document.getElementsByClassName("sidebar-bottom sidebar-expanded")[0].style.width = "100%";
    }

    //add elements to the Tassel menu
    function initTassel_ltapluah() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar === null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarPostSubscriber";
        button.innerHTML = "Post Subscriber";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarPostSubscriber").addEventListener("click", tasselDisplaySettings_ltapluah);
    }

    //create Tassel settings menu
    function tasselDisplaySettings_ltapluah() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarPostSubscriber").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //selection of update interval
        let info1 = document.createElement("label");
		info1.style.fontWeight = "normal";
        info1.innerHTML = "Check for new Comments every ";
        let select1 = document.createElement("select");
        select1.id = "tasselPostSubscriberInterval";
        select1.innerHTML = `
          <option value="600000">10 Minutes</option>
          <option value="1200000" selected>20 Minutes</option>
          <option value="1800000">30 Minutes</option>
          <option value="2400000">40 Minutes</option>
          <option value="3600000">1 Hour</option>
          <option value="7200000">2 Hours</option>
          <option value="86400000">1 Day</option>
        `;
        info1.appendChild(select1);
        content.appendChild(info1);
        content.appendChild(document.createElement("br"));
        //save settings when changed
        document.getElementById("tasselPostSubscriberInterval").addEventListener("change", function() {
            settings.interval = document.getElementById("tasselPostSubscriberInterval").value*1;
            saveSettings_ltapluah();
        });

        //show the selected option in the menu, not the default
        let selector1 = document.getElementById("tasselPostSubscriberInterval");
        let interval = settings.interval;
        for (let a = 0; a < selector1.children.length; a++) {
            if (interval == selector1.children[a].value) selector1.children[a].selected = true;
        }

        //selection of accent color
        let info2 = document.createElement("label");
		info2.style.fontWeight = "normal";
        info2.innerHTML = "Accent Color ";
        let select2 = document.createElement("select");
		select2.style.borderRight = "none";
		select2.style.borderRadius = ".5em 0 0 .5em";
        select2.id = "tasselPostSubscriberColorSelect";
        select2.innerHTML = `
          <option value="#ff7fc5">Pillowfort Pink</option>
          <option value="#232b40">Pillowfort Blue</option>
          <option value="" selected>Custom</option>
          <option value="var(--linkColor)">Link Color</option>
        `;
        info2.appendChild(select2);
        let color2 = document.createElement("input");
        color2.id = "tasselPostSubscriberColor";
        color2.type = "color";
        color2.value = settings.color;
		color2.style = "font-size:inherit;height:2.5em;width:2.4em;background:none;vertical-align:bottom;border:1px black solid;border-radius:0 .5em .5em 0;margin:0 0 0 0;border-left:1px lightgrey solid;";
        info2.appendChild(color2);
        content.appendChild(info2);
        document.getElementById("tasselPostSubscriberColorSelect").addEventListener("click", selectColor_ltapluah);
        document.getElementById("tasselPostSubscriberColor").addEventListener("change", selectColor_ltapluah);
        document.getElementById("tasselPostSubscriberColor").addEventListener("click", function() {
            document.getElementById("tasselPostSubscriberColorSelect").selectedIndex = 2
        });

        content.appendChild(createSwitch_ltapluah("Enable loading indicator", settings.loadingIndicator ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.loadingIndicator = this.checked;
            saveSettings_ltapluah();
        });

        //show the selected option in the menu, not the default
        let selector2 = document.getElementById("tasselPostSubscriberColorSelect");
        let color = settings.color;
        if (color == null) selector2.children[0].selected = true;
        else for (let a = 0; a < selector2.children.length; a++) {
            if (color == selector2.children[a].value) selector2.children[a].selected = true;
        }
    }

    //save accent color selection
    function selectColor_ltapluah() {
        let selector = document.getElementById("tasselPostSubscriberColorSelect");
        let colorPicker = document.getElementById("tasselPostSubscriberColor");
        let color = "#000";
        if (selector.value != "") {
            //select color by dropdown
            colorPicker.value = selector.value;
            color = selector.value;
        } else {
            //select color by colorpicker
            color = colorPicker.value;
        }
        settings.color = color;
        saveSettings_ltapluah();
    }

    //show/hide the popup of subscriptions
    function showPopup_ltapluah() {
        if (document.getElementById("postSubscriberBackground")) {
            //remove the popup if it's already there
            document.getElementsByTagName("body")[0].classList.remove("modal-open");
            document.getElementsByTagName("nav")[0].style.paddingRight = "0";
            document.getElementById("postSubscriberBackground").remove();
            document.getElementById("postSubscriberModal").remove();
        } else {
            document.getElementsByTagName("body")[0].classList.add("modal-open");
            document.getElementsByTagName("nav")[0].style.paddingRight = "11px";

            //generate background
            let bg = document.createElement("div");
            bg.id = "postSubscriberBackground";
            bg.classList.add("modal-backdrop", "in");
            document.getElementsByTagName("body")[0].appendChild(bg);

            //generate modal basis
            let modal = document.createElement("div");
            modal.id = "postSubscriberModal";
            modal.classList.add("modal", "in");
            modal.setAttribute("style", "display:block;z-index:3;overflow:auto;");
            //set the header
            modal.innerHTML = "<div class='modal-dialog'><div class='modal-content' id='postSubscriberModalContent'><div style='padding:10px 15px 0 40px;border-bottom:2px solid #e3e3e3;'><button class='close' type='button' title='Close'><span style='color:var(--postFontColor);'>x</span></button><div style='float:right;margin:10px 20px 0 0;color:var(--postFontColor);cursor:pointer;' id='postSubscriberClear'>unsubscribe all</div><h4 class='modal-title'>Subscriptions</h4></div></div></div>";
            document.getElementsByTagName("body")[0].appendChild(modal);
            document.getElementById("postSubscriberModal").addEventListener("click", showPopup_ltapluah);
            document.getElementById("postSubscriberClear").addEventListener("click", function() {
                subscriptions.subscriptions = [];
                saveSubscriptions_ltapluah();
            });

            //generate post entries
            subscriptions.subscriptions.forEach(function(item, index) {
                let entry = document.createElement("div");
                entry.style.padding = "10px";
                let unsubIcon = document.createElement("div");
                unsubIcon.innerHTML = iconUnsub;
                unsubIcon.style.display = "inline-block";
                unsubIcon.style.cursor = "pointer";
                unsubIcon.title = "unsubscribe";
                unsubIcon.setAttribute("postid", item.id);
                entry.appendChild(unsubIcon);
                let titleData = `
                    <span style='display:inline-block;overflow:hidden;text-overflow:ellipsis;max-width:500px;white-space:nowrap;line-height:1em;'>
                        ${item.author}: ${item.title}
                    </span>
                `;
                entry.innerHTML += "<a href='https://www.pillowfort.social/posts/"+item.id+"' class='title font-nunito-bold' style='padding-left:10px;display:inline-block;'>"+titleData+"</a>";
                let info = document.createElement("p");
                info.style.paddingLeft = "30px";
                info.style.marginBottom = "0";
                if (item.commentsSeen < item.comments) info.innerHTML = (item.comments-item.commentsSeen)+" new comment(s) • ";
                info.innerHTML += "<span style='color:var(--postFontColor);'>last visit: " + new Date(item.visited).toLocaleString()+"</span>";
                entry.appendChild(info);
                document.getElementById("postSubscriberModalContent").appendChild(entry);
                document.getElementById("postSubscriberModalContent").lastChild.firstChild.addEventListener("click", function(){unsubscribe_ltapluah(this.getAttribute("postid"));});
            });
        }
    }

    //queue subscribed posts to check them for new comments
    function checkAll_ltapluah() {
        let interval = settings.interval;
        let now = new Date().getTime();
        if (now-subscriptions.lastCheck < interval) return;//skip if not enough time has passed

        subscriptions.lastCheck = now;
        saveSubscriptions_ltapluah();
        subscriptions.subscriptions.forEach(function(item, index) {
            window.setTimeout(function() {
                checkPost_ltapluah(item.id);
            }, 3000*index);
        });

        //loading spinner
        let setting = settings.loadingIndicator;
        if (!setting) return;
        Object.values(document.getElementsByClassName("postSubscriberSpinner")).forEach(function(data) {
            let angle = data.style.transform.split("(")[1].split("d")[0]*1 + 360;
            data.style.transform = `rotate(${angle}deg)`;
        });
    }

    //get data from a post
    function checkPost_ltapluah(id) {
        $.getJSON("https://www.pillowfort.social/posts/"+id+"/json", function(json) {
            let counter = 0;//counter for new comments from ALL subscriptions
            document.getElementById("postSubscriberNotificationBubble").style.display = "none";
            subscriptions.subscriptions.forEach(function(item, index) {
                if (item.id === id) item.comments = json.comments_count;
                if (item.commentsSeen < item.comments) {
                    document.getElementById("postSubscriberNotificationBubble").style.display = "block";
                    counter += item.comments - item.commentsSeen;
                }
            });
            document.getElementById("postSubscriberNotificationCounter").innerHTML = counter;
			if (counter > 0) document.getElementById("postSubscriberNotificationCounter").style.display = "block";
            saveSubscriptions_ltapluah();
        });
    }

    //remove a subscription
    function unsubscribe_ltapluah(id) {
        subscriptions.subscriptions.forEach(function(item, index) {
            if (item.id == id) subscriptions.subscriptions.splice(index, 1);
        });
        saveSubscriptions_ltapluah();
        if (document.getElementById("postSubscriberBackground")) showPopup_ltapluah();
    }

    //(un-)subscribe to a post
    function toggleSubscription_ltapluah() {
        if (subscribed) {
            unsubscribe_ltapluah(thisPost.id);
            //change state of the button in the post navigation
            if (document.getElementById("postSubscriberToggle")) {
                document.getElementById("postSubscriberToggle").firstChild.classList.remove("svg-pink-light");
                document.getElementById("postSubscriberToggle").firstChild.firstChild.lastChild.firstChild.style.fill = "none";
                document.getElementById("postSubscriberToggle").title = "subscribe";
            } else {
                document.getElementById("postSubscriberPostModal").firstChild.classList.remove("svg-pink-light");
                document.getElementById("postSubscriberPostModal").firstChild.firstChild.lastChild.firstChild.style.fill = "none";
                document.getElementById("postSubscriberPostModal").title = "subscribe";
            }
        } else {
            subscriptions.subscriptions.push(thisPost);
            saveSubscriptions_ltapluah();
            //change state of the button in the post navigation
            if (document.getElementById("postSubscriberToggle")) {
                document.getElementById("postSubscriberToggle").firstChild.classList.add("svg-pink-light");
                document.getElementById("postSubscriberToggle").firstChild.firstChild.lastChild.firstChild.style.fill = "rgb(88, 182, 221)";
                document.getElementById("postSubscriberToggle").title = "unsubscribe";
            } else {
                document.getElementById("postSubscriberPostModal").firstChild.classList.add("svg-pink-light");
                document.getElementById("postSubscriberPostModal").firstChild.firstChild.lastChild.firstChild.style.fill = "rgb(88, 182, 221)";
                document.getElementById("postSubscriberPostModal").title = "unsubscribe";
            }
        }
        subscribed = !subscribed;
    }

    //add the "new" marking to comments
    function highlightComments_ltapluah() {
        let pivotTime = subscriptions.subscriptions.find(function(item) {
            return item.id === thisPost.id;
        }).visited;
        let comments = document.getElementsByClassName("comment");
        for (let a = 0; a < comments.length; a++) {
            if (comments[a].classList.contains("postSubscriberProcessed")) continue;
            comments[a].classList.add("postSubscriberProcessed");
            let timeString = comments[a].getElementsByClassName("header")[0].children[1].children[1].title;
            let time = new Date(timeString.replace("@", "")).getTime();
            if (time > pivotTime) {
                let newIcon = document.createElement("div");
                newIcon.innerHTML = "new";
                newIcon.setAttribute("style", `height:0;margin:-25px -53px;color:${settings.color};font-weight:bold;font-size:1.5em;`);
                comments[a].children[0].appendChild(newIcon);
            }
        }
    }

    function createSwitch_ltapluah(title="", state="") {
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
