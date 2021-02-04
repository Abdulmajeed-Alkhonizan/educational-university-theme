import $ from 'jquery';

//jquery is the connector betweent css and javascript, 
//where we can use jquery library to control how the website behaves,
//and how the content shows up in the website, also can use css through jquery functions.

class Search {
    constructor() {
        this.addSearchHTML();
        this.resultsDiv = $("#search-overlay__results"); //to control the results search by jquery
        this.openButton = $(".js-search-trigger"); // to open search overlay div by jquery
        this.closeButtob = $(".search-overlay__close"); // to close search overlay div by jquery
        this.searchOverlay = $(".search-overlay"); // the search overlay
        this.searchField = $("#search-term"); // to control the search field value by jquery
        this.isOverlayOpen = false;
        this.isSpinnerVisible = false;
        this.previousValue;
        this.events();
        this.typingTimer; // a var controls when the results shows up
    }

    events(){
        this.openButton.on("click", this.openOverlay.bind(this));
        this.closeButtob.on("click", this.closeOverlay.bind(this));
        $(document).on("keydown", this.keyPressDispatcher.bind(this));
        this.searchField.on("keyup", this.typingLogic.bind(this));
    }

    
    // this function controls when the results shows up, and resets the timer for each changes happen
    typingLogic(){
        if(this.searchField.val() != this.previousValue){
            clearTimeout(this.typingTimer);
            if(this.searchField.val()){
                if( this.isSpinnerVisible == false){
                    this.resultsDiv.html('<div class="spinner-loader"></div>'); //loading spin shows until results shows up
                    this.isSpinnerVisible = true;
                }
                this.typingTimer = setTimeout(this.getResultsDiv.bind(this), 800);
            } else {
                this.resultsDiv.html(' ');
                this.isSpinnerVisible = false; 
            }
        }

        this.previousValue = this.searchField.val();
    }

    
    // map takes a parameter that represents an object that fires the map function
    // and cna access of all array elements
    getResultsDiv(){
        $.getJSON(universityData.root_url + '/wp-json/university/v1/search?term=' + this.searchField.val(), (results) => {
            this.resultsDiv.html(`
                <div class="row">
                     <div class="one-third">
                        <h2 class="search-overlay__section-title">General Information</h2>
                        ${results.generalInfo.length ? '<ul class="link-list min-list"> ' : '<p> no general information matches that search.</p>' }
                        ${results.generalInfo.map(item => `<li> <a href="${item.link}">${item.title}</a> ${item.postType == 'post' ? `by ${item.authorName}` : ''} </li>`).join('')}
                        ${results.generalInfo.length ? '</ul>' : ''}
                     </div>
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">Programs</h2>
                        ${results.programs.length ? '<ul class="link-list min-list"> ' : `<p> no programs info match that search. <a href="${universityData.root_url}/programs">View all programs.</a></p>` }
                        ${results.programs.map(item => `<li> <a href="${item.link}">${item.title}</a> 
                        </li>`).join('')}
                        ${results.programs.length ? '</ul>' : ''}

                        <h2 class="search-overlay__section-title">Professors</h2>
                        ${results.professors.length ? '<ul class="link-list min-list"> ' : `<p> no professors info match that search.</a></p>` }
                        ${results.professors.map(item => `
                            <li class="professor-card__list-item">
                                <a class="professor-card" href="${item.link}">
                                    <img class="professor-card__image" src="${item.image}">
                                    <span class="professor-card__name">${item.title}</span>
                                </a>
                            </li>
                        `).join('')}
                        ${results.professors.length ? '</ul>' : ''}
                    </div>
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">Up Coming Events</h2>
                        ${results.events.length ? '<ul class="link-list min-list"> ' : `<p> no coming events info match that search.</a><a href="${universityData.root_url}/events">View all events.</a></p>` }
                        ${results.events.map(item => `
                            <div class="event-summary">
                                <a class="event-summary__date t-center" href="${item.link}">
                                    <span class="event-summary__month">${item.month}</span>
                                    <span class="event-summary__day">${item.day}</span>
                                </a>
                                <div class="event-summary__content">
                                    <h5 class="event-summary__title headline headline--tiny"><a href="${item.link}">${item.title}</a></h5>
                                    <p>${item.description}<a href="${item.link}" class="nu gray"> Learn more</a></p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `);
            this.isSpinnerVisible = false;
        });
    }
    
    keyPressDispatcher(e){
        console.log(e.keyCode);
        if(e.keyCode == 83 && this.isOverlayOpen == false && !$("input, textarea").is(':focus')){
            this.openOverlay();
        }
        if(e.keyCode == 27 && this.isOverlayOpen){
            this.closeOverlay();
        }
    }
    openOverlay(){
        this.searchOverlay.addClass("search-overlay--active");
        $("body").addClass("body-no-scroll"); //does not let a screen scrollable when overlay search is up by jquery
        setTimeout( ()=> this.searchField.focus(), 301);
        this.isOverlayOpen = true;
        return false;
    }

    closeOverlay(){
        this.searchOverlay.removeClass("search-overlay--active");
        $("body").removeClass("body-no-scroll"); //come back to normal scroll when overlay search is off by jquery.
        this.searchField.val('');
        this.isOverlayOpen = false;
        
    }

    addSearchHTML(){
        $("body").append(`
        <div class="search-overlay">
      <div class="search-overlay__top">
        <div class="container">
          <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
          <input type="text" class="search-term" placeholder="What are you looking for?" id="search-term">
          <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
        </div>
      </div>
      <div class="container">
        <div id="search-overlay__results"></div>
      </div>
    </div>
        `);
    }
}

export default Search;