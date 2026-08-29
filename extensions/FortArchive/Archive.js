let page = pages.findIndex(function(item) {
    return item
});
let post = null;
let totalPosts = 0;
let minPage = pages.findIndex(function(item) {
    return item
});
let maxPage = pages.findLastIndex(function(item) {
    return item
});
let imageSuffix = "_" + document.getElementsByTagName("img")[0].src.split("_")[2].split(".")[0];

init();

function init() {
    if (window.self !== window.top) return;
    let queryString = new URLSearchParams(window.location.search.substring(1));
    for (let pair of queryString.entries()) {
        if (pair[0] === "p") page = pair[1] * 1;
        if (pair[0] === "post") post = pair[1] * 1;
    }
    let html = `
    <dir-pagination-controls>
      <ul class="pagination">
        <li class=${page == 1 ? "disabled" : ""}>
          <a href="?p=${Math.max(page-1,minPage)}">‹</a>
        </li>
  `;
    for (let i = Math.max(minPage, page - 4); i <= Math.min(maxPage, page + 4); i++) {
        html += `
      <li class=${page == i ? "active" : ""}>
        <a href="?p=${i}">${i}</a>
      </li>
    `;
    }
    html += `
        <li>
          <a href="?p=${Math.min(page+1,maxPage)}">›</a>
        </li>
      </ul>
	  <div id="pageJump">
	      <input id="pageJumpPage" placeholder="1">
		  <button id="pageJumpGo">&#8631;</button>
	  </div>
    </dir-pagination-controls>
  `;
    let footer = document.getElementsByTagName("footer")[0].innerHTML = html;
    document.getElementById("pageJumpGo").addEventListener("click", function() {
        let input = document.getElementById("pageJumpPage").value;
        if (input >= minPage && input <= maxPage) window.location.href = `?p=${input}`;
    });

    pages.forEach(function(pageData, index) {
        totalPosts += pageData.posts.length;
    });
    document.getElementsByClassName("sidebar-footer")[0].children[0].innerHTML = totalPosts;
    let main = document.getElementsByTagName("main")[0];
    main.innerHTML = "";
    displayFeed();
}

function displayFeed() {
    if (!pages[page]) return;
    let main = document.getElementsByTagName("main")[0];
    pages[page].posts.forEach(function(post) {
        main.appendChild(displayPost(post));
    });
}

