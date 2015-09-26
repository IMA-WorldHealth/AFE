var db = require('../lib/db').db,
    crypto = require('crypto');

// exposed routes
exports.signup = signup;
exports.getUsers = getUsers;
exports.getUsersById = getUsersById;
exports.updateUsers = updateUsers;
exports.accountRecovery = accountRecovery;

// POST /users
function signup(req, res, next) {
  'use strict';

  // TODO
  var sql =
    'INSERT INTO user (username, email, password, roleid) VALUES (?, ?, ?, ?);';

}

// GET /users
function getUsers(req, res, next) {
  'use strict';

  var sql =
    'SELECT user.id, user.username, user.displayname, user.email, ' +
    'role.label AS role, user.hidden, user.lastactive ' +
    'FROM user JOIN role ON user.roleid = role.id;';

  db.async.all(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

// GET /users/:id
function getUsersById(req, res, next) {
  'use strict';

  var sql =
    'SELECT user.id, user.displayname, user.username, user.email, ' +
    'role.label AS role, hidden, avatar ' +
    'FROM user JOIN role ON user.roleid = role.id ' +
    'WHERE user.id = ?;';

  db.async.get(sql, req.params.id)
  .then(function (row) {
    if (!row) { return res.status(404).json(); }
    res.status(200).json(row);
  })
  .catch(next)
  .done();
}

// PUT /users/:id
function updateUsers(req, res, next) {
  'use strict';

  var sql, shasum;

  // TODO - super user override
  if (req.params.id !== req.session.user.id) {
    res.status(403).json({
      code : 'ERR_RESTRICTED_OPERATION',
      reason : 'Users can only edit their own personal information'
    });
  }

  // hash password with sha256 and store in db
  shasum = crypto.createHash('sha256').update(req.body.password).digest('hex');

  // TODO - ensure unique usernames
  sql =
    'UPDATE user SET username = ?, password = ?, email = ? WHERE id = ?;';

  db.run(sql, [req.body.username, shasum, req.body.email, req.params.id], function (err) {
    if (err) { return res.status(500).json(err); }
    res.status(200).send();
  });
}

// POST /users/accountrecovery
function accountRecovery(req, res, next) {
  'use strict';

  var sql =
    'SELECT id, username, email FROM user WHERE email = ?;';

  db.async.get(sql, [req.body.email])
  .then(function (row) {

    // no data (NOT FOUND)
    if (!row) { return res.status(404).json(); }

    // success
    // TODO - code to send email
    res.status(200).json(row);
  })
  .catch(next)
  .done();
}
