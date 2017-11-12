function auth() {
	let provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithPopup(provider).then(function(result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		var user = result.user;
		// ...
		onAuthDone(user);
	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
	});
}

function signOut() {
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		location.reload(); // FIXME Super ugly but anoying to do well
	}).catch(function(error) {
		// An error happened.
		console.error(error);
	});
}

function onAuthDone(user) {
	setupVue(user.uid);
	document.querySelector('#user-identity').innerHTML = '<span class="username">Hi ' + user.displayName + '!<span class="signout-btn"> <a href="#" onclick="signOut()">Sign out</a></span></span> <img class="profile-pic" src="' + user.photoURL + '">';
}


firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		onAuthDone(user);
	}
});
