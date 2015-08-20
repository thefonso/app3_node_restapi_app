//CALL PACKAGES
var User = require('./app/models/user');
var express			= require('express');
var app 				= express();
var bodyParser 	= require('body-parser');
var morgan			= require('morgan');
var mongoose		= require('mongoose');
var port 				= process.env.PORT || 8080;

//connect to DB on mongolab
mongoose.connect('mongodb://fonso:fonsonode1@ds031681.mongolab.com:31681/lothlorien');


//APP CONFIG
//use bodyParser to grab info from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//configure to handle cross-site HTTP request. 
//this allows any domain to access the API.
app.use(function(request, response, next){
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

//log all request to console
app.use(morgan('dev'));

//API ROUTES
//root route
app.get('/', function(request,response){
	response.send('Homepage says hello ^_^');
});

// ROUTES FOR OUR API
//start express instance
var apiRouter = express.Router();


// middleware to use for all requests
apiRouter.use(function(request, response, next) {

	console.log('Somebody just visited the app!');
	//this is where authentication of users will happen later
	next();

});


//test route to verify working
//accessed at GET http:/localhost:8080/api
apiRouter.get('/', function(request, response){
	response.json({ message:'the api url works'});
});


// on routes that end in /users
apiRouter.route('/users')

	//CREATE a user (at POST http://localhost:8080/api/users)
	.post(function(request, response){
		
		//instantiate the User model included on line #2 above
		var user = new User();

		//set incoming user info...what would come in from a form for example
		user.name = request.body.name;
		user.username = request.body.username;
		user.password = request.body.password;

		user.save(function(error){
			if(error){
				if(error.code == 11000) //duplicate entry code
					return response.json({ success: false, message: 'A user with that name already exists. '});
				else
					return response.send(error);
			}
				response.json({message: 'User created.'});
		});
	})
	//GET all users (at GET http://localhost:8080/api/users)
	.get(function(request, response){
		User.find(function(error, users){
			if(error)response.send(error);
			//return users
			response.json(users);
		});
	});


// on routes that end in /users/:user_id
apiRouter.route('/users/:user_id')

	//GET specific user (at GET http:/localhost:8080/api/users/:user_id)
	.get(function(request, response){
		User.findById(request.params.user_id, function(error, user){
			if(error)response.send(error);
			response.json(user);
		});
	})
	//UPDATE specific user (at GET http:/localhost:8080/api/users/:user_id)
	.put(function(request, response){
		User.findById(request.params.user_id, function(error, user){
			if(error)response.send(error);
			
			//update user only if new
			if(request.body.name) user.name = request.body.name;
			if(request.body.username) user.username = request.body.username;
			if(request.body.password) user.password = request.body.password;

			//now save the user
			user.save(function(error){
				if(error) response.send(error);
				response.json({message: 'User updated!'});
			});
		});
	})
	//DELETE specific user (at GET http:/localhost:8080/api/users/:user_id)
	.delete(function(request, response){
		User.remove({
			_id: request.params.user_id
		}, function(error, user){
			if(error)return response.send(error);
			response.json({message:'Successfully deleted'});
		});
	});

//all routes prefixed with /api
app.use('/api', apiRouter);

//START SERVER and listen on console
app.listen(port);
console.log('Fonos Node App is on port ' + port);