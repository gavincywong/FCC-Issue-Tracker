const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const fakeId = '61d634706a98a61edd42bf45'


chai.use(chaiHttp);

suite('Functional Tests', function() {
	this.timeout(5000);

	suite('POST requests', function() {
		// Test 1
		test("Create an issue with every field", function(done) {
			chai
				.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: "Test",
					issue_text: "test",
					created_by: "asdf",
					assigned_to: "fdas",
					status_text: "status"
				})
				.end(function(err, res) {
					assert.equal(res.status, 200)
					assert.equal(res.body.issue_title, "Test")
					assert.equal(res.body.issue_text, "test")
					assert.equal(res.body.created_by, "asdf")
					assert.equal(res.body.assigned_to, "fdas")
					assert.equal(res.body.status_text, "status")
					assert.equal(res.body.project, 'test')
					id = res.body._id
				})
				done()
		}) 
		// Test 2
		test("Create an issue with only required fields", function(done) {
			chai
				.request(server)
				.post('/api/issues/test')
				.send({
					issue_title: "Test",
					issue_text: "test",
					created_by: "asdf"
				})
				.end(function(err, res) {
					assert.equal(res.status, 200)
					assert.equal(res.body.issue_title, "Test")
					assert.equal(res.body.issue_text, "test")
					assert.equal(res.body.created_by, "asdf")
					assert.equal(res.body.assigned_to, "")
					assert.equal(res.body.status_text, "")
					assert.equal(res.body.project, 'test')
					id2 = res.body._id
				})
				done()
		}) 
		// Test 3
		test("Create an issue with missing required fields", function(done) {
			chai
				.request(server)
				.post('/api/issues/test')
				.send({})
				.end(function(err, res) {
					assert.equal(res.body.error, 'required field(s) missing' ) 
				})
				done()
		}) 
	})

	suite('GET requests', function() {
		// Test 4
		test("View issues on a project", function(done) {
			chai
				.request(server)
				.get('/api/issues/test')
				.end(function(err, res) {
					assert.equal(res.status, 200)
					assert.isArray(res.body)
					assert.property(res.body[0], 'issue_title')
					assert.property(res.body[0], 'issue_text')
					assert.property(res.body[0], 'created_by')
					assert.property(res.body[0], 'assigned_to')
					assert.property(res.body[0], 'status_text')
					assert.property(res.body[0], 'open')
					assert.property(res.body[0], 'created_on')
					assert.property(res.body[0], 'updated_on')
					assert.property(res.body[0], '_id')
					assert.property(res.body[0], 'project')

				})
				done()
		})
		// Test 5
		test("View issues on a project - one filter", function(done) {
			chai
				.request(server)
				.get('/api/issues/test')
				.query({open: true})
				.end(function(err, res) {
					for (let i=0; i< res.body.length; i++) {
						assert.equal(res.body[i].open, true)
					}
				})
				done()
		})
		// Test 6
		test("View issues on a project - multiple filters", function(done) {
			chai
				.request(server)
				.get('/api/issues/test')
				.query({open: true, issue_text: 'test'})
				.end(function(err, res) {
					for (let i=0; i< res.body.length; i++) {
						assert.equal(res.body[i].issue_text, "test")
						assert.equal(res.body[i].open, true)
					}
				})
				done()
		})
	})

	suite('PUT requests', function() {
		// Test 7
		test("Update one field on an issue:", function(done) {
			chai
				.request(server)
				.put('/api/issues/test')
				.send({_id: '61d7c983beb97a62ea7233c8', issue_title: "Tester134"})
				.end(function(err, res) {
						assert.equal(res.body.result, 'successfully updated')
				})
				done()
		})
		// Test 8
		test("Update multiple fields on an issue:", function(done) {
			chai
				.request(server)
				.put('/api/issues/test')
				.send({_id: '61d7c983beb97a62ea7233c8', issue_title: "New title", issue_text: "New text"})
				.end(function(err, res) {
						assert.equal(res.body.result, 'successfully updated')
				})
				done()
		})
		// Test 9
		test("Update an issue with missing _id:", function(done) {
			chai
				.request(server)
				.put('/api/issues/test')
				.send({issue_title: "Tester135", issue_text: "asdf23"})
				.end(function(err, res) {
						assert.equal(res.body.error, 'missing _id')
				})
				done()
		})
		// Test 10
		test("Update an issue with no fields to update:", function(done) {
			chai
				.request(server)
				.put('/api/issues/test')
				.send({_id: id})
				.end(function(err, res) {
						assert.equal(res.body.error, 'no update field(s) sent')
				})
				done()
		}) 
		// Test 11
		test("Update an issue with an invalid _id:", function(done) {
			chai
				.request(server)
				.put('/api/issues/test')
				.send({_id: fakeId, issue_title: "Tester135", issue_text: "asdf23"})
				.end(function(err, res) {
						assert.equal(res.body.error, 'could not update')
				})
				done()
		}) 
	})

	suite('DELETE requests', function() {	
		// Test 12
		test("Delete an issue", function(done) {
			chai
				.request(server)
				.delete('/api/issues/test')
				.send({_id: id})
				.end(function(err, res) {
						assert.equal(res.body.result, 'successfully deleted')
				})
				done()
		})
		// Test 13
		test("Delete an issue with invalid _id", function(done) {
			chai
				.request(server)
				.delete('/api/issues/test')
				.send({_id: fakeId })
				.end(function(err, res) {
						assert.equal(res.body.error, 'could not delete')
				})
				done()
		})
		// Test 14
		test("Delete an issue with missing _id", function(done) {
			chai
				.request(server)
				.delete('/api/issues/test')
				.send({})
				.end(function(err, res) {
						assert.equal(res.body.error, 'missing _id')
				})
				done()
		}) 
	})
});
