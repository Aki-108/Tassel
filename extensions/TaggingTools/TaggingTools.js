// ==UserScript==
// @name         Tagging Tools
// @version      2.7
// @description  Adds tag suggetions and easy copying of tags.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).taggingTools || {};
    let debug = JSON.parse(localStorage.getItem("tasselSettings2")).tassel.debug || false;
    if (!settings.tagPreset) settings.tagPreset = {textPost: "", photoPost: "", videoPost: "", linkPost: "", selfReblog: "", otherReblog: ""};
    let timeFormatActive = JSON.parse(localStorage.tasselSettings2).tassel.extensions.some(function(ext) {return ext.id == 16});
    let timeFormat = (JSON.parse(localStorage.tasselSettings2).timeFormat || {reblogDate: "RRR ago"}).reblogDate;

    //get page elements
    let tagInput = document.getElementById("tags") || document.getElementById("post_tag_list");
    let tagInputEdit = document.getElementById("post_tag_list");
    if (tagInput == tagInputEdit) tagInputEdit = null;
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
        initEditTagsModal_dshcgkhy();
        addEventListenerSubmit_dshcgkhy(submitButton);
        addEventListenerInput_dshcgkhy();
        initTassel_dshcgkhy();
    }

    /* Get post type for the reblog modal */
    function initReblogModal_dshcgkhy() {
        //update again everytime the post changes
        document.getElementById("tasselJsonManagerModalReady").addEventListener("click", function() {
            if (!tasselJsonManager.modal.ready) return;
            initPostEditorHeader_dshcgkhy();
            newPostType = tasselJsonManager.modal.json.post_type;
            if (newPostType === "picture") newPostType = "photo";
            else if (newPostType === "embed") newPostType = "link";
            togglePostType_dshcgkhy(newPostType);
            if (tagInput.value.length > 0 && tagInput.value.charAt(tagInput.value.length - 1)) tagInput.value += ", ";
            if (tasselJsonManager.modal.json.mine) {
                tagInput.value += settings.tagPreset.selfReblog;
            } else {
                tagInput.value += settings.tagPreset.otherReblog;
            }
            if (settings.autoCopy) document.getElementById("tasselTaggingToolsCopyTags").click();
            tasselJsonManager.modal.json.tags.forEach(function(tag) {
                let existing = tags.find(function(item) {
                    return item.tag.toLowerCase() === tag.toLowerCase();
                });
                if (existing !== undefined) {
                    existing.type = "original";
                } else {
                    tags.push({tag:tag,count:1,type:"original"});
                }
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
        initPostEditorHeader_dshcgkhy();
    }

    /* Get post type for the static reblog page */
    function initReblogPage_dshcgkhy() {
        if (document.URL.substring(0,37) !== "https://www.pillowfort.social/reblog/") return;
        document.getElementById("tasselJsonManagerPostReady").addEventListener("click", function() {
            newPostType = tasselJsonManager.post.json.post_type;
            if (newPostType === "picture") newPostType = "photo";
            else if (newPostType === "embed") newPostType = "link";
            togglePostType_dshcgkhy(newPostType);
            if (tagInput.value.length > 0 && tagInput.value.charAt(tagInput.value.length - 1)) tagInput.value += ", ";
            if (tasselJsonManager.post.json.mine) {
                tagInput.value += settings.tagPreset.selfReblog;
            } else {
                tagInput.value += settings.tagPreset.otherReblog;
            }
            if (settings.autoCopy) document.getElementById("tasselTaggingToolsCopyTags").click();
            tasselJsonManager.post.json.tags.forEach(function(tag) {
                let existing = tags.find(function(item) {
                    return item.tag.toLowerCase() === tag.toLowerCase();
                });
                if (existing !== undefined) {
                    existing.type = "original";
                } else {
                    tags.push({tag:tag,count:1,type:"original"});
                }
            });
        });
        initPostEditorHeader_dshcgkhy();
    }

    /* Add eventlistener for editing tags of a community post */
    function initEditTagsModal_dshcgkhy() {
        if (tagInputEdit) tagInputEdit.setAttribute("community", "true");
        let modal = document.getElementById("edit-tags-modal");
        if (!modal) return;

        let modalObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if (document.getElementById("edit-tags-modal").classList.contains("in")) {
                    let box = document.getElementById("tasselTaggingToolsSuggestionBoxEdit");
                    if (!box) {
                        box = document.createElement("div");
                        box.id = "tasselTaggingToolsSuggestionBoxEdit";
                        box.classList.add("tasselTaggingToolsSuggestionList");
                        if (settings.secondRow) box.classList.add("tasselTaggingToolsTaller");
                        tagInputEdit.before(box);
                    }
                    if (tagInputEdit.value[tagInputEdit.value.length-1] != ",") tagInputEdit.value += ",";

                    //add community tags
                    let url = document.URL;
                    let communityName = url.substring(url.search("/community/")+11);
                    communityName = communityName.split("/")[0];
                    let community = tasselJsonManager.communities.communities.find(function(item) {
                        return item.name === communityName;
                    });
                    if (community && community.pinned_tags) {
                        community.pinned_tags.split(",").forEach(function(tag) {
                            let existing = tags.find(function(item) {
                                return item.tag.toLowerCase() === tag.toLowerCase();
                            });
                            if (existing !== undefined) {
                                existing.type = "community";
                                existing.count += 999;
                            } else {
                                tags.push({tag:tag,count:999,type:"community"});
                            }
                        });
                    }

                    suggest_dshcgkhy(tagInputEdit, box);
                }
            });
        });
        modalObserver.observe(modal, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }

    /* Apply formating to the post editor header */
    function initPostEditorHeader_dshcgkhy() {
        loadCommunityTags_dshcgkhy();

        if (settings.reblogBottomHeader) {
            let frame = document.getElementById("reblog-modal") || document.getElementsByClassName("new-post")[0];
            frame.classList.add("bottomHeader");
        }

        if (document.getElementById("tasselTaggingToolsRulesButton")) return;
        let header = document.getElementsByClassName("header-create-post")[0];
        header.classList.add("tasselTaggingToolsHeaderGrid");
        let button = document.createElement("button");
        button.id = "tasselTaggingToolsRulesButton";
        button.innerHTML = "Rules";
        button.addEventListener("click", function(event) {
            event.preventDefault()
            loadCommunityRules_dshcgkhy();
        });
        header.appendChild(button);

        //replace community list with search
        //https://www.w3schools.com/howto/howto_js_autocomplete.asp
        let communitySelect = document.getElementsByName("post_to");
        if (communitySelect.length > 0) communitySelect = communitySelect[0];
        else return;
        if (settings.useCommunitySearch) {
            communitySelect.selectedIndex = 0;
            communitySelect.dispatchEvent(new Event('input', {bubbles: true}));
            let frame = document.createElement("div");
            frame.id = "tasselTaggingToolsCommunitySuggest";
            let input = document.createElement("input");
            input.style = "min-width: " + communitySelect.clientWidth + "px";
            input.id = "tasselTaggingToolsCommunitySearch";
            input.placeholder = communitySelect.options[0].text;
            input.autocomplete = "off";
            input.value = "";
            frame.appendChild(input);
            communitySelect.before(frame);

            //create list
            input.addEventListener("input", function() {
                clearCommunityList()
                let value = this.value;
                if (!value) {
                    input.classList.remove("bad");
                    document.getElementById("publish-btn").removeAttribute("disabled");
                    document.getElementById("queue-btn").removeAttribute("disabled");
                    document.getElementById("schedule-btn").removeAttribute("disabled");
                    communitySelect.selectedIndex = 0;
                    communitySelect.dispatchEvent(new Event('input', {bubbles: true}));
                    return;
                }
                let list = document.createElement("div");
                list.id = this.id + "List";
                list.classList.add("tasselTaggingToolsListItem");
                this.parentNode.appendChild(list);

                tasselJsonManager.communities.communities.sort(function(a, b) {
                    let indexA = a.name.toUpperCase().search(value.toUpperCase());
                    let indexB = b.name.toUpperCase().search(value.toUpperCase());
                    if (indexA > indexB) return 1;
                    if (indexA < indexB) return -1;
                    return 0;
                });

                //find items
                for (let community of tasselJsonManager.communities.communities) {
                    let matches = false;
                    if (community.name.toUpperCase().search(value.toUpperCase()) >= 0) matches = true;
                    if (!matches) continue;
                    let listItem = document.createElement("button");
                    listItem.innerHTML = community.name;
                    listItem.addEventListener("click", function() {
                        input.value = this.innerHTML;

                        //select community
                        let options = Object.values(document.getElementsByName("post_to")[0].options);
                        options = options.map(function(option) {
                            return option.innerHTML;
                        });
                        for (let index in options) {
                            if (options[index] === this.innerHTML) {
                                communitySelect.selectedIndex = index;
                                communitySelect.dispatchEvent(new Event('input', {bubbles: true}));
                            }
                        }

                        clearCommunityList();
                    });
                    list.appendChild(listItem);
                }
            });
            input.addEventListener("focus", function() {
                this.dispatchEvent(new Event('input', {bubbles: true}));
                this.select();
            });
            input.addEventListener("blur", function() {window.setTimeout(clearCommunityList, 100)});
        }

        communitySelect.addEventListener("input", function() {
            let info = document.getElementById("tasselTaggingToolsReblogInfo");
            if (!info) {
                info = document.createElement("div");
                info.id = "tasselTaggingToolsReblogInfo";
                document.getElementById("reblog-modal").getElementsByClassName("header-top")[0].appendChild(info);
            }
            let reblog = tasselJsonManager.reblogs.json.find(function(comm) {return comm.community == communitySelect.selectedOptions[0].textContent});
            if (!reblog) info.style.display = "none";
            else {
                let time = formatDate_dshcgkhy(new Date(reblog.publish_at), timeFormatActive ? timeFormat : "RRR ago");
                info.style.display = "block";
                info.innerHTML = `Already reblogged to <b>${communitySelect.selectedOptions[0].textContent}</b> at ${time}`;
            }
        });
    }

    function clearCommunityList() {
        let input = document.getElementById("tasselTaggingToolsCommunitySearch");
        let listItems = Object.values(document.getElementsByClassName("tasselTaggingToolsListItem"));
        for (let item of listItems) {
            item.parentNode.removeChild(item);
        }
        let communitySelect = document.getElementsByName("post_to");
        if (communitySelect.length > 0) communitySelect = communitySelect[0];
        else return;
        if (input.value.length > 0 && input.value !== communitySelect.selectedOptions[0].innerHTML) {
            input.classList.add("bad");
            document.getElementById("publish-btn").disabled = true;
            document.getElementById("queue-btn").disabled = true;
            document.getElementById("schedule-btn").disabled = true;
        } else {
            input.classList.remove("bad");
            document.getElementById("publish-btn").removeAttribute("disabled");
            document.getElementById("queue-btn").removeAttribute("disabled");
            document.getElementById("schedule-btn").removeAttribute("disabled");
        }
    }

    /* Load and display the community rules */
    function loadCommunityRules_dshcgkhy() {
        let select = document.getElementById("post_to") || document.getElementById("reblog-modal").getElementsByTagName("select")[0];
        if (select.value === "current_user") return;
        let communityName = select.selectedOptions[0].textContent;

        $.get(`https://www.pillowfort.social/community/${communityName}`, function(data) {
            let body = data.substring(data.indexOf("<!-- rules  info modal"));
            body = body.substring(body.indexOf(">")+1);
            body = body.substring(0, body.indexOf("<!-- flag modal -->"));
            let exists = document.getElementById("tasselTaggingToolsRulesModal") ? true : false;
            let dialog = document.getElementById("tasselTaggingToolsRulesModal") || document.createElement("dialog");
            dialog.id = "tasselTaggingToolsRulesModal";
            dialog.innerHTML = body;
            dialog.getElementsByTagName("button")[0].addEventListener("click", function() {
                document.getElementById("tasselTaggingToolsRulesModal").close();
                if (document.getElementById("reblog-modal").classList.contains("in")) return;
                document.body.classList.remove("modal-open");
            });
            dialog.children[0].style.display = "block";
            dialog.children[0].classList.add("in");
            if (!exists) document.body.appendChild(dialog);
            dialog.showModal();
            document.body.classList.add("modal-open");
        });
    }

    /* Load the list of pinned tags */
    function loadCommunityTags_dshcgkhy() {
        let communitySelect = document.getElementsByName("post_to");
        if (communitySelect.length > 0) communitySelect = communitySelect[0];
        else return;
        communitySelect.addEventListener("input", function() {
            //clear previous community tags
            tags = tags.map(function(item) {
                if (item.type === "community") item.type = undefined;
                return item;
            });

            //find community
            if (communitySelect.value === "current_user") return;
            let communityName = communitySelect.selectedOptions[0].textContent;
            let community = tasselJsonManager.communities.communities.find(function(item) {
                return item.name === communityName;
            });
            if (community === undefined) return;
            if (community.pinned_tags === null) return;

            //add tags
            community.pinned_tags.split(",").forEach(function(tag) {
                let existing = tags.find(function(item) {
                    return item.tag.toLowerCase() === tag.toLowerCase();
                });
                if (existing !== undefined) {
                    existing.type = "community";
                } else {
                    tags.push({tag:tag,count:1,type:"community"});
                }
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
            tags = tags.map(function(tag) {
                return tag.trim();
            });
            tags.forEach(function(tag) {
                let index = -1;
                let entry = fileTags.find(function(item, index_) {
                    if (item.tag.toLowerCase() === tag.toLowerCase()) {
                        index = index_;
                        return true;
                    }
                });
                if (index > -1) {//update tag
                    fileTags[index].count++;
                    if (fileTags[index].related === undefined) fileTags[index].related = [];
                    fileTags[index].related.push(...tags);
                    fileTags[index].related = [...new Set(fileTags[index].related)].filter(function(item) {
                        return item.toLowerCase() !== fileTags[index].tag.toLowerCase() && item.length > 0;
                    });
                } else {//add new tag
                    fileTags.push({tag: tag, count: 1, related: tags});
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
            if (localStorage.getItem("tasselTaggingTools") === 'null') {
                if (confirm("Tassel Tagging Tools detected a problem. Do you want to clear all stored tags to try and resolve this issue?")) localStorage.removeItem("tasselTaggingTools");
            }
        });
    }

    /* Add the events to the tag input field to suggest new tags when typing */
    function addEventListenerInput_dshcgkhy() {
        if (tagInput) {
            tagInput.addEventListener("click", function() {
                suggest_dshcgkhy(tagInput, document.getElementById("tasselTaggingToolsSuggestionBox"));
            });
            tagInput.addEventListener("keyup", function() {
                suggest_dshcgkhy(tagInput, document.getElementById("tasselTaggingToolsSuggestionBox"));
            });
        }
        if (tagInputEdit) {
            tagInputEdit.addEventListener("click", function() {
                suggest_dshcgkhy(tagInputEdit, document.getElementById("tasselTaggingToolsSuggestionBoxEdit"));
            });
            tagInputEdit.addEventListener("keyup", function() {
                suggest_dshcgkhy(tagInputEdit, document.getElementById("tasselTaggingToolsSuggestionBoxEdit"));
            });
        }
    }

    /* Create the page element that holds tag suggestions */
    function creatSuggestionBox_dshcgkhy() {
        if (tagInput) {
            let box = document.createElement("div");
            box.id = "tasselTaggingToolsSuggestionBox";
            box.classList.add("tasselTaggingToolsSuggestionList");
            if (settings.secondRow) box.classList.add("tasselTaggingToolsTaller");
            tagInput.before(box);

            let tags = tagInput.value.trim();
            if (tags.length > 0 && tags[tags.length-1] != ",") {
                tagInput.value += ",";
            }

            suggest_dshcgkhy(tagInput, box);
        }
        if (tagInputEdit) {
            let box = document.createElement("div");
            box.id = "tasselTaggingToolsSuggestionBoxEdit";
            box.classList.add("tasselTaggingToolsSuggestionList");
            if (settings.secondRow) box.classList.add("tasselTaggingToolsTaller");
            tagInputEdit.before(box);

            let tags = tagInputEdit.value.trim();
            if (tags.length > 0 && tags[tags.length-1] != ",") {
                tagInputEdit.value += ",";
            }

            suggest_dshcgkhy(tagInputEdit, box);
        }
    }

    /* Suggest new tags based on the current input */
    function suggest_dshcgkhy(inputBox, outputBox) {
        //cut input down to one tag at the current cursor position
        cursorPos = inputBox.selectionStart;
        let edges = findEdges_dshcgkhy(inputBox, cursorPos);
        let typing = inputBox.value.substring(edges.start, edges.end).toLowerCase().trim();

        //find fitting tags
        let matches = [];
        tags.forEach(function(item) {
            //check if input is part of a saved tag
            let searchIndex = item.tag.toLowerCase().search(typing);
            if (searchIndex > -1) matches.push({
                tag: item.tag,
                count: item.count,
                rank: item.count * (item.tag.length / (searchIndex+1)) * (item.type ? 2 : 1),
                index: searchIndex,
                type: item.type || ""
            });
        });

        //remove tags that are already in use
        let used = inputBox.value.split(",");
        used = used.map(function(item) {
            return item.trim();
        });
        matches = matches.filter(function(item) {
            let exists = false;
            used.forEach(function(tag) {
                if (tag.toLowerCase() === item.tag.toLowerCase()) exists = true;
            });
            return !exists;
        });

        //increase rank for related tags
        used.forEach(function(inUse) {
            let databaseEntry = tags.find(function(tag) {
                return tag.tag.toLowerCase() === inUse.toLowerCase();
            });
            if (databaseEntry === undefined) return;
            if (databaseEntry.related === undefined) return;
            databaseEntry.related.forEach(function(related) {
                let relative = matches.find(function(match) {
                    return match.tag.toLowerCase() === related.toLowerCase();
                });
                if (relative === undefined) return;
                relative.rank *= 2;
                relative.type = "related";
            });
        });

        //sort by ranking, as previously calculated
        matches.sort(function(a, b) {
            return b.rank - a.rank;
        });

        //display suggestions
        outputBox.innerHTML = "";
        addCopyButton_dshcgkhy();
        for (let a = 0; a < 20 && a < matches.length; a++) {
            let item = matches[a];
            let button = document.createElement("button");
            button.setAttribute("value", item.tag);
            button.innerHTML = item.tag.substring(0, item.index) + "<u>" + item.tag.substring(item.index, item.index + typing.length) + "</u>" + item.tag.substring(item.index + typing.length);
            if (debug) button.innerHTML += " <sub>" + item.rank.toFixed(1) + "</sub>";
            if (item.type === "community") {
                button.innerHTML += `<img title='community tag' alt='community' class='tasselTaggingToolsIconCommunity' src='https://www.pillowfort.social/assets/global/ic_community-ed0fa753d9cfc2c9fb0d7c1440558a8c6d367564b4f746457fbd76bb662c403d.svg'/>`;
            } else if (item.type === "original") {
                button.innerHTML += `<svg title='original tag' alt='original' class='tasselTaggingToolsIconOriginal' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 20">
                    <circle cx="8" cy="5" fill="none" stroke-width="1.4px" r="4" stroke="#58b6dd"/>
                    <path xmlns="http://www.w3.org/2000/svg" d="M8 9Q15 9 15 15V19H1V15Q1 9 8 9" fill="none" stroke="#58b6dd" style="stroke-width:1.4px"/>
                </svg>`;
            } else if (item.type === "related") {
                button.innerHTML += `<img title='related tag' alt='related' class='tasselTaggingToolsIconRelated' src='https://www.pillowfort.social/assets/global/link-7b6a90ae0077e5d84d5114d7f2a2f7b1fbd011111825602106d982d07cdddc56.svg'/>`;
            }
            button.addEventListener("click", function(event) {
                event.preventDefault();
                insertTag_dshcgkhy(this, inputBox, outputBox);
            });
            outputBox.appendChild(button);
        }
    }

    /* Adds a suggested tag into the input field at the cursor position */
    function insertTag_dshcgkhy(tag, inputBox, outputBox) {
        //insert tag
        let edges = findEdges_dshcgkhy(inputBox, cursorPos);
        inputBox.value = inputBox.value.substring(0, edges.start) + " " + tag.getAttribute("value") + inputBox.value.substring(edges.end);
        //add a comma if necessary
        let input = inputBox.value.trim();
        input = input[input.length-1];
        if (input !== undefined && input !== ",") inputBox.value += ", ";
        //return to normal
        inputBox.focus();
        let newPos = edges.start + tag.getAttribute("value").length + 2;
        inputBox.setSelectionRange(newPos, newPos);
        suggest_dshcgkhy(inputBox, outputBox);
    }

    /* Display a button to copy the tags of the original post into the input field */
    function addCopyButton_dshcgkhy() {
        let suggestionOutput = document.getElementById("tasselTaggingToolsSuggestionBox");
        let button = document.createElement("button");
        button.id = "tasselTaggingToolsCopyTags";
        button.title = "copy tags";
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <title>copy tags</title>
                <path xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke-width:1.5px;" d="
                    M 12 5 L 12 19
                    M 8 14 L 12 19 L 16 14
                ">
                </path>
            </svg>
        `;

        //copy tags
        button.addEventListener("click", function(event) {
            event.preventDefault();
            //get the original tags, stop if there are none
            let tags = getOriginalTags_dshcgkhy();
            if (!tags) return;

            //filter out tags that are already in the input field to prevent duplicates
            let used = tagInput.value.split(",");
            used = used.map(function(item) {
                return item.trim();
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
                let input = tagInput.value.trim();
                input = input[input.length-1];
                if (input !== undefined && input !== ",") tagInput.value += ", ";
                let edges = findEdges_dshcgkhy(tagInput, tagInput.value.length);
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
    function findEdges_dshcgkhy(inputBox, pos) {
        let start, end;
        for (start = pos; start > 0; start--) if (inputBox.value[start - 1] === ",") break;
        for (end = pos; end <= inputBox.value.length; end++) if (inputBox.value[end] === ",") break;
        return {start: start, end: end};
    }

    /* Add elements to the Tassel menu */
    function initTassel_dshcgkhy() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarTaggingTools";
        button.style.order = "2020";
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
        content.appendChild(createSwitch_dshcgkhy("Show a second row of suggested tags", settings.secondRow ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.secondRow = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.taggingTools = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
        content.appendChild(createSwitch_dshcgkhy("Move the community selection to the bottom of the reblog modal", settings.reblogBottomHeader ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.reblogBottomHeader = this.checked;
            let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
            file.taggingTools = settings;
            localStorage.setItem("tasselSettings2", JSON.stringify(file));
        });
        content.appendChild(createSwitch_dshcgkhy("Replace the community list dropdown with a text input", settings.useCommunitySearch ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.useCommunitySearch = this.checked;
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
        settings.tagPreset.textPost = document.getElementById("tasselTaggingToolsTagText").value.trim();
        settings.tagPreset.photoPost = document.getElementById("tasselTaggingToolsTagPhoto").value.trim();
        settings.tagPreset.videoPost = document.getElementById("tasselTaggingToolsTagVideo").value.trim();
        settings.tagPreset.linkPost = document.getElementById("tasselTaggingToolsTagLink").value.trim();
        settings.tagPreset.selfReblog = document.getElementById("tasselTaggingToolsTagSelfReblog").value.trim();
        settings.tagPreset.otherReblog = document.getElementById("tasselTaggingToolsTagOtherReblog").value.trim();

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

    /* Format date to the desired form */
    function formatDate_dshcgkhy(time, format) {
        let data = {
            mask: format,
            output: format
        }
        let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let hours = time.getHours();
        if (data.mask.indexOf("HH") >= 0) data = replaceKey_dshcgkhy(data, "HH", (hours < 10 ? "0" : "") + hours);
        if (data.mask.indexOf("H") >= 0) data = replaceKey_dshcgkhy(data, "H", hours);
        let ap = hours < 12 ? "AM" : "PM";
        hours += hours > 12 ? -12 : 0;
        hours = hours <= 0 ? 12 : hours;
        if (data.mask.indexOf("hh") >= 0) data = replaceKey_dshcgkhy(data, "hh", (hours < 10 ? "0" : "") + hours);
        if (data.mask.indexOf("h") >= 0) data = replaceKey_dshcgkhy(data, "h", hours);

        let minutes = time.getMinutes();
        if (data.mask.indexOf("mm") >= 0) data = replaceKey_dshcgkhy(data, "mm", (minutes < 10 ? "0" : "") + minutes);
        if (data.mask.indexOf("m") >= 0) data = replaceKey_dshcgkhy(data, "m", minutes);

        let seconds = time.getSeconds();
        if (data.mask.indexOf("SS") >= 0) data = replaceKey_dshcgkhy(data, "SS", (seconds < 10 ? "0" : "") + seconds);
        if (data.mask.indexOf("S") >= 0) data = replaceKey_dshcgkhy(data, "S", seconds);

        if (data.mask.indexOf("RRR") >= 0) data = replaceKey_dshcgkhy(data, "RRR", getRelativeTime_dshcgkhy(time, false));
        if (data.mask.indexOf("RR") >= 0) data = replaceKey_dshcgkhy(data, "RR", getRelativeTime_dshcgkhy(time, true));

        if (data.mask.indexOf("ap") >= 0) data = replaceKey_dshcgkhy(data, "ap", ap);

        if (data.mask.indexOf("DDDD") >= 0) data = replaceKey_dshcgkhy(data, "DDDD", weekdays[time.getDay()]);
        if (data.mask.indexOf("DDD") >= 0) data = replaceKey_dshcgkhy(data, "DDD", weekdays[time.getDay()].substring(0, 3));
        let day = time.getDate();
        if (data.mask.indexOf("DD") >= 0) data = replaceKey_dshcgkhy(data, "DD", (day < 10 ? "0" : "") + day);
        if (data.mask.indexOf("D") >= 0) data = replaceKey_dshcgkhy(data, "D", day);

        if (data.mask.indexOf("MMMM") >= 0) data = replaceKey_dshcgkhy(data, "MMMM", months[time.getMonth()]);
        if (data.mask.indexOf("MMM") >= 0) data = replaceKey_dshcgkhy(data, "MMM", months[time.getMonth()].substring(0, 3));
        let month = time.getMonth() + 1;
        if (data.mask.indexOf("MM") >= 0) data = replaceKey_dshcgkhy(data, "MM", (month < 10 ? "0" : "") + month);
        if (data.mask.indexOf("M") >= 0) data = replaceKey_dshcgkhy(data, "M", month);

        let year = time.getFullYear();
        if (data.mask.indexOf("YYYY") >= 0) data = replaceKey_dshcgkhy(data, "YYYY", year);
        if (data.mask.indexOf("YY") >= 0) data = replaceKey_dshcgkhy(data, "YY", String(year).substring(2));

        return data.output;
    }

    /* Replace sections of text */
    //input: object of data mask and data to be changed
    //key: what to remove from the text
    //value: what to put in the text
    function replaceKey_dshcgkhy(data, key, value) {
        let valueMask = "_______________________________________".substring(0, String(value).length);
        while (data.mask.indexOf(key) >= 0) {
            data.output = data.output.substring(0, data.mask.indexOf(key)) + value + data.output.substring(data.mask.indexOf(key) + key.length);
            data.mask = data.mask.substring(0, data.mask.indexOf(key)) + valueMask + data.mask.substring(data.mask.indexOf(key) + key.length);
        }
        return data;
    }

    /* Create relative timestamp */
    function getRelativeTime_dshcgkhy(date, short) {
        let units = [
            ["s", "second", "seconds"],
            ["min", "minute", "minutes"],
            ["h", "hour", "hours"],
            ["d", "day", "days"],
            ["m", "month", "months"],
            ["y", "year", "years"]
        ];
        let times = [
            1000,//1 second
            60_000,//1 minute
            3_600_000,//1 hour
            86_400_000,//1 day
            2_630_880_000,//30.45 days - 1 month
            63_113_904_000//730.485 days - 2 years
        ];
        let delta = new Date().getTime() - date.getTime();
        let rounded = Math.floor(delta / 31_556_952_000); //initialize for "years"
        for (let i = 0; i <= 5; i++) {
            if (delta < times[i+1]) {
                rounded = Math.floor(delta / times[i]);
                return rounded + " " + units[i][short ? 0 : rounded === 1 ? 1 : 2];
            }
        }
        return rounded + " " + units[5][short ? 0 : rounded === 1 ? 1 : 2]; //use "years" if nothing else fits
    }
})();
