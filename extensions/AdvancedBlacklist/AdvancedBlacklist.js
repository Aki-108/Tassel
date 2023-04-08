// ==UserScript==
// @name         Advanced Blacklist
// @version      1.0
// @description  A new and improved blacklist feature for Pillowfort.
// @author       aki108
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
		showReason: true
	};
    let lastTime; //time of the oldest loaded post
    let permaLinks; //array of perma-link elements
    let locationType = "home" //type of webpage

	const loadingIndicator =
       document.getElementById("home_loading")
    || document.getElementById("blog_loading")
    || document.getElementById("user_posts_loading")
    || document.getElementById("comm_large_loading")
    || document.getElementById("search_loading")
    || document.getElementById("comments_loading");
    const mutationConfig = {attributes: true, attributeFilter: ["style"]};
    const mutationCallback = (mutationList) => {
        if (loadingIndicator.style.display == "none") {
            loadPostData_skdasoyk();
        }
    };
    const mutationObserver = new MutationObserver(mutationCallback);
    if (loadingIndicator != null) {
	    if (loadingIndicator.style.display == "none") loadPostData_skdasoyk();
	    mutationObserver.observe(loadingIndicator, mutationConfig);
    }

	/* Read Blacklist from local storage*/
    function loadBlacklist_skdasoyk() {
		let list = localStorage.getItem("tasselAdvancedBlacklist");
		if (!list) return;
		list = JSON.parse(list);
		if (!list) return;
		blacklist = list.blacklist;
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

	/* Get Home Feed Data */
	function loadPostData_skdasoyk() {
        let url; //where to get the correct post data
        let address = document.URL.split("/");
        let posts = [];
        if (address.length === 4 && address[3] === "") {//home feed
            locationType = "feed";
            permaLinks = document.getElementsByClassName("link_post");
            url = "https://www.pillowfort.social/home/json";
            if (lastTime) url += "?last_timestamp="+lastTime;

        } else if (address[5] === "tagged") {//tagged comm
            locationType = "comm";
            permaLinks = document.getElementsByClassName("link_post");
            url = `https://www.pillowfort.social/community/${address[4]}/tagged_json?tag=${address[6]}`;
            if (lastTime) url += "&last_timestamp="+lastTime;

        } else if (address[3] === "community" ) {//community
            locationType = "comm";
            permaLinks = document.getElementsByClassName("link_post");
            url = document.URL + "/posts/json";
            if (lastTime) url += "?last_timestamp="+lastTime;

        } else if (address[3] === "posts") {//single post
            locationType = "post";
            permaLinks = document.getElementsByClassName("timestamp2");
            url = document.URL.substring(0,document.URL.indexOf("?") >= 0 ? document.URL.indexOf("?") : document.URL.length) + "/json";
            if (lastTime) url += "?last_timestamp="+lastTime;

        } else if (address[3] === "search") {//search
            locationType = "search";
            permaLinks = document.getElementsByClassName("link_post");
            url = `https://www.pillowfort.social/search/posts/${address[4]}/json/`;
            if (lastTime) url += "?last_timestamp="+lastTime;

        } else if (address[4] === "tagged") {//tagged fort
            locationType = "fort";
            permaLinks = document.getElementsByClassName("link_post");
            url = `https://www.pillowfort.social/${address[3]}/tagged/${address[5]}/json/`;
            url += "?p=";
            let page = Object.values(document.getElementsByClassName("active")).filter(function(item){return item.nodeName == "LI"})[0];
            if (page) url += page.firstChild.innerHTML;
            else url += "1";

        } else {//fort
            locationType = "fort";
            permaLinks = document.getElementsByClassName("link_post");
            url = document.URL + "/json";
            url += "?p=";
            let page = Object.values(document.getElementsByClassName("active")).filter(function(item){return item.nodeName == "LI"})[0];
            if (page) url += page.firstChild.innerHTML;
            else url += "1";
        }

        if (locationType === "post") {
            posts.push({
                id: address[4]*1,
                post: document.getElementsByClassName("post-container")[0]
            });
        } else {
            Object.values(permaLinks).forEach(function(item) {
                if (item.href.split("/")[4] === "") return;
                posts.push({
                    id: item.href.split("/")[4]*1,
                    post: item.parentNode.parentNode.parentNode.parentNode.parentNode
                });
            });
        }

        if (!url) return;
        $.getJSON(url, function(data) {
            let postData = [];
            if (locationType === "feed"
               || locationType === "fort") {
                postData = data.posts;
            } else if (locationType === "comm") {
                postData = data;
            } else if (locationType === "post") {
                postData.push(data);
            } else if (locationType === "search") {
                postData = data.posts_by_tag.posts_by_tag;
            }

            lastTime = postData[postData.length-1].created_at;

            processPosts_skdasoyk(postData, posts);
        });
    }

    function processPosts_skdasoyk(postData, posts) {
        for (let post of postData) {
            let postElement = posts.find(function(item) {
                return (item.id === (post.original_post_id || post.id));
            });
            if (postElement.post.classList.contains("tasselAdvancedBlacklistProcessed")) continue;
            postElement.post.classList.add("tasselAdvancedBlacklistProcessed");
            addBlockButton_skdasoyk(post);
            if (settings.showTags) addTags_skdasoyk(post, postElement);
            let blockResult = shouldBeBlocked_skdasoyk(post);
            if (!blockResult.block) continue;
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
        }).parentNode.parentNode.parentNode.parentNode;

        let button = document.createElement("span");
        button.innerHTML = `
            <a href="" title="Blacklist this Post" class="nav-tab tab-leftmost" style="padding-top: 15px;" post-id="${(post.original_post_id || post.id)}">
                <img class="report-img svg-purple" src="/assets/global/ic_block-4935083b69aa4d8c99438a7c30cbb741bb2886ae9cd3ce4e8f58e4d01797a730.svg">
            </a>
        `;
        button.children[0].addEventListener("click", function(event) {
            event.preventDefault();

            this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = "none";

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

    /* Check if a post should be blocked or not */
    function shouldBeBlocked_skdasoyk(post) {
        let block = {
            block: false,
            blockFor: [],
            hide: false
        };
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
            if (entry.apply.body) {
                // remove symbols and formating
                let _body = post.content + " " + (post.original_post ? post.original_post.title : post.title);
                _body = _body.replaceAll(".", " ");
                _body = _body.replaceAll("!", " ");
                _body = _body.replaceAll("?", " ");
                _body = _body.replaceAll(",", " ");
                _body = _body.replaceAll(";", " ");
                _body = _body.replaceAll("\"", " ");
                _body = _body.replaceAll("/", " ");
                _body = _body.replaceAll("[", " ");
                _body = _body.replaceAll("]", " ");
                _body = _body.replaceAll("(", " ");
                _body = _body.replaceAll(")", " ");
                _body = _body.replaceAll("'", " ");
                _body = _body.replaceAll("-", " ");
                _body = _body.replaceAll("<strong>", " ");
                _body = _body.replaceAll("</strong>", " ");
                _body = _body.replaceAll("<em>", " ");
                _body = _body.replaceAll("</em>", " ");
                _body = _body.replaceAll("<p>", " ");
                _body = _body.replaceAll("</p>", " ");
                _body = _body.replaceAll("<br>", " ");
                body = _body.split(" ");
            }

            // get tag content
            let tags = [];
            tags.push(...post.tags);
            if (post.original_post) tags.push(...post.original_post.tag_list);

            // whitelist /////////////////////////////////////////////////////////////////
            let whitelistCount = 0;
            if (entry.whitelist.length > 0) indicatorWhite = 0;
            entry.whitelist.forEach(function(whiteItem) {
                if (entry.apply.id && (post.original_post_id || post.id == whiteItem)) {
                    whitelistCount++;
                    return;
                }
                if (entry.apply.body) {
                    if (body.some(function(item) {
                        return item.toLowerCase() === whiteItem.toLowerCase();
                    })) {
                        whitelistCount++;
                        return;
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
                        if (body.some(function(item) {
                            return item.toLowerCase() === blackItem.toLowerCase();
                        })) {
                            blacklistCount--;
                            block.blockFor.push(blackItem);
                            return;
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
        }).parentNode.parentNode.parentNode.parentNode;

        //hide post completly
        if (blockResult.hide && locationType !== "post") {
            postElement.parentNode.parentNode.style.display = "none";
            return;
        }

        let container = document.createElement("div");
        container.classList.add("tasselAdvancedBlacklistBlockedHeader");
        let reason = "This post is blocked.";
        if (settings.showReason) {
            reason = "Blocked for: " + blockResult.blockFor.join(", ");
        }
        container.innerHTML = `
            <button>Show</button>
            <div>${reason}</div>
        `;
        postElement.getElementsByClassName("header")[0].after(container);
        container.children[0].addEventListener("click", function() {
            let post = this.parentNode.parentNode;
            if (this.innerHTML == "Show") {
                for (let el of post.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "block";
                this.innerHTML = "Hide";
            } else {
                for (let el of post.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "none";
                this.innerHTML = "Show";
            }
        });

        for (let el of postElement.getElementsByClassName("title")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("media")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("content")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("post-nav")) el.classList.add("advancedBlacklistHidden");
        for (let el of postElement.getElementsByClassName("advancedBlacklistHidden")) el.style.display = "none";
    }

    createPage_skdasoyk();
    /* Create the Advanced Blacklist settings page */
    function createPage_skdasoyk() {
        if (document.URL !== "https://www.pillowfort.social/settings?blacklist") return;
        document.title = "Advanced Blacklist";
        document.getElementsByClassName("header-top")[0].innerHTML = "Advanced Blacklist";
        let body = document.getElementsByClassName("settings-page")[0];
        for (let a = body.children.length-2; a > 1; a--) {
            body.children[a].remove();
        }
        let saveButton = body.getElementsByTagName("input")[0];
        saveButton.removeAttribute("type");
        saveButton.addEventListener("click", saveBlacklist_skdasoyk);
        saveButton.addEventListener("click", function() {
            window.location.reload();
        });

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
        for (let a = 0; a < 8; a++) {
            let header = document.createElement("div");
            header.classList.add("tasselAdvancedBlacklistHeader");
            header.innerHTML = `
                <div>
                    <div class="tasselAdvancedBlacklistShadowCover"></div>
                    <div class="tasselAdvancedBlacklistHeaderTitle">${titles[a]}
                        <div>
                            <div>${infos[a]}</div>
                        </div>
                    </div>
                </div>
            `;
            header.setAttribute("info", infos[a]);
            blacklistView.appendChild(header);
        }
        blacklistView.lastChild.children[0].children[0].style.width = "100%";//fix for last header item
        blacklistView.lastChild.children[0].children[1].children[0].style.display = "none";//no tooltip for last column
        for (let a = 0; a < 8; a++) {
            let shadow = document.createElement("div");
            shadow.classList.add("tasselAdvancedBlacklistShadow");
            shadow.innerHTML = "<div></div>";
            blacklistView.appendChild(shadow);
        }
        blacklistView.lastChild.children[0].style.width = "100%";

        blacklist.forEach(function(item, index) {
            addBlacklistRow_skdasoyk(index, item);
        });
        addBlacklistRow_skdasoyk(blacklist.length);

        let settingsArea = document.createElement("div");
        settingsArea.id = "tasselAdvancedBlacklistSettings";
        body.insertBefore(settingsArea, blacklistView);

        let switch1 = createSwitch_skdasoyk("Show Original Tags", settings.showTags ? "checked" : "");
        switch1.children[0].addEventListener("change", function() {
            settings.showTags = this.checked;
            saveSettings_skdasoyk();
        });
        settingsArea.appendChild(switch1);
        let switch2 = createSwitch_skdasoyk("Show why a Post was blocked", settings.showReason ? "checked" : "");
        switch2.children[0].addEventListener("change", function() {
            settings.showReason = this.checked;
            saveSettings_skdasoyk();
        });
        settingsArea.appendChild(switch2);

        settingsArea.appendChild(document.createElement("hr"));

        let filterButton = document.createElement("button");
        filterButton.classList.add("btn", "tasselButton");
        filterButton.innerHTML = "Pillowfort Filters & Blacklist";
        filterButton.addEventListener("click", function(event){
            event.preventDefault();
            showFilters_skdasoyk();
        });
        settingsArea.appendChild(filterButton);

        let pillowfortExport = document.createElement("button");
        pillowfortExport.classList.add("btn", "tasselButton");
        pillowfortExport.innerHTML = "export from Pillowfort to file";
        pillowfortExport.addEventListener("click", function(event){
            event.preventDefault();
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
        settingsArea.appendChild(pillowfortExport);

        let tasselExport = document.createElement("button");
        tasselExport.classList.add("btn", "tasselButton");
        tasselExport.innerHTML = "export from Tassel to file";
        tasselExport.addEventListener("click", function(event){
            event.preventDefault();
            let d = new Date();
            downloadObject_skdasoyk(blacklist, `advanced_blacklist_export_${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}.txt`);
        });
        settingsArea.appendChild(tasselExport);

        let tasselImport = document.createElement("button");
        tasselImport.classList.add("btn", "tasselButton");
        tasselImport.innerHTML = "import to Tassel from file";
        tasselImport.addEventListener("click", function(event){
            event.preventDefault();
            let inputFrame = document.createElement("div");
            this.after(inputFrame);
            let input = document.createElement("textarea");
            input.id = "tasselAdvancedBlacklistImport";
            input.placeholder = "Past the contents of a file export here.";
            inputFrame.appendChild(input);
            let add = document.createElement("button");
            add.classList.add("btn", "inline", "tasselButton");
            add.style.marginRight = "10px";
            add.innerHTML = "add to list";
            add.addEventListener("click", function(event) {
                event.preventDefault();
                let input = document.getElementById("tasselAdvancedBlacklistImport");
                if (input.value === "") return;
                let list = JSON.parse(input.value);
                blacklist.push(...list);

                let file = JSON.parse(localStorage.getItem("tasselAdvancedBlacklist") || "{}");
                file.blacklist = blacklist;
                localStorage.setItem("tasselAdvancedBlacklist", JSON.stringify(file));
                window.location.reload();
            });
            inputFrame.appendChild(add);
            let replace = document.createElement("button");
            replace.classList.add("btn", "inline", "tasselButton");
            replace.innerHTML = "replace list";
            replace.addEventListener("click", function(event) {
                event.preventDefault();
                let input = document.getElementById("tasselAdvancedBlacklistImport");
                if (input.value === "") return;
                blacklist = JSON.parse(input.value);

                let file = JSON.parse(localStorage.getItem("tasselAdvancedBlacklist") || "{}");
                file.blacklist = blacklist;
                localStorage.setItem("tasselAdvancedBlacklist", JSON.stringify(file));
                window.location.reload();
            });
            inputFrame.appendChild(replace);
        });
        settingsArea.appendChild(tasselImport);
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
                item = removeSpaces_skdasoyk(item);
                if (item !== "") row.blacklist.push(item);
            });

            let whiteInput = document.getElementById(`tasselAdvancedBlacklistInput-white-${index}`).value;
            whiteInput = whiteInput.split(",");
            whiteInput.forEach(function(item) {
                item = removeSpaces_skdasoyk(item);
                if (item !== "") row.whitelist.push(item);
            });

            row.apply.tags = document.getElementById(`tasselAdvancedBlacklistInput-tags-${index}`).checked;
            row.apply.body = document.getElementById(`tasselAdvancedBlacklistInput-body-${index}`).checked;
            row.apply.id = document.getElementById(`tasselAdvancedBlacklistInput-id-${index}`).checked;
            row.hide = document.getElementById(`tasselAdvancedBlacklistInput-hide-${index}`).checked;

            row.source = removeSpaces_skdasoyk(document.getElementById(`tasselAdvancedBlacklistInput-source-${index}`).value);

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

    /* Create an HTML element of a checkbox with lable */
    function createSwitch_skdasoyk(title="", state="", _class=Math.random()) {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" class="${_class}" ${state} style="accent-color:var(--pageBg)">
          <label for="${id}">${title}</label>
        `;
        return toggle;
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

        let blackInput = document.createElement("input");
        blackInput.type = "text";
        blackInput.id = "tasselAdvancedBlacklistInput-black-" + index;
        if (item) blackInput.value = item.blacklist.join(", ");
        blackInput.addEventListener("input", checkNewRow_skdasoyk);
        blacklistView.appendChild(blackInput);

        let whiteInput = document.createElement("input");
        whiteInput.type = "text";
        whiteInput.id = "tasselAdvancedBlacklistInput-white-" + index;
        if (item) whiteInput.value = item.whitelist.join(", ");
        whiteInput.addEventListener("input", checkNewRow_skdasoyk);
        blacklistView.appendChild(whiteInput);

        let checkTags = document.createElement("input");
        checkTags.id = "tasselAdvancedBlacklistInput-tags-" + index;
        checkTags.type = "checkbox";
        checkTags.checked = true;
        if (item) checkTags.checked = item.apply.tags;
        blacklistView.appendChild(checkTags);

        let checkBody = document.createElement("input");
        checkBody.id = "tasselAdvancedBlacklistInput-body-" + index;
        checkBody.type = "checkbox";
        checkBody.checked = true;
        if (item) checkBody.checked = item.apply.body;
        blacklistView.appendChild(checkBody);

        let checkId = document.createElement("input");
        checkId.id = "tasselAdvancedBlacklistInput-id-" + index;
        checkId.type = "checkbox";
        if (item) checkId.checked = item.apply.id;
        blacklistView.appendChild(checkId);

        let hidePost = document.createElement("input");
        hidePost.id = "tasselAdvancedBlacklistInput-hide-" + index;
        hidePost.type = "checkbox";
        if (item) hidePost.checked = item.hide;
        blacklistView.appendChild(hidePost);

        let sourceInput = document.createElement("input");
        sourceInput.type = "text";
        sourceInput.id = "tasselAdvancedBlacklistInput-source-" + index;
        sourceInput.addEventListener("input", checkNewRow_skdasoyk);
        if (item) sourceInput.value = item.source;
        blacklistView.appendChild(sourceInput);

        let addLine = document.createElement("div");
        addLine.id = "tasselAdvancedBlacklistInput-add-" + index;
        addLine.classList.add("tasselAdvancedBlacklistAddLine");
        addLine.innerHTML = `<button title="add a new line below">+</button>`;
        addLine.addEventListener("click", insertNewRow_skdasoyk);
        blacklistView.appendChild(addLine);
    }

    /* Add a new row if the last row in the Advanced Blacklist settings has data in it */
    function checkNewRow_skdasoyk() {
        let index = this.id.split("-")[2]*1 + 1;
        if (document.getElementById("tasselAdvancedBlacklistInput-black-" + index)) return;
        addBlacklistRow_skdasoyk(index);
    }

    /* Add a new row at the bottom and shift data down */
    function insertNewRow_skdasoyk() {
        event.preventDefault();
        let index = this.id.split("-")[2]*1 + 1;
        let lastIndex = document.getElementById("tasselAdvancedBlacklistView").lastChild.id.split("-")[2]*1 + 1;
        addBlacklistRow_skdasoyk(lastIndex);
        let a = lastIndex;
        for (; a > index; a--) {
            document.getElementById("tasselAdvancedBlacklistInput-black-" + a).value = document.getElementById("tasselAdvancedBlacklistInput-black-" + (a - 1)).value;
            document.getElementById("tasselAdvancedBlacklistInput-white-" + a).value = document.getElementById("tasselAdvancedBlacklistInput-white-" + (a - 1)).value;
            document.getElementById("tasselAdvancedBlacklistInput-tags-" + a).checked = document.getElementById("tasselAdvancedBlacklistInput-tags-" + (a - 1)).checked;
            document.getElementById("tasselAdvancedBlacklistInput-body-" + a).checked = document.getElementById("tasselAdvancedBlacklistInput-body-" + (a - 1)).checked;
            document.getElementById("tasselAdvancedBlacklistInput-id-" + a).checked = document.getElementById("tasselAdvancedBlacklistInput-id-" + (a - 1)).checked;
            document.getElementById("tasselAdvancedBlacklistInput-hide-" + a).checked = document.getElementById("tasselAdvancedBlacklistInput-hide-" + (a - 1)).checked;
            document.getElementById("tasselAdvancedBlacklistInput-source-" + a).value = document.getElementById("tasselAdvancedBlacklistInput-source-" + (a - 1)).value;
        }
        document.getElementById("tasselAdvancedBlacklistInput-black-" + a).value = "";
        document.getElementById("tasselAdvancedBlacklistInput-white-" + a).value = "";
        document.getElementById("tasselAdvancedBlacklistInput-tags-" + a).checked = true;
        document.getElementById("tasselAdvancedBlacklistInput-body-" + a).checked = true;
        document.getElementById("tasselAdvancedBlacklistInput-id-" + a).checked = false;
        document.getElementById("tasselAdvancedBlacklistInput-hide-" + a).checked = false;
        document.getElementById("tasselAdvancedBlacklistInput-source-" + a).value = "";
    }
})();
