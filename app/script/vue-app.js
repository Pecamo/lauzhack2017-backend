let app = null;

function setupVue(userId) {
	firebase.database().ref('/managers/' + userId).once('value', res => {
		if (res.child("business_id") && res.child("business_id").val()) {
			_setupVue(res.child("business_id").val())
		}
	});
}

function _setupVue(business) {
	const prefix = "/businesses/" + business + "/";

	let fcRef = firebase.database().ref(prefix + "FCs/");
	let infosRef = firebase.database().ref(prefix + "infos");
	let coordinatesRef = firebase.database().ref(prefix + "infos/coordinates");

	Vue.component('v-map', Vue2Leaflet.Map);
	Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
	Vue.component('v-marker', Vue2Leaflet.Marker);

	Vue.component("v-locations", {
		data: function () {
			return {
				zoom: 11,
				url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			}
		},
		firebase: {
			coordinates: coordinatesRef
		},
		// FIXME find center to the center of the bounding box
		template: `
			<v-map :zoom="zoom" :center="coordinates[0].coordinates">
			<v-tilelayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"></v-tilelayer>
			<v-marker v-for="coord in coordinates" :lat-lng="[coord.coordinates[0], coord.coordinates[1]]"></v-marker>
			</v-map>
		`
	})

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

	Vue.component("fc-promotions", {
		props: ["fcKey", "promos"],
		computed: {
			promosRef: function () {
				return firebase.database().ref(prefix + "FCs/" + this.fcKey + "/promos")
			}
		},
		data: () => ({
			newPromo: {
				key: '',
				value: ''
			}
		}),
		methods: {
			addPromo: function () {
				this.promosRef.push(this.newPromo)
				this.newPromo.key = ''
				this.newPromo.value = ''
			},
			removePromo: function (key) {
				this.promosRef.child(key).remove()
			}
		},
		template: `
		<div>
			<h3>Promotions</h3>
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
						<tr v-for="(promo, key) in promos" class="promo" :key="key">				
							<td>{{promo.key}}</td>
							<td>{{promo.value}}</td>				
							<td><button v-on:click="removePromo(key)">X</button></td>
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

	Vue.component("fc-card", {
		props: ["fcKey", "name", "description", "articles", "promos"],
		template:
		`<div class="fc-card">
			<h2 v-if="name === ''">No name</h2>
			<h2 v-else>{{ name }}</h2>
			<div>
				<h3>
					Description
					<span class="fa fa-pencil"></span>
				</h3>
				<p>{{ description }}</p>
			</div>
			<fc-promotions :fcKey="fcKey" :promos="promos"></fc-promotions>
		</div>`
	})

	Vue.component("fc-cards", {
		data: function() {
			return {
				formOpen: false,
				newCard: {
					name: "",
					description: "",
					articles: [],
					promos: []
				}
			}
		},
		methods: {
			openForm: function() {
				this.formOpen = true;
			},
			addCard: function() {
				this.formOpen = false;
				fcRef.push(this.newCard);
			}
		},
		firebase: {
			fcs: fcRef
		},
		template: `
		<div>
			<h1 id="card-title">
				Cards
			</h1>
			<div v-for="fc in fcs" class="fc" :key="fc['.key']">
				<fc-card
					:fcKey="fc['.key']"
					:name="fc.name"
					:description="fc.description"
					:articles="fc.articles"
					:promos="fc.promos"
				></fc-card>
			</div>

			<button class="pure-button" v-on:click="openForm">
				Add a fidelity card
				<span class="fa fa-plus"></span>
			</button>

			<form v-if="formOpen" v-on:submit.prevent="addCard">
				<input type="text" v-model="newCard.name" placeHolder="Name">
				<input type="text" v-model="newCard.description" placeHolder="Description">
				<input type="submit" value="Add">
			</form>
		</div>
		`
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
