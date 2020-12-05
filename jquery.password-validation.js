(function($) {
	$.fn.extend({
		passwordValidation: function(_options, _callback, _confirmcallback) {
			var CHARSETS = {
				//Addressing the UTF8 encoding table U+0000 to U+00FF (x00 to xFF) into logical groups
				//All UpperCase x41 to x5A
				upperCaseSet:	"A-Z",
				//All LowerCase x61 to x7A
				lowerCaseSet:	"a-z",
				//All numeric x30 to x39
				numericSet:		"0-9",
				//Standard special characters
				specialSet:		"\x21\x23-\x26\x28-\x2E\x3A-\x40\x5B-\x5F\x7B-\x7E",
				//Extended UTF8 characters
				extendedSet:	"\xA1-\xFF",
				//Space, double quote, single quote, slash, backslash, grave accent
				problemSet:		"\x20\x22\x27\x2F\\x5C\x60\xA0",
				//Unused UTF8 hex for control
				deadSet:		"\x00-\x1F\x80-\x9F",
				//Combined character sets for grouping
				//All upper, lower letters and numbers
				alphaNumericSet:	"0-9a-zA-Z"
			};
			var _defaults = {
				minLength: 12,			//Minimum Length of password 
				minUpperCase: 2,		//Minimum number of upper case letter characters
				minLowerCase: 2,		//Minimum number of lower case letter characters
				minNumeric: 2,			//Minimum number of numeric characters
				minSpecial: 2,			//Minimum number of special characters
				minExtended: 0,			//Minimum number of extended UTF8 characters
				minProblem: 0,			//Minimum number of problem characters
				maxRepeats: 2,			//Maximum number of repeated characters
				maxConsecutive: 2,		//Maximum number of characters from one set back to back
				//limitFirst: false,	//TODO First character restricted to alphaNumericSet
				//limitLast: false,		//TODO Last character restricted to alphaNumericSet
				noUpper: false,			//Disallow upper case letters
				noLower: false,			//Disallow lower case letters
				noNumeric: false,		//Disallow numeric characters
				noSpecial: false,		//Disallow special characters
				noExtended: false,		//Disallow extended UTF8 characters
				noProblem: true,		//Disallow problem characters
				failRepeats: true,		//Disallow x number of repeated characters, case insensitive
				failConsecutive: true,	//Disallow x number of consecutive characters, case insensitive
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

				if(_options.noUpper) 	cases.push({"regex": "(?=^[^" + CHARSETS.upperCaseSet + "]+$)",
													"message": "Password can not contain an upper case letter"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.upperCaseSet + "][^" + CHARSETS.upperCaseSet + "]*").repeat(_options.minUpperCase) + ")",
									"message": "Password must contain at least " + _options.minUpperCase + " upper case letters."});
				
				if(_options.noLower) 	cases.push({"regex": "(?=^[^" + CHARSETS.lowerCaseSet + "]+$)",
													"message": "Password can not contain a lower case letter"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.lowerCaseSet + "][^" + CHARSETS.lowerCaseSet + "]*").repeat(_options.minLowerCase) + ")",
									"message": "Password must contain at least " + _options.minLowerCase + " lower case letters."});
				
				if(_options.noNumeric) 	cases.push({"regex": "(?=^[^" + CHARSETS.numericSet + "]+$)",
													"message": "Password can not contain a number"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.numericSet + "][^" + CHARSETS.numericSet + "]*").repeat(_options.minNumeric) + ")",
									"message": "Password must contain at least " + _options.minNumeric + " numeric characters."});
				
				if(_options.noSpecial) 	cases.push({"regex": "(?=^[^" + CHARSETS.specialSet + "]+$)",
													"message": "Password can not contain a special character"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.specialSet + "][^" + CHARSETS.specialSet + "]*").repeat(_options.minSpecial) + ")",
									"message": "Password must contain at least " + _options.minSpecial + " special characters."});

				if(_options.noExtended) cases.push({"regex": "(?=^[^" + CHARSETS.extendedSet + "]+$)",
													"message": "Password can not contain an extended UTF8 character"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.extendedSet + "][^" + CHARSETS.extendedSet + "]*").repeat(_options.minExtended) + ")",
									"message": "Password must contain at least " + _options.minExtended + " extended UTF8 characters."});

				if(_options.noProblem) 	cases.push({"regex": "(?=^[^" + CHARSETS.problemSet + "]+$)",
													"message": "Password can not contain a space, double quote, single quote, slash, backslash or grave accent character"});
				else 	cases.push({"regex": "(?=" + ("[" + CHARSETS.problemSet + "][^" + CHARSETS.problemSet + "]*").repeat(_options.minProblem) + ")",
									"message": "Password must contain at least " + _options.minProblem + " space, double quote, single quote, slash, backslash or grave character"});

				cases.push({"regex":"[" + charsetToString() + "]{" + _options.minLength + ",}",
							"message":"Password must contain at least " + _options.minLength + " total characters."});

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

				if(_options.failRepeats && $(_element).val().search(new RegExp("(.)" + (".*\\1").repeat(_options.maxRepeats), "gi")) != -1) {
					failedCases.push("Password can not contain more than " + _options.maxRepeats + " of the same character case insensitive.");
				}

				//TODO NOT WORKING
				if(_options.failConsecutive && $(_element).val().search(new RegExp("(?=(.)" + ("\\1").repeat(_options.maxConsecutive) + ")", "gi")) != -1) {
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
