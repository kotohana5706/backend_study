var FacebookTokenStrategy = require('passport-facebook-token')

function init(app, randomstring, passport, Users, multer) {
    var filedisk = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/')
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname)
        }
    })
    var upload = multer({storage: filedisk})

    passport.use(new FacebookTokenStrategy({
        clientID: "1649437005348937",
        clientSecret: "5452e5edeb1623b12b87efd4692feb98",
        profileFields: ['id', 'displayName', 'photos'],
    }, function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        Users.findOne({'id': profile.id}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new Users({
                    id: profile.id,
                    name: profile.displayName,
                    profile: profile.photos[0].value,
                    token: randomstring.generate()
                });

                user.save(function (err) {
                    if (err) console.log(err);
                    else done(null, user);
                })
            } else done(null, user)
        })
    }))

    app.get('/auth/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
        if (req.err) res.send(500)
        if (req.user) res.send(200, req.user)
    }).post('/profile/update', upload.any(), (req, res) => {
        // for(i in req.files){
        //     console.log(req.files[i])
        // }
        console.log(req.files)
    })

}

module.exports = init;