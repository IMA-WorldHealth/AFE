/**
* Subprojects Controller
*
* This is responsible for all CRUD routes concerning a subproject.
*/

var db = require('../lib/db').db;

// module exports
exports.create = create;
exports.read = read;
exports.update = update;
exports.delete = del;

// POST /projects/:projectId/subprojects
function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body;

  sql =
    'INSERT INTO subproject (projectid, label) VALUES (?, ?);';

  db.async.run(sql, req.params.projectId, data.id)
  .then(function () {
    res.status(200).send(this.lastID);
  }.bind(db))
  .catch(next)
  .done();
}

// GET /projects/:projectId/subprojects/:id?
function read(req, res, next) {
  'use strict';
  
  var sql,
      hasId = (req.params.id !== undefined);

  sql =
    'SELECT s.id, s.projectid, s.label ' +
    'FROM subproject AS s WHERE ' +
      's.projectid = ?';

  if (hasId) {
    sql += ' AND s.id = ?;';
  }

  db.async.all(sql, [req.params.projectid, req.params.id])
  .then(function (rows) {
    if (hasId && !rows.length) {
      return res.status(404).json();
    }

    res.status(200).json(hasId ? rows[0] : rows);
  })
  .catch(next)
  .done();
}

// PUT /projects/:projectId/subprojects/:id
function update(req, res, next) {
  'use strict';

  var sql,
      data = req.body;

  sql =
    'UPDATE subproject SET projectid = ?, label = ? WHERE id = ?';

  db.async.run(sql, req.params.projectid, data.label, req.params.id)
  .then(function () {
    res.status(200).send(this.changes);
  }.bind(db))
  .catch(next)
  .done();
}

// DELETE /projects/:projectId/subprojects/:id
function del(req, res, next) {
  'use strict';

  var sql;

  sql =
    'DELETE FROM subproject WHERE projectid = ? AND id = ?;';

  db.async.run(sql, req.params.projectid, req.params.id)
  .then(function () {
    res.status(200).send(this.changes);
  }.bind(db))
  .catch(next)
  .done();
}