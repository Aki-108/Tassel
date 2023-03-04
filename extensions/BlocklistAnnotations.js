// ==UserScript==
// @name         Blocklist Annotations
// @version      1.1
// @description  Write down why you blocked someone.
// @author       aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (window.location.pathname !== "/block_list") return;

    // list of annotations
    let annotations = (JSON.parse(localStorage.getItem("tasselBlocklistAnnotations")) || {"annotations": []}).annotations;

    // create input fields
    let rows = document.getElementsByClassName("block-row");
    for (let el of rows) {
        el.setAttribute('style', 'display:grid; grid-template-columns:auto 200px 90px;grid-column-gap:10px;');

        let input = document.createElement("textarea");
        input.setAttribute("rows", 1);
        input.placeholder = "Annotation";
        input.addEventListener("blur", function() {
            let data = {};
            data.user = this.parentNode.children[0].children[1].innerHTML;
            data.note = this.value;
            for (let index in annotations) {
                let item = annotations[index];
                if (item.user !== data.user) continue;
                annotations.splice(index, 1);
            }
            if (this.value !== "") {
                annotations.push(data);
                localStorage.setItem("tasselBlocklistAnnotations", JSON.stringify({"annotations": annotations}));
            }
        });
        el.insertBefore(input, el.getElementsByClassName("unblock-btn-container")[0]);
    }

    // display loaded annotations
    let names = document.getElementsByClassName("d-inline-block");
    for (let el of names) {
        el.setAttribute('style', 'display:grid !important; grid-template-columns:40px auto 10px 210px;line-height:1em;');

        let user = el.children[1];
        if (user === undefined) continue;
        user.style.overflow = "hidden";
        user.style.textOverflow = "ellipsis";

        let input = user.parentNode.parentNode.getElementsByTagName("textarea")[0];
        let annotation = annotations.find(function(item){
            return item.user === user.innerHTML;
        });
        if (annotation) input.value = annotation.note;
    }
})();
