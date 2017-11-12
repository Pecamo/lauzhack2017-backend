let app = null;

function setupVue(userId) {
	firebase.database().ref('/managers/' + userId).once('value', res => {
		if (res.child("business_id") && res.child("business_id").val()) {
			_setupVue(res.child("business_id").val())
		}
	});
}

function _setupVue(business) {
	let promosRef = firebase.database().ref('/businesses/' + business + '/FCs/FC1/promos')

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
			<form id="form" v-on:submit.prevent="addPromo">
				<table class="pure-table promo-table">
					<thead>
						<tr>
							<th>Offer</th>
							<th>Points required</th>
							<th>Delete</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="promo in promos" class="promo" :key="promo['.key']">
							<td>{{promo.key}}</td>
							<td>{{promo.value}}</td>
							<td><button v-on:click="removePromo(promo)">X</button></td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td><input type="text" v-model="newPromo.key" placeholder="Item"></td>
							<td><input type="text" v-model="newPromo.value" placeholder="Points required"></td>
							<td><input type="submit" value="+"></td>
						</tr>
					</tfoot>
				</table>
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
	app = new Vue({
		// element to mount to
		el: '#app',
		// initial data
		data: {},
		
		// methods
		methods: {}
	})
}
