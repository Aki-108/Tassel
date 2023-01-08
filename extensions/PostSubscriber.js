// ==UserScript==
// @name         Post Subscriber V2
// @namespace    http://tampermonkey.net/
// @version      1.6
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

    var subscriptionList = [];
    var postData = [];
    var modalTimeout = null;
    //data for new subscription
    var postID = "";
    var subscribed = false;
    var commentCount = 0;
    var postUser = "";
    var postTitle = "";
    var postDate = "";
    var openTime = new Date().getTime();

    var icon = document.createElement("div");
    icon.innerHTML = "<svg style='filter:var(--iconColor);overflow:visible;' class='sidebar-img' viewBox='0 0 14 14' style='overflow:visible;'><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M5.5 13.5h-3q-2 0 -2 -2v-8.5q0 -2 2 -2h8.5q2 0 2 2v5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 4h7.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 7h4.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 10h4'></path><g xmlns='http://www.w3.org/2000/svg' transform='scale(0.5),translate(10,10)'><path xmlns='http://www.w3.org/2000/svg' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.6px'></path></g></svg>";
    var iconUnsub = "<svg style='filter:var(--iconColor);' width='20px' height='23px' viewBox='0 0 20 20'><path xmlns='http://www.w3.org/2000/svg' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.7px' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z'/><path stroke='#58b6dd' stroke-width='2px' d='M3 3l14 17'/></svg>";

    var commentContainer = document.getElementsByClassName("comments-container")[0];
    var postModal = document.getElementById("post-view-modal");
    var styleObserver = new MutationObserver(function(mutations) {
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
        if (subscriptionList.length > 0) checkPost_ltapluah(subscriptionList[subscriptionList.length-1][0]);
        checkAll_ltapluah();
        window.setInterval(checkAll_ltapluah, 600000);//check every ten minutes
    }

    //when viewing a post in the modal
    function initModal_ltapluah() {
        let navigation = postModal.getElementsByClassName("post-nav-left")[0];

        //wait before editing the modal because Pillowfort changes its content asynchronous
        modalTimeout = setTimeout(function() {

            //check if this post is subscribed
            postID = postModal.getElementsByClassName("link_post")[0].href.substring(36);
            subscribed = subscriptionList.find(function(item) {
                return item[0] == postID;
            }) ? true : false;

            //get posts information in preparation for a new subscription
            $.getJSON("https://www.pillowfort.social/posts/"+postID+"/json", function(data) {
                commentCount = data.comments_count;
                postUser = data.username || "ERROR";
                postTitle = data.title || "";
                postDate = data.timestamp || "ERROR";
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
                getData_ltapluah();
                subscriptionList.forEach(function(item, index) {
                    if (item[0] == postID) {
                        subscriptionList[index] = [postID, commentCount, commentCount, openTime];
                    }
                });
                setData_ltapluah();
            });
        }
    }

    //add elements when viewing a post with its perma-link
    function initSinglePost_ltapluah() {
        getData_ltapluah();
        if (document.URL.search("/posts/") != 29) return;

        //check if this post is subscribed
        postID = document.URL.substring(36);
        if (postID.indexOf("/") >= 0) postID = postID.substring(0, postID.indexOf("/"));
        if (postID.indexOf("?") >= 0) postID = postID.substring(0, postID.indexOf("?"));
        subscribed = subscriptionList.find(function(item) {
            return item[0] == postID;
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
        $.getJSON("https://www.pillowfort.social/posts/"+postID+"/json", function(data) {
                commentCount = data.comments_count;
                postUser = data.username || "ERROR";
                postTitle = data.title || "";
                postDate = data.timestamp || "ERROR";
            });
    }

    //add elements to the sidebar
    function initSidebar_ltapluah() {
        if (document.getElementsByClassName("postSubscriberIcon").length > 0) return;

        //add button to collapsed sidebar
        let sidebarSmall = document.getElementsByClassName("sidebar-collapsed")[1];
        let subscriptionSmall = document.createElement("a");
        subscriptionSmall.href = "";//add a link to comply with accessibility requirements but don't open the link
        subscriptionSmall.addEventListener("click", function(event) {
            event.preventDefault();
        });
        subscriptionSmall.classList.add("postSubscriberIcon", "sidebar-icon");
        subscriptionSmall.title = "Subscriptions";
        subscriptionSmall.style.cursor = "pointer";
        subscriptionSmall.appendChild(icon.cloneNode(true));
        subscriptionSmall.children[0].style.height = "40px";
        subscriptionSmall.children[0].children[0].style.transition = "all 2s";
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
        subscriptionBigWrapper.style.cursor = "pointer";
        let subscriptionBig = document.createElement("div");
        subscriptionBig.classList.add("postSubscriberIcon", "sidebar-topic");
        subscriptionBig.appendChild(icon.cloneNode(true).children[0]);
        subscriptionBig.children[0].style.transition = "all 2s";
        subscriptionBig.children[0].style.transform = "rotate(0deg)";
        subscriptionBig.children[0].classList.add("postSubscriberSpinner");
        subscriptionBig.innerHTML += "Subscriptions";
        let counter = document.createElement("div");
        counter.classList.add("sidebar-num");
        counter.style.paddingTop = "7px";
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
        if (tasselSidebar == null) return;
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
        let info1 = document.createElement("span");
        info1.innerHTML = "Check for new Comments every ";
        content.appendChild(info1);
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
        content.appendChild(select1);
        content.appendChild(document.createElement("br"));
        //save settings when changed
        document.getElementById("tasselPostSubscriberInterval").addEventListener("change", function() {
            localStorage.setItem("postSubscriberInterval", document.getElementById("tasselPostSubscriberInterval").value);
        });

        //show the selected option in the menu, not the default
        let selector1 = document.getElementById("tasselPostSubscriberInterval");
        let interval = localStorage.getItem("postSubscriberInterval");
        for (let a = 0; a < selector1.children.length; a++) {
            if (interval == selector1.children[a].value) selector1.children[a].selected = true;
        }

        //selection of accent color
        let info2 = document.createElement("span");
        info2.innerHTML = "Accent Color ";
        content.appendChild(info2);
        let select2 = document.createElement("select");
        select2.id = "tasselPostSubscriberColorSelect";
        select2.innerHTML = `
          <option value="#ff7fc5">Pillowfort Pink</option>
          <option value="#232b40">Pillowfort Blue</option>
          <option value="" selected>Custom</option>
          <option value="var(--linkColor)">Link Color</option>
        `;
        content.appendChild(select2);
        let color2 = document.createElement("input");
        color2.id = "tasselPostSubscriberColor";
        color2.type = "color";
        color2.value = localStorage.getItem("postSubscriberColor");
        color2.style = "font-size:inherit;height:2.4em;width:2.4em;background:none;vertical-align:bottom;border:1px black solid;border-radius:.5em;margin:10px 0 0 5px;";
        content.appendChild(color2);
        document.getElementById("tasselPostSubscriberColorSelect").addEventListener("click", selectColor_ltapluah);
        document.getElementById("tasselPostSubscriberColor").addEventListener("change", selectColor_ltapluah);

        //show the selected option in the menu, not the default
        let selector2 = document.getElementById("tasselPostSubscriberColorSelect");
        let color = localStorage.getItem("postSubscriberColor");
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
        localStorage.setItem("postSubscriberColor", color);
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
                localStorage.setItem("postsubscriptions", "");
                localStorage.setItem("postsubscriptiondata", "");
            });

            //generate post entries
            getData_ltapluah();
            subscriptionList.forEach(function(data, index) {
                let entry = document.createElement("div");
                entry.style.padding = "10px";
                let unsubIcon = document.createElement("div");
                unsubIcon.innerHTML = iconUnsub;
                unsubIcon.style.display = "inline-block";
                unsubIcon.style.cursor = "pointer";
                unsubIcon.title = "unsubscribe";
                unsubIcon.setAttribute("postid", data[0]);
                entry.appendChild(unsubIcon);
                let titleData = "<span style='display:inline-block;overflow:hidden;text-overflow:ellipsis;max-width:330px;white-space:nowrap;line-height:1em;'>";
                titleData += postData[index][1].slice(0, postData[index][1].length-26);
                titleData += "</span><span style='display:inline-block;overflow:hidden;line-height:1em;padding-left:5px;'>";
                titleData += postData[index][1].slice(postData[index][1].length-26);
                titleData += "</span>";
                entry.innerHTML += "<a href='https://www.pillowfort.social/posts/"+data[0]+"' class='title font-nunito-bold' style='padding-left:10px;display:inline-block;'>"+titleData+"</a>";
                let info = document.createElement("p");
                info.style.paddingLeft = "30px";
                info.style.marginBottom = "0";
                if (data[1] < data[2]) info.innerHTML = (data[2]-data[1])+" new comment(s) • ";
                info.innerHTML += "<span style='color:var(--postFontColor);'>last visit: " + new Date(data[3]*1).toLocaleString()+"</span>";
                entry.appendChild(info);
                document.getElementById("postSubscriberModalContent").appendChild(entry);
                document.getElementById("postSubscriberModalContent").lastChild.firstChild.addEventListener("click", function(){unsubscribe_ltapluah(this.getAttribute("postid"));});
            });
        }
    }

    //queue subscribed posts to check them for new comments
    function checkAll_ltapluah() {
        let lastCheck = localStorage.getItem("postSubscriberTime")*1;
        let interval = localStorage.getItem("postSubscriberInterval")*1 || 1200000;
        let now = new Date().getTime();
        if (now-lastCheck < interval) return;//skip if not enough time has passed

        //loading spinner
        Object.values(document.getElementsByClassName("postSubscriberSpinner")).forEach(function(data) {
            let angle = data.style.transform.split("(")[1].split("d")[0]*1 + 360;
            data.style.transform = `rotate(${angle}deg)`;
        });
        localStorage.setItem("postSubscriberTime", now);
        subscriptionList.forEach(function(data, index) {
            window.setTimeout(function() {
                checkPost_ltapluah(data[0]);
            }, 3000*index);
        });
    }

    //get data from a post
    function checkPost_ltapluah(id) {
        $.getJSON("https://www.pillowfort.social/posts/"+id+"/json", function(json) {
            getData_ltapluah();
            let counter = 0;//counter for new comments from ALL subscriptions
            document.getElementById("postSubscriberNotificationBubble").style.display = "none";
            subscriptionList.forEach(function(data, index) {
                if (data[0] == id) {
                    subscriptionList[index][2] = json.comments_count;
                }
                if (data[1] < subscriptionList[index][2]) {
                    document.getElementById("postSubscriberNotificationBubble").style.display = "block";
                    counter += (subscriptionList[index][2]-data[1]);
                }
            });
            document.getElementById("postSubscriberNotificationCounter").innerHTML = counter;
            setData_ltapluah();
        });
    }

    //load data from localstorage and make it an array
    function getData_ltapluah() {
        subscriptionList = [];
        if (localStorage.getItem("postsubscriptions")) {
            let list = localStorage.getItem("postsubscriptions").split(",");
            list.forEach(function(value){
                subscriptionList.push(value.split(";"));
            });
        }
        postData = [];
        if (localStorage.getItem("postsubscriptiondata")) {
            let list = localStorage.getItem("postsubscriptiondata").split(",");
            list.forEach(function(value){
                postData.push(value.split(";"));
            });
        }
    }

    //remove a subscription
    function unsubscribe_ltapluah(id) {
        getData_ltapluah();
        subscriptionList.forEach(function(data, index) {
            if (data[0] == id) {
                subscriptionList.splice(index, 1);
                postData.splice(index, 1);
                let list = [];
                postData.forEach(function(value) {
                    list.push(value.toString().replaceAll(",",";"));
                });
                list = list.toString();
                localStorage.setItem("postsubscriptiondata", list);
            }
        });
        setData_ltapluah();
        if (document.getElementById("postSubscriberBackground")) showPopup_ltapluah();
    }

    //make data a string and store it locally
    function setData_ltapluah() {
        let list = [];
        subscriptionList.forEach(function(value) {
            list.push(value.toString().replaceAll(",",";"));
        });
        list = list.toString();
        localStorage.setItem("postsubscriptions", list);
    }

    //(un-)subscribe to a post
    function toggleSubscription_ltapluah() {
        if (subscribed) {
            unsubscribe_ltapluah(postID);
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
            //save post data locally
            getData_ltapluah();
            let commentData = [postID, commentCount, commentCount, openTime];
            subscriptionList.push(commentData);
            //remove , and ; from the data so it can't mess with the array formating
            postUser = postUser.replaceAll(",",".").replaceAll(";",":");
            postTitle = postTitle.replaceAll(",",".").replaceAll(";",":");
            postDate = postDate.replaceAll(",",".").replaceAll(";",":");
            let newPostData = [postID, postUser + ": " + postTitle + " (" + postDate + ")"];
            let list = [];
            postData.push(newPostData);
            postData.forEach(function(value) {
                list.push(value.toString().replaceAll(",",";"));
            });
            list = list.toString();
            localStorage.setItem("postsubscriptiondata", list);
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
            setData_ltapluah();
        }
        subscribed = !subscribed;
    }

    //add the "new" marking to comments
    function highlightComments_ltapluah() {
        let pivotTime = subscriptionList.find(function(data) {
            return data[0] == postID;
        })[3];
        let comments = document.getElementsByClassName("comment");
        for (let a = 0; a < comments.length; a++) {
            if (comments[a].classList.contains("postSubscriberProcessed")) continue;
            comments[a].classList.add("postSubscriberProcessed");
            let timeString = comments[a].getElementsByClassName("header")[0].children[1].children[1].title;
            let time = new Date(timeString.replace("@", "")).getTime();
            if (time > pivotTime) {
                let newIcon = document.createElement("div");
                newIcon.innerHTML = "new";
                newIcon.setAttribute("style", "height:0;margin:-25px -53px;color:#ff7fc5;font-weight:bold;font-size:1.5em;");
                if (localStorage.getItem("postSubscriberColor")) newIcon.style.color = localStorage.getItem("postSubscriberColor");
                comments[a].children[0].appendChild(newIcon);
            }
        }
    }
})();
