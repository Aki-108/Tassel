// ==UserScript==
// @name         Post Subscriber V2
// @version      2.10
// @description  Get notified when there are new comments in a post.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let newBrowser = typeof HTMLDialogElement === 'function';//check if the browser supports the <dialog> element
    let subscribed = false;
    let thisPost = {};
    let openTime = new Date().getTime();

    let tasselSettings = JSON.parse(localStorage.getItem("tasselSettings2")).tassel;
    let hideNumbersSettings = JSON.parse(localStorage.getItem("tasselSettings2")).hideNumbers || {};
    let settings = (JSON.parse(localStorage.getItem("tasselSettings2")) || {});
    if (settings.postSubscriber) {
        settings = settings.postSubscriber;
    } else {
        settings = {
            "color": "#ff7fc5",
            "interval": 1200000,
            "loadingIndicator": true
        };
    }
    let subscriptions;
    loadSubscriptions_ltapluah();

    let icon = document.createElement("div");
    icon.innerHTML = "<svg style='overflow:visible;' class='sidebar-img tasselIconColor' viewBox='0 0 14 14'><title>Subscriptions</title><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M5.5 13.5h-3q-2 0 -2 -2v-8.5q0 -2 2 -2h8.5q2 0 2 2v5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 4h7.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 7h4.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 10h4'></path><g xmlns='http://www.w3.org/2000/svg' transform='scale(0.5),translate(10,10)'><path xmlns='http://www.w3.org/2000/svg' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.6px'></path></g></svg>";
    let iconUnsub = "<svg class='tasselIconColor' width='100%' height='100%' viewBox='0 0 20 22'><title>unsubscribe</title><path xmlns='http://www.w3.org/2000/svg' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.7px' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z'/><path stroke='#58b6dd' stroke-width='2px' d='M3 3l14 17'/></svg>";

    let commentContainer = document.getElementsByClassName("comments-container")[0];
    let postModal = document.getElementById("post-view-modal");
    let styleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (commentContainer) {//for single posts
                if (subscribed) highlightComments_ltapluah();
            }
            if (postModal != null && postModal.classList.contains("in")) {
                initModal_ltapluah();
            }
        });
    });

    //start initialization
    if (document.getElementsByClassName("sidebar-expanded").length > 0) init_ltapluah();
    else waitForKeyElements(".sidebar-expanded", init_ltapluah);
    if (document.getElementById("post-view-modal")) initModal_ltapluah();
    else waitForKeyElements("#post-view-modal", initModal_ltapluah);
    function init_ltapluah() {
        if (document.getElementsByClassName("postSubscriberIcon").length > 0) return;
        initSidebar_ltapluah();
        initTassel_ltapluah();
        initSinglePost_ltapluah();

        if (commentContainer) {
            styleObserver.observe(commentContainer, {
                childList: true
            });
            if (subscribed) highlightComments_ltapluah();
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

    //add the "new" marking to comments
    function highlightComments_ltapluah() {
        if (subscriptions.subscriptions.length === 0) return;
        let pivotTime = subscriptions.subscriptions.find(function(item) {
            return item.id === thisPost.id;
        }).visited;
        let comments = document.getElementsByClassName("comment");
        let newCounter = 0;
        for (let a = 0; a < comments.length; a++) {
            if (comments[a].classList.contains("postSubscriberProcessed")) continue;
            comments[a].classList.add("postSubscriberProcessed");
            let timeString = comments[a].getElementsByClassName("header")[0].children[1].children[1].title;
            let time = new Date(timeString.replace("@", "")).getTime();
            if (time > pivotTime) {
                let newIcon = document.createElement("div");
                newIcon.innerHTML = "new";
                newIcon.id = "tasselPostSubscriberNewComment" + newCounter;
                newIcon.style.color = settings.color;
                newCounter++;
                comments[a].children[0].appendChild(newIcon);
            }
        }
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
        notificationBubble.id = "postSubscriberNotificationBubble";
        subscriptionSmall.children[0].appendChild(notificationBubble);
        subscriptionSmall.addEventListener("click", showPopup_ltapluah);
        sidebarSmall.insertBefore(subscriptionSmall, sidebarSmall.children[3]);

        //add button to expanded sidebar
        let sidebarBig = document.getElementsByClassName("sidebar-expanded")[1];
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
        subscriptionBig.children[0].style.transition = "transform 2s";
        subscriptionBig.children[0].style.transform = "rotate(0deg)";
        subscriptionBig.children[0].classList.add("postSubscriberSpinner");
        subscriptionBig.innerHTML += "Subscriptions";
        let counter = document.createElement("div");
        counter.classList.add("sidebar-num");
        counter.style.paddingTop = "7px";
        if (hideNumbersSettings.subscriptionZero) counter.style.display = "none";
        counter.id = "postSubscriberNotificationCounter";
        counter.innerHTML = "0";
        subscriptionBig.appendChild(counter);
        subscriptionBigWrapper.appendChild(subscriptionBig);
        for (let child of sidebarBig.children) {
            if (child.href !== "https://www.pillowfort.social/communities") continue;
            sidebarBig.insertBefore(subscriptionBigWrapper, child);
            break;
        }

        //make sidebar bigger but only if Tassel isn't installed
        if (document.getElementById("tasselModalSidebar") != null) return;
        document.getElementsByClassName("sidebar site-sidebar")[0].style.marginTop = "10px";
        document.getElementById("expanded-bar-container").style.maxHeight = "calc(100vh - 100px)";
        document.getElementsByClassName("sidebar-bottom sidebar-expanded")[0].style.width = "100%";
    }

    //show the popup of subscriptions
    function showPopup_ltapluah() {
        document.body.style.overflow = 'hidden';//disable scrolling of the body when the modal is open
        let modal = document.getElementById("postSubscriberModal");
        //generate the modal if it doesn't already exist
        if (!modal) {
            if (newBrowser) {
                modal = document.createElement("dialog");
                modal.id = "postSubscriberModal";
                modal.setAttribute("aria-labelledby", "tasselPostSubscriberModalHeader");
                modal.innerHTML = `
                <div class="nomargin">
                    <div id="tasselPostSubscriberModalHeader" class="nomargin">
                        <div style='padding: 10px 15px 5px 20px;'>
                            <button class='close' type='button' title='Close' onclick="document.getElementById('postSubscriberModal').close();">
                                <span style='color:gray;'>x</span>
                            </button>
                            <h4 class='modal-title'>Subscriptions</h4>
                        </div>
                    </div>
                    <div id="tasselPostSubscriberModalSubHeader">
                        <div>
                            <button class="tasselButtonSmall" id="postSubscriberCheck">update all</button>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberReadAll">mark all as read</button>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberUnsubAll">unsubscribe all</button>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberOpenOptions">settings</button>
                        </div>
                        <span id="tasselPostSubscriberCheckTime" class="nowrap">last update: ${timeToRel_ltapluah(subscriptions.lastCheck)} ago</span>
                    </div>
                    <div id='postSubscriberModalContent'></div>
                </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener("close", function() {
                    document.body.style.overflow = "auto";//reanable scrolling of the body when the modal is closed
                });
                modal.addEventListener("click", function(e) {
                    const bounds = modal.getBoundingClientRect();
                    if (e.clientX < bounds.left ||
                        e.clientX > bounds.right ||
                        e.clientY < bounds.top ||
                        e.clientY > bounds.bottom) {
                        modal.close();
                    }
                });
                //button event listenrs
                document.getElementById("postSubscriberCheck").addEventListener("click", function() {
                    checkAll_ltapluah(true);
                });
                document.getElementById("tasselPostSubscriberReadAll").addEventListener("click", function() {
                    Object.values(document.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic")).forEach(function(item) {
                        item.innerHTML = "";
                    });
                    subscriptions.subscriptions.forEach(function(item) {
                        item.commentsSeen = item.comments;
                    });
                    saveSubscriptions_ltapluah();
                    updateSidebarCounter_ltapluah();
                });
                document.getElementById("tasselPostSubscriberUnsubAll").addEventListener("click", function() {
                    subscriptions.subscriptions = [];
                    saveSubscriptions_ltapluah();
                    updateSidebarCounter_ltapluah();
                    document.getElementById("postSubscriberModalContent").innerHTML = `<p style="margin: 1em;">You don't have any subscriptions yet.</p>`;
                });
                document.getElementById("tasselPostSubscriberOpenOptions").addEventListener("click", function() {
                    modal.close();
                    document.getElementsByClassName("tasselSidebarBig")[0].click()
                    tasselDisplaySettings_ltapluah();
                });
            } else {
                modal = document.createElement("div");
                modal.style = "position: fixed;width: 100vw;height: 100vh;top: 0;padding-top: 50px;display: grid;align-items: center;z-index: 90;";
                modal.innerHTML = `
                    <div id="postSubscriberModal" style="margin: auto;">
                    <div id="tasselPostSubscriberModalHeader" class="nomargin">
                        <div style='padding: 10px 15px 5px 20px;'>
                            <button class='close' type='button' title='Close' onclick="document.getElementById('postSubscriberModal').parentNode.remove();document.body.style.overflow = 'auto';">
                                <span style='color:gray'>x</span>
                            </button>
                            <h4 class='modal-title'>Subscriptions</h4>
                        </div>
                    </div>
                    <div id="tasselPostSubscriberModalSubHeader">
                        <div style="height: 28px;overflow: hidden;">
                            <button class="tasselButtonSmall" id="postSubscriberCheck">update all</button>
                        </div>
                        <span id="tasselPostSubscriberCheckTime" class="nowrap">last update: ${timeToRel_ltapluah(subscriptions.lastCheck)} ago</span>
                        <br>
                        <span>Notice: You're using an old browser. Use a newer version for a better experience.<span>
                    </div>
                    <div id='postSubscriberModalContent'></div>
                    </div>
                `;
                document.body.appendChild(modal);
                document.getElementById("postSubscriberCheck").addEventListener("click", function() {
                    checkAll_ltapluah(true);
                });
            }
        }
        if (newBrowser) modal.showModal();

        if (subscriptions.subscriptions.length === 0) {
            document.getElementById("postSubscriberModalContent").innerHTML = `<p style="margin: 1em;">You don't have any subscriptions yet.</p>`;
            return;
        }

        //generate list of subscriptions
        document.getElementById("postSubscriberModalContent").innerHTML = "";
        subscriptions.subscriptions.forEach(function(item, index) {
            let entry = document.createElement("div");
            entry.classList.add("tasselPostSubscriberModalEntry");
            let message = "";
            if (item.edited) message = `<span class="vertical-line nowrap">edited ${item.edited} ago</span>`;
            if (item.message) message = `<span class="vertical-line nowrap">${item.message}</span>`;
            entry.innerHTML = `
                <div class="tasselPostSubscriberModalEntryBack">
                    <div></div>
                    <div class="tasselPostSubscriberModalEntryBackRight">
                        <button id="tPSread${item.id}" postid="${item.id}" style="padding: 0 0 4px 12px;" title="mark as read">
                            <div class="tasselCheckmark"></div>
                        </button>
                        <button id="tPSunsub${item.id}" postid="${item.id}" style="padding: 3px;" title="unsubscribe">${iconUnsub}</button>
                    </div>
                </div>
                <div class="tasselPostSubscriberModalEntryDataFrame">
                    <div href="https://www.pillowfort.social/posts/${item.id}" class="tasselPostSubscriberModalEntryData">
                        <div>
                            <h5>
                                <a href="https://www.pillowfort.social/posts/${item.id}">${item.title}</a>
                            </h5>
                            <p>
                                <span class="vertical-line nowrap"><a href="https://www.pillowfort.social/${item.author}">${item.author}</a></span><break>
                                </break><span class="vertical-line nowrap">posted ${timeToStamp_ltapluah(item.timestamp)}</span><break>
                                </break>${message}<break>
                                </break><span class="vertical-line nowrap">last visit ${timeToStamp_ltapluah(item.visited)}</span>
                            </p>
                        </div>
                        <div class="tasselPostSubscriberModalEntryDataDynamic" postid="${item.id}"></div>
                    </div>
                </div>
            `;
            if (item.comments - item.commentsSeen) entry.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic")[0].innerHTML = `<div><h5>${item.comments - item.commentsSeen}</h5><p>new</p></div>`;
            document.getElementById("postSubscriberModalContent").appendChild(entry);
            document.getElementById(`tPSread${item.id}`).addEventListener("click", function() {
                for (let a = 0, el = this; a < 100; a++, el = el.parentNode) {
                    if (el.classList.contains("tasselPostSubscriberModalEntry")) {
                        el.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic")[0].innerHTML = "";
                        break;
                    }
                }
                let postId = this.getAttribute("postid");
                let subscription = subscriptions.subscriptions.find(function(item) {
                    return item.id == postId;
                });
                if (subscription) {
                    subscription.commentsSeen = subscription.comments;
                    saveSubscriptions_ltapluah();
                }
                updateSidebarCounter_ltapluah();
            });
            document.getElementById(`tPSunsub${item.id}`).addEventListener("click", function() {
                let el = this;
                for (let a = 0; a < 100; a++) {
                    if (el.classList.contains("tasselPostSubscriberModalEntry")) {
                        el.style.display = "none";
                        break;
                    } else el = el.parentNode;
                }
                unsubscribe_ltapluah(this.getAttribute("postid"));
                updateSidebarCounter_ltapluah();
            });
        });
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
        let options2 = document.createElement("div");
        options2.id = "tasselPostSubscriberColorFrame";
        options2.innerHTML = `
            <select id="tasselPostSubscriberColorSelect">
                <option value="#ff7fc5">Pillowfort Pink</option>
                <option value="#232b40">Pillowfort Blue</option>
                <option value="" selected>Custom</option>
                <option value="var(--linkColor)">Link Color</option>
            </select>
            <input id="tasselPostSubscriberColor" type="color" value="${settings.color}">
        `;
        info2.appendChild(options2);
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

    /* Save list of active extensions to local storage */
    function saveSettings_ltapluah() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.postSubscriber = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    //convert unix to a string of "MMM DD, YYYY @ hh:mm pm"
    function timeToStamp_ltapluah(unix) {
        let date = new Date(unix);
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let string = months[date.getMonth()] + " ";
        let day = date.getDate();
        if (day < 10) string += "0";
        string += day + ", " + date.getFullYear() + " @ ";
        let hours = date.getHours();
        let ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12;
        if (hours < 10) string += "0";
        string += hours + ":";
        let minutes = date.getMinutes();
        if (minutes < 10) string += "0";
        string += minutes + " " + ampm;
        return string;
    }

    //convert unix to a relative timestamp
    function timeToRel_ltapluah(unix) {
        if (unix === undefined) return "some time";
        let now = new Date().getTime();
        let rel = now - unix;
        let minutes = Math.round(rel / 60000);
        if (minutes === 1) return "1 minute";
        if (minutes <= 90) return minutes + " minutes";
        let hours = Math.round(rel / 3600000);
        if (hours === 1) return "1 hour";
        if (hours < 24) return hours + " hours";
        let days = Math.round(rel / 86400000);
        if (days === 1) return "1 day";
        return days + " days";
    }

    //when viewing a post in the modal
    function initModal_ltapluah() {
        let navigation = postModal.getElementsByClassName("post-nav-left")[0];

        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {

            //check if this post is subscribed
            thisPost.id = postModal.getElementsByClassName("link_post")[0].href.substring(36)*1;
            if (thisPost.id == 0) {
                initModal_ltapluah();
                return;
            }
            subscribed = subscriptions.subscriptions.some(function(item) {
                return item.id === thisPost.id;
            });

            //get posts information in preparation for a new subscription
            thisPost.comments = tasselJsonManager.modal.json.comments_count;
            thisPost.commentsSeen = tasselJsonManager.modal.json.comments_count;
            thisPost.author = tasselJsonManager.modal.json.username || "ERROR";
            thisPost.title = getPostTitle_ltapluah(tasselJsonManager.modal.json);
            thisPost.timestamp = new Date(tasselJsonManager.modal.json.created_at).getTime() || null;
            thisPost.edited = tasselJsonManager.modal.json.last_edited_at || null;
            thisPost.visited = openTime;

            //switch from loading circle to subscribe button
            document.getElementById("postSubscriberPostModal").style.display = "inline-block";
            document.getElementById("postSubscriberPostModalLoading").style.display = "none";

            if (subscribed) {
                document.getElementById("postSubscriberPostModal").firstChild.classList.add("svg-pink-light");
                document.getElementById("postSubscriberPostModal").firstChild.firstChild.lastChild.firstChild.style.fill = "rgb(88, 182, 221)";
            } else {
                document.getElementById("postSubscriberPostModal").firstChild.classList.remove("svg-pink-light");
                document.getElementById("postSubscriberPostModal").firstChild.firstChild.lastChild.firstChild.style.fill = "none";
            }

        });

        //switch from subscribe button to loading circle
        if (document.getElementById("postSubscriberPostModal")) {
            document.getElementById("postSubscriberPostModal").style.display = "none";
            document.getElementById("postSubscriberPostModalLoading").style.display = "inline-block";
            return;
        }
        //add button to post navigation
        let subscriptionNav = document.createElement("span");
        subscriptionNav.id = "postSubscriberPostModal";
        subscriptionNav.style.display = "none";
        subscriptionNav.title = subscribed ? "unsubscribe" : "subscribe";
        subscriptionNav.classList.add("nav-tab");
        subscriptionNav.appendChild(icon.cloneNode(true));
        subscriptionNav.firstChild.firstChild.style.width = "22px";
        subscriptionNav.addEventListener("click", toggleSubscription_ltapluah);
        navigation.appendChild(subscriptionNav);
        let subscriptionLoading = document.createElement("div");
        subscriptionLoading.id = "postSubscriberPostModalLoading";
        subscriptionLoading.classList.add("nav-tab");
        subscriptionLoading.innerHTML = `<i class="fa fa-circle-notch fa-spin fa-3x fa-fw tasselIconColor" style="color:#58b6dd;"></i>`;
        navigation.appendChild(subscriptionLoading);
    }

    //add elements when viewing a post with its perma-link
    function initSinglePost_ltapluah() {
        if (document.URL.search("/posts/") !== 29) return;
        if (document.URL.search("/posts/new") === 29) return;

        //check if this post is subscribed
        let postID = document.URL.substring(36);
        if (postID.indexOf("/") >= 0) postID = postID.substring(0, postID.indexOf("/"));
        if (postID.indexOf("?") >= 0) postID = postID.substring(0, postID.indexOf("?"));
        thisPost.id = postID*1;
        let subscriptionData = subscriptions.subscriptions.find(function(item) {
            return item.id === thisPost.id;
        });
        subscribed = subscriptionData ? true : false;

        //add button to post navigation
        let postNav = document.getElementsByClassName("post-nav")[0];
        let subscriptionNav = document.createElement("span");
        subscriptionNav.id = "postSubscriberToggle";
        subscriptionNav.title = subscribed ? "unsubscribe" : "subscribe";
        subscriptionNav.classList.add("nav-tab");
        subscriptionNav.appendChild(icon.cloneNode(true));
        subscriptionNav.firstChild.firstChild.style.width = "22px";
        subscriptionNav.addEventListener("click", toggleSubscription_ltapluah);
        postNav.appendChild(subscriptionNav);
        if (subscribed) {
            document.getElementById("postSubscriberToggle").firstChild.classList.add("svg-pink-light");
            document.getElementById("postSubscriberToggle").firstChild.firstChild.lastChild.firstChild.style.fill = "rgb(88, 182, 221)";

            document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
                loadSubscriptions_ltapluah();
                let subscriptionData = subscriptions.subscriptions.find(function(item) {
                    return item.id === thisPost.id;
                });
                subscriptionData.comments = tasselJsonManager.post.json.comments_count;
                subscriptionData.title = getPostTitle_ltapluah(tasselJsonManager.post.json);
                subscriptionData.edited = tasselJsonManager.post.json.last_edited_at || null;
                saveSubscriptions_ltapluah();
                thisPost = subscriptionData;

                //source: https://stackoverflow.com/a/14746878
                window.addEventListener("beforeunload", function(event) {
                    event.returnValue = '';
                    loadSubscriptions_ltapluah();
                    let subscriptionData = subscriptions.subscriptions.find(function(item) {
                        return item.id === thisPost.id;
                    });
                    subscriptionData.visited = openTime;
                    subscriptionData.commentsSeen = subscriptionData.comments;
                    saveSubscriptions_ltapluah();
                });
            });
        } else {

            //get posts information in preparation for a new subscription
            thisPost.visited = new Date().getTime();
            document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
                thisPost.comments = tasselJsonManager.post.json.comments_count;
                thisPost.commentsSeen = tasselJsonManager.post.json.comments_count;
                thisPost.author = tasselJsonManager.post.json.username || "ERROR";
                thisPost.title = getPostTitle_ltapluah(tasselJsonManager.post.json);
                thisPost.timestamp = new Date(tasselJsonManager.post.json.created_at).getTime() || null;
                thisPost.edited = tasselJsonManager.post.json.last_edited_at || null;
            });
        }
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
            let newSubscription = {};
            for (let key in thisPost) {
                newSubscription[key] = thisPost[key];
            }
            loadSubscriptions_ltapluah();
            subscriptions.subscriptions.push(newSubscription);
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

    //remove a subscription
    function unsubscribe_ltapluah(id) {
        loadSubscriptions_ltapluah();
        subscriptions.subscriptions.forEach(function(item, index) {
            if (item.id == id) subscriptions.subscriptions.splice(index, 1);
        });
        saveSubscriptions_ltapluah();
    }

    //queue subscribed posts to check them for new comments
    function checkAll_ltapluah(force) {
        let interval = settings.interval;
        let now = new Date().getTime();
        if (now-subscriptions.lastCheck < interval && !force) { //when it's not time yet, only check stored data, don't fetch new data
            updateSidebarCounter_ltapluah();
            return;
        }

        loadSubscriptions_ltapluah();
        subscriptions.lastCheck = now;
        saveSubscriptions_ltapluah();
        if (document.getElementById("tasselPostSubscriberCheckTime")) document.getElementById("tasselPostSubscriberCheckTime").innerHTML = `last update: ${timeToRel_ltapluah(subscriptions.lastCheck)} ago`;
        let modalAreas = Object.values(document.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic"));
        modalAreas.forEach(function(item) {
            item.innerHTML = `<i class="fa fa-circle-notch fa-spin fa-2x fa-fw tasselLinkColor"></i>`;
        });
        subscriptions.subscriptions.forEach(function(item, index) {
            window.setTimeout(function() {
                checkPost_ltapluah(item.id);
            }, 1000*index);
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
        if (id == 0) return;
        $.getJSON("https://www.pillowfort.social/posts/"+id+"/json", function(json) {
            let localCounter = 0;//counter for new comments from THIS subsription
            loadSubscriptions_ltapluah();
            document.getElementById("postSubscriberNotificationBubble").style.display = "none";
            let modalArea = Object.values(document.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic"));
            modalArea = modalArea.find(function(item) {
                return item.attributes.postid.value == id;
            });
            subscriptions.subscriptions.forEach(function(item, index) {
                if (item.id === id) {
                    item.message = "";
                    item.comments = json.comments_count;
                    item.title = getPostTitle_ltapluah(json);
                    localCounter = item.comments - item.commentsSeen;
                    if (modalArea) {
                        if (localCounter > 0) {
                            modalArea.innerHTML = `<div><h5>${localCounter}</h5><p>new</p></div>`;
                        } else {
                            modalArea.innerHTML = "";
                        }
                    }
                }
                if (!item.commentsSeen) item.commentsSeen = 0;
            });
            updateSidebarCounter_ltapluah();
            saveSubscriptions_ltapluah();
        }).fail(function(value) {
            loadSubscriptions_ltapluah();
            let subscriptionData = subscriptions.subscriptions.find(function(item) {
                return item.id === id;
            });
            subscriptionData.message = value.responseJSON.message;
            saveSubscriptions_ltapluah();
            let modalArea = Object.values(document.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic"));
            modalArea = modalArea.find(function(item) {
                return item.attributes.postid.value == id;
            });
            if (modalArea) modalArea.innerHTML = "<h5>\u26A0</h5>";
        });
    }

    //put the counter of total unread comments in the sidebar
    function updateSidebarCounter_ltapluah() {
        let counter = 0;//counter for new comments from ALL subscriptions
        document.getElementById("postSubscriberNotificationBubble").style.display = "none";
        subscriptions.subscriptions.forEach(function(item, index) {
            if (!item.commentsSeen) item.commentsSeen = 0;
            if (item.commentsSeen < item.comments) {
                if (!hideNumbersSettings.subscription) document.getElementById("postSubscriberNotificationBubble").style.display = "block";
                counter += item.comments - item.commentsSeen;
            }
        });
        document.getElementById("postSubscriberNotificationCounter").innerHTML = counter;
        if (counter > 0 && !hideNumbersSettings.subscription) document.getElementById("postSubscriberNotificationCounter").style.display = "block";
        else if (hideNumbersSettings.subscriptionZero) document.getElementById("postSubscriberNotificationCounter").style.display = "none";
    }

    //return a post "title" based on title, text or post type
    function getPostTitle_ltapluah(json) {
        if (json.title) return json.title;
        if (!json.content) return json.post_type.substring(0, 1).toUpperCase() + json.post_type.substring(1);
        let postBody = document.createElement("div");
        postBody.innerHTML = json.content.replaceAll("<br>", "\n");
        let text = postBody.textContent;
        if (text.length > 40) return text.substring(0, 37) + "...";
        return text.substring(0, 40);
    }

    /* Load the list of subscripted posts from local storage*/
    function loadSubscriptions_ltapluah() {
        subscriptions = (JSON.parse(localStorage.getItem("tasselPostSubscriber")) || {});
        if (subscriptions.subscriptions === undefined) subscriptions.subscriptions = [];
    }

    /* Save list of subscriped posts to local storage */
    function saveSubscriptions_ltapluah() {
        localStorage.setItem("tasselPostSubscriber", JSON.stringify(subscriptions));
    }
})();
