function pathFilename(path) {
	var match = /\/([^\/]+)$/.exec(path);
	if (match) {
		return match[1];
	}
}

function getRandomInt(min, max) {
	// via https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random#Examples
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(items) {
	return items[getRandomInt(0, items.length-1)];
}

var xkcd = {
	latest: null,
	last: null,
	cache: {},
	base: 'http://dynamic.xkcd.com/api-0/jsonp/comic/',
	get: function(num, success, error) {
		if (num == null) {
			path = '';
		} else if (Number(num)) {
			path = String(num);
		} else {
			error(false);
			return false;
		}
		
		if (num in this.cache) {
			this.last = this.cache[num];
			success(this.cache[num]);
		} else {
			return $.ajax({
				url: this.base+path,
				dataType: 'jsonp',
				success: $.proxy(function(data) {
					this.last = this.cache[num] = data;
					success(data);
				}, this),
				error: error});
		}
	}
};

var xkcdDisplay = TerminalShell.commands['display'] = function(terminal, path) {
	function fail() {
		terminal.print($('<p>').addClass('error').text('display: unable to open image "'+path+'": No such file or directory.'));
		terminal.setWorking(false);
	}
			
	if (path) {
		path = String(path);
		num = Number(path.match(/^\d+/));
		filename = pathFilename(path);
		
		if (num > xkcd.latest.num) {
			terminal.print("Time travel mode not enabled.");
			return;
		}
	} else {
		num = xkcd.last.num;
	}
	
	terminal.setWorking(true);
	xkcd.get(num, function(data) {
		if (!filename || (filename == pathFilename(data.img))) {
			$('<img>')
				.hide()
				.load(function() {
					terminal.print($('<h3>').text(data.num+": "+data.title));
					$(this).fadeIn();
					
					var comic = $(this);
					if (data.link) {
						comic = $('<a>').attr('href', data.link).append($(this));
					}
					terminal.print(comic);
					
					terminal.setWorking(false);
				})
				.attr({src:data.img, alt:data.title, title:data.alt})
				.addClass('comic');
		} else {
			fail();
		}
	}, fail);
};

TerminalShell.commands['next'] = function(terminal) {
	xkcdDisplay(terminal, xkcd.last.num+1);
};

TerminalShell.commands['previous'] =
TerminalShell.commands['prev'] = function(terminal) {
	xkcdDisplay(terminal, xkcd.last.num-1);
};

TerminalShell.commands['first'] = function(terminal) {
	xkcdDisplay(terminal, 1);
};

TerminalShell.commands['latest'] =
TerminalShell.commands['last'] = function(terminal) {
	xkcdDisplay(terminal, xkcd.latest.num);
};

TerminalShell.commands['random'] = function(terminal) {
	xkcdDisplay(terminal, getRandomInt(1, xkcd.latest.num));
};

TerminalShell.commands['goto'] = function(terminal, subcmd) {
	$('#screen').one('cli-ready', function(e) {
		terminal.print('Did you mean "display"?');
	});
	xkcdDisplay(terminal, 292);
};


TerminalShell.commands['sudo'] = function(terminal) {
	var cmd_args = Array.prototype.slice.call(arguments);
	cmd_args.shift(); // terminal
	if (cmd_args.join(' ') == 'make me a sandwich') {
		terminal.print('Okay.');
	} else {
		var cmd_name = cmd_args.shift();
		cmd_args.unshift(terminal);
		cmd_args.push('sudo');
		if (TerminalShell.commands.hasOwnProperty(cmd_name)) {
			this.sudo = true;
			this.commands[cmd_name].apply(this, cmd_args);
			delete this.sudo;
		} else if (!cmd_name) {
			terminal.print('sudo what?');
		} else {
			terminal.print('sudo: '+cmd_name+': command not found');
		}
	}
};

TerminalShell.filters.push(function (terminal, cmd) {
	if (/!!/.test(cmd)) {
		var newCommand = cmd.replace('!!', this.lastCommand);
		terminal.print(newCommand);
		return newCommand;
	} else {
		return cmd;
	}
});

TerminalShell.commands['shutdown'] = TerminalShell.commands['poweroff'] = function(terminal) {
	if (this.sudo) {
		terminal.print('Broadcast message from guest@xkcd');
		terminal.print();
		terminal.print('The system is going down for maintenance NOW!');
		return $('#screen').fadeOut();
	} else {
		terminal.print('Must be root.');
	}
};

TerminalShell.commands['logout'] =
TerminalShell.commands['exit'] = 
TerminalShell.commands['quit'] = function(terminal) {
	terminal.print('Bye.');
	$('#prompt, #cursor').hide();
	terminal.promptActive = false;
};

TerminalShell.commands['restart'] = TerminalShell.commands['reboot'] = function(terminal) {
	if (this.sudo) {
		TerminalShell.commands['poweroff'](terminal).queue(function(next) {
			window.location.reload();
		});
	} else {
		terminal.print('Must be root.');
	}
};

function linkFile(url) {
	return {type:'link', enter:function() {
		window.location = url;
	}};
}

 function dirFile(dirname) {
     return {type:'dir', enter:function() {
			       if ( dirname == 'events' ){			
			   		TerminalShell.pwd = Event_FS;
			   		Terminal.config.prompt = 'guest@dotSlash:/events$';
			   		Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'workshops'){
				   // edit
				   	TerminalShell.pwd = Workshop_FS;
				 		Terminal.config.prompt = 'guest@dotSlash:/workshops$';
				 		Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'sponsors'){
				   // edit
				   TerminalShell.pwd = Sponsors_FS;
				   Terminal.config.prompt = 'guest@dotSlash:/sponsors$';
				   Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'register'){
				   // edit
				   TerminalShell.pwd = Register_FS;
				   Terminal.config.prompt = 'guest@dotSlash:/register$';
				   Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'about'){
				   // edit
				   TerminalShell.pwd = About_FS;
				   Terminal.config.prompt = 'guest@dotSlash:/about$';
				   Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'contacts'){
				   // edit
				   TerminalShell.pwd = Contacts_FS;
				   Terminal.config.prompt = 'guest@dotSlash:/contacts$';
				   Terminal.updateInputDisplay(); 
			   }else{
					 Terminal.config.prompt = 'seriously_fucked$';
					 Terminal.updateInputDisplay();
			   }

	   }};
   }

  Event_FS = {		  
	  'a_la_carte': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('FUNCTION À LA CARTE'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
					'Shortcuts?? Not anymore!! Lets go back to the basics. Pre-defined functions has',
					'made programming easier & us, programmers lazier. So, its time to shirk that off &',
					'get back to the basics. Primitive is the flavour of the season!! Being programmers, we',
					'are obliged to be familiar with their implementations. Fun with Functions does just',
					'that!!!		  '
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# A maximum of 2 members are allowed in a team.'));
		terminal.print($('<p>').text('# Decision of judges will be final and binding.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('# Event tests your acquaintance with the basic functions.'));
		terminal.print($('<p>').text('# Prelims consists of questions pertinent to functions. It will be of 30 mins duration.'));
		terminal.print($('<p>').text('# Finals are conducted in 2 rounds :'));		
		$.each([
				'1st round – The contestants will be asked to code in a functional programming',
				'language with the help of a manual provided at the time of the test.',
				'2nd round – Expect questions regarding the implementation of some pre-defined',
				'functions like strcpy() , strstr() , etc.	  '
		  ], function(num, line) {
			  terminal.print(line);
		  });

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
	  
	  'step_by_step': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('STEP BY STEP CODING'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
		  		'Its is like the greek version of the ‘Amazing Race’. Every task ',
		  		'takes you to the next level, which opens up a greater challenge.',
		  		'Get ready to set your coding skills ablaze and test your ',
		  		'adaptability to dynamic requirements.',
		  		' Reach the zenith, one step at a time.'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# A maximum of 2 members are allowed in a team.'));
		terminal.print($('<p>').text('# Decision of judges will be final and binding.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('#Prelims comprise of C/C++ coding and debugging questions. It will be of 30 mins duration.'));
		terminal.print($('<p>').text('#Initially, each shortlisted team will be given a problem to solve. At equal intervals, they will be asked to incorporate an additional functionality to the solution.'));		
		$.each([
		'Eg:- A team is required to implement a car showroom, which initially deals only with',
		'selling cars. Later, they decide to open a new section, concerned with purchase of',
		'used cars and subsequently plan to provide Rent-a-car facility.',
		'If more than one team succeeds in completing the entire (most) set of tasks, it results',
		'in a tie, in which case the efficiency in implementation will be the criterion for',
		'deciding the winner.'
		  ], function(num, line) {
			  terminal.print(line);
		  });

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'parallel': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('PARALLEL PROGRAMMING'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([		  
		  '‘ALL THE WORLD’S A STAGE & ALL THE MEN AND WOMENS MEARLY',
			'PLAYERS’. Applies to coding too. The stage is set for parallel programming and',
			'individual member a role. The idea is ‘three brains work better than one’. And that is',
			'your task make the amalgamation work!! ',
			'Set the stage to find out the team with the best coordination and coding prowess.'		  
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# A maximum of 3 members are allowed in a team.'));
		terminal.print($('<p>').text('# Teams will not be allowed to sit together in the finals'));
		terminal.print($('<p>').text('# The time limits set for this event will be observed strictly.'));
		terminal.print($('<p>').text('# Any team taking more time than the time allotted to them will be disqualified'));
		terminal.print($('<p>').text('# Members of a teams will not be allowed to communicate with each other after the discussion time is over.'));
		terminal.print($('<p>').text('# Each member of the team can take note of the portion of the program that he has planned to complete.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		$.each([
		'Prelims – Expect questions, covering various aspects in C/C++ programming.',
		'A problem will be assigned to the team at first. The team members can discuss for a',
		'maximum of 5 minutes. Then, each member has to code a preplanned portion',
		'(function, class or like) of the bigger program in parallel. After the stipulated time,',
		'one member of the group is required to combine their code snippets into a single',
		'program that compiles successfully to give the desired output.',
		'The coordinators will transfer the individual code snippets into a single system after',
		'which one member of the team can integrate the program.',
		'Marks will be awarded depending on the clarity of the output, coordination between',
		'the team members, time taken and algorithm used.'
		  ], function(num, line) {
			  terminal.print(line);
		  });

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
	  
	  'web_designing': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('WEB DESIGNING AND DEVELOPMENT'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
		  'The ‘World Wide Web’ is one of the greatest inventions of the modern era and still',
			'evolving. Carve your niche in it.',
			'Creativity clubbed with technical know how. Prove your mettle in an outstanding test',
			'of creativity in an effort to capture minds with your enticing designs. Bring out the',
			'artist you. Let your imagination take flight!!'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# A maximum of 2 members are allowed in a team.'));
		terminal.print($('<p>').text('# Use of pen drives or any external data or scripts will lead to disqualification.'));
		terminal.print($('<p>').text('# Decision of judges will be final and binding.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('# There are no preliminary rounds for this event.'));
		terminal.print($('<p>').text('# The contestants will have to design a web page consisting of 4-6 pages and a logo based on the topic given.'));
		terminal.print($('<p>').text('# Available softwares - Dreamweaver, Flash and Photoshop Jquery will be available.'));
		terminal.print($('<p>').text('# Internet connectivity will not be provided.'));
		terminal.print($('<p>').text('# Skill and creativity in the design of the pages and logo will be the main criteria for selection.'));
		terminal.print($('<p>').text('# Knowledge of xhtml, php will be helpful.'));
		terminal.print($('<p>').text('# Stock images or videos will be provided.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
	 
	  'papers': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('PAPER PRESENTATION'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
					'A small idea is the birthplace of great accomplishments. Everything begins with an idea.',
					'This is an avenue to put forward yours. Do you have the courage to speak out, the power',
					'to transcend your opponents in reaching out to your listeners, then you have come to the',
					'right place - A test of presentation skills, body language and vocabulary.'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		  		  
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# The paper shall have a max of 2 authors.'));
		terminal.print($('<p>').text('# A team can present only a single paper of their choice.'));
		terminal.print($('<p>').text('# The abstract should be sent on or before 15th Feb.'));
		terminal.print($('<p>').text('# The decision of the judges would be final.'));
		
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  		
		$.each([
		'Each team is assigned a maximum of 20 mins, in which the first 15 mins is alloted for',
		'presentation and the remaining 5 mins is left to Q&A.',
		'Each team can select from the following topics :',
		'• Cloud computing',
		'• Networking',
		'• Architectures (many core, multi-threading etc ..)',
		'• Cryptography',
		'• Bio-informatics',
		'• Mobile computing',
		'• Artificial Intelligence',
		'• Green computing',
		'• Other topics will also be considered.'
		  ], function(num, line) {
			  terminal.print(line);
		  });

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
	  
	  'tech_quiz': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('TECHNICAL QUIZ'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		terminal.print($('<p>').text('Compete with the brightest minds and rate yourself in the ultimate quizzing challenge.'));
		  
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# A maximum of 2 members are allowed in a team.'));
		terminal.print($('<p>').text('# In case of any ambiguities or discrepancies the decision of the Quiz Master will be final.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('# All participants have to appear for a preliminary round from which only 6 teams will qualify for the final.'));
		terminal.print($('<p>').text('# The shortlisted contestants can expect questions mostly from the recent trends in the field of computer science.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'googly': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('GOOGLY'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
					'Some things man was never meant to know. For everything else there is google!!',
					'Do you think googling is easy.. Then this event is for you...'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('# A maximum of 2 members are allowed in a team.'));
		terminal.print($('<p>').text('# Teams will have to produce the exact reproduction of the question that is given to them from the internet.'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		$.each([
			'There will be no prelims.',
			'All teams will be given questions with varying difficulty.',
			'Questions will have marks assigned to them',
			'Team with the maximum marks will be declared the winner.',
			'In case of a tie, a tie breaker question will be given to the tied teams.',
			'The event will be conducted in 1 hour.'
		  ], function(num, line) {
			  terminal.print(line);
		  });

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'treasure_hunt': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('TREASURE HUNT'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
					'Be ready to think wild and experience the most grueling hunt for treasure.',
					'Your hunt for the virtual treasure and waltz of the glory.On our end,we assure you,',
					'we’ll open pandora’s box'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'dalal_bull': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('DALAL BULL'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
				'Bulls & Bears. Ask & Bid. Brokers. Dow Jones .Blue chips & Book values.If this dosent',
				'sound like a random gibberish to you,’dalal bull’ is the arena for you',
				'Wanna try your luck in the stock markets. Then start off by laying your hands on “ “',
				', the virtual stock exchange.'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'math_quiz': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('ONLINE MATH QUIZ'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
					'You thought it was all about zeros and ones ??',
					'We move ahead.To what according to many ,rules the world.Pure,un-udultered',
					'mathematics.For those out there ,who are mavericks with number,come in,get down &',
					'dirty!!',
					'Test your savvy in the amazing world of mathematics.'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('Will be updated soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'gaming': {type:'file', read:function(terminal) {		
						
		terminal.print($('<h3>').text('GAMING'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
					'Will be updated soon !'					
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('Will be updated soon !'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('Will be updated soon !'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
				
		'system_treasure': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('SYSTEM TREASURE HUNT'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
		  	'Unravel the mystery by treading through queer and treacherous paths where a single',
				'decision can make a substantial difference !!!',
				'The treasure is hidden in the computer network.',
				'Use your computer skills to find out the treasure..'				
		  ], function(num, line) {
			  terminal.print(line);
		  });
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Rules'));	  
		terminal.print($('<p>').text('Will be updated soon !'));
		
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Format'));	  
		terminal.print($('<p>').text('Will be updated soon !'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Prize'));	  
		terminal.print($('<p>').text('Will be announced soon'));

		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Coordinators'));	  
		terminal.print($('<p>').text('Will be updated soon'));
		}},
		
		'informals': {type:'file', read:function(terminal) {		
			
		terminal.print($('<h3>').text('INFORMAL EVENTS'));	
		terminal.print($('<br/>').text(''));
		terminal.print($('<h4>').text('Description'));	
		  $.each([
		  	'Informal Events:',
				'1) Man of the series - WAP to complete a number series',
				'2) Tech word hunt - like crosswords, tech dumb c,',
				'3) Photography',
				'4) Rubik’s Cube Solving',
				'5) Fastest texter - fast typing in mobile phone',
				'6) Type Master - faster typer using qwerty',
				'7) Reverse Chess',
				'     And many more exciting events……'
		  ], function(num, line) {
			  terminal.print(line);
		  });
		}},
  };

	Workshop_FS = {
	  'workshop': {type:'file', read:function(terminal) {	
	  	terminal.print($('<h3>').text('Welcome to '));
	  
		terminal.print();
		$.each([			                                                                           
			'  /                             /           /##                             ',
			'#/                            #/          #/ ###                            ',
			'##                            ##         ##   ###                     #     ',
			'##                            ##         ##                          ##     ',
			'##                            ##         ##                          ##     ',
			'##  /##      /###     /###    ##  /##    ###### /##       /###     ######## ',
			'## / ###    / ###  / / ###  / ## / ###   ##### / ###     / #### / ########  ',
			'##/   ###  /   ###/ /   ###/  ##/   /    ##   /   ###   ##  ###/     ##     ',
			'##     ## ##    ## ##         ##   /     ##  ##    ### ####          ##     ',
			'##     ## ##    ## ##         ##  /      ##  ########    ###         ##     ',
			'##     ## ##    ## ##         ## ##      ##  #######       ###       ##     ',
			'##     ## ##    ## ##         ######     ##  ##              ###     ##     ',
			'##     ## ##    /# ###     /  ##  ###    ##  ####    /  /###  ##     ##     ',
			'##     ##  ####/ ## ######/   ##   ### / ##   ######/  / #### /      ##     ',
			' ##    ##   ###   ## #####     ##   ##/   ##   #####      ###/        ##    ',
			'       /                                                                    ',
			'      /                                                                     ',
			'     /                                                                      ',
			'    /  '
		], function(num, line) {
			terminal.print(line);
		});
	}}
};

	Sponsors_FS = {
	  'sponsors.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome to the sponsors file.'));
		  //terminal.print('To navigate the system, enter "next", "prev", "first", "last", "display", or "random".');
		  terminal.print('Use "ls", "cat", and "cd" to navigate the filesystem.');
		  terminal.print('Most unix commands work (un)usually. ');
	  }},
	  'license.txt': {type:'file', read:function(terminal) {
		  terminal.print($('<p>').html('Client-side logic for Wordpress CLI theme :: <a href="http://thrind.xamai.ca/">R. McFarland, 2006, 2007, 2008</a>'));
		  terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://posterous.humanint.com/">yadudoc, 2011</a> and <a href="http://simula67.wordpress.com/">simula67, 2011</a>'));
		terminal.print();
		$.each([
			'This program is free software; you can redistribute it and/or',
			'modify it under the terms of the GNU General Public License',
			'as published by the Free Software Foundation; either version 2',
			'of the License, or (at your option) any later version.',
			'',
			'This program is distributed in the hope that it will be useful,',
			'but WITHOUT ANY WARRANTY; without even the implied warranty of',
			'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
			'GNU General Public License for more details.',
			'',
			'You should have received a copy of the GNU General Public License',
			'along with this program; if not, write to the Free Software',
			'Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.'
		], function(num, line) {
			terminal.print(line);
		});
	}}
};
  
  Register_FS = {
	  'welcome.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome dotslash registration '));
		  //terminal.print('To navigate the system, enter "next", "prev", "first", "last", "display", or "random".');
		  terminal.print('PLease register your seats immediately :)');
		  terminal.print('Most unix commands work (un)usually. ');
	  }},
	  'license.txt': {type:'file', read:function(terminal) {
		  terminal.print($('<p>').html('Client-side logic for Wordpress CLI theme :: <a href="http://thrind.xamai.ca/">R. McFarland, 2006, 2007, 2008</a>'));
		  terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://posterous.humanint.com/">yadudoc, 2011</a> and <a href="http://simula67.wordpress.com/">simula67, 2011</a>'));
		terminal.print();
		$.each([
			'This program is free software; you can redistribute it and/or',
			'modify it under the terms of the GNU General Public License',
			'as published by the Free Software Foundation; either version 2',
			'of the License, or (at your option) any later version.',
			'',
			'This program is distributed in the hope that it will be useful,',
			'but WITHOUT ANY WARRANTY; without even the implied warranty of',
			'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
			'GNU General Public License for more details.',
			'',
			'You should have received a copy of the GNU General Public License',
			'along with this program; if not, write to the Free Software',
			'Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.'
		], function(num, line) {
			terminal.print(line);
		});
	}}
};
  
  About_FS = {
	  'about.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome to the about file console.'));
		  //terminal.print('To navigate the system, enter "next", "prev", "first", "last", "display", or "random".');
		  terminal.print('Use "ls", "cat", and "cd" to navigate the filesystem.');
		  terminal.print('Most unix commands work (un)usually. ');
	  }},
	  'license.txt': {type:'file', read:function(terminal) {
		  terminal.print($('<p>').html('Client-side logic for Wordpress CLI theme :: <a href="http://thrind.xamai.ca/">R. McFarland, 2006, 2007, 2008</a>'));
		  terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://posterous.humanint.com/">yadudoc, 2011</a> and <a href="http://simula67.wordpress.com/">simula67, 2011</a>'));
		terminal.print();
		$.each([
			'This program is free software; you can redistribute it and/or',
			'modify it under the terms of the GNU General Public License',
			'as published by the Free Software Foundation; either version 2',
			'of the License, or (at your option) any later version.',
			'',
			'This program is distributed in the hope that it will be useful,',
			'but WITHOUT ANY WARRANTY; without even the implied warranty of',
			'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
			'GNU General Public License for more details.',
			'',
			'You should have received a copy of the GNU General Public License',
			'along with this program; if not, write to the Free Software',
			'Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.'
		], function(num, line) {
			terminal.print(line);
		});
	}}
};

	Contacts_FS = {
	  'contacts.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome to the contacts list.'));
		  //terminal.print('To navigate the system, enter "next", "prev", "first", "last", "display", or "random".');
		  terminal.print('Yaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaay');
		  terminal.print('Most unix commands work (un)usually. ');
	  }},
	  'yadu': {type:'file', read:function(terminal) {
		  terminal.print($('<p>').html('none'));
		  terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://posterous.humanint.com/">yadudoc, 2011</a> and <a href="http://simula67.wordpress.com/">simula67, 2011</a>'));
		terminal.print();
		$.each([
			'This program is free software; you can redistribute it and/or',
			'modify it under the terms of the GNU General Public License',
			'as published by the Free Software Foundation; either version 2',
			'of the License, or (at your option) any later version.',
			'',
			'This program is distributed in the hope that it will be useful,',
			'but WITHOUT ANY WARRANTY; without even the implied warranty of',
			'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
			'GNU General Public License for more details.',
			'',
			'You should have received a copy of the GNU General Public License',
			'along with this program; if not, write to the Free Software',
			'Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.'
		], function(num, line) {
			terminal.print(line);
		});
	}}
};
  Contacts_FS['yadunand'] = linkFile('http://posterous.humanint.com');
  
 
  Filesystem = {
	  'welcome.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome to the dotslash console.'));
		  //terminal.print('To navigate the system, enter "next", "prev", "first", "last", "display", or "random".');
		  terminal.print('Use "ls", "cat", and "cd" to navigate the filesystem.');
		  terminal.print('Most unix commands work (un)usually. ');
	  }},
	  'license.txt': {type:'file', read:function(terminal) {
		  terminal.print($('<p>').html('Client-side logic for Wordpress CLI theme :: <a href="http://thrind.xamai.ca/">R. McFarland, 2006, 2007, 2008</a>'));
		  terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://posterous.humanint.com/">yadudoc, 2011</a> and <a href="http://simula67.wordpress.com/">simula67, 2011</a>'));
		terminal.print();
		$.each([
			'This program is free software; you can redistribute it and/or',
			'modify it under the terms of the GNU General Public License',
			'as published by the Free Software Foundation; either version 2',
			'of the License, or (at your option) any later version.',
			'',
			'This program is distributed in the hope that it will be useful,',
			'but WITHOUT ANY WARRANTY; without even the implied warranty of',
			'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
			'GNU General Public License for more details.',
			'',
			'You should have received a copy of the GNU General Public License',
			'along with this program; if not, write to the Free Software',
			'Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.'
		], function(num, line) {
			terminal.print(line);
		});
	}}
};
	
Filesystem['events'] = dirFile('events');
Filesystem['workshops'] =dirFile('workshops');
Filesystem['sponsors'] =dirFile('sponsors');
Filesystem['register'] =dirFile('register');
Filesystem['about'] =dirFile('about');
Filesystem['contacts'] =dirFile('contacts');



TerminalShell.pwd = Filesystem;

TerminalShell.commands['cd'] = function(terminal, path) {
	if (path == '..'){
		// edit done right :P
		TerminalShell.pwd = Filesystem;
		Terminal.config.prompt = 'guest@dotSlash:/$';		
		Terminal.updateInputDisplay(); 
	}else{
			if (path in this.pwd) {
			if (this.pwd[path].type == 'link') {
				this.pwd[path].enter(terminal);
			}else if (this.pwd[path].type == 'dir') {
				this.pwd[path].enter(terminal);
			} else if (this.pwd[path].type == 'file') {
				terminal.print('cd: '+path+': Not a directory');
			}
		}else {
			terminal.print('cd: '+path+': No such file or directory');
		}	
	}
};

TerminalShell.commands['dir'] =
TerminalShell.commands['ls'] = function(terminal, path) {
	var name_list = $('<ul>');
	var flag_license = false ;
	$.each(this.pwd, function(name, obj) {		
		if (name == 'license.txt'){
			flag_license = true ;
			name = '';
		}
		if (obj.type == 'dir' | obj.type == 'link') {
			name += '/';
		}
		name_list.append($('<li>').text(name));	
	});
	if ( flag_license == true ){
		name_list.append($('<li>').text('license.txt'));
	}
	terminal.print(name_list);
};

TerminalShell.commands['cat'] = function(terminal, path) {
	if (path in this.pwd) {
		if (this.pwd[path].type == 'file') {
			this.pwd[path].read(terminal);
		} else if (this.pwd[path].type == 'dir') {
			terminal.print('cat: '+path+': Is a directory');
		}
	} else if (pathFilename(path) == 'alt.txt') {
		terminal.setWorking(true);
		num = Number(path.match(/^\d+/));
		xkcd.get(num, function(data) {
			terminal.print(data.alt);
			terminal.setWorking(false);
		}, function() {
			terminal.print($('<p>').addClass('error').text('cat: "'+path+'": No such file or directory.'));
			terminal.setWorking(false);
		});
	} else {
		terminal.print('You\'re a kitty!');
	}
};

TerminalShell.commands['rm'] = function(terminal, flags, path) {
	if (flags && flags[0] != '-') {
		path = flags;
	}
	if (!path) {
		terminal.print('rm: missing operand');
	} else if (path in this.pwd) {
		if (this.pwd[path].type == 'file') {
			delete this.pwd[path];
		} else if (this.pwd[path].type == 'dir') {
			if (/r/.test(flags)) {
				delete this.pwd[path];
			} else {
				terminal.print('rm: cannot remove '+path+': Is a directory');
			}
		}
	} else if (flags == '-rf' && path == '/') {
		if (this.sudo) {
			TerminalShell.commands = {};
		} else {
			terminal.print('rm: cannot remove /: Permission denied');
		}
	}
};

TerminalShell.commands['cheat'] = function(terminal) {
	terminal.print($('<a>').text('*** FREE SHIPPING ENABLED ***').attr('href', 'http://store.xkcd.com/'));
}; 

TerminalShell.commands['reddit'] = function(terminal, num) {
	num = Number(num);
	if (num) {
		url = 'http://xkcd.com/'+num+'/';
	} else {
		var url = window.location;
	}
	terminal.print($('<iframe src="http://www.reddit.com/static/button/button1.html?width=140&url='+encodeURIComponent(url)+'&newwindow=1" height="22" width="140" scrolling="no" frameborder="0"></iframe>'));
};

TerminalShell.commands['wget'] = TerminalShell.commands['curl'] = function(terminal, dest) {
	if (dest) {
		terminal.setWorking(true);
		var browser = $('<div>')
			.addClass('browser')
			.append($('<iframe>')
					.attr('src', dest).width("100%").height(600)
					.one('load', function() {
						terminal.setWorking(false);
					}));
		terminal.print(browser);
		return browser;
	} else {
		terminal.print("Please specify a URL.");
	}
};

TerminalShell.commands['write'] =
TerminalShell.commands['irc'] = function(terminal, nick) {
	if (nick) {
		$('.irc').slideUp('fast', function() {
			$(this).remove();
		});
		var url = "http://widget.mibbit.com/?server=irc.foonetic.net&channel=%23xkcd";
		if (nick) {
			url += "&nick=" + encodeURIComponent(nick);
		}
		TerminalShell.commands['curl'](terminal, url).addClass('irc');
	} else {
		terminal.print('usage: irc <nick>');
	}
};

TerminalShell.commands['unixkcd'] = function(terminal, nick) {
	TerminalShell.commands['curl'](terminal, "http://www.xkcd.com/unixkcd/");
};

TerminalShell.commands['apt-get'] = function(terminal, subcmd) {
	if (!this.sudo && (subcmd in {'update':true, 'upgrade':true, 'dist-upgrade':true})) {
		terminal.print('E: Unable to lock the administration directory, are you root?');
	} else {
		if (subcmd == 'update') {
			terminal.print('Reading package lists... Done');
		} else if (subcmd == 'upgrade') {
			if (($.browser.name == 'msie') || ($.browser.name == 'firefox' && $.browser.versionX < 3)) {
				terminal.print($('<p>').append($('<a>').attr('href', 'http://abetterbrowser.org/').text('To complete installation, click here.')));
			} else {
				terminal.print('This looks pretty good to me.');
			}
		} else if (subcmd == 'dist-upgrade') {
			var longNames = {'win':'Windows', 'mac':'OS X', 'linux':'Linux'};
			var name = $.os.name;
			if (name in longNames) {
				name = longNames[name];
			} else {
				name = 'something fancy';
			}
			terminal.print('You are already running '+name+'.');
		} else if (subcmd == 'moo') {
			terminal.print('        (__)');
			terminal.print('        (oo)');
			terminal.print('  /------\\/ ');
			terminal.print(' / |    ||  ');
			terminal.print('*  /\\---/\\  ');
			terminal.print('   ~~   ~~  '); 
			terminal.print('...."Have you mooed today?"...');
		} else if (!subcmd) {
			terminal.print('This APT has Super Cow Powers.');
		} else {
			terminal.print('E: Invalid operation '+subcmd);
		}
	}
};

function oneLiner(terminal, msg, msgmap) {
	if (msgmap.hasOwnProperty(msg)) {
		terminal.print(msgmap[msg]);
		return true;
	} else {
		return false;
	}
}

TerminalShell.commands['man'] = function(terminal, what) {
	pages = {
		'last': 'Man, last night was AWESOME.',
		'help': 'Man, help me out here.',
		'next': 'Request confirmed; you will be reincarnated as a man next.',
		'cat':  'You are now riding a half-man half-cat.'
	};
	if (!oneLiner(terminal, what, pages)) {
		terminal.print('Oh, I\'m sure you can figure it out.');
	}
};

TerminalShell.commands['locate'] = function(terminal, what) {
	keywords = {
		'ninja': 'Ninja can not be found!',
		'keys': 'Have you checked your coat pocket?',
		'joke': 'Joke found on user.',
		'problem': 'Problem exists between keyboard and chair.',
		'raptor': 'BEHIND YOU!!!'
	};
	if (!oneLiner(terminal, what, keywords)) {
		terminal.print('Locate what?');
	}
};

Adventure = {
	rooms: {
		0:{description:'You are at a computer using dotslash.', exits:{west:1, south:10}},
		1:{description:'Life is peaceful there.', exits:{east:0, west:2}},
		2:{description:'In the open air.', exits:{east:1, west:3}},
		3:{description:'Where the skies are blue.', exits:{east:2, west:4}},
		4:{description:'This is what we\'re gonna do.', exits:{east:3, west:5}},
		5:{description:'Sun in wintertime.', exits:{east:4, west:6}},
		6:{description:'We will do just fine.', exits:{east:5, west:7}},
		7:{description:'Where the skies are blue.', exits:{east:6, west:8}},
		8:{description:'This is what we\'re gonna do.', exits:{east:7}},
		10:{description:'A dark hallway.', exits:{north:0, south:11}, enter:function(terminal) {
				if (!Adventure.status.lamp) {
					terminal.print('You are eaten by a grue.');
					Adventure.status.alive = false;
					Adventure.goTo(terminal, 666);
				}
			}
		},
		11:{description:'Bed. This is where you sleep.', exits:{north:10}},
		666:{description:'You\'re dead!'}
	},
	
	status: {
		alive: true,
		lamp: false
	},
	
	goTo: function(terminal, id) {
		Adventure.location = Adventure.rooms[id];
		Adventure.look(terminal);
		if (Adventure.location.enter) {
			Adventure.location.enter(terminal);
		}
	}
};
Adventure.location = Adventure.rooms[0];

TerminalShell.commands['look'] = Adventure.look = function(terminal) {
	terminal.print(Adventure.location.description);	
	if (Adventure.location.exits) {
		terminal.print();
		
		var possibleDirections = [];
		$.each(Adventure.location.exits, function(name, id) {
			possibleDirections.push(name);
		});
		terminal.print('Exits: '+possibleDirections.join(', '));
	}
};

TerminalShell.commands['go'] = Adventure.go = function(terminal, direction) {
	if (Adventure.location.exits && direction in Adventure.location.exits) {
		Adventure.goTo(terminal, Adventure.location.exits[direction]);
	} else if (!direction) {
		terminal.print('Go where?');
	} else if (direction == 'down') {
		terminal.print("On our first date?");
	} else {
		terminal.print('You cannot go '+direction+'.');
	}
};

TerminalShell.commands['light'] = function(terminal, what) {
	if (what == "lamp") {
		if (!Adventure.status.lamp) {
			terminal.print('You set your lamp ablaze.');
			Adventure.status.lamp = true;
		} else {
			terminal.print('Your lamp is already lit!');
		}
	} else {
		terminal.print('Light what?');
	}
};

TerminalShell.commands['sleep'] = function(terminal, duration) {
	duration = Number(duration);
	if (!duration) {
		duration = 5;
	}
	terminal.setWorking(true);
	terminal.print("You take a nap.");
	$('#screen').fadeOut(1000);
	window.setTimeout(function() {
		terminal.setWorking(false);
		$('#screen').fadeIn();
		terminal.print("You awake refreshed.");
	}, 1000*duration);
};

// No peeking!
TerminalShell.commands['help'] = TerminalShell.commands['halp'] = function(terminal) {
	terminal.print('That would be cheating!');
}; 

TerminalShell.fallback = function(terminal, cmd) {
	oneliners = {
		'make me a sandwich': 'What? Make it yourself.',
		'make love': 'I put on my robe and wizard hat.',
		'i read the source code': '<3',
		'pwd': 'You are in a maze of twisty passages, all alike.',
		'lpr': 'PC LOAD LETTER',
		'hello joshua': 'How about a nice game of Global Thermonuclear War?',
		'xyzzy': 'Nothing happens.',
		'date': 'March 32nd',
		'hello': 'Why hello there!',
		'who': 'Doctor Who?',
		'xkcd': 'Yes?',
		'su': 'God mode activated. Remember, with great power comes great ... aw, screw it, go have fun.',
		'fuck': 'I have a headache.',
		'whoami': 'You are Richard Stallman.',
		'nano': 'Seriously? Why don\'t you just use Notepad.exe? Or MS Paint?',
		'top': 'It\'s up there --^',
		'moo':'moo',
		'ping': 'There is another submarine three miles ahead, bearing 225, forty fathoms down.',
		'find': 'What do you want to find? Kitten would be nice.',
		'hello':'Hello.','more':'Oh, yes! More! More!',
		'your gay': 'Keep your hands off it!',
		'hi':'Hi.','echo': 'Echo ... echo ... echo ...',
		'bash': 'You bash your head against the wall. It\'s not very effective.','ssh': 'ssh, this is a library.',
		'uname': 'Illudium Q-36 Explosive Space Modulator',
		'finger': 'Mmmmmm...',
		'kill': 'Terminator deployed to 1984.',
		'use the force luke': 'I believe you mean source.',
		'use the source luke': 'I\'m not luke, you\'re luke!',
		'serenity': 'You can\'t take the sky from me.',
		'enable time travel': 'TARDIS error: Time Lord missing.',
		'ed': 'You are not a diety.'
	};
	oneliners['emacs'] = 'You should really use vim.';
	oneliners['vi'] = oneliners['vim'] = 'You should really use emacs.';
	
	cmd = cmd.toLowerCase();
	if (!oneLiner(terminal, cmd, oneliners)) {
		if (cmd == "asl" || cmd == "a/s/l") {
			terminal.print(randomChoice([
				'2/AMD64/Server Rack',
				'328/M/Transylvania',
				'6/M/Battle School',
				'48/M/The White House',
				'7/F/Rapture',
				'Exactly your age/A gender you\'re attracted to/Far far away.',
				'7,831/F/Lothlórien',
				'42/M/FBI Field Office'
			]));
		} else if  (cmd == "hint") {
			terminal.print(randomChoice([
 				'We offer some really nice polos.',
 				$('<p>').html('This terminal will remain available at <a href="http://xkcd.com/unixkcd/">http://xkcd.com/unixkcd/</a>'),
 				'Use the source, Luke!',
 				'There are cheat codes.'
 			]));
		} else if (cmd == 'find kitten') {
			terminal.print($('<iframe width="800" height="600" src="http://www.robotfindskitten.net/rfk.swf"></iframe>'));
		} else if (cmd == 'buy stuff') {
			Filesystem['store'].enter();
		} else if (cmd == 'time travel') {
			xkcdDisplay(terminal, 630);
		} else if (/:\(\)\s*{\s*:\s*\|\s*:\s*&\s*}\s*;\s*:/.test(cmd)) {
			Terminal.setWorking(true);
		} else {
			$.get("/unixkcd/missing", {cmd: cmd});
			return false;
		}
	}
	return true;
};

var konamiCount = 0;
$(document).ready(function() {
	Terminal.promptActive = true;	
	function noData() {
		Terminal.print($('<p>').addClass('error').text('Unable to load startup data. :-('));
		Terminal.promptActive = true;
	}
	$('#screen').bind('cli-load', function(e) {
		/*xkcd.get(null, function(data) {
			if (data) {
				xkcd.latest = data;
				$('#screen').one('cli-ready', function(e) {
					//edit
					Terminal.runCommand('cat welcome.txt');
				});
				// edit
				//Terminal.runCommand('display '+xkcd.latest.num+'/'+pathFilename(xkcd.latest.img));
				//Terminal.runCommand('cat welcome.txt');
			} else {
				noData();
			}
		}, noData);*/
		    
		   
		 $.each([		
		 
                                                                                     
'         88                                  88                         88           ',
'         88                ,d                88                         88           ',
'         88                88                88                         88           ',
' ,adPPYb,88   ,adPPYba,  MM88MMM  ,adPPYba,  88  ,adPPYYba,  ,adPPYba,  88,dPPYba,   ',
'a8"    `Y88  a8"     "8a   88     I8[    ""  88  ""     `Y8  I8[    ""  88P\'    "8a  ',
'8b       88  8b       d8   88      `"Y8ba,   88  ,adPPPPP88   `"Y8ba,   88       88  ',
'"8a,   ,d88  "8a,   ,a8"   88,    aa    ]8I  88  88,    ,88  aa    ]8I  88       88  ',
' `"8bbdP"Y8   `"YbbdP"\'    "Y888  `"YbbdP"\'  88  `"8bbdP"Y8  `"YbbdP"\'  88       88  ',
''
], function(num, line) {
			Terminal.print(line);
		});                                                                               

	Terminal.runCommand('cat welcome.txt');
	}
	);
	
	$(document).konami(function(){
		function shake(elems) {
			elems.css('position', 'relative');
			return window.setInterval(function() {
				elems.css({top:getRandomInt(-3, 3), left:getRandomInt(-3, 3)});
			}, 100);	
		}
		
		if (konamiCount == 0) {
			$('#screen').css('text-transform', 'uppercase');
		} else if (konamiCount == 1) {
			$('#screen').css('text-shadow', 'gray 0 0 2px');
		} else if (konamiCount == 2) {
			$('#screen').css('text-shadow', 'orangered 0 0 10px');
		} else if (konamiCount == 3) {
			shake($('#screen'));
		} else if (konamiCount == 4) {
			$('#screen').css('background', 'url(/unixkcd/over9000.png) center no-repeat');
		}
		
		$('<div>')
			.height('100%').width('100%')
			.css({background:'white', position:'absolute', top:0, left:0})
			.appendTo($('body'))
			.show()
			.fadeOut(1000);
		
		if (Terminal.buffer.substring(Terminal.buffer.length-2) == 'ba') {
			Terminal.buffer = Terminal.buffer.substring(0, Terminal.buffer.length-2);
			Terminal.updateInputDisplay();
		}
		TerminalShell.sudo = true;
		konamiCount += 1;
	});
});
