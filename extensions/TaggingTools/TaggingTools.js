// ==UserScript==
// @name         Tagging Tools
// @version      2.2
// @description  Adds tag suggetions and easy copying of tags.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).taggingTools || {};
    if (!settings.tagPreset) settings.tagPreset = {textPost: "", photoPost: "", videoPost: "", linkPost: "", selfReblog: "", otherReblog: ""};

    //get page elements
    let tagInput = document.getElementById("tags") || document.getElementById("post_tag_list");
    let submitButton = document.getElementById("submit-reblog") || document.getElementById("publish-btn");
    let draftButton;
    if (submitButton) {;//reblog modal
    } else if (document.getElementsByClassName("submit-post-bkd")[1]) {//create post
        submitButton = document.getElementById("publish-btn");
        draftButton = document.getElementById("draft-btn");
    } else if (document.getElementsByClassName("main reblog-tags-container")[0]) {//reblog page
        submitButton = document.getElementsByClassName("main reblog-tags-container")[0].children[1].children[0];
    }

    //load database
    let tags = (JSON.parse(localStorage.getItem("tasselTaggingTools")) || {tags: {}});
    if (tags.constructor === Array) {
        let newTags = {};
        for (let index in tags) {
            tags[index].id = parseInt(index) + 1;
            newTags[tags[index].id] = tags[index];
        }
        newTags.nextIndex = Object.values(newTags).length + 1;
        tags = newTags;
        localStorage.setItem("tasselTaggingTools", JSON.stringify(tags));
        console.log(tags);
    }

    let cursorPos = -1;
    let newPostType = "text";

    let styleObserver;

    init_dshcgkhy();
    function init_dshcgkhy() {
        creatSuggestionBox_dshcgkhy();
        initNewPostPage_dshcgkhy();
        initReblogPage_dshcgkhy();
        initReblogModal_dshcgkhy();
        addEventListenerSubmit_dshcgkhy(submitButton);
        addEventListenerInput_dshcgkhy();
        initTassel_dshcgkhy();
    }

    /* Get post type for the reblog modal */
    function initReblogModal_dshcgkhy() {
        //update again everytime the post changes
        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
            if (!tasselJsonManager.modal.ready) return;
            addCommunityRulesButton_dshcgkhy();
            newPostType = tasselJsonManager.modal.json.post_type;
            if (newPostType === "picture") newPostType = "photo";
            else if (newPostType === "embed") newPostType = "link";
            togglePostType_dshcgkhy(newPostType);
            if (tasselJsonManager.modal.json.mine) {
                tagInput.value += ", " + settings.tagPreset.selfReblog;
            } else {
                tagInput.value += ", " + settings.tagPreset.otherReblog;
            }
            if (settings.autoCopy) document.getElementById("tasselTaggingToolsCopyTags").click();
            tasselJsonManager.modal.json.tags.forEach(function(tag) {
                //tags.push({tag:tag,count:1});
                //TODO
                tags[tags.nextIndex] = {tag:tag,count:1,type:"original"};
                tags.nextIndex++;
            });
        });
    }

    /* Add eventlisteners for creating a new post */
    function initNewPostPage_dshcgkhy() {
        if (document.URL.indexOf("https://www.pillowfort.social/posts/new") != 0) return;
        togglePostType_dshcgkhy("text");
        document.getElementById("text").addEventListener("click", function() {togglePostType_dshcgkhy("text")});
        document.getElementById("picture_select").addEventListener("click", function() {togglePostType_dshcgkhy("photo")});
        document.getElementById("video").addEventListener("click", function() {togglePostType_dshcgkhy("video")});
        document.getElementById("embed").addEventListener("click", function() {togglePostType_dshcgkhy("link")});
        addCommunityRulesButton_dshcgkhy();
    }

    /* Get post type for the static reblog page */
    function initReblogPage_dshcgkhy() {
        if (document.URL.substring(0,37) !== "https://www.pillowfort.social/reblog/") return;
        document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
            newPostType = tasselJsonManager.post.json.post_type;
            if (newPostType === "picture") newPostType = "photo";
            else if (newPostType === "embed") newPostType = "link";
            togglePostType_dshcgkhy(newPostType);
            if (tasselJsonManager.post.json.mine) {
                tagInput.value += ", " + settings.tagPreset.selfReblog;
            } else {
                tagInput.value += ", " + settings.tagPreset.otherReblog;
            }
            if (settings.autoCopy) document.getElementById("tasselTaggingToolsCopyTags").click();
            tasselJsonManager.post.json.tags.forEach(function(tag) {
                //tags.push({tag:tag,count:1});
                //TODO
                tags[tags.nextIndex] = {tag:tag,count:1,type:"original"};
                tags.nextIndex++;
            });
        });
        addCommunityRulesButton_dshcgkhy();
    }

    /* Create a button in the modal header */
    function addCommunityRulesButton_dshcgkhy() {
        //sortCommunities_dshcgkhy();
        if (document.getElementById("tasselTaggingToolsRulesButton")) return;
        let header = document.getElementsByClassName("header-create-post")[0];
        let button = document.createElement("button");
        button.id = "tasselTaggingToolsRulesButton";
        button.innerHTML = "Rules";
        button.addEventListener("click", function(event) {
            event.preventDefault()
            loadCommunityRules_dshcgkhy();
        });
        header.appendChild(button);
    }

    /* Load and display the community rules */
    function loadCommunityRules_dshcgkhy() {
        let select = document.getElementById("post_to") || document.getElementById("reblog-modal").getElementsByTagName("select")[0];
        if (select.value === "current_user") return;
        let community = select.selectedOptions[0].textContent;
        $.get(`https://www.pillowfort.social/community/${community}`, function(data) {
            let body = data.substring(data.indexOf("<!-- rules  info modal"));
            body = body.substring(body.indexOf(">")+1);
            body = body.substring(0, body.indexOf("<!-- flag modal -->"));
            let exists = document.getElementById("tasselTaggingToolsRulesModal") ? true : false;
            let dialog = document.getElementById("tasselTaggingToolsRulesModal") || document.createElement("dialog");
            dialog.id = "tasselTaggingToolsRulesModal";
            dialog.innerHTML = body;
            dialog.getElementsByTagName("button")[0].addEventListener("click", function() {
                document.getElementById("tasselTaggingToolsRulesModal").close();
                document.body.classList.remove("modal-open");
            });
            dialog.children[0].style.display = "block";
            dialog.children[0].classList.add("in");
            if (!exists) document.body.appendChild(dialog);
            dialog.showModal();
            document.body.classList.add("modal-open");
        });
    }

    /* Sort the list of communities to reblog to */
    function loadCommunityTags_dshcgkhy() {
        $.get(`https://www.pillowfort.social/community/IntroduceYourself`, function(data) {
            let doc = document.createElement("div");
            doc.innerHTML = data.substring(data.indexOf("<!-- BEGIN COMMUNITY PINNED TAGS -->"), data.indexOf("<!-- END COMMUNITY PINNED TAGS -->"));;

            if (doc.childNodes.length < 3) return;
            let list = Object.values(doc.childNodes[2].childNodes)
            .filter(function(item) {
                return item.tagName === "A";
            })
            .map(function(item) {
                return item.innerHTML;
            });
            list.forEach(function(tag) {
                tags[tags.nextIndex] = {tag:tag,count:1,type:"community"};
                tags.nextIndex++;
            });
        });
    }

    /* Remove previous default tag and add new one */
    function togglePostType_dshcgkhy(type) {
        //find previous tag
        let oldTag = "";
        switch (newPostType) {
            case "text": oldTag = settings.tagPreset.textPost; break;
            case "photo": oldTag = settings.tagPreset.photoPost; break;
            case "video": oldTag = settings.tagPreset.videoPost; break;
            case "link": oldTag = settings.tagPreset.linkPost; break;
        }
        if (oldTag !== "") tagInput.value = tagInput.value.substring(oldTag.length);
        else tagInput.value = "," + tagInput.value;
        //place new tag
        let newTag = "";
        switch (type) {
            case "text": newTag = settings.tagPreset.textPost; break;
            case "photo": newTag = settings.tagPreset.photoPost; break;
            case "video": newTag = settings.tagPreset.videoPost; break;
            case "link": newTag = settings.tagPreset.linkPost; break;
        }
        if (newTag !== "") tagInput.value = newTag + tagInput.value;
        else tagInput.value = tagInput.value.substring(tagInput.value.search(",")+1);
        newPostType = type;
    }

    /* Add the event for updating the database */
    function addEventListenerSubmit_dshcgkhy(button) {
        if (!button) return;
        button.addEventListener("click", function() {
            //load database
            let file = JSON.parse(localStorage.getItem("tasselTaggingTools")) || {};
            let fileTags = file.tags || {};

            let tags = tagInput.value.split(",");
            tags = tags.map(removeSpaces_dshcgkhy);
            tags.forEach(function(tag) {
                let index = -1;
                let entry = fileTags.find(function(item, index_) {
                    if (item.tag === tag) {
                        index = index_;
                        return true;
                    }
                });
                if (index > -1) {//update tag
                    fileTags[index].count++;
                } else {//add new tag
                    fileTags.push({tag: tag, count: 1});
                }
            });
            //remove empty tags
            fileTags = fileTags.filter(function(item) {
                return item.tag.length > 0;
            });
            fileTags.sort(function(a, b) {
                return b.count - a.count
            });
            //save database
            file.tags = fileTags;
            localStorage.setItem("tasselTaggingTools", JSON.stringify(file));
        });
    }

    /* Add the events to the tag input field to suggest new tags when typing */
    function addEventListenerInput_dshcgkhy() {
        if (!tagInput) return;
        tagInput.addEventListener("click", suggest_dshcgkhy);
        tagInput.addEventListener("keyup", suggest_dshcgkhy);
    }

    /* Create the page element that holds tag suggestions */
    function creatSuggestionBox_dshcgkhy() {
        if (!tagInput) return;
        let box = document.createElement("div");
        box.id = "tasselTaggingToolsSuggestionBox";
        tagInput.before(box);
        suggest_dshcgkhy();
    }

    /* Suggest new tags based on the current input */
    function suggest_dshcgkhy() {
        //cut input down to one tag at the current cursor position
        cursorPos = tagInput.selectionStart;
        let edges = findEdges_dshcgkhy(cursorPos);
        let typing = removeSpaces_dshcgkhy(tagInput.value.substring(edges.start, edges.end));

        //find fitting tags
        let matches = [];
        tags.forEach(function(item) {
            //check if input is part of a saved tag
            let searchIndex = item.tag.toLowerCase().search(typing);
            if (searchIndex > -1) matches.push({
                tag: item.tag,
                count: item.count,
                rank: item.count * (item.tag.length / (searchIndex+1)),
                index: searchIndex,
                type: item.type || ""
            });
        });

        //remove tags that are already in use
        let used = tagInput.value.split(",");
        used = used.map(function(item) {
            return removeSpaces_dshcgkhy(item);
        });
        matches = matches.filter(function(item) {
            let exists = false;
            used.forEach(function(tag) {
                if (tag.toLowerCase() === item.tag.toLowerCase()) exists = true;
            });
            return !exists;
        });

        //sort by ranking, as previously calculated
        matches.sort(function(a, b) {
            return b.rank - a.rank;
        });

        //display suggestions
        let suggestionOutput = document.getElementById("tasselTaggingToolsSuggestionBox");
        suggestionOutput.innerHTML = "";
        addCopyButton_dshcgkhy();
        for (let a = 0; a < 20 && a < matches.length; a++) {
            let item = matches[a];
            let button = document.createElement("button");
            button.setAttribute("value", item.tag);
            button.innerHTML = item.tag.substring(0, item.index) + "<u>" + item.tag.substring(item.index, item.index + typing.length) + "</u>" + item.tag.substring(item.index + typing.length);
            if (item.type === "community") button.style.background = "orange";
            else if (item.type === "original") button.style.background = "red";
            button.addEventListener("click", function(event) {
                event.preventDefault();
                insertTag_dshcgkhy(this);
            });
            suggestionOutput.appendChild(button);
        }
    }

    /* Adds a suggested tag into the input field at the cursor position */
    function insertTag_dshcgkhy(el) {
        //insert tag
        let edges = findEdges_dshcgkhy(cursorPos);
        tagInput.value = tagInput.value.substring(0, edges.start) + " " + el.getAttribute("value") + tagInput.value.substring(edges.end);
        //add a comma if necessary
        let input = removeSpaces_dshcgkhy(tagInput.value);
        input = input[input.length-1];
        if (input !== undefined && input !== ",") tagInput.value += ", ";
        //return to normal
        tagInput.focus();
        let newPos = edges.start + el.getAttribute("value").length + 2;
        tagInput.setSelectionRange(newPos, newPos);
        suggest_dshcgkhy();
    }

    /* Display a button to copy the tags of the original post into the input field */
    function addCopyButton_dshcgkhy() {
        let suggestionOutput = document.getElementById("tasselTaggingToolsSuggestionBox");
        let button = document.createElement("button");
        button.id = "tasselTaggingToolsCopyTags";
        button.title = "copy tags";
        button.innerHTML = "&#x1F817;";

        //copy tags
        button.addEventListener("click", function(event) {
            event.preventDefault();
            //get the original tags, stop if there are none
            let tags = getOriginalTags_dshcgkhy();
            if (!tags) return;

            //filter out tags that are already in the input field to prevent duplicates
            let used = tagInput.value.split(",");
            used = used.map(function(item) {
                return removeSpaces_dshcgkhy(item);
            });
            tags = tags.filter(function(tag) {
                let exists = false;
                used.forEach(function(item) {
                    if (tag.toLowerCase() === item.toLowerCase()) exists = true;
                });
                return !exists;
            });

            //add tags to the input field
            tags.forEach(function(item) {
                let input = removeSpaces_dshcgkhy(tagInput.value);
                input = input[input.length-1];
                if (input !== undefined && input !== ",") tagInput.value += ", ";
                let edges = findEdges_dshcgkhy(tagInput.value.length);
                tagInput.value = tagInput.value.substring(0, edges.start) + ` ${item}, `;
            });

            tagInput.selectionStart = tagInput.value.length;
        });

        suggestionOutput.appendChild(button);
    }

    /* Get the original tags of the post as an array of strings */
    function getOriginalTags_dshcgkhy() {
        let originalTags;
        if (document.getElementById("reblog-modal")) {//reblog modal
            originalTags = document.getElementById("reblog-modal").getElementsByClassName("tags")[0].getElementsByClassName("tag-item");
        } else if (document.getElementsByClassName("tags")[0]) {//reblog page
            originalTags = document.getElementsByClassName("tags")[0].getElementsByClassName("tag-item");
        } else return;

        originalTags = Object.values(originalTags).map(function(item) {
            return item.innerHTML;
        });
        return originalTags;
    }

    /* Return the start and end cursor positions of a tag in the input field */
    function findEdges_dshcgkhy(pos) {
        let start, end;
        for (start = pos; start > 0; start--) if (tagInput.value[start - 1] === ",") break;
        for (end = pos; end <= tagInput.value.length; end++) if (tagInput.value[end] === ",") break;
        return {start: start, end: end};
    }

    /* Removes spaces at the start and end of a string */
    function removeSpaces_dshcgkhy(string) {
        let first = "";
        for (let a = string.length - 1; a >= 0; a--)
            if (first != "" || string[a] != " ") first += string[a];
        let second = "";
        for (let a = first.length - 1; a >= 0; a--)
            if (second != "" || first[a] != " ") second += first[a];
        return second;
    }

    /* Add elements to the Tassel menu */
    function initTassel_dshcgkhy() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarTaggingTools";
        button.innerHTML = "Tagging Tools";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarTaggingTools").addEventListener("click", displaySettings_dshcgkhy);
    }

    /* Create Tassel settings menu */
    function displaySettings_dshcgkhy() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarTaggingTools").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_dshcgkhy("Auto-copy tags when reblogging", settings.autoCopy ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.autoCopy = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.taggingTools = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
        content.appendChild(document.createElement("hr"));

        let title1 = document.createElement("h2");
        title1.innerHTML = "Default Tags";
        content.appendChild(title1);

        let frame1 = document.createElement("div");
        frame1.id = "tasselTaggingToolsSettings";
        content.appendChild(frame1);

        let info1 = document.createElement("label");
		info1.style.fontWeight = "normal";
        info1.innerHTML = "Text Posts";
        info1.setAttribute("for", "tasselTaggingToolsTagText");
        frame1.appendChild(info1);
        let input1 = document.createElement("input");
        input1.id = "tasselTaggingToolsTagText";
        input1.value = settings.tagPreset.textPost || "";
        frame1.appendChild(input1);

        let info2 = document.createElement("label");
		info2.style.fontWeight = "normal";
        info2.innerHTML = "Photo Posts";
        info2.setAttribute("for", "tasselTaggingToolsTagPhoto");
        frame1.appendChild(info2);
        let input2 = document.createElement("input");
        input2.id = "tasselTaggingToolsTagPhoto";
        input2.value = settings.tagPreset.photoPost || "";
        frame1.appendChild(input2);

        let info3 = document.createElement("label");
		info3.style.fontWeight = "normal";
        info3.innerHTML = "Video Posts";
        info3.setAttribute("for", "tasselTaggingToolsTagVideo");
        frame1.appendChild(info3);
        let input3 = document.createElement("input");
        input3.id = "tasselTaggingToolsTagVideo";
        input3.value = settings.tagPreset.videoPost || "";
        frame1.appendChild(input3);

        let info4 = document.createElement("label");
		info4.style.fontWeight = "normal";
        info4.innerHTML = "Link Posts";
        info4.setAttribute("for", "tasselTaggingToolsTagLink");
        frame1.appendChild(info4);
        let input4 = document.createElement("input");
        input4.id = "tasselTaggingToolsTagLink";
        input4.value = settings.tagPreset.linkPost || "";
        frame1.appendChild(input4);

        let info5 = document.createElement("label");
		info5.style.fontWeight = "normal";
        info5.innerHTML = "Self-Reblogs";
        info5.setAttribute("for", "tasselTaggingToolsTagSelfReblog");
        frame1.appendChild(info5);
        let input5 = document.createElement("input");
        input5.id = "tasselTaggingToolsTagSelfReblog";
        input5.value = settings.tagPreset.selfReblog || "";
        frame1.appendChild(input5);

        let info6 = document.createElement("label");
		info6.style.fontWeight = "normal";
        info6.innerHTML = "Other-Reblogs";
        info6.setAttribute("for", "tasselTaggingToolsTagOtherReblog");
        frame1.appendChild(info6);
        let input6 = document.createElement("input");
        input6.id = "tasselTaggingToolsTagOtherReblog";
        input6.value = settings.tagPreset.otherReblog || "";
        frame1.appendChild(input6);

        let frame7 = document.createElement("div");
        frame7.id = "tasselTaggingToolsSaveFrame";
        frame7.innerHTML = `
            <div>
                <div></div>
            </div>
        `;
        let button7 = document.createElement("button");
        button7.id = "tasselTaggingToolsSaveTags";
        button7.classList.add("btn", "btn-success");
        button7.innerHTML = "Save";
        button7.addEventListener("click", saveTags_dshcgkhy);
        frame7.appendChild(button7);
        content.appendChild(frame7);
        content.appendChild(document.createElement("hr"));

        let title2 = document.createElement("h2");
        title2.innerHTML = "Manage";
        content.appendChild(title2);

        let info8 = document.createElement("p");
        info8.innerHTML = `You have <b>${tags.length}</b> saved tags.`;
        content.appendChild(info8);

        let info9 = document.createElement("p");
        info9.innerHTML = "Remove tags used fewer times than:";
        content.appendChild(info9);
        let input9 = document.createElement("input");
        input9.id = "tasselTaggingToolsRemoveCount"
        input9.type = "number";
        input9.min = "1";
        input9.step = "1";
        input9.value = "1";
        info9.appendChild(input9);
        input9.addEventListener("change", function() {
            //display how many tags are selected based on input
            let input = document.getElementById("tasselTaggingToolsRemoveCount");
            let count = tags.filter(function(item) {
                return item.count < input.value;
            }).length;
            document.getElementById("tasselTaggingToolsRemoveSelected").innerHTML = `<b>${count}</b> tags selected.`;
        });
        let button9 = document.createElement("button");
        button9.id = "tasselTaggingToolsRemoveButton";
        button9.innerHTML = "Remove";
        info9.appendChild(button9);
        button9.addEventListener("click", function() {
            //load data
            let file = JSON.parse(localStorage.getItem("tasselTaggingTools")) || {};
            let fileTags = file.tags || [];

            let before = fileTags.length;
            let input = document.getElementById("tasselTaggingToolsRemoveCount");
            fileTags = fileTags.filter(function(item) {
                return item.count >= input.value;
            });
            tags = fileTags;
            //save data
            file.tags = fileTags;
            localStorage.setItem("tasselTaggingTools", JSON.stringify(file));

            displaySettings_dshcgkhy();
        });

        let info10 = document.createElement("p");
        info10.id = "tasselTaggingToolsRemoveSelected";
        info10.innerHTML = "<b>0</b> tags selected.";
        content.appendChild(info10);
    }

    /* Save settings to local storage */
    function saveTags_dshcgkhy() {
        if (!settings.tagPreset) settings.tagPreset = {};
        settings.tagPreset.textPost = removeSpaces_dshcgkhy(document.getElementById("tasselTaggingToolsTagText").value);
        settings.tagPreset.photoPost = removeSpaces_dshcgkhy(document.getElementById("tasselTaggingToolsTagPhoto").value);
        settings.tagPreset.videoPost = removeSpaces_dshcgkhy(document.getElementById("tasselTaggingToolsTagVideo").value);
        settings.tagPreset.linkPost = removeSpaces_dshcgkhy(document.getElementById("tasselTaggingToolsTagLink").value);
        settings.tagPreset.selfReblog = removeSpaces_dshcgkhy(document.getElementById("tasselTaggingToolsTagSelfReblog").value);
        settings.tagPreset.otherReblog = removeSpaces_dshcgkhy(document.getElementById("tasselTaggingToolsTagOtherReblog").value);

        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.taggingTools = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    /* Create an icon with hover popup */
    function createTooltip_dshcgkhy(content) {
        let icon = document.createElement("div");
        icon.classList.add("tasselInfo");
        icon.innerHTML = `
            <div class='tasselTooltip'>
                <div class='tasselTooltipBubble'>
                    ${content}
                </div>
            </div>
        `;
        return icon;
    }

    function createSwitch_dshcgkhy(title="", state="") {
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
