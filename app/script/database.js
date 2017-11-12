
// Get a reference to the database service
let database = firebase.database();

/*
let userId = firebase.auth().currentUser.uid;
console.log(userId)

firebase.database().ref('/users/' + userId).once('value').then(snapshot => {
	let username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
	console.log(database)
});
*/

function createPromos() {
	firebase.database().ref('/businesses/holycow/FCs/FC1').once('value').then(snapshot => {
		console.log(snapshot.toJSON())
	})
}
