/**
 * jspsych-continuous-color
 * plugin for continuous color report
 
 * requires jQuery to be included, as well as the relevant css
 */

var continuous_img_css_added = false;

jsPsych.plugins['continuous-image-percep'] = (function() {

  var plugin = {};

	jsPsych.pluginAPI.registerPreload('continuous-image-percep', 'image_sprite', 'image');
  plugin.info = {
    name: 'continuous-image-percep',
    description: '',
    parameters: {
	    image_sprite: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Sprite of images',
        default: undefined,
        description: 'The image content to be displayed, should be CSS sprite'
      },
			item_values: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Actual colors to show (optional)',
        default: [],
				array: true,
        description: 'If not empty, should be a list of colors to show, in degrees of color wheel, of same length as set_size'
      },		
			wheel_spin: {
        type: jsPsych.plugins.parameterType.Boolean,
        pretty_name: 'Spin the color wheel every trial',
        default: false,
        description: 'Should the color wheel spin every trial?'				
			},
			feedback: {
        type: jsPsych.plugins.parameterType.Boolean,
        pretty_name: 'Give feedback?',
        default: false,
        description: 'Feedback will be in deg. of color wheel of error.'				
			},			
			responses_per_item: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Collect multiple response per item',
        default: 1,
        description: 'To allow ranking task, where people can pick more than 1 color for each item.'
      },		
      num_previews: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of previews of images outside wheel',
        default: 24,
        description: 'Number of previews of images outside wheel.'
      },			
      wheel_num_options: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of colors on wheel',
        default: 360,
        description: 'Number of color options. Can be overruled by wheel_list_options. Should evenly divide into 360 and be <= 360.'
      },
      wheel_list_options: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Which choices to show',
        array: true,
        default: [],
        description: 'If not empty, which options to show, relative to the target (0), ranging from -179 to 180.'
      },
			bg_color: {
        type: jsPsych.plugins.parameterType.String,
        pretty_name: 'BG color of box for experiment',
        default: '#FFFFFF',
        description: 'BG color of box for experiment.'
      },
      item_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Size of each item',
        default: 90,
        description: 'Diameter of each circle in pixels.'
      },
      radius: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Where items appear',
        default: 160,
        description: 'Radius in pixels of circle items appear along.'
      },
      num_placeholders: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of locations where items can appear',
        default: 8,
        description: 'Number of locations where items can appear'
      },
	  min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name:'Slider width',
        default: null,
        description: 'Width of the slider in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }
	
  plugin.trial = function(display_element, trial) {

    /* Add CSS for classes just once when 
      plugin is first used: 
    --------------------------------*/
		if (!continuous_img_css_added) {
			var css = `
			.contImgMemoryItem {
				position: absolute;
				border: 1px solid #CCC;
				user-select: none;
			}
			.contImgMemoryChoice {
				position: absolute;
				width: 20px;
				height: 20px;
        border-radius: 50%;
				background: black;
				cursor: pointer;
				z-index: 5;
				font-size: 10pt;
				display: flex;
				align-items: center;
        justify-content: center;  
				user-select: none;
			}
			.contImgPreview {
				position: absolute;
				background-size: 36000% 100%;
				width: 50px;
				height: 50px;			
				z-index: 1;
			}
			#contImgMemoryFixation {
				font-size: 11pt;
				padding: 15px;
				user-select: none;
				position: absolute;
			}
      #contImgMemoryBox {
        display: flex;
        margin: 0 auto;
        align-items: center;
        justify-content: center;  
        border: 1px solid black;
        background: ${trial.bg_color};
        position: relative;
      }
	  
	 `;
			var styleSheet = document.createElement("style");
			styleSheet.type = "text/css"
			styleSheet.innerText = css;
			document.head.appendChild(styleSheet);
			continuous_color_css_added = true;
		}
		
		/* Build basic trial structure: 
		-------------------------------- */
		trial.set_size = 1;
		trial.which_test = 0;
		var width = trial.radius * 2 + trial.item_size * 2 + 125;
		var height = trial.radius * 2 + trial.item_size * 2 + 125;
		var center = width/2;
    
		
		var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
		html+=`
		<div id="contImgMemoryBox" style="
			width:${width}px; 
			height: ${height}px;">`;
		var possiblePositions = [];
		for (var i=0; i < trial.num_placeholders; i++) {
			let curTop = (Math.cos((Math.PI*2)/(trial.num_placeholders)*i)*trial.radius)
				- trial.item_size/2 + center;
			let curLeft = (Math.sin((Math.PI*2)/(trial.num_placeholders)*i)*trial.radius)
				- trial.item_size/2 + center;
				
			html += `<div id="item${i}" class="contImgMemoryItem" 
				style="top:${curTop}px; left:${curLeft}px; 
        width:${trial.item_size}px; 
        height:${trial.item_size}px; background-size: 36000% 100%;"></div>`;
				
			possiblePositions.push(i);
		}
		html += `<span id="contImgMemoryFixation" style="cursor: pointer">+</span>
			<div id="contMemoryStartTrial" style="position: absolute; 
				top:20px">Click the + to start this trial.</div>
			<div id="reportDiv"></div>
		</div>`;
		html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
		if(trial.slider_width !== null){
		  html += 'width:'+trial.slider_width+'px;';
		}
		html += '">';
		html += '<input type="range" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-html-slider-response-response"></input>';
		html += '<div>'
		//for(var j=0; j < trial.labels.length; j++){
		  var width = 100/(trial.labels.length-1);
		  var left_offset1 = (0 * (100 /(trial.labels.length - 1))) - (width/2);
		  html += '<div id = "labelz1" style="display: inline-block; position: absolute; left:'+left_offset1+'%; text-align: center; width: '+width+'%;">';
		  html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[0]+'</span>';
		  html += '</div>'
		  var left_offset2 = (1 * (100 /(trial.labels.length - 1))) - (width/2);
		  html += '<div id = "labelz2" style="display: inline-block; position: absolute; left:'+left_offset2+'%; text-align: center; width: '+width+'%;">';
		  html += '<span style="text-align: center; font-size: 80%; font-style:italic;">'+trial.labels[1]+'</span>';
		  html += '</div>'
		  var left_offset3 = (2 * (100 /(trial.labels.length - 1))) - (width/2);
		  html += '<div id = "labelz3" style="display: inline-block; position: absolute; left:'+left_offset3+'%; text-align: center; width: '+width+'%;">';
		  html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[2]+'</span>';
		  html += '</div>'
		//}
		html += '</div>';
		html += '</div>';
		html += '</div>';

	
		if (trial.prompt !== null){
		  html += trial.prompt;
		}
	
		// add submit button
		html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn" '+ (trial.require_movement ? "disabled" : "") + '>'+trial.button_label+'</button>';
	
		display_element.innerHTML = html;
		
		document.getElementById("jspsych-html-slider-response-response").style.visibility = 'hidden';
		document.getElementById("labelz1").style.visibility = 'hidden';
		document.getElementById("labelz2").style.visibility = 'hidden';
		document.getElementById("labelz3").style.visibility = 'hidden';
	
				/* Show the items:  
		-------------------------------- */
		var pos = jsPsych.randomization.sampleWithoutReplacement(possiblePositions, 2);
		var item_values = trial.item_values;
		if (trial.item_values.length==0) {
			item_values = GetItemsForTrial(trial.set_size, trial.min_difference);
		}
		var showStimuli = function() {
			SetItem('item'+pos[0], item_values[0], trial);  
			SetItem('item'+pos[1], item_values[1], trial);  
			document.getElementById('item' + pos[0]).style.border = '5px solid black';
			document.getElementById('item' + pos[1]).style.border = '5px solid black';   
			document.getElementById("jspsych-html-slider-response-response").style.visibility = 'visible';
			document.getElementById("labelz1").style.visibility = 'visible';
			document.getElementById("labelz2").style.visibility = 'visible';
			document.getElementById("labelz3").style.visibility = 'visible';
		}
		

		var startTrial = function() {
			document.getElementById("contMemoryStartTrial").style.display = 'none';
			display_element.querySelector('#contImgMemoryFixation').removeEventListener('click', startTrial);
			document.getElementById("contImgMemoryFixation").style.cursor = 'auto';
			jsPsych.pluginAPI.setTimeout(function() {
        requestAnimationFrame(showStimuli);
      			}, 500);
		};

		display_element.querySelector('#contImgMemoryFixation').addEventListener('click', startTrial);
		var startTime = performance.now();
		var response = {
		  rt: null,
		  response: null
		};
	
		if(trial.require_movement){
		  display_element.querySelector('#jspsych-html-slider-response-response').addEventListener('change', function(){
			display_element.querySelector('#jspsych-html-slider-response-next').disabled = false;
			
		  })
		}
	
		display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function() {
		  // measure response time
		 
	
		  if(trial.response_ends_trial){
			var endTime = performance.now();
			response.rt = endTime - startTime;
			response.response = display_element.querySelector('#jspsych-html-slider-response-response').value;
		
			end_trial();
		  } else {
			display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
		  }
	
		});
	

	
		function end_trial(){

			jsPsych.pluginAPI.clearAllTimeouts();
	  
			// save data
			var trialdata = {
			  "rt": response.rt,
			  "stimulus": trial.stimulus,
			  "start": trial.start,
			  "response": response.response,
			  "position_of_items": pos,
			   "item_vals": item_values,
			};
	  
			display_element.innerHTML = '';
	  
			// next trial
			jsPsych.finishTrial(trialdata);
		  }

  };

  /* Helper functions
	 ------------------------------ */
	 
	/* Set an element to a color given in degrees of color wheel */
	function SetItem(id, deg, trial) {
		deg=(deg>=360) ? deg-360:deg;
		deg=(deg<0) ? deg+360:deg;
		document.getElementById(id).style.backgroundImage = `url('${trial.image_sprite}')`;
		document.getElementById(id).style.backgroundPosition = `${(deg*100)}% 0%`;
	}

	/* Get colors subject to constraint that all items are a min.
	  difference from each other: */
	function GetItemsForTrial(setSize, minDiff) {
		var items = [];
		var whichCol = getRandomIntInclusive(0,359);
		items.push(whichCol);
		
		for (var j=1; j<=setSize-1; j++) {
			var validColors = new Array();
			for (var c=0;c<360; c++) { 
				isValid = !tooClose(whichCol,c, minDiff);
				for (var testAgainst=0;testAgainst<j;testAgainst++) {
					if (isValid && tooClose(items[testAgainst],c,minDiff)) {
						isValid = false;
					}
				}
				if (isValid) {
					validColors.push(c); 
				}
			}
			validColors = jsPsych.randomization.shuffle(validColors);
			items.push(validColors[0]);
		}
		return items;
	}

	/* Make sure all numbers in an array are between 0 and 360: */
	function wrap(v) {
    if (Array.isArray(v)) {
      for (var i=0; i<v.length; i++) {
        if (v[i]>=360) { v[i]-=360; }
        if (v[i]<0) { v[i]+=360; }
      }    
    } else {
      if (v>=360) { v-=360; }
      if (v<0) { v+=360; }
    }
		return v;
	} 

	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	function tooClose(startcol,endcol,minDiff) {
		if (isNaN(startcol) || isNaN(endcol)) {
			return false;
		}
		if (Math.abs(startcol-endcol)<=minDiff) {
			return true;
		}
		if (Math.abs(startcol+360 - endcol)<=minDiff) {
			return true;
		}	
		if (Math.abs(startcol-360 - endcol)<=minDiff) {
			return true;
		}		
		return false;
	}

  return plugin;
})();
