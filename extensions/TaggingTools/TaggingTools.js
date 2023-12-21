// ==UserScript==
// @name         Tagging Tools
// @version      1.5
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
    let submitButton = document.getElementById("submit-reblog");
    let draftButton;
    if (submitButton) {;//reblog modal
    } else if (document.getElementsByClassName("submit-post-bkd")[1]) {//create post
        submitButton = document.getElementById("publish-btn");
        draftButton = document.getElementById("draft-btn");
    } else if (document.getElementsByClassName("main reblog-tags-container")[0]) {//reblog page
        submitButton = document.getElementsByClassName("main reblog-tags-container")[0].children[1].children[0];
    }

    //load database
    let tags = (JSON.parse(localStorage.getItem("tasselTaggingTools")) || {tags: []}).tags;

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
        //addEventListenerSubmit_dshcgkhy(draftButton);
        addEventListenerInput_dshcgkhy();
        initTassel_dshcgkhy();
    }

    /* Get post type for the reblog modal */
    function initReblogModal_dshcgkhy() {
        if (!document.getElementById("post-view-modal")) return;
        let postModalLink = document.getElementById("post-view-modal").getElementsByClassName("link_post")[0];
        //update again everytime the post changes
        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
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
                tags.push({tag:tag,count:1});
            });
        });
    }

    /* Add eventlisteners for creating a new post */
    function initNewPostPage_dshcgkhy() {
        if (document.URL !== "https://www.pillowfort.social/posts/new") return;
        togglePostType_dshcgkhy("text");
        document.getElementById("text").addEventListener("click", function() {togglePostType_dshcgkhy("text")});
        document.getElementById("picture_select").addEventListener("click", function() {togglePostType_dshcgkhy("photo")});
        document.getElementById("video").addEventListener("click", function() {togglePostType_dshcgkhy("video")});
        document.getElementById("embed").addEventListener("click", function() {togglePostType_dshcgkhy("link")});
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
                tags.push({tag:tag,count:1});
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
            let fileTags = file.tags || [];

            let tags = tagInput.value.split(",");
            tags.forEach(function(tag) {
                tag = removeSpaces_dshcgkhy(tag);

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
                index: searchIndex
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
        button.innerHTML = "🠗";

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

        let info1 = document.createElement("label");
		info1.style.fontWeight = "normal";
        info1.innerHTML = "Text Posts";
        let input1 = document.createElement("input");
        input1.id = "tasselTaggingToolsTagText";
        input1.value = settings.tagPreset.textPost || "";
        info1.appendChild(input1);
        content.appendChild(info1);
        content.appendChild(document.createElement("br"));

        let info2 = document.createElement("label");
		info2.style.fontWeight = "normal";
        info2.innerHTML = "Photo Posts";
        let input2 = document.createElement("input");
        input2.id = "tasselTaggingToolsTagPhoto";
        input2.value = settings.tagPreset.photoPost || "";
        info2.appendChild(input2);
        content.appendChild(info2);
        content.appendChild(document.createElement("br"));

        let info3 = document.createElement("label");
		info3.style.fontWeight = "normal";
        info3.innerHTML = "Video Posts";
        let input3 = document.createElement("input");
        input3.id = "tasselTaggingToolsTagVideo";
        input3.value = settings.tagPreset.videoPost || "";
        info3.appendChild(input3);
        content.appendChild(info3);
        content.appendChild(document.createElement("br"));

        let info4 = document.createElement("label");
		info4.style.fontWeight = "normal";
        info4.innerHTML = "Link Posts";
        let input4 = document.createElement("input");
        input4.id = "tasselTaggingToolsTagLink";
        input4.value = settings.tagPreset.linkPost || "";
        info4.appendChild(input4);
        content.appendChild(info4);
        content.appendChild(document.createElement("br"));

        let info5 = document.createElement("label");
		info5.style.fontWeight = "normal";
        info5.innerHTML = "Self-Reblogs";
        let input5 = document.createElement("input");
        input5.id = "tasselTaggingToolsTagSelfReblog";
        input5.value = settings.tagPreset.selfReblog || "";
        info5.appendChild(input5);
        content.appendChild(info5);
        content.appendChild(document.createElement("br"));

        let info6 = document.createElement("label");
		info6.style.fontWeight = "normal";
        info6.innerHTML = "Other-Reblogs";
        let input6 = document.createElement("input");
        input6.id = "tasselTaggingToolsTagOtherReblog";
        input6.value = settings.tagPreset.otherReblog || "";
        info6.appendChild(input6);
        content.appendChild(info6);
        content.appendChild(document.createElement("br"));

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
