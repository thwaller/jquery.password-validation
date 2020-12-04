(function($) {
	$.fn.extend({
		passwordValidation: function(_options, _callback, _confirmcallback) {
			var CHARSETS = {
				//Addressing the full UTF8 encoding table U+0000 to U+00FF (x00 to xFF)
				upperCaseSet:	"A-Z",	//All UpperCase (Ascii/Unicode) x41 to x5A
				lowerCaseSet:	"a-z",	//All LowerCase (Ascii/Unicode) x61 to x7A
				numericSet:		"0-9",	//All numeric (Ascii/Unicode) x30 to x39
				specialSet:		"\x21\x23-\x26\x28-\x2E\x3A-\x40\x5B-\x5F\x7B-\x7E", //Standard special characters
				extendedSet:	"\xA1-\xFF", //Extended UTF8 characters
				problemSet:		"\x20\x22\x27\x2F\x5C\x60\xA0", //the characters of space, double quote, single quote, slash, backslash, grave accent
				deadSet:		"\x00-\x1F\x80-\x9F" //unused UTF8 hex for control
			};
			var _defaults = {
				minLength: 12,			//Minimum Length of password 
				minUpperCase: 2,		//Minimum number of Upper Case Letters characters in password
				minLowerCase: 2,		//Minimum number of Lower Case Letters characters in password
				minNumeric: 2,			//Minimum number of digits characters in password
				minSpecial: 2,			//Minimum number of special characters in password
				minExtended: 0,			//Minimum number of extended UTF8 characters
				minProblem: 0,			//Minimum number of problem characters
				maxRepeats: 2,			//Maximum number of repeated alphanumeric characters in password dhgurAAAfjewd <- 3 A's
				maxConsecutive: 1,		//Maximum number of alphanumeric characters from one set back to back
				noUpper: false,			//Disallow Upper Case Letters
				noLower: false,			//Disallow Lower Case Letters
				noNumeric: false,		//Disallow Numeric
				noSpecial: false,		//Disallow Special Characters
				noExtended: false,		//Disallow Extended UTF8 Characters
				noProblem: false,		//Disallow Problem Characters
				failRepeats: true,		//Disallow user to have x number of repeated alphanumeric characters ex.. ..A..a..A.. <- fails if maxRepeats <= 3 CASE INSENSITIVE
				failConsecutive: true,	//Disallow user to have x number of consecutive alphanumeric characters from any set ex.. abc <- fails if maxConsecutive <= 3
				confirmField: undefined
			};

			//Ensure parameters are correctly defined
			if($.isFunction(_options)) {
				if($.isFunction(_callback)) {
					if($.isFunction(_confirmcallback)) {
						console.log("Warning in passValidate: 3 or more callbacks were defined... First two will be used.");
					}
					_confirmcallback = _callback;
				}
				_callback = _options;
				_options = {};
			}

			//concatenate user options with _defaults
			_options = $.extend(_defaults, _options);
			if(_options.maxRepeats < 2) _options.maxRepeats = 2;

			function charsetToString() {
				return CHARSETS.upperCaseSet + CHARSETS.lowerCaseSet + CHARSETS.numericSet + CHARSETS.specialSet + CHARSETS.extendedSet + CHARSETS.problemSet; 
			}

			//GENERATE ALL REGEXs FOR EVERY CASE
			function buildPasswordRegex() {
				var cases = [];

				if(_options.noUpper) 	cases.push({"regex": "(?=" + CHARSETS.upperCaseSet + ")",
													"message": "Password can not contain an Upper Case Letter"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.upperCaseSet + "][^" + CHARSETS.upperCaseSet + "]*").repeat(_options.minUpperCase) + ")",
									"message": "Password must contain at least " + _options.minUpperCase + " Upper Case Letters."});
				
				if(_options.noLower) 	cases.push({"regex": "(?=" + CHARSETS.lowerCaseSet + ")",
													"message": "Password can not contain a Lower Case Letter"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.lowerCaseSet + "][^" + CHARSETS.lowerCaseSet + "]*").repeat(_options.minLowerCase) + ")",
									"message": "Password must contain at least " + _options.minLowerCase + " Lower Case Letters."});
				
				if(_options.noNumeric) 	cases.push({"regex": "(?=" + CHARSETS.numericSet + ")",
													"message": "Password can not contain a Number"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.numericSet + "][^" + CHARSETS.numericSet + "]*").repeat(_options.minNumeric) + ")",
									"message": "Password must contain at least " + _options.minNumeric + " Digits."});
				
				if(_options.noSpecial) 	cases.push({"regex": "(?=" + CHARSETS.specialSet + ")",
													"message": "Password can not contain a Special Character"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.specialSet + "][^" + CHARSETS.specialSet + "]*").repeat(_options.minSpecial) + ")",
									"message": "Password must contain at least " + _options.minSpecial + " Special Characters."});

				if(_options.noExtended) cases.push({"regex": "(?=" + CHARSETS.extendedSet + ")",
													"message": "Password can not contain an Extended UTF8 Character"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.extendedSet + "][^" + CHARSETS.extendedSet + "]*").repeat(_options.minExtended) + ")",
									"message": "Password must contain at least " + _options.minExtended + " Extended UTF8 Characters."});

				if(_options.noProblem) 	cases.push({"regex": "(?=" + CHARSETS.problemSet + ")",
													"message": "Password can not contain a space, double quote, single quote, slash, backslash or grave Character"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.problemSet + "][^" + CHARSETS.problemSet + "]*").repeat(_options.minProblem) + ")",
									"message": "Password must contain at least " + _options.minProblem + " space, double quote, single quote, slash, backslash or grave Character"});

				cases.push({"regex":"[" + charsetToString() + "]{" + _options.minLength + ",}",
							"message":"Password must contain at least " + _options.minLength + " characters"});

				return cases;
			}

			var _cases = buildPasswordRegex();
			var _element = this;
			var $confirmField = (_options.confirmField != undefined)? $(_options.confirmField): undefined;

			//Field validation on every captured event
			function validateField() {
				var failedCases = [];
		
				//Evaluate all verbose cases
				$.each(_cases, function(i, _case) {
					if($(_element).val().search(new RegExp(_case.regex, "g")) == -1) {
						failedCases.push(_case.message);
					}
				});

				if(_options.failRepeats && $(_element).val().search(new RegExp("(.)" + (".*\\1").repeat(_options.maxRepeats - 1), "gi")) != -1) {
					failedCases.push("Password can not contain " + _options.maxRepeats + " of the same character case insensitive.");
				}

				if(_options.failConsecutive && $(_element).val().search(new RegExp("(?=(.)" + ("\\1").repeat(_options.maxConsecutive) + ")", "g")) != -1) {
					failedCases.push("Password can not contain the same character more than " + _options.maxConsecutive + " times in a row.");
				}
				
				//Determine if valid
				var validPassword = (failedCases.length == 0) && ($(_element).val().length >= _options.minLength);
				var fieldsMatch = true;
				
				if($confirmField != undefined) {
					fieldsMatch = ($confirmField.val() == $(_element).val());
				}

				_callback(_element, validPassword, validPassword && fieldsMatch, failedCases);
			}

			//Add custom classes to fields
			this.each(function() {
				//Validate field if it is already filled
				if($(this).val()) {
					validateField().apply(this);
				}

				$(this).toggleClass("jqPassField", true);
				if($confirmField != undefined) {
					$confirmField.toggleClass("jqPassConfirmField", true);
				}
			});

			//Add event bindings to the password fields
			return this.each(function() {
				$(this).bind('keyup focus input propertychange mouseup', validateField);
				if($confirmField != undefined) {
					$confirmField.bind('keyup focus input propertychange mouseup', validateField);
				}
			});
		}
	});
})(jQuery);
