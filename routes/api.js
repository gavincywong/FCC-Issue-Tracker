'use strict';

module.exports = function(app) {
	let mongoose = require('mongoose')
	let mongodb = require('mongodb')

	mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

	var issuesSchema = new mongoose.Schema({
		issue_title: { type: String, required: true },
		issue_text: { type: String, required: true },
		created_by: { type: String, required: true },
		assigned_to: String,
		status_text: String,
		open: { type: Boolean, required: true },
		created_on: { type: Date, required: true },
		updated_on: { type: Date, required: true },
		project: String
	})

	var Issues = mongoose.model("Issues", issuesSchema)

	app.route('/api/issues/:project')

		.get(function(req, res) {
			let project = req.params.project;
			let projectQuery = Object.assign(req.query)
			projectQuery['project'] = project
			if (project) {
				Issues.find(projectQuery, function(err, data) {
					if (!err && data) return res.json(data)
				})
			}
		})

		.post(function(req, res) {
			let project = req.params.project;
			let newIssue = new Issues({
				issue_title: req.body.issue_title,
				issue_text: req.body.issue_text,
				created_by: req.body.created_by,
				assigned_to: req.body.assigned_to || '',
				status_text: req.body.status_text || '',
				open: true,
				created_on: new Date().toUTCString(),
				updated_on: new Date().toUTCString(),
				project: project
			})

			newIssue.save(function(err, data) {
				if (err) {
					console.error(err)
					res.json({ error: 'required field(s) missing' })
				}

				res.json(data)
			})
		})

		.put(function(req, res) {
			let project = req.params.project;
			let id = req.body._id
			let updateObj = {}

			if (!id) {
				res.json({ error: 'missing _id' })
			} else {
				if (project) {
					if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.status_text) {
						console.log("Error: no update field sent")
						res.json({ error: 'no update field(s) sent', '_id': id })
					} else {

						for (let i=0; i< req.body.length; i++) {
								updateObj[i] = req.body[i]
						}
						/*
						Object.keys(req.body).forEach((key) => {
							updateObj[key] = req.body[key]
						}) */

						updateObj['updated_on'] = new Date().toUTCString()
						Issues.findByIdAndUpdate(id, updateObj, { new: true }, function(err, data) {
							if (err || !data) {
								console.error(err)
								res.json({ error: 'could not update', '_id': id })
							} else {
								res.json({ result: 'successfully updated', '_id': id })
							}
						})
					}
				}
			}
		})

		.delete(function(req, res) {
			let project = req.params.project;
			let id = req.body._id

			if (!id) {
				res.json({ error: 'missing _id' })
			} else {
				Issues.findByIdAndRemove(id, function(err, data) {
					if (err || !data) {
						console.error(err)
						res.json({ error: 'could not delete', '_id': id })
					} else {
						res.json({ result: 'successfully deleted', '_id': id })
					}
				})
			}
		});
};
