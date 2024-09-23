// ==UserScript==
// @name         Post Subscriber V3
// @version      3.0
// @description  Get notified when there are new comments in a post.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let tasselSettings = JSON.parse(localStorage.getItem("tasselSettings2"));
    let settings = tasselSettings.postSubscriber;
    if (!settings) settings = {"color":"#ff7fc5","interval":1200000};
    let subscriptions = {"subscriptions":[]};
    let openTime = new Date().getTime();
    let newBrowser = typeof HTMLDialogElement === 'function';

    let icon = document.createElement("div");
    icon.innerHTML = "<svg style='overflow:visible;' class='sidebar-img tasselIconColor' viewBox='0 0 14 14'><title>Subscriptions</title><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M5.5 13.5h-3q-2 0 -2 -2v-8.5q0 -2 2 -2h8.5q2 0 2 2v5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 4h7.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 7h4.5'></path><path xmlns='http://www.w3.org/2000/svg' fill='none' stroke='#58b6dd' stroke-width='.8' d='M3 10h4'></path><g xmlns='http://www.w3.org/2000/svg' transform='scale(0.5),translate(10,10)'><path xmlns='http://www.w3.org/2000/svg' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z' transform='translate(-15.024 -14.708)' style='stroke:#58b6dd;stroke-width:1.6px' class='tasselPostSubscriberIcon'></path></g></svg>";
    let iconUnsub = "<svg class='tasselIconColor' width='100%' height='100%' viewBox='0 0 20 22'><title>unsubscribe</title><path xmlns='http://www.w3.org/2000/svg' transform='translate(-15.024 -14.708)' style='fill:none;stroke:#58b6dd;stroke-width:1.7px' d='M19.653 33.124h-2.817c-.289 0-.578-.02-.867-.04a.436.436 0 01-.307-.561c.177-.319.359-.635.544-.949.274-.466.559-.926.828-1.4.349-.609.7-1.217 1.022-1.839a2.149 2.149 0 00.185-.661 9.817 9.817 0 00.068-1.471c0-.871.011-1.743.02-2.614a6.175 6.175 0 01.5-2.445 6.93 6.93 0 01.986-1.622 6.661 6.661 0 013.694-2.288c.089-.022.127-.053.123-.151a2.576 2.576 0 01.081-.835 1.2 1.2 0 01.982-.915 1.319 1.319 0 011.068.219 1.282 1.282 0 01.514.863c.032.23.033.464.044.7 0 .059.012.087.082.1a7.247 7.247 0 011.569.574 6.471 6.471 0 011.342.888 7.087 7.087 0 011.473 1.787 5.493 5.493 0 01.564 1.28 7.837 7.837 0 01.226 1.125c.05.431.052.868.067 1.3.013.374.015.747.022 1.121l.021 1.216c.006.29.007.579.022.869a3.2 3.2 0 00.073.669 3.043 3.043 0 00.281.634c.2.375.42.742.636 1.11.288.491.583.977.871 1.468q.363.62.716 1.246a.4.4 0 01-.159.507.549.549 0 01-.358.084q-3.194.015-6.388.022c-.165 0-.159 0-.179.171a2.233 2.233 0 01-.607 1.324 2.071 2.071 0 01-1.319.672 2.211 2.211 0 01-1.678-.454 2.243 2.243 0 01-.822-1.365 1.308 1.308 0 01-.023-.217c0-.092-.03-.134-.134-.134-.99.013-1.978.012-2.966.012z'/><path stroke='#58b6dd' stroke-width='2px' d='M3 3l14 17'/></svg>";

    init_ltapluah();
    function init_ltapluah() {
        initTassel_ltapluah();
        loadSubscriptions_ltapluah();
        initSidebar_ltapluah();
        initModal_ltapluah();
        addJsonEvents_ltapluah();

        //start checking for new comments
        checkAll_ltapluah();
        window.setInterval(checkAll_ltapluah, 600000);//check every ten minutes
    }

    //add events to JSON Manager triggers
    function addJsonEvents_ltapluah() {
        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
            let subscribed = subscriptions.subscriptions.some(function(item) {
                return item.id == tasselJsonManager.modal.postId;
            });
            if (subscribed) document.getElementById("tasselPostSubscriberModalSubscribe").classList.add("subscribed");
            else document.getElementById("tasselPostSubscriberModalSubscribe").classList.remove("subscribed");
        });
        document.getElementById("tasselJsonManagerPostReady").addEventListener("click", initSinglePost_ltapluah);
        document.getElementById("tasselJsonManagerCommentReady").addEventListener("click", highlightComments_ltapluah);
        initSinglePost_ltapluah();
        highlightComments_ltapluah();
    }

    //add the "new" marking to comments
    function highlightComments_ltapluah() {
        if (subscriptions.subscriptions.length === 0) return;
        if (!tasselJsonManager.comments.ready) return;
        let pivotTime = subscriptions.subscriptions.find(function(item) {
            return item.id == tasselJsonManager.comments.postId;
        });
        if (!pivotTime) return;
        pivotTime = pivotTime.visited;
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

    //add buttons to the sidebar
    function initSidebar_ltapluah() {
        //collapsed sidebar
        let sidebarSmall = document.getElementsByClassName("sidebar-collapsed")[1];
        let subscriptionsSmall = document.createElement("button");
        subscriptionsSmall.id = "tasselPostSubscriberSidebarSmall";
        if (tasselSettings.tassel.sidebar && tasselSettings.tassel.sidebar.collapsedSubscriptions) subscriptionsSmall.classList.add("tasselRemoveSidebarElement");
        subscriptionsSmall.title = "Subscriptions";
        subscriptionsSmall.appendChild(icon.cloneNode(true));
        let notificationBubble = document.createElement("div");
        notificationBubble.id = "tasselPostSubscriberSidebarBubble";
        subscriptionsSmall.children[0].appendChild(notificationBubble);
        sidebarSmall.insertBefore(subscriptionsSmall, sidebarSmall.children[3]);
        subscriptionsSmall.addEventListener("click", openModal_ltapluah);

        //expanded sidebar
        let sidebarBig = document.getElementById("expanded-bar-container").children[0];
        let subscriptionsBig = document.createElement("button");
        subscriptionsBig.id = "tasselPostSubscriberSidebarBig";
        subscriptionsBig.classList.add("sidebar-topic");
        if (tasselSettings.tassel.sidebar && tasselSettings.tassel.sidebar.expandedSubscriptions) subscriptionsBig.classList.add("tasselRemoveSidebarElement");
        subscriptionsBig.appendChild(icon.cloneNode(true));
        subscriptionsBig.innerHTML += "Subscriptions";
        let counter = document.createElement("div");
        counter.id = "tasselPostSubscriberSidebarCounter";
        counter.classList.add("sidebar-num");
        counter.innerHTML = "0";
        if (tasselSettings.hideNumbers && (tasselSettings.hideNumbers.subscriptionZero || tasselSettings.hideNumbers.subscription)) counter.style.display = "none";
        subscriptionsBig.appendChild(counter);
        for (let child of sidebarBig.children) {
            if (child.href !== "https://www.pillowfort.social/communities") continue;
            sidebarBig.insertBefore(subscriptionsBig, child);
            break;
        }
        subscriptionsBig.addEventListener("click", openModal_ltapluah);

        updateSidebarCounter_ltapluah();
    }

    //generate / open the subscriptions modal
    function openModal_ltapluah() {
        document.body.classList.add("modal-open");
        if (!newBrowser) {
            openLegacyModal_ltapluah();
            return;
        }

        let modal = document.getElementById("tasselPostSubscriberModal");
        if (modal) {
            listSubscriptions_ltapluah();
            modal.showModal();
            return;
        }

        //create modal
        modal = document.createElement("dialog");
        modal.id = "tasselPostSubscriberModal";
        modal.setAttribute("aria-labelledby", "tasselPostSubscriberModalHeader");
        modal.innerHTML = `
                <div class="nomargin">
                    <div id="tasselPostSubscriberModalHeader" class="nomargin">
                        <div style='padding: 10px 15px 5px 20px;'>
                            <button class='close' type='button' title='Close' onclick="document.getElementById('tasselPostSubscriberModal').close();">
                                <span style='color:gray;'>x</span>
                            </button>
                            <h4 class='modal-title'>Subscriptions</h4>
                        </div>
                    </div>
                    <div id="tasselPostSubscriberModalSubHeader">
                        <div>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberCheckAll">update all</button>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberReadAll">mark all as read</button>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberUnsubAll">unsubscribe all</button>
                            <button class="tasselButtonSmall" id="tasselPostSubscriberOpenOptions">settings</button>
                        </div>
                        <span id="tasselPostSubscriberCheckTime" class="nowrap">last update: ${timeToRel_ltapluah(subscriptions.lastCheck)} ago</span>
                    </div>
                    <div id='tasselPostSubscriberModalContent'></div>
                </div>
                `;
        document.body.appendChild(modal);
        modal.addEventListener("close", function() {
            document.body.classList.remove("modal-open");//reanable scrolling of the body when the modal is closed
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
        document.getElementById("tasselPostSubscriberCheckAll").addEventListener("click", function() {
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
        listSubscriptions_ltapluah();
        modal.showModal();
    }

    //generate the subscriptions modal for browsers without dialogs
    function openLegacyModal_ltapluah() {
        let modal = document.createElement("div");
        modal.style = "position: fixed;width: 100vw;height: 100vh;top: 0;padding-top: 50px;display: grid;align-items: center;z-index: 90;";
        modal.innerHTML = `
                    <div id="tasselPostSubscriberModal" style="margin: auto;">
                    <div id="tasselPostSubscriberModalHeader" class="nomargin">
                        <div style='padding: 10px 15px 5px 20px;'>
                            <button class='close' type='button' title='Close' onclick="document.getElementById('tasselPostSubscriberModal').parentNode.remove();document.body.style.overflow = 'auto';">
                                <span style='color:gray'>x</span>
                            </button>
                            <h4 class='modal-title'>Subscriptions</h4>
                        </div>
                    </div>
                    <div id="tasselPostSubscriberModalSubHeader">
                        <div style="height: 28px;overflow: hidden;">
                            <button class="tasselButtonSmall" id="tasselPostSubscriberCheckAll">update all</button>
                        </div>
                        <span id="tasselPostSubscriberCheckTime" class="nowrap">last update: ${timeToRel_ltapluah(subscriptions.lastCheck)} ago</span>
                        <br>
                        <span>Notice: You're using an old browser. Use a newer version for a better experience.<span>
                    </div>
                    <div id='tasselPostSubscriberModalContent'></div>
                    </div>
                `;
        document.body.appendChild(modal);
        document.getElementById("tasselPostSubscriberCheckAll").addEventListener("click", function() {
            checkAll_ltapluah(true);
        });
        listSubscriptions_ltapluah();
    }

    //fill the modal with all subscriped posts
    function listSubscriptions_ltapluah() {
        let modal = document.getElementById("tasselPostSubscriberModalContent");
        if (!modal) return;
        loadSubscriptions_ltapluah();
        if (subscriptions.subscriptions.length === 0) {
            modal.innerHTML = `<p style="margin: 1em;">You don't have any subscriptions yet.</p>`;
            return;
        }

        modal.innerHTML = "";
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
            if (item.comments - item.commentsSeen > 0) entry.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic")[0].innerHTML = `<div><h5>${item.comments - item.commentsSeen}</h5><p>new</p></div>`;
            else if (item.comments - item.commentsSeen < 0) item.commentsSeen = item.comments;
            modal.appendChild(entry);
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
                let id = this.getAttribute("postid");
                let el = this;
                for (let a = 0; a < 100; a++) {
                    if (el.classList.contains("tasselPostSubscriberModalEntry")) {
                        el.style.display = "none";
                        break;
                    } else el = el.parentNode;
                }
                subscriptions.subscriptions.forEach(function(item, index) {
                    if (item.id == id) subscriptions.subscriptions.splice(index, 1);
                });
                updateSidebarCounter_ltapluah();
                saveSubscriptions_ltapluah();
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
        let modal = document.getElementById("post-view-modal");
        if (!modal) return;

        let navigation = modal.getElementsByClassName("post-nav-left")[0];
        let subscribe = document.createElement("button");
        subscribe.id = "tasselPostSubscriberModalSubscribe";
        subscribe.classList.add("nav-tab");
        subscribe.appendChild(icon.cloneNode(true));
        subscribe.firstChild.firstChild.style.width = "22px";
        subscribe.addEventListener("click", function() {
            toggleSubscription_ltapluah(this, tasselJsonManager.modal.json);
        });
        navigation.appendChild(subscribe);

        let loading = document.createElement("div");
        loading.id = "tasselPostSubscriberModalLoading";
        loading.classList.add("nav-tab");
        loading.innerHTML = `<i class="fa fa-circle-notch fa-spin fa-3x fa-fw tasselIconColor" style="color:#58b6dd;"></i>`;
        navigation.appendChild(loading);
    }

    //add elements when viewing a post with its perma-link
    function initSinglePost_ltapluah() {
        if (document.URL.search("/posts/") !== 29) return;
        if (document.URL.search("/posts/new") === 29) return;
        if (!tasselJsonManager.post.ready) return;

        let subscribed = subscriptions.subscriptions.some(function(item) {
            return item.id === tasselJsonManager.post.json.id;
        });

        let navigation = document.getElementsByClassName("post-nav")[0];
        let subscribe = document.createElement("button");
        subscribe.id = "tasselPostSubscriberModalSubscribe";
        subscribe.classList.add("nav-tab");
        if (subscribed) subscribe.classList.add("subscribed");
        subscribe.appendChild(icon.cloneNode(true));
        subscribe.firstChild.firstChild.style.width = "22px";
        subscribe.addEventListener("click", function() {
            toggleSubscription_ltapluah(this, tasselJsonManager.post.json);
        });
        navigation.appendChild(subscribe);

        if (subscribed) {
            //source: https://stackoverflow.com/a/14746878
            window.addEventListener("beforeunload", function(event) {
                event.returnValue = '';
                loadSubscriptions_ltapluah();
                let subscriptionData = subscriptions.subscriptions.find(function(item) {
                    return item.id === tasselJsonManager.post.json.id;
                });
                subscriptionData.visited = openTime;
                subscriptionData.commentsSeen = subscriptionData.comments;
                saveSubscriptions_ltapluah();
            });
        }
        pushEvent_ltapluah({source:"Post Subscriber",text:"single post loaded"});
    }

    //(un-)subscribe to a post
    function toggleSubscription_ltapluah(caller, json) {
        //check if this post is subscribed
        let subscribed = subscriptions.subscriptions.some(function(item) {
            return item.id === json.id;
        });
        if (subscribed) {
            loadSubscriptions_ltapluah();
            subscriptions.subscriptions.forEach(function(item, index) {
                if (item.id == json.id) subscriptions.subscriptions.splice(index, 1);
            });
            saveSubscriptions_ltapluah();
            caller.classList.remove("subscribed");
        } else {
            let newSubscription = {};
            newSubscription.author = json.username;
            newSubscription.comments = json.comments_count;
            newSubscription.commentsSeen = json.comments_count;
            newSubscription.edited = json.last_edited_at || null;
            newSubscription.id = json.id;
            newSubscription.message = "";
            newSubscription.timestamp = new Date(json.publish_at).getTime() || null;
            newSubscription.title = getPostTitle_ltapluah(json);
            newSubscription.visited = openTime;
            loadSubscriptions_ltapluah();
            subscriptions.subscriptions.push(newSubscription);
            saveSubscriptions_ltapluah();
            caller.classList.add("subscribed");
        }
    }

    //queue subscribed posts to check them for new comments
    function checkAll_ltapluah(force) {
        let now = new Date().getTime();
        if (now-subscriptions.lastCheck < settings.interval && !force) { //when it's not time yet, only check stored data, don't fetch new data
            updateSidebarCounter_ltapluah();
            return;
        }
        pushEvent_ltapluah({source:"Post Subscriber",text:"checking for comments"});

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
    }

    //get data from a post
    function checkPost_ltapluah(id) {
        if (id == 0) return;
        $.getJSON("https://www.pillowfort.social/posts/"+id+"/json", function(json) {
            let localCounter = 0;//counter for new comments from THIS subsription
            loadSubscriptions_ltapluah();
            let modalArea = Object.values(document.getElementsByClassName("tasselPostSubscriberModalEntryDataDynamic"));
            modalArea = modalArea.find(function(item) {
                return item.attributes.postid.value == id;
            });
            let subscription = subscriptions.subscriptions.find(function(item) {
                return item.id === id;
            });
            if (subscription) {
                if (!subscription.commentsSeen) subscription.commentsSeen = 0;
                subscription.author = json.username;
                subscription.timestamp = new Date(json.publish_at).getTime() || null;
                subscription.edited = json.last_edited_at;
                subscription.message = "";
                subscription.comments = json.comments_count;
                subscription.title = getPostTitle_ltapluah(json);
                localCounter = subscription.comments - subscription.commentsSeen;
                if (modalArea) {
                    if (localCounter > 0) modalArea.innerHTML = `<div><h5>${localCounter}</h5><p>new</p></div>`;
                    else modalArea.innerHTML = "";
                }
            }
            saveSubscriptions_ltapluah();
            updateSidebarCounter_ltapluah();
        }).fail(function(value) {
            loadSubscriptions_ltapluah();
            let subscription = subscriptions.subscriptions.find(function(item) {
                return item.id === id;
            });
            subscription.message = value.responseJSON.message;
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
        document.getElementById("tasselPostSubscriberSidebarBubble").style.display = "none";
        subscriptions.subscriptions.forEach(function(item, index) {
            if (!item.commentsSeen) item.commentsSeen = 0;
            if (item.commentsSeen < item.comments) {
                if (!(tasselSettings.hideNumbers && tasselSettings.hideNumbers.subscription)) document.getElementById("tasselPostSubscriberSidebarBubble").style.display = "block";
                counter += item.comments - item.commentsSeen;
            }
        });
        document.getElementById("tasselPostSubscriberSidebarCounter").innerHTML = counter;
        if (counter > 0 && !(tasselSettings.hideNumbers && tasselSettings.hideNumbers.subscription)) document.getElementById("tasselPostSubscriberSidebarCounter").style.display = "block";
        else if (tasselSettings.hideNumbers && tasselSettings.hideNumbers.subscriptionZero) document.getElementById("tasselPostSubscriberSidebarCounter").style.display = "none";
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

    /* Create event log for debug more */
    function pushEvent_ltapluah(data) {
        if (!tasselSettings.tassel.debug) return;
        let event = document.createElement("div");
        event.innerHTML = `
          <p><b>${data.source}:</b> ${data.text}</p>
        `;
        event.id = "event" + Math.random();
        document.getElementById("tasselEvents").appendChild(event);
        window.setTimeout(function() {
            event.classList.add("fade-out");
            window.setTimeout(function() {
                event.remove();
            }, 5000);
        }, 30000);
    }
})();
