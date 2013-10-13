

var test = require('tape');
var ago = require('ago');
var yt = require('../lib');
var creds;

try {
  var creds = require('./credentials');
} 
catch (e) {
  console.log("skipping analytics, credentials.json is missing from test dir");
  console.log("credentials.json format: \n\n" +
'{ "client_id": "from https://code.google.com/apis/console"\n' +
', "client_secret": "from https://code.google.com/apis/console"\n' +
', "refresh_token": "returned after auth prompt"\n' +
', "access_token": "returned after auth prompt"\n' +
', "channel_id": "UCeDAMjAoztnS2WYGLzB2P_w" }\n'
    );
}

if (creds) {
  test(function (t) {
    t.plan(1);

    var auth = new yt.OAuth2Client(creds.client_id, creds.client_secret);
    auth.credentials = {
      access_token: creds.access_token,
      refresh_token: creds.refresh_token
    };

    var analytics = yt
    .analytics()
    .channel(creds.channel_id)
    .startDate(ago(1, 'months'))
    .endDate(new Date())
    .metrics(['likes']);

    yt
    .query(analytics)
    .oauth(auth)
    .run(function (err, results) {
      t.notOk(err, "no error");
    });
  });
}
