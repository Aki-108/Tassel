// ==UserScript==
// @name         Advanced Blacklist
// @version      0.2
// @description  A new and improved blacklist feature for Pillowfort.
// @author       aki108
// @match        http*://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var blacklist = [];
    loadBlacklist_skdasoyk();
    var lastTime = "";
    var postData;
    var permaLinks;
    var settings = localStorage.getItem("tasselAdvancedBlacklist") || "11";

    const loadingIndicator =
       document.getElementById("home_loading")
    || document.getElementById("blog_loading")
    || document.getElementById("user_posts_loading")
    || document.getElementById("comm_large_loading")
    || document.getElementById("search_loading");
    const mutationConfig = {attributes: true, attributeFilter: ["style"]};
    const mutationCallback = (mutationList) => {
        if (loadingIndicator.style.display == "none") {
            loadPostData_skdasoyk();
        }
    };
    const mutationObserver = new MutationObserver(mutationCallback);
    if (loadingIndicator != null) mutationObserver.observe(loadingIndicator, mutationConfig);

    //window.setTimeout(init_skdasoyk, 10000);
    init_skdasoyk();

    function init_skdasoyk() {
        initTassel_skdasoyk();
        //loadPostData_skdasoyk();
    }

    //add elements to the Tassel menu
    function initTassel_skdasoyk() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarAdvancedBlacklist";
        button.innerHTML = "Advanced Blacklist";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarAdvancedBlacklist").addEventListener("click", tasselDisplaySettings_skdasoyk);
    }

    function loadPostData_skdasoyk() {
        permaLinks = document.getElementsByClassName("link_post");

        let url = "https://www.pillowfort.social/home/json";
        if (lastTime != "") url += "?last_timestamp="+lastTime;
        $.getJSON(url, function(data) {
            postData = data.posts;
            lastTime = data.posts[data.posts.length-1].created_at;

            processPost_skdasoyk();
        });
    }

    function processPost_skdasoyk() {
        for (let post of postData) {
            next_post: {
                if (post.original_post && settings[0] == "1") addTags_skdasoyk(post);

                //block post
                for (let blackItem of blacklist) {
                    let evaluation = shouldBlock_skdasoyk(post, blackItem);
                    if (evaluation.blocked) {
                        blockPost_skdasoyk(post, evaluation, blackItem);
                        break next_post;
                    }
                }
            }
        }
    }

    /* Return data when any block criteria is met */
    function shouldBlock_skdasoyk(post, blackItem) {
        if (blackItem[1].length > 0) {
            let username = post.original_username || post.username;
            if (username != blackItem[1] && post.comm_name != blackItem[1])
                return {blocked: false};
        }

        let blackWord = blackItem[0].toLowerCase();
        //block by original tags
        if (blackItem[2][0] == "1")
            for (let tag of post.tags)
                if (tag.toLowerCase() === blackWord)
                    return {blocked: true, tag: tag, type: "in the Original Tags"};
        //block by reblog tags
        if (blackItem[2][0] == "1" && post.original_post)
            for (let tag of post.original_post.tag_list)
                if (tag.toLowerCase() === blackWord)
                    return {blocked: true, tag: tag, type: "in the Tags"};
        //block by body
        if (blackItem[2][1] == "1") {
            let postBody = post.content.toLowerCase();
            if (postBody.search(blackWord) >= 0)
                return {blocked: true, tag: blackItem[0], type: "in the Post Body"};
        }
        //block by username of reblogger/poster
        if (blackItem[2][2] == "1") {
            let username = post.username.toLowerCase();
            if (username.search(blackWord) >= 0)
                return {blocked: true, tag: blackItem[0], type: "in the Username"};
        }
        //block by username of poster
        if (blackItem[2][2] == "1" && post.original_username) {
            let username = post.original_username.toLowerCase();
            if (username.search(blackWord) >= 0)
                return {blocked: true, tag: blackItem[0], type: "in the Username"};
        }
        //block by ID
        if (blackItem[2][3] == "1") {
            let id = post.original_post_id || post.id;
            if (id == blackWord)
                return {blocked: true, tag: blackItem[0], type: "ID"};
        }
        //don't block
        return {blocked: false};
    }

    /* Block post */
    function blockPost_skdasoyk(post, evaluation, blackItem) {
        let postId = post.original_post_id || post.id;
        let postElement = Object.values(permaLinks).find(function(item) {
            return item.href.substring(item.href.search("/posts/")+7) == postId;
        }).parentNode.parentNode.parentNode.parentNode;

        if (blackItem[2][4] == "1") {
            postElement.parentNode.parentNode.style.display = "none";
            return;
        }

        for (let el of postElement.getElementsByClassName("title")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("media")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("content")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("tags-container")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("post-nav")) el.classList.add("advancedBlacklistHidden");

        for (let el of postElement.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "none";

        let frame = document.createElement("div");
        frame.style.background = "var(--tag_bg)";
        frame.style.padding = "5px 15px";
        frame.style.lineHeight = "35px";
        if (settings[1] == "1") {
            frame.innerHTML = `This post is hidden because of "${evaluation.tag}" ${evaluation.type}.`;
        } else {
            frame.innerHTML = "This post is hidden.";
        }
        if (evaluation.type == "ID") frame.innerHTML = "You blocked this Post.";
        let button = document.createElement("button");
        button.style = "float:right;background:white;border:1px solid var(--postFontColor);border-radius:1.5px;width:4em;margin:6px 0";
        button.innerHTML = "Show";
        button.addEventListener("click", function() {
            let post = this.parentNode.parentNode;
            if (this.innerHTML == "Show") {
                for (let el of postElement.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "block";
                this.innerHTML = "Hide";
            } else {
                for (let el of postElement.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "none";
                this.innerHTML = "Show";
            }
        });
        frame.appendChild(button);
        let header = postElement.getElementsByClassName("header")[0];
        header.parentNode.insertBefore(frame, header.nextSibling);
    }

    /* Show original tags */
    function addTags_skdasoyk(post) {
        let tags = post.original_post.tag_list;

        let postElement = Object.values(permaLinks).find(function(item) {
            return item.href.substring(item.href.search("/posts/")+7) == post.original_post_id;
        }).parentNode.parentNode.parentNode.parentNode;
        if (postElement.classList.contains("tasselOriginalTagsAdded")) return;
        postElement.classList.add("tasselOriginalTagsAdded");

        let tagsElement = postElement.getElementsByClassName("tags")[0];
        if (!tagsElement) {
            let container = document.createElement("div");
            container.classList.add("tags-container");
            let tagBox = document.createElement("div");
            tagBox.classList.add("tags");
            container.appendChild(tagBox);
            postElement.insertBefore(container, postElement.getElementsByClassName("post-nav")[0]);
            tagsElement = postElement.getElementsByClassName("tags")[0];
        } else {
            tagsElement.appendChild(document.createElement("br"));
        }

        let title = document.createElement("span");
        title.classList.add("tag-title");
        title.innerHTML = "ORIGINAL TAGS ";
        tagsElement.appendChild(title);
        for (let tag of tags) {
            let comma = "<span>, </span>";
            if (tag == tags[tags.length-1]) comma = "";
            tagsElement.innerHTML += `
                <span><a class="tag-item" href="/search/${tag}">${tag}</a>${comma}</span>
            `;
        }
    }

    //create Tassel settings menu
    function tasselDisplaySettings_skdasoyk() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarAdvancedBlacklist").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //Settings
        let title1 = document.createElement("h4");
        title1.innerHTML = "Settings";
        content.appendChild(title1);
        content.appendChild(createSwitch_skdasoyk("Show Original Tags", settings[0] == "1" ? "checked" : "", "tasselSetting0"));
        content.lastChild.children[0].addEventListener("change", saveSettings_skdasoyk);
        content.appendChild(createSwitch_skdasoyk("Show why a Post was blocked", settings[1] == "1" ? "checked" : "", "tasselSetting0"));
        content.lastChild.children[0].addEventListener("change", saveSettings_skdasoyk);

        //Blacklist
        content.appendChild(document.createElement("hr"));
        let title2 = document.createElement("h4");
        title2.innerHTML = "Blacklist";
        content.appendChild(title2);

        let listFrame = document.createElement("div");
        listFrame.setAttribute("style", `
            overflow: auto;
            border-left: 1px solid lightgrey;
            border-right: 1px solid lightgrey;
            max-height: calc(100% - 40px);
        `);
        content.appendChild(listFrame);

        let listHeader = document.createElement("div");
        listHeader.setAttribute("style", `
            display: grid;
            grid-template-columns: 180px 50px 50px 50px 50px 50px 100px;
            grid-row-gap: 5px;
            position: sticky;
            top: -10px;
            padding: 10px 10px 0;
            background: white;
            box-shadow: 0 7px 7px -7px black;
            text-align: center;
            width: fit-content;
        `);
        listFrame.appendChild(listHeader);

        let headerItems = [
            ["Word", "The Word or Phrase to be blocked"],
            ["in Tags","Search Word in Tags"],
            ["in Body","Search Word in Post Body"],
            ["in User","Search Word in Username"],
            ["in ID","Search Word in Post ID"],
            ["Hide","Hide Post completely, instead of collapsing"],
            ["by User / Community","Only block if the Post is by that User or out of that Community"]
        ];
        for (let a = 0; a < headerItems.length; a++) {
            let item = document.createElement("h6");
            item.innerHTML = `<abbr style="font-weight:bold" title="${headerItems[a][1]}">${headerItems[a][0]}</abbr>`;
            listHeader.appendChild(item);
        }

        let list4 = document.createElement("div");
        list4.style.display = "grid";
        list4.style.gridTemplateColumns = "180px 50px 50px 50px 50px 50px 100px";
        list4.style.gridRowGap = "5px";
        list4.style.padding = "10px";
        list4.id = "advancedBlacklistBlack";
        listFrame.appendChild(list4);

        let index = 0;
        for (index = 0; index < blacklist.length; index++) {
            generateBlacklistRow(index, blacklist[index]);
        }
        generateBlacklistRow(index);

        {
            let buttonBox = document.createElement("div");
            buttonBox.style = "display:grid;grid-template-columns:auto auto auto auto;grid-column-gap: 10px;margin-top:10px;";

            let addButton = document.createElement("button");
            addButton.innerHTML = "Add";
            addButton.classList.add("tasselBlacklistButton");
            addButton.addEventListener("click", function() {
                let index = document.getElementById("advancedBlacklistBlack").lastChild.id.split("-")[1]*1+1;
                generateBlacklistRow(index);
            });
            buttonBox.appendChild(addButton);

            let saveButton = document.createElement("button");
            saveButton.innerHTML = "Save";
            saveButton.classList.add("tasselBlacklistButton");
            saveButton.addEventListener("click", saveBlacklist_skdasoyk);
            buttonBox.appendChild(saveButton);

            /*let importButton = document.createElement("button");
            importButton.innerHTML = "Import from Pillowfort";
            importButton.classList.add("tasselBlacklistButton");
            buttonBox.appendChild(importButton);

            let exportButton = document.createElement("button");
            exportButton.innerHTML = "Export to Pillowfort";
            exportButton.classList.add("tasselBlacklistButton");
            buttonBox.appendChild(exportButton);*/

            content.appendChild(buttonBox);

            let buttons = document.getElementsByClassName("tasselBlacklistButton");
            for (let el of buttons) {
                el.style.background = "var(--tag_bg)";
                el.style.border = "1px solid grey";
                el.style.borderRadius = "1.5px";
                el.style.padding = "5px 15px";
            }
        }
    }

    function generateBlacklistRow(index, item) {
        let list = document.getElementById("advancedBlacklistBlack");

        let termInput = document.createElement("input");
        termInput.id = "tasselBlacklistInput0-" + index;
        if (item) termInput.value = item[0];
        termInput.style.width = "auto";
        list.appendChild(termInput);

        let checkTags = document.createElement("input");
        checkTags.id = "tasselBlacklistInput2-" + index;
        checkTags.type = "checkbox";
        checkTags.checked = true;
        if (item) checkTags.checked = item[2][0] == "1" ? true : false;
        checkTags.style.margin = "2px auto";
        checkTags.style.transform = "none";
        checkTags.style.width = "1.5em";
        list.appendChild(checkTags);

        let checkBody = document.createElement("input");
        checkBody.id = "tasselBlacklistInput3-" + index;
        checkBody.type = "checkbox";
        checkBody.checked = true;
        if (item) checkBody.checked = item[2][1] == "1" ? true : false;
        checkBody.style.margin = "2px auto";
        checkBody.style.transform = "none";
        checkBody.style.width = "1.5em";
        list.appendChild(checkBody);

        let checkUser = document.createElement("input");
        checkUser.id = "tasselBlacklistInput4-" + index;
        checkUser.type = "checkbox";
        if (item) checkUser.checked = item[2][2] == "1" ? true : false;
        checkUser.style.margin = "2px auto";
        checkUser.style.transform = "none";
        checkUser.style.width = "1.5em";
        list.appendChild(checkUser);

        let checkId = document.createElement("input");
        checkId.id = "tasselBlacklistInput5-" + index;
        checkId.type = "checkbox";
        if (item) checkId.checked = item[2][3] == "1" ? true : false;
        checkId.style.margin = "2px auto";
        checkId.style.transform = "none";
        checkId.style.width = "1.5em";
        list.appendChild(checkId);

        let hidePost = document.createElement("input");
        hidePost.id = "tasselBlacklistInput6-" + index;
        hidePost.type = "checkbox";
        if (item) hidePost.checked = item[2][4] == "1" ? true : false;
        hidePost.style.margin = "2px auto";
        hidePost.style.transform = "none";
        hidePost.style.width = "1.5em";
        list.appendChild(hidePost);

        let byUser = document.createElement("input");
        byUser.id = "tasselBlacklistInput1-" + index;
        if (item) byUser.value = item[1];
        list.appendChild(byUser);
    }

    function saveBlacklist_skdasoyk() {
        blacklist = [];
        let index = 0;
        let input = document.getElementById("tasselBlacklistInput0-0");
        while (input != null) {
            let row = ["","",""];
            if (input.value != "") {
                for (let subindex = 0; subindex < 7; subindex++) {
                    if (subindex <= 1) {
                        row[subindex] = removeSpaces_skdasoyk(document.getElementById("tasselBlacklistInput"+subindex+"-"+index).value);
                    } else {
                        row[2] += document.getElementById("tasselBlacklistInput"+subindex+"-"+index).checked ? "1" : "0";
                    }
                }
                blacklist.push(row);
            }
            ++index;
            input = document.getElementById("tasselBlacklistInput0-"+index);
        }

        let list = [];
        blacklist.forEach(function(value) {
            list.push(value.toString().replaceAll(",",";"));
        });
        list = list.toString();
        localStorage.setItem("tasselBlacklist", list);
    }

    /* Remove spaces at the start and end of a string */
    function removeSpaces_skdasoyk(string) {
        let first = "";
        for (let a = string.length - 1; a >= 0; a--)
            if (first != "" || string[a] != " ") first += string[a];
        let second = "";
        for (let a = first.length - 1; a >= 0; a--)
            if (second != "" || first[a] != " ") second += first[a];
        return second;
    }

    /* Read Blacklist from local storage*/
    function loadBlacklist_skdasoyk() {
        let list = localStorage.getItem("tasselBlacklist")
        if (list) {
            list = list.split(",");
            list.forEach(function(value){
                blacklist.push(value.split(";"));
            });
        }
    }

    /* Write Tassel Settings to local storage */
    function saveSettings_skdasoyk() {
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
        localStorage.setItem("tasselAdvancedBlacklist", data);
    }

    /* Create an HTML element of a checkbox with lable */
    function createSwitch_skdasoyk(title="", state="", _class=Math.random()) {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" class="${_class}" ${state}>
          <label for="${id}">${title}</label>
        `;
        return toggle;
    }
})();
