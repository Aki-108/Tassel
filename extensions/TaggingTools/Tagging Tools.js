// ==UserScript==
// @name         Tagging Tools
// @version      1.0
// @description  Adds tag suggetions and easy copying of tags.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //get page elements
    let tagInput = document.getElementById("tags") || document.getElementById("post_tag_list");
    let submitButton = document.getElementById("submit-reblog");
    if (submitButton) {;//reblog modal
    } else if (document.getElementsByClassName("submit-post-bkd")[1]) {//create post
        submitButton = document.getElementsByClassName("submit-post-bkd")[1].children[0].children[0];
    } else if (document.getElementsByClassName("main reblog-tags-container")[0]) {//reblog page
        submitButton = document.getElementsByClassName("main reblog-tags-container")[0].children[1].children[0];
    }

    //load database
    let tags = (JSON.parse(localStorage.getItem("tasselTaggingTools")) || {tags: []}).tags;

    let cursorPos = -1;

    init();
    function init() {
        creatSuggestionBox();
        addEventListenerSubmit();
        addEventListenerInput();
    }

    /* Get the original tags of the post as an array of strings */
    function getOriginalTags() {
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

    /* Create the page element that holds tag suggestions */
    function creatSuggestionBox() {
        let box = document.createElement("div");
        box.id = "tasselTaggingToolsSuggestionBox";
        box.style = "height:32px;overflow:hidden;color:#aaa;margin-top:5px;line-height:32px;";
        box.innerHTML = " start typing to get suggestions";
        tagInput.before(box);
        suggest();
    }

    /* Add the events to the tag input field to suggest new tags when typing */
    function addEventListenerInput() {
        tagInput.addEventListener("click", suggest);
        tagInput.addEventListener("keyup", suggest);
    }

    /* Suggest new tags based on the current input */
    function suggest() {
        //cut input down to one tag at the current cursor position
        cursorPos = tagInput.selectionStart;
        let edges = findEdges(cursorPos);
        let typing = removeSpaces(tagInput.value.substring(edges.start, edges.end));

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
            return removeSpaces(item);
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
        addCopyButton();
        matches.forEach(function(item) {
            let button = document.createElement("button");
            button.style = "border:none;border-radius:.5em;padding:2px 8px;margin:4px;background-color:#f5f5f5;color:#37474f;";
            button.setAttribute("value", item.tag);
            button.innerHTML = item.tag.substring(0, item.index) + "<u>" + item.tag.substring(item.index, item.index + typing.length) + "</u>" + item.tag.substring(item.index + typing.length);
            button.addEventListener("click", function(event) {
                event.preventDefault();
                insertTag(this);
            });
            button.addEventListener("mouseenter", function() {
                this.style.backgroundColor = "#e8e8e8";
            });
            button.addEventListener("mouseleave", function() {
                this.style.backgroundColor = "#f5f5f5";
            });
            suggestionOutput.appendChild(button);
        });
    }

    /* Display a button to copy the tags of the original post into the input field */
    function addCopyButton() {
        let suggestionOutput = document.getElementById("tasselTaggingToolsSuggestionBox");
        let button = document.createElement("button");
        button.style = "border:1px solid #cfcfcf;border-radius:.5em;margin:4px 0px 4px 4px;background-color:#f5f5f5;color:#37474f;float:right;width:24px;height:24px;text-align:center;";
        button.title = "copy tags";
        button.innerHTML = "🠗";
        button.addEventListener("mouseenter", function() {
            this.style.backgroundColor = "#e8e8e8";
        });
        button.addEventListener("mouseleave", function() {
            this.style.backgroundColor = "#f5f5f5";
        });

        //copy tags
        button.addEventListener("click", function(event) {
            event.preventDefault();
            //get the original tags, stop if there are none
            let tags = getOriginalTags();
            if (!tags) return;

            //filter out tags that are already in the input field to prevent duplicates
            let used = tagInput.value.split(",");
            used = used.map(function(item) {
                return removeSpaces(item);
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
                let input = removeSpaces(tagInput.value);
                input = input[input.length-1];
                if (input !== undefined && input !== ",") tagInput.value += ", ";
                let edges = findEdges(tagInput.value.length);
                tagInput.value = tagInput.value.substring(0, edges.start) + ` ${item}, `;
            });
        });

        suggestionOutput.appendChild(button);
    }

    /* Return the start and end cursor positions of a tag in the input field */
    function findEdges(pos) {
        let start, end;
        for (start = pos; start > 0; start--) if (tagInput.value[start - 1] === ",") break;
        for (end = pos; end <= tagInput.value.length; end++) if (tagInput.value[end] === ",") break;
        return {start: start, end: end};
    }

    /* Removes spaces at the start and end of a string */
    function removeSpaces(string) {
        let first = "";
        for (let a = string.length - 1; a >= 0; a--)
            if (first != "" || string[a] != " ") first += string[a];
        let second = "";
        for (let a = first.length - 1; a >= 0; a--)
            if (second != "" || first[a] != " ") second += first[a];
        return second;
    }

    /* Adds a suggested tag into the input field at the cursor position */
    function insertTag(el) {
        //insert tag
        let edges = findEdges(cursorPos);
        tagInput.value = tagInput.value.substring(0, edges.start) + " " + el.getAttribute("value") + tagInput.value.substring(edges.end);
        //add a comma if necessary
        let input = removeSpaces(tagInput.value);
        input = input[input.length-1];
        if (input !== undefined && input !== ",") tagInput.value += ", ";
        //return to normal
        tagInput.focus();
        let newPos = edges.start + el.getAttribute("value").length + 2;
        tagInput.setSelectionRange(newPos, newPos);
        suggest();
    }

    /* Add the event for updating the database */
    function addEventListenerSubmit() {
        submitButton.addEventListener("click", function() {
            //load database
            let file = JSON.parse(localStorage.getItem("tasselTaggingTools")) || {};
            let fileTags = file.tags || [];

            let tags = tagInput.value.split(",");
            tags.forEach(function(tag) {
                tag = removeSpaces(tag);

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
})();
