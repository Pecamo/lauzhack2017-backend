let promosRef = firebase.database().ref('/businesses/holycow/FCs/FC1/promos')

Vue.component("fc-promo", {
	props: ["name", "points"],
	template: `
	<div class="promotion pure-g">
		<strong class="pure-u-1-4">
			{{ name }}
		</strong>
		<div class="pure-u-3-4">
			{{ points }}
			<span class="fa fa-pencil"></span>
		</div>
	</div>
	`
})

Vue.component("fc-promos-edit", {
	data: () => ({
		newPromo: {
			key: '',
			value: ''
		}
	}),
	methods: {
		addPromo: function () {
			promosRef.push(this.newPromo)
			this.newPromo.key = ''
			this.newPromo.value = ''
		},
		removePromo: function (promo) {
			promosRef.child(promo['.key']).remove()
		}
	},
	// firebase binding
	// https://github.com/vuejs/vuefire
	firebase: {
		promos: promosRef
	},
	template: `
	<div>
		<ul is="transition-group">
			<li v-for="promo in promos" class="promo" :key="promo['.key']">
				<span>{{promo.key}} - {{promo.value}}</span>
				<button v-on:click="removePromo(promo)">X</button>
			</li>
		</ul>
		<form id="form" v-on:submit.prevent="addPromo">
			<input type="text" v-model="newPromo.key" placeholder="Key">
			<input type="text" v-model="newPromo.value" placeholder="Value">
			<input type="submit" value="Add promo">
		</form>
	</div>
	`
})

Vue.component("fc-promotions", {
	template: `
	<div>
		<h3>Promotions</h3>
		<fc-promos-edit></fc-promos-edit>
		<fc-promo name="1 free drink" points="2"></fc-promo>
		<fc-promo name="1 free burger" points="10"></fc-promo>
	</div>
	`
})

Vue.component("fc-card", {
	props: ["description"],
	template: 
	`<div class="fc-card">
		<h2>FC cow</h2>
		<div>
			<h3>
				Description
				<span class="fa fa-pencil"></span>
			</h3>
			<p>{{ description }}</p>
		</div>
		<fc-promotions></fc-promotions>
	</div>`
})

// create Vue app
let app = new Vue({
	// element to mount to
	el: '#app',
	// initial data
	data: {},
	
	// methods
	methods: {}
})
