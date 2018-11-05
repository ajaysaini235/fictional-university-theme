import $ from 'jquery';

class Search {
  // 1. describe and create/initiate our object
  constructor() {
    this.addSearchHTML();
    this.resultsDiv = $("#search-overlay__results");
    this.openButton = $(".js-search-trigger");
    this.closeButton = $(".search-overlay__close");
    this.searchOverlay = $(".search-overlay");
    this.previousValue;
    this.searchField = $("#search-term");
    //this attribute will get its value in typingLogic
    this.typigTimer;
    this.events();
    /* 
    Boolean used to ensure overlay only fires when overlay is not open
    */
    this.isOverlayOpen = false;
    //for our loading spinner icon in typingLogic
    this.isSpinnerVisible = false;
  }

  // 2. events
  events() {
    this.openButton.on("click", this.openOverlay.bind(this));
    /*
    keyup fires when a key is released
    keydown fires when a key is pressed, BUT it will continue firing until the key has been released. keyPressDispatcher 
    function explains how to get around this
    */
    $(document).on("keydown", this.keyPressDispatcher.bind(this));
    this.closeButton.on("click", this.closeOverlay.bind(this));
    /* we could have used JQuery here, but that would force JavaScript to traverse the DOM over and over again. this is much more efficient.
     in order for our spinner to work we actually have to use keyup, because the keydown event value will not update fast enough for instnaces
     such as pushing the back arrow button.
    */
    this.searchField.on("keyup", this.typingLogic.bind(this));
  }
  

  // 3. methods (function, action...)
    typingLogic() {
        if (this.searchField.val() != this.previousValue){
            // our property can be based to clearTimeout so that the timer resets everytime there's a keystroke, instead of firing every key stroke.
            clearTimeout(this.typigTimer);
            if(this.searchField.val()){
                if (!this.isSpinnerVisible) {
                    // as soon as someone types they'll still get an immediate response with this.
                    this.resultsDiv.html('<div class="spinner-loader"></div>');
                    this.isSpinnerVisible = true;
                }
                // 1000 is 1 second
                //this.getResults() will allow us to find our getResults method. bind(this) will allow us to access our objects properties and methods
                this.typigTimer = setTimeout(this.getResults.bind(this), 750);
            } else {
                this.resultsDiv.html('');
                this.isSpinnerVisible = false;
            }
        }
        this.previousValue = this.searchField.val();
    }

    getResults(){
        /*
        We use the ES6 syntax primarily for one reason other than the fact that is less verbose.
        With the ES6 function this does not get bound to $.getJSON, so when we use this.resultsDiv, it knows we are referring to OUR objects
        property, and not that of whatever api we are referencing.
        Alternatively we could have used the older syntax and bound this to the function like so...
        function(posts){

        }.bind(this)

        we also need to use the when/then functions from JQuery, since these will allow us to make two requests (post and pages) asynchronously...
        */
        $.when(
            //unveristyData.root_url is from functions.php in our university_Files function
            $.getJSON(universityData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.val()), 
                $.getJSON(universityData.root_url + '/wp-json/wp/v2/pages?search=' + this.searchField.val())
            ).then((posts, pages) => {
            /* 
            Using string to output html is problematic since it requires us to stay on one line, or concatinate each line to the next. 
            Instead of single or double quotes, we can use something called a 'template literal'
            referenced with two backticks (``) to output our html on multiple lines.
            if we want to reference our posts object we can use ${} which in this context does NOT refer to JQuery. this is a native ES syntax
            that informs JavaScript that what we are about to type within ${} should be referenced as JavaScript code.
            */
            /* 
            In JavaScript Arrays have access to a function called map that allows us to loop through each item within an array.
            this by default adds a comma at the end of each item, to remove this we can append .join('') to the end of that function. An empty join
            tells JS we do not want any deliminator.
            for example...
            var testAarray = ['red','orange','yellow'];
             this.resultsDiv.html(`
                 <h2 class="search-overlay__section-title">General Information</h2>
                 <ul class="link-list min-list">
                 ${testAarray.map(post => `<li>${post}</li>`).join('')}
                 </ul>
             `);
 
             The result of this would be...
             red
             orange
             yellow
            */
            /* ternary operator
                $ { condition ? true : false }
            */
            /* 
             arrays have a concat function that allows you to combine it with different arrays concat is kind of like appending. in this case we are
             getting the results for searching posts, and pages, in two getJSON functions, and then combining our results
             the posts and pages array now carry much information in regards to our asynchronous methods (call back functions). Since we only want to
             combine data, we are focusing on this first array.
            */
            var combinedResults = posts[0].concat(pages[0]);
            this.resultsDiv.html(`
                <h2 class="search-overlay__section-title">General Information</h2>
                ${combinedResults.length ? '<ul class="link-list min-list">' : '<p>No General information matches that search</p>'}
                <!-- template literals do not allow us to add traditional control statements, but we can use ternary operators... -->
                ${combinedResults.map(result => `<li><a href="${result.link}">${result.title.rendered}</a> ${result.type == 'post' ? `by ${result.authorName}` : ''}</li>`).join('')}
                ${combinedResults.length ? '</ul>' : ''}
            `);
            this.isSpinnerVisible = false;            
        }, () => {
            this.resultsDiv.html('<p>Unexpected error. Please try again</p>');
        } );

    }

    keyPressDispatcher(e) {
        // find the keyCode fired
        // console.log("key: ", e.keyCode);
        // we could set our second condition to this.isOverlayOpen == false, but !this.isOverlayOpen is the shorter syntax for the same thing.
        //this also prevents it from running repeatedly
        if (e.keyCode == 83 && !this.isOverlayOpen && !$("input, textarea").is(":focus")) {
            this.openOverlay();
        }
        if (e.keyCode == 27 && this.isOverlayOpen) {
            this.closeOverlay();
        }
    }


  openOverlay() {
    this.searchOverlay.addClass("search-overlay--active");
    $("body").addClass("body-no-scroll");
    //clean input field so it doesn't show oldie
    this.searchField.val('');
    // focus, but wait a lil so focus succeeds
    setTimeout(() => this.searchField.focus(),301)
    // console.log("our open method just ran!");
    /* 
    Boolean used to ensure overlay only fires when overlay is not open
    */
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    this.searchOverlay.removeClass("search-overlay--active");
      $("body").removeClass("body-no-scroll");
      //console.log("our close method just ran!");
      /* 
      Boolean used to ensure overlay only fires when overlay is not open
      */
      this.isOverlayOpen = false;
  }

  addSearchHTML(){
      $("body").append(`
        <!-- When a user selects the search icon the overlay below will appear.
        CSS class hook JS will use to make it appear is search-overlay--active 
        -->
        <div class="search-overlay">
            <div class="search-overlay__top">
                <div class="container">
                <!-- we use the i element for font awesome 
                aria-hidden <-- screen reader will not try to read this out to the visitor.
                -->
                <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
                <input type="text" class="search-term" placeholder="what are you looking for?" id="search-term">
                <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
                </div>
            </div>
            <div class="container">
                <div id="search-overlay__results">
                        
                </div>
            </div>
        </div>
      `);
  }

}

export default Search;