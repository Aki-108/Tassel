let tasselJsonManager = {
    modal: {
        ready: false,
        postId: null,
        json: {}
    },
    post: {
        ready: false,
        postId: null,
        json: {}
    },
    comments: {
        ready: false,
        postId: null,
        page: null,
        comments: []
    },
    reblogs: {
        ready: false,
        postId: null,
        page: null,
        json: {}
    },
    likes: {
        ready: false,
        postId: null,
        page: null,
        json: {}
    },
    feed: {
        ready: false,
        pages: 0,
        time: null,
        posts: []
    }
}

initModal_quugasdg();
function initModal_quugasdg() {
    let postModal = document.getElementById("post-view-modal")
    if (!postModal) return;
    let postModalLink = document.getElementById("post-view-modal").getElementsByClassName("link_post")[0];

    let modalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.attributeName === "href") {
                let postId = mutationRecord.target.href;
                postId = postId.substring(postId.search("/posts/")+7);
                tasselJsonManager.modal.postId = postId;
                $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
                    tasselJsonManager.modal.json = data;
                    tasselJsonManager.modal.ready = true;
                    trigger_quugasdg("tasselJsonManagerModalReady");
                });
                getCommentData_quugasdg(postId);
            } else if (mutationRecord.attributeName === "style") {
                if (mutationRecord.target.style.display === "none") {
                    tasselJsonManager.modal.ready = false;
                    tasselJsonManager.comments.ready = false;
                }
            }
        });
    });

    modalObserver.observe(postModalLink, {
        attributes: true,
        attributeFilter: ["href"]
    });
    modalObserver.observe(postModal, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

initSinglePost_quugasdg();
function initSinglePost_quugasdg() {
    if (document.getElementById("post-view-modal")) return;
    if (document.getElementsByTagName("dir-pagination-controls").length === 0) return;
    let postId = document.URL.split("/");
    if (postId.length < 5) return;
    postId = postId[4].split("?")[0];
    tasselJsonManager.post.postId = postId;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/json`, function(data) {
        tasselJsonManager.post.json = data;
        tasselJsonManager.post.ready = true;
        trigger_quugasdg("tasselJsonManagerPostReady");
    });

    if (document.getElementsByTagName("dir-pagination-controls").length < 1) return;

    let commentPageButtons = document.getElementsByTagName("dir-pagination-controls")[0];
    commentPageButtons.addEventListener("click", function () {getCommentData_quugasdg(postId)});
    getCommentData_quugasdg(postId);

    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    reblogPageButtons.addEventListener("click", function () {getReblogData_quugasdg(postId)});
    getReblogData_quugasdg(postId);

    let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
    likePageButtons.addEventListener("click", function () {getLikeData_quugasdg(postId)});
    getLikeData_quugasdg(postId);
}

function getCommentData_quugasdg(postId) {
    tasselJsonManager.comments.ready = false;
    tasselJsonManager.comments.postId = postId;
    let page = 1;
    let commentPageButtons = document.getElementsByTagName("dir-pagination-controls")[0];
    if (commentPageButtons.getElementsByClassName("active").length > 0) page = commentPageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.comments.page = page;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/comments?pageNum=${page}`, function(data) {
        tasselJsonManager.comments.comments = unpackComments_quugasdg(data.comments);
        tasselJsonManager.comments.ready = true;
        trigger_quugasdg("tasselJsonManagerCommentReady");
    });
}

function getReblogData_quugasdg(postId) {
    tasselJsonManager.reblogs.ready = false;
    tasselJsonManager.reblogs.postId = postId;
    let page = 1;
    let reblogPageButtons = document.getElementsByTagName("dir-pagination-controls")[1];
    if (reblogPageButtons.getElementsByClassName("active").length > 0) page = reblogPageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.reblogs.page = page;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/reblogs?p=${page}`, function(data) {
        tasselJsonManager.reblogs.json = data.reblog_batch;
        tasselJsonManager.reblogs.ready = true;
        trigger_quugasdg("tasselJsonManagerReblogReady");
    });
}

function getLikeData_quugasdg(postId) {
    tasselJsonManager.likes.ready = false;
    tasselJsonManager.likes.postId = postId;
    let page = 1;
    let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
    if (likePageButtons.getElementsByClassName("active").length > 0) page = likePageButtons.getElementsByClassName("active")[0].textContent;
    tasselJsonManager.likes.page = page;
    $.getJSON(`https://www.pillowfort.social/posts/${postId}/likes?p=${page}`, function(data) {
        tasselJsonManager.likes.json = data.likes_batch;
        tasselJsonManager.likes.ready = true;
        trigger_quugasdg("tasselJsonManagerLikeReady");
    });
}

