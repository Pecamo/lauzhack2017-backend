let promosRef = firebase.database().ref('/businesses/holycow/FCs/FC1/promos')
console.log(123, promosRef.toJSON())

// create Vue app
let app = new Vue({
	// element to mount to
	el: '#app',
	// initial data
	data: {
		newPromo: {
			key: '',
			value: ''
		}
	},

	// firebase binding
	// https://github.com/vuejs/vuefire
	firebase: {
		promos: promosRef
	},
	
	// methods
	methods: {
		addPromo: function () {
			promosRef.push(this.newPromo)
			this.newPromo.key = ''
			this.newPromo.value = ''
		},
		removePromo: function (promo) {
			promosRef.child(promo['.key']).remove()
		}
	}
})
