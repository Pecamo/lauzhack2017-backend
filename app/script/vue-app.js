let app = null;

function setupVue(userId) {
	firebase.database().ref('/managers/' + userId).once('value', res => {
		if (res.child("business_id") && res.child("business_id").val()) {
			_setupVue(res.child("business_id").val())
		}
	});
}

function _setupVue(business) {
	const prefix = "/businesses/" + business + "/"

	// left part
	_setupInfoComponents(prefix)
	// right part
	_setupCardsComponents(prefix)
	// utils
	_setupUtils(prefix)

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

function _setupInfoComponents(prefix) {
	Vue.component("business-infos", {
		firebase: {
			infos: {
				source: firebase.database().ref(prefix + "/infos"),
				asObject: true
			}
		},
		methods: {
			curPath: function () {
				return prefix + "/infos"
			}
		},
		template: `
		<div class="pure-u-1-2 page-container">
			<div id="main-title" class="pure-g">
				<div
					v-if="infos.logo" id="logo" class="pure-u-1-4"
					v-bind:style="{ 'backgroundImage': 'url(' + infos.logo + ')' }"
				></div>
				<div v-else id="logo" class="unset pure-u-1-4"></div>

				<div class="pure-u-3-4">
					<h1 id="business-name">
						{{ infos.name }}
					</h1>
				</div>
			</div>
			<div>
				<h3>Description</h3>
				<editable-p
					:text="infos.description"
					:path="curPath()"
					identifier="description"
					placeholder="Description"
				></editable-p>
			</div>
			<div class="pure-g">
				<strong class="pure-u-1-4">
					Website
					<span class="fa fa-pencil"></span>
				</strong>
				<div class="pure-u-3-4">
					<editable-a
						:text="infos.website"
						:path="curPath()"
						identifier="website"
						placeholder="Website"
					>
					</editable-a>
				</div>
			</div>
			<div>
				<h3>Locations</h3>
				<div class="leaflet-map">
					<v-locations></v-locations>
				</div>
			</div>
		</div>
		`
	})

	_setupMapComponents(prefix)
}

function _setupMapComponents(prefix) {
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
		methods: {
			getCenter: function () {
				for (let coord of this.coordinates) {
					return coord.coordinates
				}
			}
		},
		// FIXME find center to the center of the bounding box
		template: `
			<v-map :zoom="zoom" :center="getCenter()">
				<v-tilelayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"></v-tilelayer>
				<v-marker v-for="coord in coordinates" :lat-lng="[coord.coordinates[0], coord.coordinates[1]]"></v-marker>
			</v-map>
		`
	})
}

function _setupCardsComponents(prefix) {
	let fcRef = firebase.database().ref(prefix + "FCs");

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
		<div class="pure-u-1-2 page-container">
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

	Vue.component("fc-card", {
		props: ["fcKey", "name", "description", "articles", "promos"],
		methods: {
			getTitle: function () {
				return this.name === "" ? "No name" : this.name
			},
			curPath: function () {
				return prefix + 'FCs/' + this.fcKey
			}
		},
		template:
		`<div class="fc-card">
			<editable-h2
				:text="getTitle()"
				:path="curPath()"
				identifier="name"
				placeholder="Fidelity card name"
			></editable-h2>
			<div>
				<h3>Description</h3>
				<editable-p
					:text="description"
					:path="curPath()"
					identifier="description"
					placeholder="Description"
				></editable-p>
			</div>
			<fc-entries
				:fcKey="fcKey"
				:entries="articles"
				path="/articles"
				title="Articles"
				col1Name="Article"
				col2Name="Points given"
			>
			</fc-entries>
			<fc-entries 
				:fcKey="fcKey"
				:entries="promos"
				path="/promos"
				title="Promotions"
				col1Name="Offer"
				col2Name="Points required"
			></fc-entries>
		</div>`
	})

	Vue.component("fc-entries", {
		props: ["fcKey", "entries", "path", "title", "col1Name", "col2Name"],
		computed: {
			entriesRef: function () {
				return firebase.database().ref(prefix + "FCs/" + this.fcKey + this.path)
			}
		},
		data: () => ({
			newEntry: {
				key: '',
				value: ''
			}
		}),
		methods: {
			addEntry: function () {
				this.entriesRef.push(this.newEntry)
				this.newEntry.key = ''
				this.newEntry.value = ''
			},
			// FIXME remove using the actual ID instead of finding it with the name
			removeEntry: function (entry) {
				this.entriesRef.once('value', res => {
					for (let k in res.val()) {
						if (res.val()[k].key == entry.key) {
							this.entriesRef.child(k).remove();
							break;
						}
					}
				});
			}
		},
		template: `
		<div>
			<h3>{{ title }}</h3>
				<table class="pure-table entry-table">
					<thead>
						<tr>
							<th>{{ col1Name }}</th>
							<th>{{ col2Name }}</th>
							<th>Delete</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="entry in entries" class="entry" :key="entry['.key']">
							<td>{{entry.key}}</td>
							<td>{{entry.value}}</td>
							<td><button v-on:click="removeEntry(entry)">X</button></td>
						</tr>
					</tbody>
				</table>
				<table class="pure-table entry-table">
					<tr>
						<form id="form" v-on:submit.prevent="addEntry">
							<td><input type="text" v-model="newEntry.key" placeholder="Item"></td>
							<td><input type="text" v-model="newEntry.value" placeholder="Points required"></td>
							<td><input type="submit" value="+"></td>
						</form>
					</tr>
				</table>
		</div>
		`
	})
}

function _setupUtils(prefix) {
	function editableCompBase(tag) {
		return {
			props: ["text", "path", "identifier", "placeholder"],
			data: function () {
				return {
					editing: false,
					value: this.text
				}
			},
			methods: {
				openEdit: function () {
					this.editing = true;
				},
				save: function () {
					this.editing = false;
					firebase.database().ref(this.path).child(this.identifier).set(this.value)
				}
			},
			template: `
				<div>
					<form v-if="editing" class="pure-form" v-on:submit.prevent="save">
						<input type="text" v-model="value" :placeholder="placeholder">
						<button type="submit" class="pure-button">Save</button>
					</form>
					<` + tag + ` v-else class="editable" v-on:click="openEdit">
						{{ text }}
						<span class="fa fa-pencil"></span>
					</` + tag + `>
				</div>
			`
		}
	}
	Vue.component("editable-h2", editableCompBase("h2"))	
	Vue.component("editable-h3", editableCompBase("h3"))
	Vue.component("editable-strong", editableCompBase("strong"))
	Vue.component("editable-p", editableCompBase("p"))
	Vue.component("editable-a", editableCompBase("a"))
}