function displayPost(post) {
    let body = document.createElement("div");
    body.classList.add("post-container");

    let avatar = document.createElement("div");
    avatar.classList.add("side-info");
    avatar.innerHTML = `
      <div class="avatar">
				<img loading="lazy" src="${formatImageSource(post.avatar_url)}">
			</div>
    `;
    body.appendChild(avatar);

    let header = document.createElement("div");
    header.classList.add("post", "main");
    header.innerHTML = `
      <div class="header">
				<div class="post-perma-link">
					<div class="post-right">
						<div class="timestamp2">
							${formatDate(post.publish_at)}
						</div>
						<div class="post-header-icons">
              ${post.privacy === "users" ? `<span class="priv-icon" title="This post is only visible to logged in users"><img class="priv-svg svg-pink-light" src="${formatImageSource("user-badge.svg")}"></span>` : ``}
              ${post.mine === false && post.community_id === null && post.user_concealed ? `<span class="priv-icon" title="This post is only visible to certain users"><img class="priv-svg svg-pink-light" src="${formatImageSource("lock.svg")}"></span>` : ``}
              ${post.community_id === null && post.mine === true && post.user_concealed ? `<span class="priv-icon" title="This post is only visible to users you are following because you are in Concealed Mode."><img class="priv-svg svg-pink-light" src="${formatImageSource("lock.svg")}"></span>` : ``}
              ${post.mine === true && post.privacy === 'followers' ? `<span class="priv-icon" title="This post is only visible to your followers"><img class="priv-svg svg-pink-light" src="${formatImageSource("lock.svg")}"></span>` : ``}
              ${post.mine === true && post.privacy === 'mutuals' ? `<span class="priv-icon" title="This post is only visible to your mutual followers"><img class="priv-svg svg-pink-light" src="${formatImageSource("lock.svg")}"></span>` : ``}
              ${post.privacy === "members-only" ? `<span class="priv-icon" title="This post is only visible to members of this community"><img class="priv-svg svg-pink-light" src="${formatImageSource("lock.svg")}"></span>` : ``}
              ${post.mine === true && post.privacy === 'private' ? `<span class="priv-icon" title="This post is only visible to you"><img class="priv-svg svg-pink-light" src="${formatImageSource("lock.svg")}"></span>` : ``}
              ${post.nsfw === true ? `<span class="priv-icon" title="This post has been marked as NSFW"><img class="nsfw-svg svg-pink-light" src="${formatImageSource("nsfw.svg")}"></span>` : ``}
							<span>
								<a target="_blank" title="link to post" class="link_post svg-blue" href="https://www.pillowfort.social/posts/${post.id}">
									<img src="${formatImageSource("link.svg")}">
								</a>
							</span>
						</div>
					</div>
				</div>
        ${post.original_post ? `<div class="citation"><span>Reblogged from <a href="">${post.original_username}</a>:</span></div>` : ``}
			</div>
    `;
    body.appendChild(header);
    
    //TODO post body
    
    let tags = document.createElement("div");
    tags.classList.add("tags-container");
    tags.innerHTML = `
      <div class="tags">
				<span class="tag-title">
					TAGS
				</span>
			</div>
    `;
    header.appendChild(tags);
    post.tags.forEach(function(tag, index) {
      let span = document.createElement("span");
      span.innerHTML = `<a class="tag-item" href="?tag=${tag}">${tag}</a>`;
      if (index < post.tags.length - 1) span.innerHTML += `<span>, </span>`;
      tags.children[0].appendChild(span);
    });
    /*body.innerHTML += `
		<div class="tags-container">
			<div class="tags">
				<span class="tag-title">
					TAGS
				</span>
				<span>
					<a class="tag-item" href="${tag_link}">
						${tag}
					</a>
					<span>, </span>
				</span>
			</div>
		</div>
	</div>
	<div class="post-nav">
        <div class="post-nav-left>
			<a class="nav-tab pointer-cursor">
				<img src="${comment_icon}">
				<div class="tag-text">
					${comment_count}
				</div>
			</a>
			<span>
				<a class="nav-tab pointer-cursor">
					<img src="${reblog_icon}">
					<div class="tag-text">
						${reblog_count}
					</div>
				</a>
			</span>
			<span>
				<span>
					<a class="nav-tab like-button">
						<img class="svg-blue" style="width:22px" src="${unliked_icon}">
						<div class="tag-text">
							${like_count}
						</div>
					</a>
				</span>
			</span>
		</div>
	</div>
	`;*/
    return body;
}

function textpostBody() {
    let body = `
		<div class="post-content">
			<div>
				<div class="title font-nunito-bold">
					${title}
				</div>
			</div>
			<div class="content">
				<div>
					${post_body}
				</div>
			</div>
		</div>
	`;
}

function formatImageSource(name) {
    let folder = document.location.pathname.substring(0, document.location.pathname.length - 4) + "_files/";
    let fileName = name.split(".");
    return folder + fileName[0] + imageSuffix + "." + fileName[1];
}

function formatDate(d) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let date = new Date(d);
    let string = "";
    string += date.getDate();
    string += " ";
    string += months[date.getMonth()];
    string += " ";
    string += date.getFullYear();
    string += ", ";
    string += date.getHours() < 10 ? "0" : "";
    string += date.getHours();
    string += ":";
    string += date.getMinutes() < 10 ? "0" : "";
    string += date.getMinutes();
    return string;
}
