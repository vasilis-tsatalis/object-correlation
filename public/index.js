//
function shuffleArray(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


// load the page - window

window.addEventListener('load',function(event){

	//parameter to check whether request is active, my controler
	let searchmovie_active_request = null; 
	let search_timeout = 0; //parameter for search timeout
	
	//external server url
	const baseURL = 'http://localhost:3000/';
	
	let my_movies = [];
	let suggested_movies = [];
	
	let page_loader = document.getElementById('page_loader');
	 
	// async function to call api for movie search
	// return a list with movies which the keyword included into title
	async function searchMovie(url = '', element){
        try{
			searchmovie_active_request="active";
            const service = 'movie'
            const response = await fetch(`${url}${service}`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    'keyword': element
                })
			});
			const result = await response.json();
			searchmovie_active_request = null;
            return result;
        }catch(err){
			//console.error(err.message);
			alert(err.message);
        }
    };

	// async function to call api and post movies id which have rating
	// return all user and their ratings per movie
	async function searchRatings(url = '', data = []){
        try{
            const service = 'ratings'
            const response = await fetch(`${url}${service}`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    'movieList': data
                })
			});
			const result = await response.json();
			return result;
        }catch(err){
			//console.error(err.message);
			alert(err.message);
        }
    };
	
	// check if my movie already stored in session
	function isMovieInMyMoviesStorage(movie_id) {

		if(!sessionStorage['my_movies_stored'])
		{
			return false;
		}
		else
		{
			let my_movies_stored_array = JSON.parse(sessionStorage['my_movies_stored']);
			for (let i=0; i<my_movies_stored_array.length; i++)
			{
				let mov = my_movies_stored_array[i];
				if(mov.id == movie_id)
				{
					return true;
				}
			}
			return false;
		}
	}
	
	// draw the stars in rating
	function drawRating(rating) {

		let rating_text='';
		for (let i=1; i<=5; i++)
		{
			if(i <= rating)
			{
				rating_text += '<i class="fa fa-star"></i>';
			}
			else
			{
				rating_text += '<i class="fa fa-star-o"></i>';
			}
		}
		return rating_text;
	}
	
	//in case of refresh F5
	function refreshMyMoviesList() {

		if(!sessionStorage['my_movies_stored'])
		{
			document.getElementById('my_movies').innerHTML = 'Δεν έχετε επιλέξει ταινία';
		}
		else
		{
			let my_movies_list = document.getElementById('my_movies');
			my_movies_list.innerHTML = '';
			let my_movies_stored_array = JSON.parse(sessionStorage['my_movies_stored']);
			for (let i=0; i<my_movies_stored_array.length; i++)
			{
				let mov = my_movies_stored_array[i];
				//create new element in DOM 
				let mov_entry = document.createElement("p");
				let rating_stars = drawRating(mov.rating);
				mov_entry.innerHTML = '&bull; '+ mov.title + ' ' + rating_stars +' ('+ mov.rating +'/5)';
				mov_entry.setAttribute('id', 'movie_'+ mov.id);
				my_movies_list.appendChild(mov_entry);
			}
			
		}
	}
	
	//refresh the list when add new movie
	function refreshSuggestionsList() {
		if(!sessionStorage['my_movies_stored'])
		{
			document.getElementById('movies_suggestions').innerHTML = 'Δεν έχετε επιλέξει ταινία';
		}
		else
		{
			let movies_suggestions=document.getElementById('movies_suggestions');
			
			movies_suggestions.innerHTML = '';
			page_loader.classList.remove("active");
			let my_movies_stored_array = JSON.parse(sessionStorage['my_movies_stored']);
			let my_movies_ids = [];
			let my_movies_ratings = {};
			for (let i=0; i<my_movies_stored_array.length; i++)
			{
				let mov=my_movies_stored_array[i];
				//console.log(mov);
				my_movies_ids.push(mov.id);
				my_movies_ratings[mov.id] = mov.rating;
				
			}
			//console.log(my_movies_ids);
			//console.log('my_movies_ratings');
			//console.log(my_movies_ratings);
			if(my_movies_ids.length > 0)
			{
				page_loader.classList.add("active");
				let ratings_results_users = [];
				searchRatings(baseURL, my_movies_ids)
					.then(data => {
						//console.log(data);
						movies_suggestions.innerHTML = `Βρήκα '${data.length}' αποτελέσματα με αξιολογήσεις για κάθε ταινία και κάθε χρήστη`;
						data.forEach(element => {
							//console.log(element);
							let movieId = element.movieId;
							let user_rating = element.rating;
							//console.log(movieId);
							
							let my_rating = my_movies_ratings[movieId];
							//return absolute value 
							//let rating_diff = Math.abs(user_rating - my_rating);
							//correlation coefficient
							let rating_diff = user_rating / my_rating;

							//console.log('movieId: '+movieId);
							//console.log('my_rating: '+my_rating);
							//console.log('user_rating: '+user_rating);
							//console.log('rating_diff: '+rating_diff);

							//store the movies if the difference is near to 1
							//if(rating_diff <= 1)
							if((rating_diff < 1.5) || (rating_diff > 0.5))
							{
								//console.log('added user: '+element.userId);
								//add a new entry in the list
								ratings_results_users.push(element.userId);
							}
						});
						
						if(ratings_results_users.length == 0)
						{
							movies_suggestions.innerHTML = 'Δεν βρέθηκαν αποτελέσματα';
							page_loader.classList.remove("active");
						}
						else
						{
							suggested_movies=[];
							
							//less request for user to avoid overload in remote server
							if(ratings_results_users.length > 5)
							{
								//random users selection
								ratings_results_users = shuffleArray(ratings_results_users);
								//console.log(ratings_results_users.length +' users');
								//select in the array from position 0 to (and 4) - on fire
								ratings_results_users = ratings_results_users.slice(0,5);
								//console.log(ratings_results_users);
								//return false;
							}
							console.log(ratings_results_users.length +' users to search');
							for(let i=0; i<ratings_results_users.length; i++)
							{
								//here we don't need async call
								const xhr = new XMLHttpRequest();
								const service = 'ratings';		
								xhr.open('GET', `${baseURL}${service}/${ratings_results_users[i]}`, false); 
								xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
								xhr.onreadystatechange =
										function(){
											if(xhr.readyState == 4 && xhr.status == 200){
												//We're good, let's display results
												var data = JSON.parse(xhr.responseText);
												data.forEach(function(element) {
													if(!isMovieInMyMoviesStorage(element.movieId) && suggested_movies.indexOf(element.movieId) == -1)
													{
														suggested_movies.push(element.movieId);
													}
												});							
											} else {
												//console.log(xhr.readyState);
												//console.log(xhr.responseText);
												//an error occured here
												alert("Error: " + xhr.responseText);
											}
										};
									xhr.send(); 							
							}
							console.log(suggested_movies.length+' suggested_movies');
							if(suggested_movies.length == 0)
							{
								movies_suggestions.innerHTML='Δεν βρέθηκαν προτάσεις';
								page_loader.classList.remove("active");
								
							}
							else
							{
								suggested_movies = shuffleArray(suggested_movies);
								//less requests to avoid overload in remote server
								if(suggested_movies.length > 10)
								{
									//random movies selection
									//suggested_movies = shuffleArray(suggested_movies);
									//first 10
									suggested_movies = suggested_movies.slice(0,10);
								}
								console.log(suggested_movies.length+' suggested_movies');
								console.log(suggested_movies);
								let suggested_movies_titles=[];
								//to find movie title
								for (let i=0; i<suggested_movies.length; i++)
								{
									//here we don't need async call
									const xhr = new XMLHttpRequest();
									const service = 'movie'; 
									xhr.open('GET', `${baseURL}${service}/${suggested_movies[i]}`, false); 
									xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
									xhr.onreadystatechange=
											function(){
												if(xhr.readyState == 4 && xhr.status == 200){
													//We're good, let's display results
													var data = JSON.parse(xhr.responseText);
													data.forEach(function(entry) {
														{
															suggested_movies_titles.push(entry);
														}
													});												
												} else
												{
													//console.log(xhr.readyState);
													//console.log(xhr.responseText);
													//an error occured here
													alert("Error: "+ xhr.responseText);	
												}
											};
										xhr.send(); 
								}
								console.log(suggested_movies_titles);

								movies_suggestions.innerHTML='';
								for (let i=0; i<suggested_movies_titles.length; i++)
								{
									let mov=suggested_movies_titles[i];
									let mov_entry = document.createElement("p");
									mov_entry.innerHTML='&bull; '+ mov.title + ' - '+mov.genres+'';
									movies_suggestions.appendChild(mov_entry);
								}
								page_loader.classList.remove("active");
							}
						}					
					});
			}
		}
	}
	

	refreshMyMoviesList();
	refreshSuggestionsList();
	
	
	if(sessionStorage['my_movies_stored'])
	{
		my_movies = JSON.parse(sessionStorage['my_movies_stored']);
	}
		
	//no matter press enter while input
	document.getElementById('search_movies').addEventListener('keydown',function(event){
		if(event.keyIdentifier=='U+000A' || event.keyIdentifier=='Enter' || event.keyCode==13){
			if(event.target.nodeName=='INPUT' && event.target.type=='text'){
				event.preventDefault();
				return false;
			}
		}
	});

	//start searching for movies
	document.getElementById('search_movies').addEventListener('input',function(event){
		const movie_element = document.getElementById('search_movie_title');
		const movie = movie_element.value.trim();
		//at least 3 letters to start searching (call)
        if (movie.length >= 3) {
			movie_element.classList.add("loading");
			document.getElementById("cancel_search").classList.remove('active');
			if(searchmovie_active_request != null)
			{
				//we schould wait for the previous request to finish before sending a new one
				return false;
			}
			if(search_timeout)
			{
				//if search timeout is active we clear it to send it again. 
				//We use the timeout to not send immediately the request in case of quick typing
				clearTimeout(search_timeout);
			}
			
			//use the timeout to slow down the call speed with typing
			search_timeout=setTimeout(function(){
				document.getElementById("cancel_search").classList.add('active');
			searchMovie(baseURL, movie)
			.then(data => {
				document.getElementById("movies_list").innerHTML='';
				data.forEach(movie_entry => {
					let movie_code = movie_entry.movieId;
					//check if movie is in list already, if not added
					if(!isMovieInMyMoviesStorage(movie_code))
					{				
						let ul = document.getElementById("movies_list");
						let li = document.createElement("li");
						
						//create new element li for the movie
						li.appendChild(document.createTextNode(movie_entry.title));
						li.setAttribute('id', movie_code);
						ul.appendChild(li);
					}
				});
				//document.getElementById("cancel_search").classList.remove('active');
				setTimeout(1000, movie_element.classList.remove("loading"))
			})
			},400);
		} else event.preventDefault();
    });


	document.getElementById("movies_list").addEventListener('click',function(event){
		
		//let movie_sel = selection.value;
		if (event.target && event.target.matches("li")) {
			let clicked_li = event.target;
			
			let g_rating = prompt("Αξιολογήστε την ταινία από 1 εώς 5", "3");
			if(g_rating == "null" || g_rating == null)
			{
				return false;
			}
			g_rating = g_rating.trim();
			//change 2,5 to 2.5 case of decimals
			g_rating = g_rating.replace(',','.');
			//convert the string to integer
			g_rating = parseInt(g_rating);
			if(isNaN(g_rating))
			{
				alert("Παρακαλώ προσθέστε μια αξιολόγηση");
				return false;
			}
			//round the number up
			g_rating = Math.ceil(g_rating);
			if(g_rating < 1 || g_rating > 5)
			{
				alert("Δεν δώσατε σωστή αξιολόγηση");
				return false;
			}
			
			// new class name here
			clicked_li.className = "active"; 
			
			//add new entry to the list
			my_movies.push({id:clicked_li.attributes['id'].value, title:clicked_li.innerText, rating:g_rating});
			console.log(my_movies);
			//store the value into the current session in browser
			sessionStorage.setItem('my_movies_stored', JSON.stringify(my_movies));
			//alert( clicked_li.innerText);
			document.getElementById("movies_list").innerHTML = '';
			document.getElementById("cancel_search").classList.remove('active');
			refreshMyMoviesList();
			refreshSuggestionsList();
		}
		
  
	});
	//stop the searching
	document.getElementById('cancel_search').addEventListener('click',function(event){
		
		document.getElementById("movies_list").innerHTML='';
		if(searchmovie_active_request != null)
		{
			searchmovie_active_request = null;
		}
		document.getElementById('search_movie_title').classList.remove('loading');		 
	});

	//clear all data - start again
	document.getElementById('cancel_all').addEventListener('click',function(event){
		if(confirm("Θα ακυρωθούν όλες οι ταινίες που έχετε επιλέξει και οι βαθμολογίες που έχετε εισάγει, να ξεκινήσει η διαδικασία από την αρχή;")){
			//clear browser session from saved movies
			sessionStorage.clear();
			document.getElementById('search_movie_title').innerHTML='';
			document.location.reload();
		}
	});
	
});
