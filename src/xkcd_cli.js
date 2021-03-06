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

// Edits

TerminalShell.commands['l33t'] = function(terminal) {
	terminal.print('if u c4n r34d th1s u r34lly n33d t0 g37 141d...');
};

TerminalShell.commands['next'] = function(terminal) {
	terminal.print('Hey..hey, take it slow');
};

TerminalShell.commands['previous'] =
TerminalShell.commands['prev'] = function(terminal) {
	terminal.print('I\'m not a taperecorder');
};

TerminalShell.commands['first'] = function(terminal) {
	terminal.print('At the beginning of it all, there was init');
};

TerminalShell.commands['last'] = function(terminal) {
	terminal.print('My last wish is to die on apache');
};

TerminalShell.commands['random'] = function(terminal) {
	terminal.print('Take 4, I dropped a die and it showed 4, thats random right ?');
};

TerminalShell.commands['goto'] = function(terminal, subcmd) {
	terminal.print('Didn\'t you hear, goto is bad');
};

//TerminalShell.commands['startx'] = window.url("http://www.google.com");

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
		terminal.print('Broadcast message from guest@dbpb');
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

// Content based 
function dirFile(dirname) {
     return {type:'dir', enter:function() {
			       if ( dirname == 'how_dare_they' ){			
			   		TerminalShell.pwd = HOW_FS;
			   		Terminal.config.prompt = 'guest@dbpb:/how_dare_they$';
			   		Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'you\'re_a_douche'){
				   // edit
				   	TerminalShell.pwd = YOURE_FS;
				 		Terminal.config.prompt = 'guest@dbpb:/you\'re_a_douche$';
				 		Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'hilarious'){
				   // edit
				   TerminalShell.pwd = HILARIOUS_FS;
				   Terminal.config.prompt = 'guest@dbpb:/hilarious$';
				   Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'i_like_this'){
				   // edit
				   TerminalShell.pwd = ILIKE_FS;
				   Terminal.config.prompt = 'guest@dbpb:/i_like_this$';
				   Terminal.updateInputDisplay(); 
			   }else if ( dirname == 'umm,wtf?!'){
				   // edit
				   TerminalShell.pwd = UMM_FS;
				   Terminal.config.prompt = 'guest@dbpb:/umm,wtf?!$';
				   Terminal.updateInputDisplay(); 			  
			   }else{
					 Terminal.config.prompt = 'seriously_fucked$';
					 Terminal.updateInputDisplay();
			   }

	   }};
   }

