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

    pages.forEach(function(pageData, index) {
        totalPosts += pageData.posts.length;
    });
    document.getElementsByClassName("sidebar-footer")[0].children[0].innerHTML = totalPosts;
    document.getElementsByTagName("main")[0].innerHTML = "";
    document.getElementsByTagName("footer")[0].innerHTML = "";
    
    let queryString = new URLSearchParams(window.location.search.substring(1));
    for (let pair of queryString.entries()) {
        if (pair[0] === "p") page = pair[1] * 1;
        if (pair[0] === "post") post = pair[1] * 1;
    }
    if (post) displayComments(post);
    else if (page) displayFeed();
    //TODO display post
    //TODO display tags
}

function displayFeed() {
    if (!pages[page]) return;
    
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
    
    let main = document.getElementsByTagName("main")[0];
    pages[page].posts.forEach(function(post) {
        main.appendChild(displayPost(post));
    });
}

function displayComments(postId) {
  let postData = undefined;
  pages.forEach(function(page) {
    if (postData) return;
    let find = page.posts.find(function(post) {
      return post.id == postId;
    });
    if (find) postData = find;
  });
  
  let main = document.getElementsByTagName("main")[0];
  main.appendChild(displayPost(postData, true));
  
  let comments = document.createElement("div");
  comments.id = "tabs-and-content";
  comments.innerHTML = `
    <div id="post-comments-section" class="tab-content margin-auto">
      <div id="comments" class="tab-pane active">
        <div class="comments-container">
        </div>
      </div>
    </div>
  `;
  main.appendChild(comments);
  
  
}

function displayPost(post, fully) {
    let body = document.createElement("div");
    body.classList.add("post-container");

    let avatar = document.createElement("div");
    avatar.classList.add("side-info");
    avatar.innerHTML = `
      <div class="avatar">
        <img loading="lazy" src="${post.original_post_id ? post.avatar_url : formatImageSource(post.avatar_url)}">
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
        ${post.original_post_id ? `<div class="citation"><span>Reblogged from <a href="">${post.original_username}</a>:</span></div>` : ``}
			</div>
    `;
    body.appendChild(header);
    
    header.appendChild(postBody(post, fully));
    
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

    let nav = document.createElement("div");
    nav.classList.add("post-nav");
    nav.innerHTML = `
      <div class="post-nav-left">
        <a class="nav-tab pointer-cursor" href="?post=${post.id}">
          <img src="${formatImageSource("comment.svg")}">
          <div class="tag-text">
            ${post.comments_count}
          </div>
        </a>
        <span>
          <div class="nav-tab pointer-cursor">
            <img src="${formatImageSource("reblog.svg")}">
            <div class="tag-text">
              ${post.reblogs_count}
            </div>
          </div>
        </span>
        <span>
          <span>
            <div class="nav-tab like-button">
              <img class="svg-blue" style="width:22px" src="${formatImageSource("like.svg")}">
              <div class="tag-text">
                ${post.likes_count}
              </div>
            </div>
          </span>
        </span>
      </div>
    `;
    if (!post.original_post_id) header.appendChild(nav);
    return body;
}

function postBody(post, fully) {
  let body = document.createElement("div");
  body.classList.add("post-content");
  
  let title = document.createElement("div");
  title.innerHTML = `
    <div class="title font-nunito-bold">${post.title}</div>
  `;
  if (post.title != null && post.title != "") body.appendChild(title);
  
  if (post.post_type === "picture") body.appendChild(postBodyPicture(post, fully));
  if (post.post_type === "text") body.appendChild(postBodyText(post, fully));
  if (post.post_type === "video") body.appendChild(postBodyVideo(post, fully));
  if (post.post_type === "embed") body.appendChild(postBodyEmbed(post, fully));
  
  return body;
}

function postBodyPicture(post, fully) {
  let body = document.createElement("div");
  let media = document.createElement("div");
  media.classList.add("media");
  body.appendChild(media);
  post.media.forEach(function(picture, index) {
    let width = "full";
    if (post.media[index + 1] && post.media[index + 1].row === 1 || picture.col === 2) width = "half";
    let container = document.createElement("div");
    container.classList.add("pic-container", width, "d-flex", "justify-content-center", "inline-block");
    if (picture.col === 2) container.classList.add("second-col");
    if (picture.row === post.pic_row_last) container.classList.add("pic-row-last");
    container.innerHTML = `
      <img class="${width}" src="${formatImageSource(picture.url)}">
    `;
    media.appendChild(container);
  });
  body.appendChild(postBodyText(post, fully));
  return body;
}

function postBodyText(post, fully) {
  let body = document.createElement("div");
  if (!post.content) return body;
  body.classList.add("content");

  let content = post.content;
  content = formatReadMores(content, post.id, fully);
  content = formatTextImage(content);
  body.innerHTML = `
    <div>
      ${content}
    </div>
	`;
  if (!post.last_edited_at) return body;
  
  let edited = document.createElement("div");
  edited.classList.add("last-edited-note");
  edited.innerHTML = `<span>Last edited ${post.last_edited_at}.</span>`;
  body.appendChild(edited);
  return body;
}

function postBodyVideo(post, fully) {
  let body = document.createElement("div");
  if (!post.media || !post.media[0]) return body;
  let url = `https://www.youtube.com/embed/${post.media[0].url}`;
  body.innerHTML = `
    <div class="media">
      <div class="flex-video">
        <iframe width="640" height="360" frameborder="0" allowfullscreen src="${url}"></iframe>
      </div>
    </div>
  `;
  body.appendChild(postBodyText(post, fully));
  return body;
}

function postBodyEmbed(post, fully) {
  let body = document.createElement("div");
  if (!post.media || !post.media[0]) return body;
  body.innerHTML = `
    <div class="media margin-auto">
      <div>${post.media[0].embed_code}</div>
    </div>
  `;
  body.appendChild(postBodyText(post, fully));
  return body;
}

function formatReadMores(input, postId, fully) {
  let output = "";
  while (input.search(`\\[READ-MORE]`) >= 0) {
    output += input.substring(0, input.search(`\\[READ-MORE]`));
    if (fully) {
      input = input.substring(input.search(`\\[READ-MORE]`)+11);
      output += input.substring(0, input.search(`\\[/READ-MORE]`));
    } else {
      output += `<span>(<a href="?post=${postId}">Read More...</a>)</span>`;
      input = input.substring(input.search(`\\[READ-MORE]`)+11);
    }
    input = input.substring(input.search(`\\[/READ-MORE]`)+12);
  }
  output += input;
  return output;
}

function formatTextImage(input) {
  let output = "";
  while (input.search(`<img`) >= 0) {
    output += input.substring(0, input.search(`<img`)+4);
    input = input.substring(input.search(`<img`)+4);

    output += input.substring(0, input.search(`src="`)+5);
    input = input.substring(input.search(`src="`)+5);

    let url = input.substring(0, input.search(`"`));
    output += formatImageSource(url);
    input = input.substring(url.length);
  }
  output += input;
  return output;
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