initHomeFeed_quugasdg()
function initHomeFeed_quugasdg() {
    const loadingIndicator = document.getElementById("home_loading");
    if (!loadingIndicator) return;

    let homeObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                tasselJsonManager.feed.ready = false;
                let time = "";
                if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
                $.getJSON(`https://www.pillowfort.social/home/json${time}`, function(data) {
                    tasselJsonManager.feed.ready = true;
                    tasselJsonManager.feed.pages++;
                    tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
                    tasselJsonManager.feed.posts.push(...data.posts);
                    trigger_quugasdg("tasselJsonManagerFeedReady");
                });
            }
        });
    });
    homeObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

initCommFeed_quugasdg()
function initCommFeed_quugasdg() {
    const loadingIndicator = document.getElementById("comm_large_loading");
    if (!loadingIndicator) return;

    let commObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                tasselJsonManager.feed.ready = false;
                let time = "";
                if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
                let jsonURL = "/posts/json";
                if (document.URL.split("/")[5] === "tagged") jsonURL = `/tagged_json?tag=${document.URL.split("/")[6]}&`;
                $.getJSON(`https://www.pillowfort.social/community/${document.URL.split("/")[4]}${jsonURL}${time}`, function(data) {
                    tasselJsonManager.feed.ready = true;
                    tasselJsonManager.feed.pages++;
                    tasselJsonManager.feed.time = data[data.length-1].created_at;
                    tasselJsonManager.feed.posts.push(...data);
                    trigger_quugasdg("tasselJsonManagerFeedReady");
                });
            }
        });
    });
    commObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

initFortFeed_quugasdg()
function initFortFeed_quugasdg() {
    const loadingIndicator = document.getElementById("blog_loading");
    if (!loadingIndicator) return;

    let fortObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                tasselJsonManager.feed.ready = false;
                let page = 1;
                let pageButton = Object.values(
                    document.getElementsByTagName("li")
                ).find(function(item) {
                    return item.classList.contains("active")
                });
                if (pageButton) page = pageButton.textContent;
                let jsonURL = "/";
                if (document.URL.split("/")[4] === "tagged") jsonURL = `/tagged/${document.URL.split("/")[5]}/`;
                $.getJSON(`https://www.pillowfort.social/${document.URL.split("/")[3]}${jsonURL}json?p=${page}`, function(data) {
                    tasselJsonManager.feed.ready = true;
                    tasselJsonManager.feed.pages = 1;
                    tasselJsonManager.feed.time = data.posts[data.posts.length-1].created_at;
                    tasselJsonManager.feed.posts = data.posts;
                    trigger_quugasdg("tasselJsonManagerFeedReady");
                });
            }
        });
    });
    fortObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

initSearch_quugasdg()
function initSearch_quugasdg() {
    const loadingIndicator = document.getElementById("search_loading");
    if (!loadingIndicator) return;

    let searchObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutationRecord) {
            if (mutationRecord.target.style.display === "none") {
                tasselJsonManager.feed.ready = false;
                let time = "";
                if (tasselJsonManager.feed.time) time = `?last_timestamp=${tasselJsonManager.feed.time}`;
                $.getJSON(`https://www.pillowfort.social/search/posts/${document.URL.split("/")[4]}/json${time}`, function(data) {
                    tasselJsonManager.feed.ready = true;
                    tasselJsonManager.feed.pages++;
                    tasselJsonManager.feed.time = data.posts_by_tag.posts_by_tag[data.posts_by_tag.posts_by_tag.length-1].created_at;
                    tasselJsonManager.feed.posts.push(...data.posts_by_tag.posts_by_tag);
                    trigger_quugasdg("tasselJsonManagerFeedReady");
                });
            }
        });
    });
    searchObserver.observe(loadingIndicator, {
        attributes: true,
        attributeFilter: ["style"]
    });
}

function trigger_quugasdg(name) {
    let trigger = document.getElementById(name);
    if (trigger) trigger.click();
}

function unpackComments_quugasdg(comment) {
    if (comment.length === 0) return [];
    let list = [...comment];
    comment.forEach(function(item) {
        list.push(...unpackComments_quugasdg(item.children))
    });
    return list;
}
