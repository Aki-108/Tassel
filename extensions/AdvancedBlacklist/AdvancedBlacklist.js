// ==UserScript==
// @name         Advanced Blacklist
// @version      1.13
// @description  A new and improved blacklist feature for Pillowfort.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let blacklist = [];
	loadBlacklist_skdasoyk();
	let settings = JSON.parse(localStorage.getItem("tasselSettings2")).advancedBlacklist || {
		showTags: true,
		showReason: true,
		hideBlacklistPost: false
	};
    let permaLinks; //array of perma-link elements
    let locationType = "home" //type of webpage

    if (document.getElementById("tasselJsonManagerFeedReady")) document.getElementById("tasselJsonManagerFeedReady").addEventListener("click", loadFeed_skdasoyk);
    if (document.getElementById("tasselJsonManagerPostReady")) document.getElementById("tasselJsonManagerPostReady").addEventListener("click", loadSinglePost_skdasoyk);

	/* Read Blacklist from local storage*/
    function loadBlacklist_skdasoyk() {
		let list = localStorage.getItem("tasselAdvancedBlacklist");
		if (!list) return;
		list = JSON.parse(list);
		if (!list) return;
		blacklist = list.blacklist;
        blacklist = blacklist.map(function(item, index) {
            item.index = index;
            return item;
        });
    }

    addSidebarButton_skdasoyk();
    /* Replace the Filters & Blacklist button in the sidebar with an Advanced Blacklist button */
    function addSidebarButton_skdasoyk() {
        let sidebarSmall = document.getElementsByClassName("sidebar-collapsed")[1];
        let buttonSmall = Object.values(sidebarSmall.children).find(function(item) {
            return item.getAttribute("data-target") === "#filtersModal";
        });
        buttonSmall.href = "https://www.pillowfort.social/settings?blacklist";
        buttonSmall.removeAttribute("data-target");
        buttonSmall.title = "Advanced Blacklist";

        let sidebarBig = document.getElementsByClassName("sidebar-rows sidebar-expanded")[0];
        let buttonBig = Object.values(sidebarBig.children).find(function(item) {
            return item.getAttribute("data-target") === "#filtersModal";
        });
        buttonBig.href = "https://www.pillowfort.social/settings?blacklist";
        buttonBig.removeAttribute("data-target");
        let icon = buttonBig.children[0].children[0].cloneNode(true);
        buttonBig.children[0].innerHTML = icon.outerHTML + "Advanced Blacklist";
    }

    /* Get post from JSON Manager and process it */
    function loadSinglePost_skdasoyk() {
        locationType = "post";
        permaLinks = document.getElementsByClassName("timestamp2");
        processPosts_skdasoyk([tasselJsonManager.post.json], [{
            id: tasselJsonManager.post.postId*1,
            post: document.getElementsByClassName("post-container")[0]
        }]);
    }

    /* Get posts from JSON Manager and process them */
    function loadFeed_skdasoyk() {
        locationType = "feed";
        let posts = [];
        permaLinks = Object.values(document.getElementsByClassName("link_post")).filter(function(item) {
            return item.href.search("post/") && item.parentNode.parentNode.classList.contains("post-header-icons")
        });
        permaLinks.forEach(function(item) {
            if (item.href.split("/")[4] === "") return;
            let post = item;
            for (let i = 0; i < 100 && !post.classList.contains("header"); i++) post = post.parentNode;
            posts.push({
                id: item.href.split("/")[4]*1,
                post: post
            });
        });
        processPosts_skdasoyk(tasselJsonManager.feed.posts, posts);
    }

    /*  */
    function processPosts_skdasoyk(postData, posts) {
        for (let post of postData) {
            let postElement = posts.find(function(item) {
                return (item.id === (post.original_post_id || post.id));
            });
            if (!postElement) continue;
            if (postElement.post.classList.contains("tasselAdvancedBlacklistProcessed")) continue;
            postElement.post.classList.add("tasselAdvancedBlacklistProcessed");
            if (!settings.hideBlacklistPost) addBlockButton_skdasoyk(post);
            if (settings.showTags) addTags_skdasoyk(post, postElement);
            let blockResult = shouldBeBlocked_skdasoyk(post);
            if (!blockResult.block) continue;

            //save additional information in JSON Manager for other extentions
            if (!post.tassel) post.tassel = {};
            if (blockResult.hide) post.tassel.hidden = true;
            else post.tassel.collapsed = true;
            post.tassel.advancedBlacklist = blockResult.blockFor;

            showReason_skdasoyk(post, blockResult);
        }
    }

    /* Add the "Blacklist this Post" button to the post navigation */
    function addBlockButton_skdasoyk(post) {
        if (!permaLinks) return;
        let postElement = Object.values(permaLinks).find(function(item) {
            let id;
            if (locationType === "post") id = document.URL.split("/")[4].split("?")[0]
            else id = item.href.substring(item.href.search("/posts/")+7);
            return id == (post.original_post_id || post.id);
        });
        for (let a = 0; a < 100 && !postElement.classList.contains("post-container"); a++) {
            postElement = postElement.parentNode;
        }

        let button = document.createElement("span");
        button.innerHTML = `
            <a href="" title="Blacklist this Post" class="nav-tab tab-leftmost" style="padding-top: 15px;" post-id="${(post.original_post_id || post.id)}">
                <svg xmlns="http://www.w3.org/2000/svg" width="19.195" height="19.2" viewBox="0 0 19.195 19.2">
                    <path id="ic_block" d="M2.807 16.388A9.6 9.6 0 1 1 9.6 19.2a9.612 9.612 0 0 1-6.793-2.812zM1.195 9.6A8.4 8.4 0 0 0 15 16.026L3.168 4.19A8.334 8.334 0 0 0 1.195 9.6zm14.828 5.409A8.4 8.4 0 0 0 4.186 3.173z" fill="var(--tasselIconPurple)"/>
                </svg>
            </a>
        `;
        button.children[0].addEventListener("click", function(event) {
            event.preventDefault();

            let post = this;
            for (let i = 0; i < 100 && !post.classList.contains("post-container"); i++) post = post.parentNode;
            post.classList.add("hidden");

            blacklist.push({
                blacklist: [this.getAttribute("post-id")],
                whitelist: [],
                apply: {
                    tags: false,
                    body: false,
                    id: true
                },
                hide: true,
                source: ""
            });
            let file = JSON.parse(localStorage.getItem("tasselAdvancedBlacklist") || "{}");
            file.blacklist = blacklist;
            localStorage.setItem("tasselAdvancedBlacklist", JSON.stringify(file));
        });
        postElement.getElementsByClassName("post-nav-right")[0].appendChild(button);
    }

    /* Show original tags on a post */
    function addTags_skdasoyk(post) {
        if (!post.original_post) return;
        let tags = post.original_post.tag_list;

        let postElement = Object.values(permaLinks).find(function(item) {
            return item.href.substring(item.href.search("/posts/")+7) == post.original_post_id;
        });
        for (let a = 0; a < 100 && !postElement.classList.contains("post-container"); a++) {
            postElement = postElement.parentNode;
        }
        if (postElement.classList.contains("tasselOriginalTagsAdded")) return;
        postElement.classList.add("tasselOriginalTagsAdded");

        let tagsElement = postElement.getElementsByClassName("tags")[0];
        if (!tagsElement) {
            if (!tags.length) return;
            let container = document.createElement("div");
            container.classList.add("tags-container");
            let tagBox = document.createElement("div");
            tagBox.classList.add("tags");
            container.appendChild(tagBox);
            postElement.children[1].children[postElement.children[1].children.length-2].after(container);
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
            let url = `/search/${tag}`;
            if (tasselJsonManager.feed.type === "community") url = `${document.URL}/tagged/${tag}`;
            tagsElement.innerHTML += `
                <span><a class="tag-item" href="${url}">${tag}</a>${comma}</span>
            `;
        }
    }

    /* Check if a post should be blocked or not */
    function shouldBeBlocked_skdasoyk(post) {
        let block = {
            block: false,
            blockFor: [],
            hide: false
        };

        // get tag content
        let tags = [];
        tags.push(...post.tags);
        if (post.original_post) tags.push(...post.original_post.tag_list);

        //remove untagged posts
        if (!post.mine && !tags.length && ((settings.removeUntaggedFollowing && post.following) || (settings.removeUntagged && !post.following))) {
            return {block: true, blockFor: ["untagged"], hide: true};
        }

        blacklist.forEach(function(entry) {
            //found indicators: -1 no entry; 0 not found; 1 found
            let indicatorSource = -1;
            let indicatorBlack = -1;
            let indicatorWhite = -1;

            // source ///////////////////////////////////////////////////////////////////
            // check if the source tag applies here
            if (entry.source && entry.source.length > 0) {
                indicatorSource = 1;
                //ignore when the post is not by the source
                if (entry.source !== post.username
                    && entry.source !== post.original_username
                    && entry.source !== post.comm_name) {
                    indicatorSource = 0;
                    return;
                }
                block.blockFor.push(entry.source);
            }

            // get title and body content
            let body = [];
            let bodyUnsplit = "";
            if (entry.apply.body) {
                // remove symbols and formating
                bodyUnsplit = post.content + " " + (post.original_post ? post.original_post.title : post.title);
                bodyUnsplit = bodyUnsplit.replaceAll(".", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("!", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("?", " ");
                bodyUnsplit = bodyUnsplit.replaceAll(",", " ");
                bodyUnsplit = bodyUnsplit.replaceAll(";", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("\"", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("/", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("[", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("]", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("(", " ");
                bodyUnsplit = bodyUnsplit.replaceAll(")", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("'", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("-", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("<strong>", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("</strong>", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("<em>", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("</em>", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("<p>", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("</p>", " ");
                bodyUnsplit = bodyUnsplit.replaceAll("<br>", " ");
                bodyUnsplit = bodyUnsplit.toLowerCase();
                body = bodyUnsplit.split(" ");
            }

            // whitelist /////////////////////////////////////////////////////////////////
            let whitelistCount = 0;
            if (entry.whitelist.length > 0) indicatorWhite = 0;
            entry.whitelist.forEach(function(whiteItem) {
                if (entry.apply.id && (post.original_post_id || post.id == whiteItem)) {
                    whitelistCount++;
                    return;
                }
                if (entry.apply.body) {
                    if (whiteItem.search(" ") >= 0) {//multiword tag
                        if (bodyUnsplit.search(whiteItem.toLowerCase()) >= 0) {
                            whitelistCount++;
                            return;
                        }
                    } else {
                        if (body.some(function(item) {
                            return item === whiteItem.toLowerCase();
                        })) {
                            whitelistCount++;
                            return;
                        }
                    }
                }
                if (entry.apply.tags) {
                    if (tags.some(function(item) {
                        return item.toLowerCase() === whiteItem.toLowerCase();
                    })) {
                        whitelistCount++;
                        return;
                    }
                }
            });
            if (whitelistCount > 0 && whitelistCount === entry.whitelist.length) {
                indicatorWhite = 1;
                return;
            }

            // blacklist /////////////////////////////////////////////////////////////
            let blacklistCount = entry.blacklist.length;
            if (blacklistCount > 0) {
                indicatorBlack = 0;
                entry.blacklist.forEach(function(blackItem) {
                    if (entry.apply.id && ((post.original_post_id || post.id) == blackItem)) {
                        blacklistCount--;
                        block.blockFor.push(blackItem);
                        return;
                    }
                    if (entry.apply.body) {
                        if (blackItem.search(" ") >= 0) {//multiword tag
                            if (bodyUnsplit.search(blackItem.toLowerCase()) >= 0) {
                                blacklistCount--;
                                block.blockFor.push(blackItem);
                                return;
                            }
                        } else {
                            if (body.some(function(item) {
                                return item === blackItem.toLowerCase();
                            })) {
                                blacklistCount--;
                                block.blockFor.push(blackItem);
                                return;
                            }
                        }
                    }
                    if (entry.apply.tags) {
                        if (tags.some(function(item) {
                            return item.toLowerCase() === blackItem.toLowerCase();
                        })) {
                            blacklistCount--;
                            block.blockFor.push(blackItem);
                            return;
                        }
                    }
                });
                if (blacklistCount === 0) {
                    indicatorBlack = 1;
                }
            }

            if (indicatorBlack === 1 || (indicatorBlack === -1 && indicatorSource === 1)) {
                block.block = true;
                if (entry.hide) block.hide = true;
            }
        });
        return block;
    }

    /* Display why a post was blocked */
    function showReason_skdasoyk(post, blockResult) {
        if (!permaLinks) return;
        let postElement = Object.values(permaLinks).find(function(item) {
            let id;
            if (locationType === "post") id = document.URL.split("/")[4].split("?")[0]
            else id = item.href.substring(item.href.search("/posts/")+7);
            return id == (post.original_post_id || post.id);
        });
        for (let a = 0; a < 100 && !postElement.classList.contains("post-container"); a++) {
            postElement = postElement.parentNode;
        }

        //hide post completly
        if (blockResult.hide && locationType !== "post") {
            postElement.classList.add("hidden");
            return;
        }

        //compatibility with Read This
        let readThis = postElement.getElementsByClassName("tasselReadThisTools");
        if (readThis.length) {
            readThis[0].classList.add("hidden");
        }

        let reason = "This post is blocked.";
        if (settings.showReason) {
            reason = "Blocked for: " + blockResult.blockFor.join(", ");
        }
        let container = postElement.getElementsByClassName("tasselAdvancedBlacklistBlockedHeader")[0];
        if (container) {
            container.children[1].innerHTML += `<br>${reason}`;
            return;
        }

        container = document.createElement("div");
        container.innerHTML = `
                <button>Show</button>
                <div>${reason}</div>
            `;
        postElement.getElementsByClassName("header")[0].after(container);
        container.children[0].addEventListener("click", function() {
            let post = this.parentNode.parentNode;
            if (this.innerHTML == "Show") {
                for (let el of post.getElementsByClassName("advancedBlacklistHidden")) el.classList.remove("hidden");
                this.innerHTML = "Hide";
            } else {
                for (let el of post.getElementsByClassName("advancedBlacklistHidden")) el.classList.add("hidden");
                this.innerHTML = "Show";
            }
        });
        container.classList.add("tasselAdvancedBlacklistBlockedHeader");

        for (let el of postElement.getElementsByClassName("title")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("media")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("content")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("post-nav")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("advancedBlacklistHidden")) el.classList.add("hidden");
    }

    createPage_skdasoyk();
    /* Create the Advanced Blacklist settings page */
    function createPage_skdasoyk() {
        if (document.URL !== "https://www.pillowfort.social/settings?blacklist") return;
        document.title = "Advanced Blacklist";
        let form = document.getElementsByClassName("edit_setting ")[0];
        let body = document.createElement("div");
        body.id = "tasselAdvancedBlacklistPage";
        form.after(body);
        form.remove();

        let header = document.createElement("header");
        header.innerHTML = "Advanced Blacklist";
        body.appendChild(header);

        let settingsArea = document.createElement("div");
        body.appendChild(settingsArea);

        let switchArea = document.createElement("section");
        switchArea.id = "tasselAdvancedBlacklistSwitches";
        settingsArea.appendChild(switchArea);

        let switch1 = createSwitch_skdasoyk("Show Original Tags", settings.showTags ? "checked" : "");
        switch1.children[0].addEventListener("change", function() {
            settings.showTags = this.checked;
            saveSettings_skdasoyk();
        });
        switchArea.appendChild(switch1);
        let switch2 = createSwitch_skdasoyk("Show why a Post was blocked", settings.showReason ? "checked" : "");
        switch2.children[0].addEventListener("change", function() {
            settings.showReason = this.checked;
            saveSettings_skdasoyk();
        });
        switchArea.appendChild(switch2);
        let switch5 = createSwitch_skdasoyk("Hide the Blacklist Post button", settings.hideBlacklistPost ? "checked" : "");
        switch5.children[0].addEventListener("change", function() {
            settings.hideBlacklistPost = this.checked;
            saveSettings_skdasoyk();
        });
        switchArea.appendChild(switch5);
        let switch3 = createSwitch_skdasoyk("Remove untagged Posts from Users you're following", settings.removeUntaggedFollowing ? "checked" : "");
        switch3.children[0].addEventListener("change", function() {
            settings.removeUntaggedFollowing = this.checked;
            saveSettings_skdasoyk();
        });
        switchArea.appendChild(switch3);
        let switch4 = createSwitch_skdasoyk("Remove untagged Posts from Users you're not following", settings.removeUntagged ? "checked" : "");
        switch4.children[0].addEventListener("change", function() {
            settings.removeUntagged = this.checked;
            saveSettings_skdasoyk();
        });
        switchArea.appendChild(switch4);

        settingsArea.appendChild(document.createElement("hr"));

        let buttonArea = document.createElement("section");
        buttonArea.id = "tasselAdvancedBlacklistButtons";
        settingsArea.appendChild(buttonArea);

        let filterButton = document.createElement("button");
        filterButton.classList.add("tasselButton");
        filterButton.innerHTML = "Pillowfort Filters & Blacklist";
        filterButton.addEventListener("click", showFilters_skdasoyk);
        buttonArea.appendChild(filterButton);

        let pillowfortExport = document.createElement("button");
        pillowfortExport.classList.add("tasselButton");
        pillowfortExport.innerHTML = "export from Pillowfort to file";
        pillowfortExport.addEventListener("click", function(){
            let tempBlacklist = [];
            let body = document.getElementsByClassName("blacklist-block")[0];
            body = body.getElementsByTagName("input");
            Object.values(body).forEach(function(item) {
                if (item.value == "") return;
                tempBlacklist.push({
                    blacklist: [item.value],
                    whitelist: [],
                    apply: {
                        tags: true,
                        body: true,
                        id: false
                    },
                    hide: false,
                    source: ""
                });
            });
            let tags = document.getElementsByClassName("blacklist-block")[1];
            tags = tags.getElementsByTagName("input");
            Object.values(tags).forEach(function(item) {
                if (item.value == "") return;
                tempBlacklist.push({
                    blacklist: [item.value],
                    whitelist: [],
                    apply: {
                        tags: true,
                        body: false,
                        id: false
                    },
                    hide: false,
                    source: ""
                });
            });
            let d = new Date();
            downloadObject_skdasoyk(tempBlacklist, `pillowfort_blacklist_export_${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}.txt`);
        });
        buttonArea.appendChild(pillowfortExport);

        let tasselExport = document.createElement("button");
        tasselExport.classList.add("tasselButton");
        tasselExport.innerHTML = "export from Tassel to file";
        tasselExport.addEventListener("click", function(){
            let d = new Date();
            let blacklistCopy = structuredClone(blacklist);
            blacklistCopy.sort(function(a, b) {
                return a.index - b.index;
            });
            blacklistCopy = blacklistCopy.map(function(item) {
                delete item.index;
                return item;
            });
            console.log(blacklistCopy);
            downloadObject_skdasoyk(blacklistCopy, `advanced_blacklist_export_${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}.txt`);
        });
        buttonArea.appendChild(tasselExport);

        let tasselImport = document.createElement("button");
        tasselImport.classList.add("tasselButton");
        tasselImport.innerHTML = "import to Tassel from file";
        tasselImport.addEventListener("click", function(){
            if (this.classList.contains("active")) {
                this.classList.remove("active");
                inputFrame.classList.add("hidden");
            } else {
                this.classList.add("active");
                inputFrame.classList.remove("hidden");
            }
        });
        buttonArea.appendChild(tasselImport);

        let inputFrame = document.createElement("div");
        inputFrame.id = "tasselAdvancedBlacklistImportFrame";
        inputFrame.classList.add("hidden");
        buttonArea.appendChild(inputFrame);
        let input = document.createElement("label");
        input.id = "tasselAdvancedBlacklistImport";
        input.classList.add("tasselLabelTextbox");
        input.innerHTML = `
            File Import
            <textarea placeholder="Upload a file or paste the contents here."></textarea>
        `;
        inputFrame.appendChild(input);
        input.getElementsByTagName("textarea")[0].addEventListener("input", function() {
            try {
                let list = JSON.parse(this.value);
                info.innerHTML = `List entries: ${list.length}`;
            } catch {
                info.innerHTML = "Error: Data invalid";
                return;
            }
        });
        let info = document.createElement("p");
        info.innerHTML = "No data.";
        inputFrame.appendChild(info);
        let upload = document.createElement("button");
        upload.classList.add("tasselButton");
        upload.innerHTML = "upload a file";
        upload.addEventListener("click", function() {
            fileSelect.click();
        });
        inputFrame.appendChild(upload);
        let fileSelect = document.createElement("input");
        fileSelect.classList.add("hidden");
        fileSelect.innerHTML = "import"
        fileSelect.setAttribute("type", "file");
        fileSelect.setAttribute("accept", ".json, .txt");
        fileSelect.addEventListener("change", function(e) {
            let file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                let data = {};
                try {
                    data = JSON.parse(reader.result);
                } catch {
                    alert("Error: Data invalid");
                    return;
                }
                input.getElementsByTagName("textarea")[0].value = JSON.stringify(data, null, 2);
                input.getElementsByTagName("textarea")[0].dispatchEvent(new Event('input',{bubbles:true}));
            },false,);
            if (file) reader.readAsText(file);
        });
        inputFrame.appendChild(fileSelect);
        let add = document.createElement("button");
        add.classList.add("tasselButton");
        add.innerHTML = "add to list";
        add.addEventListener("click", function(event) {
            let textbox = input.getElementsByTagName("textarea")[0];
            if (textbox.value === "") return;
            try {
                let list = JSON.parse(textbox.value);
                blacklist.push(...list);
            } catch {
                alert("Error: Data invalid");
                return;
            }

            let file = JSON.parse(localStorage.getItem("tasselAdvancedBlacklist") || "{}");
            file.blacklist = blacklist;
            localStorage.setItem("tasselAdvancedBlacklist", JSON.stringify(file));
            window.location.reload();
        });
        inputFrame.appendChild(add);
        let replace = document.createElement("button");
        replace.classList.add("tasselButton");
        replace.innerHTML = "replace list";
        replace.addEventListener("click", function() {
            let textbox = input.getElementsByTagName("textarea")[0];
            if (textbox.value === "") return;
            try {
                let list = JSON.parse(textbox.value);
                blacklist = list;
            } catch {
                alert("Error: Data invalid");
                return;
            }

            let file = JSON.parse(localStorage.getItem("tasselAdvancedBlacklist") || "{}");
            file.blacklist = blacklist;
            localStorage.setItem("tasselAdvancedBlacklist", JSON.stringify(file));
            window.location.reload();
        });
        inputFrame.appendChild(replace);

        settingsArea.appendChild(document.createElement("hr"));

        let blacklistView = document.createElement("div");
        blacklistView.id = "tasselAdvancedBlacklistView";
        body.insertBefore(blacklistView, body.getElementsByClassName("bottom-submit-section")[0]);

        let titles = ["Blacklist", "Whitelist", "Tags", "Body", "ID", "Hide", "Source", ""];
        let infos = ["Enter words to be blocked. Separate words with a comma to create a combination of words.<br><b>Example:</b> \"one, two, three\" would block a post tagged with \"three, one, two, four\" but not a post tagged with \"one, two, five\".",
                     "Enter words that prevent blocking. Separate words with a comma to create a combination of words.<br><b>Example:</b> \"one, two\" would whitelist a post tagged with \"two, one, three\" but not a post tagged with \"one, four\".",
                     "Check this to search post tags.",
                     "Check this to search the post body.",
                     "Check this to search the post ID. Used for blocking specific posts.",
                     "Check this to hide a blocked post completely, instead of collapsing it.",
                     "Enter the post source. Usernames and commuity names work.<br>Putting a username or community in this field and leaving the blacklist and whitelist empty will block every post by that user or from that community.",
                     ""];
        let headerLine = document.createElement("div");
        headerLine.classList.add("line", "header");
        for (let a = 0; a < 8; a++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            if (titles[a] == "") cell.classList.add("invisible");
            cell.innerHTML = `
                <div class="title">
                    ${titles[a]}
                </div>
                <div class="controls">
                    ${createTooltip_skdasoyk(infos[a]).outerHTML}
                    <div>
                        <button class="sortUp">^</button>
                        <button class="sortDown">^</button>
                    </div>
                </div>
            `;
            headerLine.appendChild(cell);
            cell.getElementsByClassName("sortUp")[0].addEventListener("click", function() {
                blacklist.sort(function(x, y) {
                    if (a == 0) return x.blacklist.join(", ").toLowerCase() < y.blacklist.join(", ").toLowerCase() ? -1 : 1;
                    else if (a == 1) return x.whitelist.join(", ").toLowerCase() < y.whitelist.join(", ").toLowerCase() ? -1 : 1;
                    else if (a == 2) return x.apply.tags < y.apply.tags ? -1 : 1;
                    else if (a == 3) return x.apply.body < y.apply.body ? -1 : 1;
                    else if (a == 4) return x.apply.id < y.apply.id ? -1 : 1;
                    else if (a == 5) return x.hide < y.hide ? -1 : 1;
                    else if (a == 6) return x.source.toLowerCase() < y.source.toLowerCase() ? -1 : 1;
                    return 0;
                });
                let list = Object.values(document.getElementById("tasselAdvancedBlacklistView").children);
                blacklist.forEach(function(item, order) {
                    let row = list.find(function(row) {
                        return row.getAttribute("index") == item.index;
                    });
                    row.style.order = order;
                });
            });
            cell.getElementsByClassName("sortDown")[0].addEventListener("click", function() {
                blacklist.sort(function(x, y) {
                    if (a == 0) return x.blacklist.join(", ").toLowerCase() > y.blacklist.join(", ").toLowerCase() ? -1 : 1;
                    else if (a == 1) return x.whitelist.join(", ").toLowerCase() > y.whitelist.join(", ").toLowerCase() ? -1 : 1;
                    else if (a == 2) return x.apply.tags > y.apply.tags ? -1 : 1;
                    else if (a == 3) return x.apply.body > y.apply.body ? -1 : 1;
                    else if (a == 4) return x.apply.id > y.apply.id ? -1 : 1;
                    else if (a == 5) return x.hide > y.hide ? -1 : 1;
                    else if (a == 6) return x.source.toLowerCase() > y.source.toLowerCase() ? -1 : 1;
                    return 0;
                });
                let list = Object.values(document.getElementById("tasselAdvancedBlacklistView").children);
                blacklist.forEach(function(item, order) {
                    let row = list.find(function(row) {
                        return row.getAttribute("index") == item.index;
                    });
                    row.style.order = order;
                });
            });
        }
        blacklistView.appendChild(headerLine);

        blacklist.forEach(function(item, index) {
            addBlacklistRow_skdasoyk(index, item);
        });
        addBlacklistRow_skdasoyk(blacklist.length);

        let saveButton = document.createElement("button");
        saveButton.classList.add("tasselButton", "save");
        saveButton.innerHTML = `save<span class="checkmark"></span>`;
        saveButton.addEventListener("click", saveBlacklist_skdasoyk);
        saveButton.addEventListener("click", function() {
            window.location.reload();
        });
        blacklistView.after(saveButton);
    }

    /* Save data from input fields to local storage */
    function saveBlacklist_skdasoyk() {
        blacklist = [];
        let index = 0;
        while (document.getElementById(`tasselAdvancedBlacklistInput-black-${index}`)) {
            let row = {blacklist:[],whitelist:[],apply:{}};
            let blackInput = document.getElementById(`tasselAdvancedBlacklistInput-black-${index}`).value;
            blackInput = blackInput.split(",");
            blackInput.forEach(function(item) {
                item = item.trim();
                if (item !== "") row.blacklist.push(item);
            });

            let whiteInput = document.getElementById(`tasselAdvancedBlacklistInput-white-${index}`).value;
            whiteInput = whiteInput.split(",");
            whiteInput.forEach(function(item) {
                item = item.trim();
                if (item !== "") row.whitelist.push(item);
            });

            row.apply.tags = document.getElementById(`tasselAdvancedBlacklistInput-tags-${index}`).checked;
            row.apply.body = document.getElementById(`tasselAdvancedBlacklistInput-body-${index}`).checked;
            row.apply.id = document.getElementById(`tasselAdvancedBlacklistInput-id-${index}`).checked;
            row.hide = document.getElementById(`tasselAdvancedBlacklistInput-hide-${index}`).checked;

            row.source = document.getElementById(`tasselAdvancedBlacklistInput-source-${index}`).value.trim();

            if (row.blacklist.length > 0
                || row.whitelist.length > 0
                || row.source.length > 0)
                blacklist.push(row);
            ++index;
        }

        let file = JSON.parse(localStorage.getItem("tasselAdvancedBlacklist") || "{}");
        file.blacklist = blacklist;
        localStorage.setItem("tasselAdvancedBlacklist", JSON.stringify(file));
    }

    /* Create an HTML element of a checkbox with lable */
    function createSwitch_skdasoyk(title="", state="") {
        let toggle = document.createElement("label");
        toggle.classList.add("tasselCheckbox");
        toggle.innerHTML = `
          <input type="checkbox" ${state}>
          ${title}
        `;
        return toggle;
    }

    /* Create an icon with hover popup */
    function createTooltip_skdasoyk(content) {
        let id = "tasselTooltip" + Math.random();
        let icon = document.createElement("button");
        icon.classList.add("tasselInfoDot");
        icon.setAttribute("popovertarget", id);
        icon.innerHTML = `
            <dialog id='${id}' popover='hint' class='tasselBoxShadow'>
                ${content}
            </dialog>
        `;
        return icon;
    }

    /* Save user settings to local storage */
    function saveSettings_skdasoyk() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.advancedBlacklist = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    /* Open Pillowfort's Filters & Blacklist modal */
    function showFilters_skdasoyk() {
        let modal = document.getElementById("filtersModal");
        modal.style.display = "block";
        modal.style.paddingLeft = "13px";
        modal.classList.add("in");
        let close = document.getElementById("filtersModal").getElementsByClassName("close")[0];
        close.addEventListener("click", hideFilters_skdasoyk);
        let backdrop = document.createElement("div");
        backdrop.id = "filterModalBackdrop";
        backdrop.classList.add("modal-backdrop", "fade", "in");
        document.body.appendChild(backdrop);
        document.body.classList.add("modal-open");
    }

    /* Close Pillowfort's Filters & Blacklist modal */
    function hideFilters_skdasoyk() {
        let modal = document.getElementById("filtersModal");
        modal.style.display = "none";
        modal.classList.remove("in");
        document.getElementById("filterModalBackdrop").remove();
        document.body.classList.remove("modal-open");
    }

    /* Download JSON as a file */
    /* https://stackoverflow.com/a/47821215 */
    function downloadObject_skdasoyk(obj, filename){
        var blob = new Blob([JSON.stringify(obj/*, null, 2*/)], {type: "application/json;charset=utf-8"});
        var url = URL.createObjectURL(blob);
        var elem = document.createElement("a");
        elem.href = url;
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    /* Create a new row at the bottom of the Advanced Blacklist settings */
    function addBlacklistRow_skdasoyk(index, item) {
        let blacklistView = document.getElementById("tasselAdvancedBlacklistView");
        let line = document.createElement("div");
        line.classList.add("line");
        line.style.order = index;
        line.setAttribute("index", index);
        blacklistView.appendChild(line);

        let blackInput = document.createElement("label");
        blackInput.classList.add("tasselLabelInline", "cell");
        blackInput.innerHTML = `
            blacklist
            <input id="tasselAdvancedBlacklistInput-black-${index}" type="text" value="${item ? item.blacklist.join(", ") : ""}">
        `;
        line.appendChild(blackInput);

        let whiteInput = document.createElement("label");
        whiteInput.classList.add("tasselLabelInline", "cell");
        whiteInput.innerHTML = `
            whitelist
            <input id="tasselAdvancedBlacklistInput-white-${index}" type="text" value="${item ? item.whitelist.join(", ") : ""}">
        `;
        line.appendChild(whiteInput);

        let checkTags = document.createElement("label");
        checkTags.classList.add("tasselCheckbox", "cell");
        checkTags.innerHTML = `
            tags
            <input id="tasselAdvancedBlacklistInput-tags-${index}" type="checkbox" ${item && !item.apply.tags ? "" : "checked"}>
        `;
        line.appendChild(checkTags);

        let checkBody = document.createElement("label");
        checkBody.classList.add("tasselCheckbox", "cell");
        checkBody.innerHTML = `
            body
            <input id="tasselAdvancedBlacklistInput-body-${index}" type="checkbox" ${item && item.apply.body ? "checked" : ""}>
        `;
        line.appendChild(checkBody);

        let checkId = document.createElement("label");
        checkId.classList.add("tasselCheckbox", "cell");
        checkId.innerHTML = `
            ID
            <input id="tasselAdvancedBlacklistInput-id-${index}" type="checkbox" ${item && item.apply.id ? "checked" : ""}>
        `;
        line.appendChild(checkId);

        let hidePost = document.createElement("label");
        hidePost.classList.add("tasselCheckbox", "cell");
        hidePost.innerHTML = `
            hide
            <input id="tasselAdvancedBlacklistInput-hide-${index}" type="checkbox" ${item && item.hide ? "checked" : ""}>
        `;
        line.appendChild(hidePost);

        let sourceInput = document.createElement("label");
        sourceInput.classList.add("tasselLabelInline", "cell");
        sourceInput.innerHTML = `
            source
            <input id="tasselAdvancedBlacklistInput-source-${index}" type="text" value="${item ? item.source : ""}">
        `;
        line.appendChild(sourceInput);

        let addLine = document.createElement("div");
        addLine.id = "tasselAdvancedBlacklistInput-add-" + index;
        addLine.classList.add("tasselAdvancedBlacklistAddLine", "cell");
        addLine.innerHTML = `<button title="add a new line below">+</button>`;
        addLine.addEventListener("click", insertNewRow_skdasoyk);
        line.appendChild(addLine);

        return line;
    }

    /* Add a new row at the bottom and shift data down */
    function insertNewRow_skdasoyk() {
        let index = this.parentNode.style.order;
        let lastIndex = document.getElementById("tasselAdvancedBlacklistView").children.length-1;
        let line = addBlacklistRow_skdasoyk(lastIndex);
        line.style.order = index;
    }
})();