HOW_FS = {
'Dear_Girlfriend' : {type:'file', read:function(terminal) {
terminal.print('   Please dont use my 12 month deployment into Afghanistan as an ');
terminal.print(' excuse to dump me. ');
terminal.print(' Sincerely, Just trying to provide for you ');
}} ,


'Dear_mom' : {type:'file', read:function(terminal) {
terminal.print('   Thanks for the lung cancer I now have from your ');
terminal.print('   second hand smoke. The doctors say I have a year, enjoy ');
terminal.print(' your three packs a day. ');
terminal.print(' Sincerely, your daughter. ');
}} ,


'Dear_whoever_just_b' : {type:'file', read:function(terminal) {
terminal.print('   Please enjoy my complete collection of U2 CDs, especially the anniversary ');
terminal.print('   editions of the Joshua Tree and the Unforgettable Fire. I hope ');
terminal.print('   you appreciate all the autographed, scratched up Jars of Clay albums ');
terminal.print('   that were my favorite when I was 14. I hope ');
terminal.print('   you appreciate the CDs that were given to me at important ');
terminal.print('   times in my life. I hope you appreciate how much it ');
terminal.print('   cost me to track down those Damien Rice albums, and please ');
terminal.print('   enjoy some of Damien Rices choice lyrics that I would like ');
terminal.print('   to dedicate to you. I hope you appreciate what you just ');
terminal.print('   did to my views of that part of Nashville. I hope ');
terminal.print('   you love Over the Rhine, Tchaikovsky, and the Decemberists, because thats ');
terminal.print('   what you got. I hope you appreciate how much Im going ');
terminal.print('   to have to pay to get a new window. Truth ');
terminal.print('   is, youre not going to get much for them, because they ');
terminal.print('   wont be worth anything to anyone except me. Thanks a lot. ');
terminal.print(' Sincerely, one of the nicest people ever ');
}} ,


'Dear_mother' : {type:'file', read:function(terminal) {
terminal.print('   Please realize it wasnt a phase, and it still hurts ');
terminal.print(' that you think it is. ');
terminal.print(' Sincerely, Your gay son ');
}} ,


'Dear_Ex-Boyfriend' : {type:'file', read:function(terminal) {
terminal.print('   Changing your relationship status to "single" on Facebook is not a ');
terminal.print(' good way to break up with someone. ');
terminal.print(' Sincerely, All you had to do was tell me ');
}} ,


'Dear_father' : {type:'file', read:function(terminal) {
terminal.print('   Please stop making my little brother want to commit suicide. ');
terminal.print('   A 10 year old should not be putting a knife to ');
terminal.print(' his throat. ');
terminal.print('   Sincerely, your daughter who had to put up with this ');
terminal.print(' same stuff. ');
}} ,


'Dear_future_in-laws' : {type:'file', read:function(terminal) {
terminal.print('   Please grow up and realize that you only get one ');
terminal.print('   life. Its unacceptable to not come to your own sons wedding. ');
terminal.print('   Barring a death in the family, there is no other excuse ');
terminal.print('   not to show up. Thanks for breaking my future husbands heart. ');
terminal.print(' Sincerely, Apparently un-welcome future daughter-in-law ');
}} ,


'Dear_boyfriend' : {type:'file', read:function(terminal) {
terminal.print('   Thank you for moving me 1,000 miles away from my ');
terminal.print('   family and friends to this dumpy town after you got transferred. ');
terminal.print('   Also, thanks for cheating on me and getting herpes. Super awesome. ');
terminal.print(' Sincerely, done with you. ');
}} ,


'Dear_Nice_Loving_Fa' : {type:'file', read:function(terminal) {
terminal.print('   I dont want to be Christian anymore. I know that ');
terminal.print('   means you all wont love me anymore, as you explicitly said ');
terminal.print(' at the dinner table, so Ill leave now. ');
terminal.print(' Sincerely, your Daughter ');
}} ,


'Dear_best_friend' : {type:'file', read:function(terminal) {
terminal.print('   Please stop telling me I have small boobs. I am ');
terminal.print('   a B cup. You are only a C cup because you ');
terminal.print('   are a lot heavier than I am. Maybe you are insecure, ');
terminal.print('   but you have nothing to be insecure about and youre hurting ');
terminal.print(' me. ');
terminal.print(' Sincerely, considering a boob job now ');
}} ,


'Dear_first_love' : {type:'file', read:function(terminal) {
terminal.print('   Please stop flirting with me. Ive loved you since 1993. ');
terminal.print('   Now youre married with 3 kids. Every time you say something ');
terminal.print('   sweet and endearing, my heart breaks a little more. Enough now. Enough. ');
terminal.print(' Sincerely, Heartbroken Girl ');
}} ,


'Dear_fellow_classma' : {type:'file', read:function(terminal) {
terminal.print('   Please stop trying to be my friend on Facebook. You ');
terminal.print('   hated me 20 years ago. You terrorized me. You made fun ');
terminal.print('   of me, threw things at me and vandalized my house. What ');
terminal.print('   makes you think all is forgiven and Im ready to be ');
terminal.print(' your buddy now? ');
terminal.print(' Sincerely, Still Bitter ');
}} ,


'Dear_My_Cheat_of_a_' : {type:'file', read:function(terminal) {
terminal.print('   Yeah I found all your letters to your lover. I ');
terminal.print('   read your texts too. This isnt gonna work out any more. ');
terminal.print(' Sincerely, Daddy-loving Daughter ');
}} ,


'Dear_government' : {type:'file', read:function(terminal) {
terminal.print('   Please stop cutting my job at the library. I read ');
terminal.print('   to children, help old people use computers, and make suicidal teens ');
terminal.print('   feel accepted just so I can get through college and maybe ');
terminal.print(' make my own life better. ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_stepdad' : {type:'file', read:function(terminal) {
terminal.print('   I wish you had loved me more than the money ');
terminal.print('   I gave you for rent. They cut my hours, I couldnt ');
terminal.print('   pay so you kicked me out. Ive tried to forgive you ');
terminal.print(' for this but I cant. ');
terminal.print(' Sincerely, worth less to you than the rent. ');
}} 

};

YOURE_FS = {
'Dear_girls' : {type:'file', read:function(terminal) {
terminal.print(' If you can read this, make me a sammich. ');
terminal.print(' Sincerely, a boy ');
}} ,


'Dear_Stephenie_Meye' : {type:'file', read:function(terminal) {
terminal.print('   Please make another book for the Twilight series. Please, I ');
terminal.print(' am begging you. ');
terminal.print(' Sincerely, Twihard. ');
}} ,


'Dear_fat_people' : {type:'file', read:function(terminal) {
terminal.print('   Please stop parading your lard on the street and lose ');
terminal.print(' some weight. You disgust me. ');
terminal.print(' Sincerely, Slim Jim. ');
}} ,


'Dear_Wife' : {type:'file', read:function(terminal) {
terminal.print('   Please get a bikini wax. You look ridiculous with hair ');
terminal.print(' sticking out of your granny panties. ');
terminal.print(' Sincerely, Husband ');
}} ,


'Dear_Asians' : {type:'file', read:function(terminal) {
terminal.print(' At least wear name tags or something. ');
terminal.print(' Sincerely, The rest of the world ');
}} ,


'Dear_grandmother' : {type:'file', read:function(terminal) {
terminal.print('   Please stop muttering to yourself and forgetting things. If you keep ');
terminal.print('   this up, Im putting you in an old folks home. ');
terminal.print(' Sincerely, your oldest granddaughter. ');
}} ,


'Dear_idiot_down_the' : {type:'file', read:function(terminal) {
terminal.print('   No one cares if you are the only person in ');
terminal.print('   the neighborhood with a 62 flat screen 3D LED TV. I ');
terminal.print('   just had sex with your girlfriend for the 4th time since ');
terminal.print('   monday, thats enough hi def entertainment for me. There are some ');
terminal.print(' things money cant buy... ');
terminal.print('   Sincerely, the naked guy in your house, on your computer ');
terminal.print(' right now. ');
}} ,


'Dear_J.K._Rowling' : {type:'file', read:function(terminal) {
terminal.print('   Your books are entirely unrealistic. I mean, a ginger kid ');
terminal.print(' with two friends? ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_chubby_girls' : {type:'file', read:function(terminal) {
terminal.print('   HA! No, no, no... Skinny jeans do not make you ');
terminal.print(' appear skinny... Nice try though... A for effort. ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_People_complai' : {type:'file', read:function(terminal) {
terminal.print(' Its 2010, grammar doesnt matter anymore. ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_Fat_People' : {type:'file', read:function(terminal) {
terminal.print('   Stop messing up the whole rack when you search for ');
terminal.print(' your XXL shirts at the bottom. Thanks. ');
terminal.print(' Sincerely, Pissed off worker ');
}} ,


'Dear_smokers' : {type:'file', read:function(terminal) {
terminal.print(' Please hurry up and die. ');
terminal.print(' Sincerely, Richard. ');
}} ,


'Dear_girlfriend' : {type:'file', read:function(terminal) {
terminal.print('   "I didnt know you were coming over" is no excuse for ');
terminal.print(' not shaving your legs. ');
terminal.print(' Sincerely, grossed out boyfriend. ');
}} ,


'Dear_women' : {type:'file', read:function(terminal) {
terminal.print('   Please stop talking about your period around EVERYONE. We get it, ');
terminal.print('   it sucks, now try getting a sports hernia. Oh wait! ');
terminal.print(' Sincerely, everybody. ');
}} ,


'Dear_Obama' : {type:'file', read:function(terminal) {
terminal.print('   Please ignore what they are saying. Youre doing a great job! ');
terminal.print(' Sincerely, Faithful American ');
}} 

};

HILARIOUS_FS = {
'Dear_Noah' : {type:'file', read:function(terminal) {
terminal.print('   We could have sworn you said the ark wasnt leaving ');
terminal.print(' till 5. ');
terminal.print(' Sincerely, Unicorns ');
}} ,


'Dear_Twilight_fans' : {type:'file', read:function(terminal) {
terminal.print('   Please realize that because vampires are dead and have no ');
terminal.print('   blood pumping through them, they can never get an erection. Enjoy fantasizing ');
terminal.print(' about that. ');
terminal.print(' Sincerely, Logic ');
}} ,


'Dear_J.K._Rowling' : {type:'file', read:function(terminal) {
terminal.print('   Your books are entirely unrealistic. I mean, a ginger kid ');
terminal.print(' with two friends? ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_icebergs' : {type:'file', read:function(terminal) {
terminal.print('   Sorry to hear about the global warming. Enjoy the Karma... ');
terminal.print(' Sincerely, the Titanic. ');
}} ,


'Dear_Mom' : {type:'file', read:function(terminal) {
terminal.print(' Im 16 now, can I PLEASE get a bra? ');
terminal.print(' Sincerely, your son, Justin B ');
}} ,


'Dear_Boyfriend' : {type:'file', read:function(terminal) {
terminal.print('   I can make your girlfriend scream louder than you can. ');
terminal.print(' Sincerely, Spiders ');
}} ,


'Dear_Students' : {type:'file', read:function(terminal) {
terminal.print(' I know when youre texting. ');
terminal.print('   Sincerely, No one just looks down at their crotch and ');
terminal.print(' smiles ');
}} ,


'Dear_America' : {type:'file', read:function(terminal) {
terminal.print(' You produced Miley Cyrus. Bieber is your punishment. ');
terminal.print(' Sincerely, Canada ');
}} ,


'Dear_person_reading' : {type:'file', read:function(terminal) {
terminal.print('   Youre here because youre actively procrastinating or avoiding real work, arent ');
terminal.print(' you? Its OK...me too. ');
terminal.print(' Sincerely, Ill work tomorrow ');
}} ,


'Dear_6' : {type:'file', read:function(terminal) {
terminal.print('   Please stop spreading rumors about me eating 9. You shouldnt be ');
terminal.print(' talking. I hear you guys do some pretty nasty things. ');
terminal.print(' Sincerely, 7 ');
}} ,


'Dear_Buffy' : {type:'file', read:function(terminal) {
terminal.print('   We have a new assignment for you. His name is ');
terminal.print(' Edward. ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_Twilight_fans' : {type:'file', read:function(terminal) {
terminal.print(' Thank you for making us look sane and well-adjusted. ');
terminal.print(' Sincerely, Trekkies. ');
}} ,


'Dear_Waldo' : {type:'file', read:function(terminal) {
terminal.print(' Please return my invisibility cloak ASAP. ');
terminal.print(' Sincerely, H. Potter ');
}} ,


'Dear_Edward_Cullen' : {type:'file', read:function(terminal) {
terminal.print(' Avada Kedavra! ');
terminal.print(' Sincerely, Tom Riddle ');
}} ,


'Dear_Nickelback' : {type:'file', read:function(terminal) {
terminal.print(' Thats enough. ');
terminal.print(' Sincerely, the world. ');
}} 

};

ILIKE_FS = {
'Dear_Women' : {type:'file', read:function(terminal) {
terminal.print('   Please stop thinking you have to be a size 0 ');
terminal.print('   to be beautiful. Those magazines got it all wrong, no one ');
terminal.print('   ever told them that beauty is also on the inside. Be ');
terminal.print('   confident and happy with yourself. Some guy out there is going ');
terminal.print(' to fall in love with everything about you. ');
terminal.print(' Sincerely, a real man ');
}} ,


'Dear_war_in_Iraq' : {type:'file', read:function(terminal) {
terminal.print(' Please end soon. ');
terminal.print(' Sincerely, I miss my dad. ');
}} ,


'Dear_Obama' : {type:'file', read:function(terminal) {
terminal.print('   Please ignore what they are saying. Youre doing a great job! ');
terminal.print(' Sincerely, Faithful American ');
}} ,


'Dear_cancer' : {type:'file', read:function(terminal) {
terminal.print('   My mom is too strong for you. Just leave already. ');
terminal.print(' Sincerely, daughter. ');
}} ,


'Dear_You' : {type:'file', read:function(terminal) {
terminal.print(' Smile. Youre beautiful. ');
terminal.print(' Sincerely, Me ');
}} ,


'Dear_Nickelodeon' : {type:'file', read:function(terminal) {
terminal.print(' Whatever happened to quality programming? ');
terminal.print(' Sincerely, children of the 90s ');
}} ,


'Dear_Grouchy_Femini' : {type:'file', read:function(terminal) {
terminal.print('   Please dont take my chivalry the wrong way. Im opening a ');
terminal.print('   door for you because its courteous, not because I think ');
terminal.print(' you cant do it yourself. ');
terminal.print(' Sincerely, A Nice Guy ');
}} ,


'Dear_Hogwarts_Schoo' : {type:'file', read:function(terminal) {
terminal.print('   Please send me my letter already. Im tired of the ');
terminal.print(' Muggle world. ');
terminal.print(' Sincerely, the kid who still believes in magic ');
}} ,


'Dear_War_on_Terror' : {type:'file', read:function(terminal) {
terminal.print(' Please end. Id like to come home soon. ');
terminal.print(' Sincerely, a soldier who misses his family ');
}} ,


'Dear_America' : {type:'file', read:function(terminal) {
terminal.print('   Please understand that saying all Muslim people are terrorists is like ');
terminal.print(' saying all Americans are like the people on Jersey Shore. ');
terminal.print(' Sincerely, Sane People ');
}} ,


'Dear_eating_disorde' : {type:'file', read:function(terminal) {
terminal.print('   I can look in a mirror and feel beautiful without ');
terminal.print(' you now. ');
terminal.print(' Sincerely, stronger than ever. ');
}} ,


'Dear_Secular_World_' : {type:'file', read:function(terminal) {
terminal.print('   Please stop being so appalled that Im 24 and have ');
terminal.print('   chosen to remain a virgin until marriage. Its not a disease, ');
terminal.print(' and Im fully aware of what Im "missing out" on. ');
terminal.print(' Sincerely, Clean Vagina ');
}} ,


'Dear_flat_chested_g' : {type:'file', read:function(terminal) {
terminal.print(' Please dont give up. We exist. ');
terminal.print(' Sincerely, Guys who like small boobs ');
}} ,


'Dear_racist' : {type:'file', read:function(terminal) {
terminal.print('   Your car is Japanese. Your beer is German. Your wine ');
terminal.print('   is Spanish. Your democracy is Greek. Your coffee is Colombian. Your ');
terminal.print('   tea is Chinese. Your watch is Swiss. Your fashion is French. ');
terminal.print('   Your shirt is Indian. Your shoes are Thai. Your radio is ');
terminal.print('   Korean. Your vodka is Russian. And then you complain that your ');
terminal.print(' neighbor is an immigrant? ');
terminal.print(' Sincerely, lets just all live and let live ');
}} ,


'Dear_people_who_thi' : {type:'file', read:function(terminal) {
terminal.print('   The girl you just called fat? She has been starving ');
terminal.print('   herself and has lost over 30lbs. The boy you called stupid? ');
terminal.print('   He has a learning disability and studies over 4hrs a night. ');
terminal.print('   The girl you just called ugly? She spends hours putting makeup ');
terminal.print('   on hoping people will like her. The boy you tripped yesterday? ');
terminal.print(' He is abused enough at home. ');
terminal.print('   Sincerely, there is a lot more to people than you ');
terminal.print(' think. Stop bullying. ');
}} 

};

UMM_FS = {
'Dear_Sister' : {type:'file', read:function(terminal) {
terminal.print('   By the time you read this Ill be dead. This ');
terminal.print('   is how I think its gonna happen: Dave will shoot me, ');
terminal.print('   then Ill shoot Dave, then Eric will enter and get shot ');
terminal.print('   by Dave. Then youll come in and get shot by Eric, ');
terminal.print(' Dave, and I multiple times. ');
terminal.print('   Sincerely, Your brother Keith. P.S. Then two cops will read ');
terminal.print(' this letter and shoot each other ');
}} ,


'Dear_Diary' : {type:'file', read:function(terminal) {
terminal.print('   Please stop hiding in easy places for my parents to ');
terminal.print('   read. Having to answer questions about my sexual experiences with homeless ');
terminal.print(' men in the park is becoming annoying. ');
terminal.print(' Sincerely, I Like Boys ');
}} ,


'Dear_Poop' : {type:'file', read:function(terminal) {
terminal.print(' I havent eaten corn in days... ');
terminal.print(' Sincerely, WTF?!?! ');
}} ,


'Dear_Dad' : {type:'file', read:function(terminal) {
terminal.print('   Please stop coming into my room in the middle of ');
terminal.print(' the night. ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_Mom' : {type:'file', read:function(terminal) {
terminal.print('   Please dont ground me when I tell you my 20-year-old-bf from ');
terminal.print('   Ohio who Ive been dating over the internet is coming ');
terminal.print('   over for my 18th birthday. P.S I want him to sleep ');
terminal.print(' in my room ');
terminal.print(' Sincerely, hopelessly-in-love-Daughter ');
}} ,


'Dear_Mom' : {type:'file', read:function(terminal) {
terminal.print(' Please stop making yourself throw up in the shower. ');
terminal.print(' Sincerely, I can hear you ');
}} ,


'Dear_students' : {type:'file', read:function(terminal) {
terminal.print(' Welcome to Putnam Middle School! Enjoy your first period! ');
terminal.print(' Sincerely, your principal ');
}} ,


'Dear_boyfriend' : {type:'file', read:function(terminal) {
terminal.print(' Please stop sniffing my dirty clothes. Its becoming creepy. ');
terminal.print(' Sincerely, your girlfriend. ');
}} ,


'Dear_Humans' : {type:'file', read:function(terminal) {
terminal.print(' Bring lube. ');
terminal.print(' Sincerely, Aliens ');
}} ,


'Dear_Mark' : {type:'file', read:function(terminal) {
terminal.print('   That was a very loud beep... I dont even know ');
terminal.print('   if this is working. Mark! Mark! Are you there? Are you ');
terminal.print('   screening your calls? Its Mom. We wanted to call and say ');
terminal.print('   we love you and well miss you tomorrow. Cindy and the ');
terminal.print('   kids are here, send their love. Oh! I hope you like ');
terminal.print('   the hot plate! Just dont leave it on, dear, when you ');
terminal.print('   leave the house! Oh and Mark! Were sorry to hear that ');
terminal.print('   Maureen dumped you, I say cest la vie! So let ');
terminal.print('   her be a lesbian! There are other fishies in the sea. ');
terminal.print(' Sincerely, Mom ');
}} ,


'Dear_Google_Maps' : {type:'file', read:function(terminal) {
terminal.print('   Please extend your street view to the rural parts of ');
terminal.print('   the country. Im trying to find out which field I left ');
terminal.print(' my virginity in. ');
terminal.print(' Sincerely, anonymous. ');
}} ,


'Dear_Boyfriend_in_G' : {type:'file', read:function(terminal) {
terminal.print(' I love you. ');
terminal.print(' Sincerely, Your girlfriend in California :) ');
}} ,


'Dear_poops' : {type:'file', read:function(terminal) {
terminal.print(' Please stay in when I fart. ');
terminal.print(' Sincerely, thats not gonna come out in the washer. ');
}} ,


'Dear_Cutie' : {type:'file', read:function(terminal) {
terminal.print(' Your living room arrangement looks nice from the yard. ');
terminal.print(' Sincerely, Stalker ');
}} ,


'Dear_girlfriend' : {type:'file', read:function(terminal) {
terminal.print('   Please forgive me. I just bought a ring. Im afraid ');
terminal.print('   to give it to you, because I know eventually you will ');
terminal.print(' die, which will break my heart. ');
terminal.print(' Sincerely, sir ');
}} 

};

/*
	Contacts_FS = {
	  'contacts.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome to the contacts list.'));
		  terminal.print('Arjun        arjun1296@gmail.com');
		  terminal.print('Dhananjay    mb.dhananjay@gmail.com');
		  terminal.print('Jogy         simula67@gmail.com');
		  terminal.print('Naufal       naufal22@gmail.com');		  
		  terminal.print('Yadu         yadudoc1729@gmail.com');
	  }},	  
};
  
  */
  Filesystem = {
	  'welcome.txt': {type:'file', read:function(terminal) {	
	  terminal.print($('<h4>').text('Welcome to the dbpb console.'));
		  terminal.print('Use "ls", "cat", and "cd" to navigate the filesystem.');
		  terminal.print('Use "help" command for a list of common usages.');
		  terminal.print('Use page-up and page-down keys to scroll up and down.');
		  terminal.print('Most unix commands work (un)usually. ');
	  }},
	  'license.txt': {type:'file', read:function(terminal) {
		  terminal.print($('<p>').html('Client-side logic for Wordpress CLI theme :: <a href="http://thrind.xamai.ca/">R. McFarland, 2006, 2007, 2008</a>'));
		  terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://www.chromakode.com/">Chromakode, 2010</a>'));
		  terminal.print($('<p>').html('Majorly hacked by :: <a href="http://posterous.humanint.com/">yadudoc, 2011</a> and <a href="http://simula67.wordpress.com/">simula67, 2011</a>'));
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
	
Filesystem['how_dare_they'] = dirFile('how_dare_they');
Filesystem['you\'re_a_douche'] =dirFile('you\'re_a_douche');
Filesystem['hilarious'] =dirFile('hilarious');
Filesystem['i_like_this'] =dirFile('i_like_this');
Filesystem['umm,wtf?!'] =dirFile('umm,wtf?!');
//Filesystem['contacts'] =dirFile('contacts');

// End of content based data

TerminalShell.pwd = Filesystem;

TerminalShell.commands['cd'] = function(terminal, path) {
	if (path == '..'){		
		TerminalShell.pwd = Filesystem;
		// < configurable  shell prompt >
		Terminal.config.prompt = 'guest@dbpb:/$';				
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
	}/* else if (pathFilename(path) == 'alt.txt') {
		terminal.setWorking(true);
		num = Number(path.match(/^\d+/));
		xkcd.get(num, function(data) {
			terminal.print(data.alt);
			terminal.setWorking(false);
		}, function() {
			terminal.print($('<p>').addClass('error').text('cat: "'+path+'": No such file or directory.'));
			terminal.setWorking(false);
		}); */
	 else {
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
	        var url = "http://widget.mibbit.com/?settings=99509cab0139cd1d42552b39d0ff6784&server=irc.mibbit.net&channel=%23dbpb&hashtag=%23dbpb";
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
		'raptor': 'BEHIND YOU!!!',
		'jogy' : 'In the holy temple',
		'naufal' : 'Somewhere lost in the screwed up FFmpeg code ',
		'yadu' : 'In Deep Hacker Mode, cannot be found',
		'girls' : 'Try asking somebody who doesn\'nt live on a server'
	};
	if (!oneLiner(terminal, what, keywords)) {
		terminal.print('Locate what?');
	}
};

Adventure = {
	rooms: {
		0:{description:'You are at a computer using dbpb.', exits:{west:1, south:10}},
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

// No peeking! <--- ha, not anymore
// more edits to go here.
TerminalShell.commands['help'] = TerminalShell.commands['halp'] = function(terminal) {
	terminal.print($('<h4>').html('Basic help page: Common commands and usages'));	
	terminal.print('');
	terminal.print('"ls" : list files in the current directory');
	terminal.print('"cd \<dir\>" : change directory to the new directory');
	terminal.print('"cd .." : moves to the parent directory');
	terminal.print('"cat \<file\>" : prints out the contents of a file');
	terminal.print('"help" : for this help file');
	terminal.print('"irc \<nick\> : Log into irc and chat live with online friends');
	terminal.print('');
	terminal.print($('<h4>').html('Basically every other unix command works and we have extras, Like'));
	terminal.print('sudo       su       rm       man        whoami');
	terminal.print('who        cheat    light    sleep      locate');	
	terminal.print('shutdown   logout   exit     quit       goto');
	terminal.print('And undocumented ones left for the users\' curiosity');
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
		'date': 'Hey, i\'m already taken',
		'hello': 'Why hello there!',
		'unzip' : 'You pervert! there are ladies here',
		'who': 'Doctor Who?',
		'dbpb': 'Yes, kiddo ?',
		'su': 'God mode activated. Remember, with great power comes great ... aw, screw it, go have fun.',
		'fuck': 'I have a headache.',
		'whoami': 'You are Richard Stallman.',
		'nano': 'Seriously? Why don\'t you just use Notepad.exe? Or MS Paint?',
		'top': 'It\'s up there --^',
		'moo':'moooo..',
		'ping': 'There is another submarine three miles ahead, bearing 225, forty fathoms down.',
		'find': 'What do you want to find? Kitten would be nice.',
		'hello':'Hello.','more':'Oh, yes! More! More!',
		'your gay': 'Keep your hands off it!',
		'hi':'Hi.',
		'echo': 'Echo ... echo ... echo ...',
		'bash': 'You bash your head against the wall. It\'s not very effective.',
		'ssh': 'ssh speaking, this is a library.',
		'uname': 'Illudium Q-36 Explosive Space Modulator',
		'finger': 'Mmmmmm...',
		'kill': 'Terminator deployed to 1984.',
		'use the force luke': 'I believe you mean source.',
		'use the source luke': 'I\'m not luke, you\'re luke!',
		'serenity': 'You can\'t take the sky from me.',
		'enable time travel': 'TARDIS error: Time Lord missing.',
		'ed': 'You are not a diety.',
		'nice' : 'Yea, Tell me about it'
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
			terminal.print('Hey, you can\'t do that..');
		} else if (cmd == 'time travel') {
			//xkcdDisplay(terminal, 630);
			terminal.print('Yea right, in another 20 years... or you\'ve gotta be Doc Brown')
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
		                                                                         
'    //    ) )                           ',
'   //    / /  ___      ___      __      ',
'  //    / / //___) ) //   ) ) //  ) )   ',
' //    / / //       //   / / //         ',
'//____/ / ((____   ((___( ( //          ',
'                                        ',  
'                                        ',   
'    //   ) )                             ', 
'   //___/ /  //  ___       __     / ___  ', 
'  / __  (   // //   ) ) //   ) ) //\ \   ', 
' //    ) ) // //   / / //   / / //  \ \  ', 
'//____/ / // ((___( ( //   / / //    \ \ ',		 
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
