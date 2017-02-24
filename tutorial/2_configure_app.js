app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

app.use(cookieparser());
app.use(session({secret: 'damieneSessionSecretValueBro', resave: true, saveUninitialized: true}));

app.use('/static', express.static('static'));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/chat_app');
