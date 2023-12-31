
"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");


async function getShowsByTerm(searchTerm) {
  const showsArray = [];
  const queryObj = { q: searchTerm }
  const response = await axios.get(`http://api.tvmaze.com/singlesearch/shows`, { params: queryObj });
  const showObj = {
    id: response.data.id,
    name: response.data.name,
    summary: response.data.summary,
    image: response.data.image.medium,
  };
  showsArray.push(showObj);
  return showsArray;
}

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let imgSrc = (show.image) ? show.image : "https://tinyurl.com/tv-missing";
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${imgSrc}
              alt=${show.name}
              class="w-25 me-3 card-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  $("#searchForm-term").val("");

});

$showsList.on("click", ".Show-getEpisodes", getEpisodesOfShow);

async function getEpisodesOfShow() {
  const parentDiv = this.parentElement.parentElement.parentElement;
  const showId = parentDiv.dataset.showId;
  const response = await axios.get(`https://api.tvmaze.com/shows/${showId}/episodes`);
  const episodes = response.data.map(({ id, name, season, number }) => ({ id, name, season, number })); 
  const numberSeasons = episodes[episodes.length - 1].season;
  populateEpisodes(numberSeasons, episodes);
}


function populateEpisodes(numberSeasons, episodes) {
  $episodesArea.show();
  $("#seasons").empty();
  addSeasonsButtons(numberSeasons);
  const grouped = groupBySeason(episodes, numberSeasons);
  $("#seasons").on("click", ".seasonBtn", function(e){
    $episodesList.empty();
    const num = e.target.id.slice(7);
    const season = grouped[num-1];
    const episodes = season[num];
    for (let i of episodes){
      $episodesList.append($(`<li>"${i.name}" - Season ${i.season}, Ep ${i.number}</li>`))
    }
  })
}

function addSeasonsButtons(num) {
  for (let i = 1; i <= num; i++) {
    const $seasonBtn = $(`<button class="btn btn-secondary btn-sm seasonBtn" id="season-${i}">Season ${i}</button>`);
    $("#seasons").append($seasonBtn);
  }
}

function groupBySeason(episodes, numberSeasons) {
  const grouped = new Array();
  for (let i=1; i<=numberSeasons; i++) {
      let season = episodes.filter(ep => ep.season === i);
      let seasonObj = {};
      seasonObj[i] = season;
      grouped.push(seasonObj);
  }
  return grouped;
}