// ==UserScript==
// @name         Tassel
// @version      0.4
// @description  Pillowfort Extension Manager
// @author       aki108
// @match        http*://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @updateURL    https://raw.githubusercontent.com/Aki-108/Tassel/main/tassel.js
// @downloadURL  https://raw.githubusercontent.com/Aki-108/Tassel/f211144933e121ace248206a5b79ac41b848c545/tassel.js
// @supportURL   https://www.pillowfort.social/Tassel
// @resource     tasselCSS https://raw.githubusercontent.com/Aki-108/Tassel/3c680115ef20cb66034a60e6281a9028a4bea481/style.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    let extensionsIndexURL = "https://cdn.rawgit.com/Aki-108/Tassel/2dea53361cf29fbeb68902e88a0ff47af3893563/extensionsIndex.js";
    let toastsURL = "https://cdn.rawgit.com/Aki-108/Tassel/4924e0d91b9f8b7f1c0b4c26cfc5f4c12199e854/toasts.js";

    let icon = document.createElement("div");
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <path xmlns="http://www.w3.org/2000/svg" id="prefix__ic_settings" style="fill:none;stroke:#58b6dd;stroke-width:1.2px" d="
          M 8 7        Q 6.5 8 6.5 12     Q 6.5 16 4 19
          M 12 7       Q 13.5 8 13.5 12   Q 13.5 16 16 19
          M 8 2.5      L 8 0.5            L 12 0.5            L 12 2.5
          M 6 16       L 8 18.5           L 10 16             L 12 18.5           L 14 16
        "/>
        <circle cx="10" fill="none" stroke-width="1.2px" r="3" stroke="#58b6dd" cy="5"/>
      </svg>`;

    let settings = localStorage.getItem("tasselSettings") || "11100010";
    /* settings ids
    0  Get Notifications for Active Extensions
    1  Get Notifications for Inactive Extensions
    2  Get Notifications for New Extensions
    3  Show Experimental Extensions in the List
    4  Shorten Expended Sidebar
    5  Hide 0 Notification Counter
    6  Sticky Text Toolbar
    7  Highlight Linked Comments
    */
    let sortOrder = "new";//order in which to display extensions in the list
    let loadedExtensions = [];

    //src: https://aaronsmith.online/easily-load-an-external-script-using-javascript/
    const loadScript_xcajbuzn = src => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.onload = resolve
            script.onerror = reject
            script.src = src
            document.head.append(script)
        })
    }

    //source: https://stackoverflow.com/a/43027791
    var waitForJQuery = setInterval(function () {
        if (typeof $ != 'undefined') {
            clearInterval(waitForJQuery);
            loadScript_xcajbuzn("https://cdn.rawgit.com/vnausea/waitForKeyElements/f50495d44441c0c5d153d7a5ff229eeaace0bf9e/waitForKeyElements.js")
                .then().then(() => init_xcajbuzn());
        }
    }, 10);

    /* Initialize */
    function init_xcajbuzn() {
        GM_addStyle(GM_getResourceText("tasselCSS"));
        loadScript_xcajbuzn(extensionsIndexURL)
            .then().then(() => loadExtensions_xcajbuzn());
        initToast_xcajbuzn();
        createModal_xcajbuzn();
        loadData_xcajbuzn();
        waitForKeyElements(".sidebar-expanded", initSidebar_xcajbuzn);
    }

    /* Add buttons to sidebar */
    function initSidebar_xcajbuzn() {
        if (document.getElementsByClassName("tasselSidebarBig").length > 0) return; //stop if sidebar has already been initialized

        //add button to collapsed sidebar
        let sidebarSmall = document.getElementsByClassName("sidebar-collapsed")[1];
        let settingsSmall = document.createElement("a");
        settingsSmall.href = "";//add a link to comply with accessibility requirements but don't open the link
        settingsSmall.addEventListener("click", function(event) {
            event.preventDefault();
        });
        settingsSmall.classList.add("sidebar-icon", "tasselSidebarSmall");
        settingsSmall.title = "Tassel";
        let imageSmall = icon.cloneNode(true);
        settingsSmall.appendChild(imageSmall);
        settingsSmall.addEventListener("click", openModal_xcajbuzn);
        sidebarSmall.appendChild(settingsSmall);

        //add button to expanded sidebar
        let sidebarBig = document.getElementsByClassName("sidebar-expanded")[1];
        sidebarBig.children[8].firstChild.style.paddingBottom = "0";
        let settingsBigWrapper = document.createElement("a");
        settingsBigWrapper.href = "";//add a link to comply with accessibility requirements but don't open the link
        settingsBigWrapper.addEventListener("click", function(event) {
            event.preventDefault();
        });
        settingsBigWrapper.addEventListener("click", openModal_xcajbuzn);
        let settingsBig = document.createElement("div");
        settingsBig.classList.add("sidebar-topic", "tasselSidebarBig");
        let image = icon.children[0];
        image.classList.add("sidebar-img");
        image.style.transform = "scale(1.2)";
        image.style.filter = "var(--iconColor)";
        settingsBig.appendChild(image);
        settingsBig.innerHTML += "Tassel";
        settingsBigWrapper.appendChild(settingsBig);
        sidebarBig.appendChild(settingsBigWrapper);

        //shorten the expended sidebar
        if (settings[4] == "1") {
            let sidebarItems = document.getElementsByClassName("sidebar-topic");
            Object.values(sidebarItems).forEach(function(item) {
                item.style.marginTop = "8px";
                item.style.marginBottom = "8px";
            });
            let sidebarBottom = document.getElementsByClassName("sidebar-bottom-left");
            Object.values(sidebarBottom).forEach(function(item) {
                item.style.paddingTop = "10px";
                item.style.paddingBottom = "8px";
            });
        }

        //hide 0 notifications
        if (settings[5] == "1") {
            Object.values(document.getElementsByClassName("sidebar-num")).forEach(function(el) {
                if (el.innerHTML = "0") el.style.display = "none"
            });
        }
    }

    /* Create the modal basis with sidebar */
    function createModal_xcajbuzn() {
        let modal = document.createElement("div");
        modal.id = "tasselModal";
        modal.classList.add("modal", "in");
        //create the stucture with header, sidebar and content-box
        modal.innerHTML = `
          <div id='tasselModalDialog1' class='modal-dialog'>
            <div id='tasselModalDialog2' class='modal-content'>
              <div id='tasselModalHeader'>
                <button id='tasselModalClose' class='close' type='button' title='Close'>
                <span style='color:#2b2b2b;'>x</span>
                </button>
                <h4 class='modal-title'>Tassel</h4>
              </div>
              <div id='tasselModalGrid'>
                <div id='tasselModalSidebar'>
                  <button class='tasselModalSidebarEntry' id='tasselModalSidebarExtensions'>Extensions</button>
                  <button class='tasselModalSidebarEntry' id='tasselModalSidebarSettings'>Settings</button>
                  <button class='tasselModalSidebarEntry' id='tasselModalSidebarAbout'>About</button>
                </div>
                <div id='tasselModalContent'></div>
              </div>
            </div>
          </div>
          <div id='tasselModalBackground' class='modal-backdrop in'></div>`;
        document.getElementsByTagName("body")[0].appendChild(modal);
        document.getElementById("tasselModalSidebarExtensions").addEventListener("click", displayExtensions_xcajbuzn);
        document.getElementById("tasselModalSidebarSettings").addEventListener("click", displaySettings_xcajbuzn);
        document.getElementById("tasselModalSidebarAbout").addEventListener("click", displayAbout_xcajbuzn);
        document.getElementById("tasselModalBackground").addEventListener("click", closeModal_xcajbuzn);
        document.getElementById("tasselModalClose").addEventListener("click", closeModal_xcajbuzn);
    }

    /* Load the selection of active extension */
    function loadData_xcajbuzn() {
        let data = localStorage.getItem("tasselActive");
        if (data == null) return;
        data = data.split(",");
        loadedExtensions = [];
        data.forEach(function(value){
            value = value.split(";");
            value[0] = value[0]*1;
            value[1] = value[1]*1;
            loadedExtensions.push(value);
        });
    }

    /* Load extensions from external file */
    function loadExtensions_xcajbuzn() {
        loadedExtensions.forEach(function(value) {
            let extension = extensionsIndex.find(function(data) {
                return data.id == value[0];
            });
            if (extension != undefined) loadScript_xcajbuzn(extension.src);
        });
        evaluateURLParameter_xcajbuzn();
    }

    /* Create the basis for toasts */
    function initToast_xcajbuzn() {
        let toastFrame = document.createElement("div");
        toastFrame.id = "tasselToast";
        document.getElementsByTagName("body")[0].appendChild(toastFrame);

        loadScript_xcajbuzn(toastsURL)
            .then().then(() => loadToasts_xcajbuzn());
    }

    /* Check which toasts to display */
    function loadToasts_xcajbuzn() {
        let read = localStorage.getItem("tasselToastRead") || -1;
        if (toasts != null && toasts.length > 0) {
            toasts.forEach(function(toast, index) {
                if (toast.timestamp > read) {//only show new toasts
                    let extension = loadedExtensions.find(function(value) {
                        return value[0] == toast.extension;
                    });
                    if (
                        //show toast for active extensions
                        (extension//only when the extension is active
                          && settings[0] == "1"//only when active is wanted
                          && extension[1] < toast.timestamp//only if it's been active before the toast
                          && !toast.new)//only if the extension is not new
                        ||
                        //show toast for inactive extensions
                        (!extension//only when the extension is inactive
                          && settings[1] == "1"//only when inactive is wanted
                          && !toast.new)//only when the extension is not new
                        ||
                        //show toast for new extensions
                        (toast.new//only when the extension is new
                          && settings[2] == "1")//only when new is wanted
                        ||
                        //show toast that don't belong to an extension
                        (toast.extension == "0")
                        ) {
                        pushToast_xcajbuzn(toast);
                    }
                }
            });
        }
    }

    /* Create toast */
    function pushToast_xcajbuzn(data) {
        let toast = document.createElement("div");
        toast.innerHTML = `
          <h6>${data.title}</h6>
          <span>${data.text}</span>
        `;
        toast.setAttribute("timestamp", data.timestamp);
        document.getElementById("tasselToast").appendChild(toast);
        //add relativ links
        if (document.getElementById("tasselToast").lastChild.getElementsByTagName("a").length > 0) {
            let links = Object.values(document.getElementById("tasselToast").lastChild.getElementsByTagName("a"));
            links.forEach(function(link) {
                if (link.tagName == "A" && link.href == "" && link.hasAttribute("linkRel")) {
                    let url = new URL(window.location);
                    url.searchParams.set("tassel", link.getAttribute("linkRel"));
                    link.href = url;
                }
            });
        }
        document.getElementById("tasselToast").lastChild.style.height = document.getElementById("tasselToast").lastChild.clientHeight + "px";
        //mark as read when clicked
        document.getElementById("tasselToast").lastChild.addEventListener("click", function() {
            if (this.getAttribute("timestamp") > (localStorage.getItem("tasselToastRead") || -1)) localStorage.setItem("tasselToastRead", this.getAttribute("timestamp"));
            this.classList.add("fade-out");
        });
    }

    /* Open modal when URL parameters say so and highlight specific elements */
    function evaluateURLParameter_xcajbuzn() {
        let queryString = new URLSearchParams(window.location.search.substring(1));
        for (let pair of queryString.entries()) {
            if (pair[0] == "tassel") {
                openModal_xcajbuzn(pair[1]);
            } else if (pair[0] == "tExtension") {
                let extension = document.getElementById(pair[1]);
                extension.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
                extension.style.animationDuration = "2s";
                extension.style.animationIterationCount = "2";
                extension.style.animationName = "blink";
            } else if (pair[0] == "tSwitch") {
                let setting = document.getElementsByClassName(pair[1])[0].parentNode;
                setting.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
                setting.style.animationDuration = "2s";
                setting.style.animationIterationCount = "2";
                setting.style.animationName = "blink";
            } else if (pair[0] == "comment" && settings[7] == "1") {
                window.setTimeout(function() {
                    let comment = document.getElementById(pair[1]);
                    comment.style.animationDuration = "2s";
                    comment.style.animationIterationCount = "2";
                    comment.style.animationName = "blink";
                }, 2000);
            }
        }
    }

    /* Make modal visible */
    function openModal_xcajbuzn(tab) {
        document.getElementsByTagName("body")[0].classList.add("modal-open");
        document.getElementsByTagName("nav")[0].style.paddingRight = "11px";

        document.getElementById("tasselModal").style.display = "block";
        switch (tab) {
            case "settings": displaySettings_xcajbuzn(); break;
            case "about": displayAbout_xcajbuzn(); break;
            default: displayExtensions_xcajbuzn();
        }
    }

    /* Make modal invisible */
    function closeModal_xcajbuzn() {
        document.getElementsByTagName("body")[0].classList.remove("modal-open");
        document.getElementsByTagName("nav")[0].style.paddingRight = "0";
        document.getElementById("tasselModal").style.display = "none";
    }

    /* Create a list of all extensions in the modal */
    function displayExtensions_xcajbuzn() {
        //reset modal
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarExtensions").classList.add("active");

        //create content
        let header = document.createElement("div");
        header.id = "tasselModalContentExtensionsHeader";
            let note = document.createElement("p");
            note.innerHTML = "Select the extensions you want to use. Changes will become active after a page reload.";
            header.appendChild(note);

            let sortLabel = document.createElement("label");
            sortLabel.innerHTML = "Sort by ";
                let sorter = document.createElement("select");
                sorter.addEventListener("change", function() {
                    sortOrder = this.value;
                    displayExtensions_xcajbuzn();
                });
                sorter.innerHTML = `
                    <option value="a">A > Z</option>
                    <option value="z">Z > A</option>
                    <option value="new" selected>new > old</option>
                    <option value="old">old > new</option>
                    <option value="1.0">V1.0 > V0.1</option>
                    <option value="0.1">V0.1 > V1.0</option>
                `;
                for (let a = 0; a < sorter.children.length; a++) {
                    if (sortOrder == sorter.children[a].value) sorter.children[a].selected = true;
                }
                sortLabel.appendChild(sorter);
            header.appendChild(sortLabel);
        content.appendChild(header);

        //sort before displaying
        extensionsIndex.sort(function(one, two) {
            switch (sortOrder) {
                case "a": return one.name > two.name ? 1 : -1;
                case "z": return one.name < two.name ? 1 : -1;
                case "new": return one.updated < two.updated ? 1 : -1;
                case "old": return one.updated > two.updated ? 1 : -1;
                case "1.0": return one.version < two.version ? 1 : -1;
                case "0.1": return one.version > two.version ? 1 : -1;
                default: return one.updated < two.updated ? 1 : -1;
            }
        });
        let extensionsList = document.createElement("div");
        extensionsList.style.display = "grid";
        extensionsList.style.gridTemplateColumns = "50% 50%";

        //create extension entries in modal
        extensionsIndex.forEach(function(data, index) {
            let frame = document.createElement("div");
            frame.id = "extension"+data.id;
            frame.classList.add("tasselExtension");
                let checkboxID = "checkbox"+data.name;
                let info = document.createElement("div");
                if (data.version < 1) info.style.opacity = "0.6";
                    let checkbox = document.createElement("input");
                    checkbox.id = checkboxID;
                    checkbox.type = "checkbox";
                    checkbox.setAttribute("extension", data.id);
                    checkbox.addEventListener("click", function() {
                        toggleExtension_xcajbuzn(this.getAttribute("extension"));
                    });
                    let entry = loadedExtensions.find(function(value) {
                        return value[0] == data.id;
                    });
                    if (entry != null) {
                        checkbox.checked = true;
                    }
                info.appendChild(checkbox);

                    let title = document.createElement("label");
                    title.innerHTML = `${data.name}<span style="opacity:.6;font-size:14px;padding:10px;vertical-align:middle;">${data.version}</span>`;
                    title.setAttribute("for", checkboxID);
                info.appendChild(title);

                    let description = document.createElement("p");
                    description.innerHTML = data.description;
                    description.style.margin = "0";
                info.appendChild(description);

                if (data.features != null && data.features.length > 0) {
                    let details = document.createElement("details");
                    details.style.margin = "10px 0 0 10px";
                        let summary = document.createElement("summary");
                        summary.innerHTML = "Features...";
                        summary.style.marginBottom = ".5em";
                    details.appendChild(summary);
                    let list = document.createElement("ul");
                    list.style.paddingLeft = "14px";
                    list.style.margin = "0";
                    data.features.forEach(function(feature) {
                        let text = document.createElement("li");
                        text.innerHTML = feature;
                        list.appendChild(text);
                    });
                    details.appendChild(list);
                    info.appendChild(details);
                }
            frame.appendChild(info);

            let links = document.createElement("a");
            links.classList.add("link_post", "svg-blue");
            links.target = "_blank";
            links.title = "link to post";
            links.href = data.post;
            links.innerHTML = `<img style="width:100%;" src="/assets/global/link-9f122935c5c4c4b995a7771b6761858a316e25f4dee4c6d2aff037af1f24adac.svg">`;
            if (data.post) frame.appendChild(links);

            if (settings[3] == "1" || data.version >= 1) extensionsList.appendChild(frame);//only display extension if it's a full version or WIPs are wanted
        });
        content.appendChild(extensionsList);

        content.appendChild(document.createElement("hr"));
        let info2 = document.createElement("p");
        info2.innerHTML = "If you enjoy an extension, consider commenting / reblogging / liking the corresponding announcement post by opening the link of the extension."
        if (settings[3] == "1") info2.innerHTML += "<br><br>Extensions that are greyed out are currently in development and might not work as intended. Use at own risk.";
        content.appendChild(info2);
    }

    /* Create the About page in the modal */
    function displayAbout_xcajbuzn() {
        //reset modal
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarAbout").classList.add("active");

        content.innerHTML = `
          <div style="justify-content:center;display:grid;text-align:center;">
            <h4 style="margin:0;">Tassel</h4>
            <span style="margin-bottom:.5em;">by Aki108</span>
            <span style="margin-bottom:.5em;">Version ${GM_info.script.version}</span>
            <span style="margin-bottom:2.5em;">since 11th Dec 2022</span>
            <a style="margin-bottom:1em;" href="https://www.pillowfort.social/Tassel">Visit Tassel's Fort</a>
            <a style="margin-bottom:1em;" href="https://github.com/Aki-108/Tassel">Tassel on GitHub</a>
          </div>
        `;
    }

    /* Create the Tassel Settings page in the modal */
    function displaySettings_xcajbuzn() {
        //reset modal
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarSettings").classList.add("active");

        //header
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //Notifications
        let title1 = document.createElement("h4");
        title1.innerHTML = "Notifications";
        content.appendChild(title1);
        let info1 = document.createElement("p");
        info1.innerHTML = "Notifications will show up in the bottom right corner on any Pillowfort page. They can be marked as 'read' by clicking on them.";
        content.appendChild(info1);
        content.appendChild(createSwitch_xcajbuzn("Get Notifications for Active Extensions", "checked", "tasselSetting0"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);
        content.appendChild(createSwitch_xcajbuzn("Get Notifications for Inactive Extensions", "checked", "tasselSetting1"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);
        content.appendChild(createSwitch_xcajbuzn("Get Notifications for New Extensions", "checked", "tasselSetting2"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);

        //Appearance
        content.appendChild(document.createElement("hr"));
        let title2 = document.createElement("h4");
        title2.innerHTML = "Appearance";
        content.appendChild(title2);
        content.appendChild(createSwitch_xcajbuzn("Shorten Expended Sidebar", "", "tasselSetting4"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);
        content.appendChild(createSwitch_xcajbuzn("Hide 0 Notification Counter", "", "tasselSetting5"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);
        /*content.appendChild(createSwitch_xcajbuzn("Sticky Text Toolbar", "disabled checked", "tasselSetting6"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);*/
        content.appendChild(createSwitch_xcajbuzn("Highlight Linked Comments", "", "tasselSetting7"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);

        //Other
        content.appendChild(document.createElement("hr"));
        let title4 = document.createElement("h4");
        title4.innerHTML = "Other";
        content.appendChild(title4);
        content.appendChild(createSwitch_xcajbuzn("Show Experimental Extensions in the List", "", "tasselSetting3"));
        content.lastChild.children[0].addEventListener("change", saveSettings_xcajbuzn);

        //Reset
        content.appendChild(document.createElement("hr"));
        let title3 = document.createElement("h4");
        title3.innerHTML = "Reset";
        content.appendChild(title3);
        let info3 = document.createElement("p");
        info3.innerHTML = "Caution! Resetting your data will remove the all settings and personal information of any Tassel extension. This includes all extentions, active or not. Even those that have been manually installed.";
        content.appendChild(info3);
        let button3 = document.createElement("button");
        button3.innerHTML = "Reset";
        button3.classList.add("delete-button");
        button3.style.backgroundColor = "#B30000";
        button3.addEventListener("click", reset_xcajbuzn);
        content.appendChild(button3);

        loadSettings_xcajbuzn();
    }

    /* Load Tassel Setting from local storage */
    function loadSettings_xcajbuzn() {
        let data = settings;
        for (let a = 0; a < data.length; a++) {
            let setting = document.getElementsByClassName("tasselSetting"+a)[0];
            if (data[a] == "1") {
                setting.checked = true;
            } else if (data[a] == "0") {
                setting.checked = false;
            }
        }
    }

    /* Write Tassel Settings to local storage */
    function saveSettings_xcajbuzn() {
        let data = "";
        for (let a = 0; a < 100; a++) {
            let setting = document.getElementsByClassName("tasselSetting"+a)[0];
            if (setting == undefined) {
                data += "-";
                continue;
            }
            data += setting.checked ? "1" : "0";
        }
        settings = data;
        localStorage.setItem("tasselSettings", data);
    }

    /* Activate / deactivate extensions */
    function toggleExtension_xcajbuzn(id) {
        let entry = loadedExtensions.find(function(data) {
            return data[0] == id;
        });
        if (entry == null) {//activate
            loadedExtensions.push([id, Date.now()]);
        } else {//deactivate
            loadedExtensions.splice(loadedExtensions.indexOf(entry));
        }
        saveData_xcajbuzn();
    }

    /* Save list of active extensions to local storage */
    function saveData_xcajbuzn() {
        let data = [];
        loadedExtensions.forEach(function(value) {
            data.push(value.toString().replaceAll(",",";"));
        });
        data = data.toString();
        localStorage.setItem("tasselActive", data);
    }

    /* Create an HTML element of a checkbox with lable */
    function createSwitch_xcajbuzn(title="", state="", _class=Math.random()) {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" class="${_class}" ${state}>
          <label for="${id}">${title}</label>
        `;
        return toggle;
    }

    /* Remove local storage items that belong to Tassel and its extensions */
    function reset_xcajbuzn() {
        localStorage.removeItem("tasselActive");//which extensions are selected
        localStorage.removeItem("tasselSettings");

        //Post Subscriber
        localStorage.removeItem("postSubscriberColor");//accent color
        localStorage.removeItem("postSubscriberInterval");//time between updates
        localStorage.removeItem("postSubscriberTime");//last update timestamp
        localStorage.removeItem("postsubscriptiondata");//subscribed post titles
        localStorage.removeItem("postsubscriptions");//subscribed post ids
        localStorage.removeItem("tasselPostSubLoadingIndicator");//use loading indicator or not

        //Reblogged to Community
        localStorage.removeItem("rtcdisablelike");//disable for likes
        localStorage.removeItem("rtcdisablereblog");//disable for reblogs

        window.location.reload()
    }
})();
