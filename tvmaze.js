
"use strict";


const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


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
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" data-toggle="modal" data-target="#${show.name}-episodes">
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

  // $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  $("#searchForm-term").val("");

});

$showsList.on("click", ".Show-getEpisodes", getEpisodesOfShow);

async function getEpisodesOfShow(e) {
  const parentDiv = this.parentElement.parentElement.parentElement;
  const showId = parentDiv.dataset.showId;
  const response = await axios.get(`https://api.tvmaze.com/shows/${showId}/episodes`);
  const episodes = response.data.map(({ id, name, season, number }) => ({ id, name, season, number }));
  const showName = $(this.parentElement.firstElementChild).html();
  const numberSeasons = episodes[episodes.length - 1].season;
  populateEpisodes(showName, numberSeasons, episodes);
}


function populateEpisodes(showName, numberSeasons, episodes) {
  $episodesArea.show();
  const $episodesModal = $(
    `<div class="modal" id="test">
       <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title">${showName} Episodes</h4>
          </div>
          <div class="modal-body">
          <div id="${showName}-seasons"></div>
            <table>
              <thead>
              </thead>
                <tbody class="table">
                </tbody>
            </table>
          </div>
       </div>
     </div>
    `);
  const $seasonsDiv = $(`${showName}-seasons`);
  addSeasonsButtons($seasonsDiv, showName, numberSeasons)
  console.log($episodesModal)
}

 function addSeasonsButtons(div, showName, num){
  for (let i=1; i<=num; i++) {
    const seasonBtn = $(`<button class="btn btn-primary btn-sm seasonBtn" id="${showName}-S${i}">Season ${i}</button>`);
    div.append(seasonBtn);
  }
 }
