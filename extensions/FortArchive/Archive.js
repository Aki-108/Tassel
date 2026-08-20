let page = pages.findIndex(function(item) {return item});
let post = null;
let totalPosts = 0;

init();
function init() {
  if (window.self !== window.top) return;
  let queryString = new URLSearchParams(window.location.search.substring(1));
  for (let pair of queryString.entries()) {
    if (pair[0] === "p") page = pair[1]*1;
    if (pair[0] === "post") post = pair[1]*1;
  }
  let html = `
    <dir-pagination-controls>
      <ul class="pagination">
        <li class=${page == 1 ? "disabled" : ""}>
          <a href="?p=${Math.max(page-1,1)}">‹</a>
        </li>
  `;
  pages.forEach(function(pageData, index) {
    html += `
      <li class=${page == index ? "active" : ""}>
        <a href="?p=${index}">${index}</a>
      </li>
    `;
    totalPosts += pageData.posts.length;
  });
  html += `
        <li>
          <a href="?p=${page+1}">›</a>
        </li>
      </ul>
    </dir-pagination-controls>
  `;
  document.getElementsByClassName("sidebar-footer")[0].children[0].innerHTML = totalPosts;
  let footer = document.getElementsByTagName("footer")[0].innerHTML = html;
  let main = document.getElementsByTagName("main")[0];
  main.innerHTML = "";
  console.log(pages);
}
