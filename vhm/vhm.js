var fullPlotlyId="vhm-plot";

function setvalue(dict) {
  for (const key in dict) {
    $("input#"+key).val(dict[key]);
  };
}

function resetVhmForm() {
  var
  // Set inputs
  defaultInputs = {
    "D": 10,
    "d": 4,
    "K": 2,
    "sum": 5,
    "Vd": 4000,
    "Hd": 0,
    "Md": 0,
    "Vl": 0,
    "Hl": 2000,
    "Ml": 7000,
    "lam_d": 1,
    "lam_l": 1,
    "lam_mt": 1,
    "plotType": "normalised",
    "optimisation": "Dopt",
  },
  labels = {
    "Vd_label": "V".concat(String.prototype.sub("d"))
  },
  // Derived inputs
  derivedInputs = {
    "dD": "",
    "A": "",
    "su0": "",
    "su0f": "",
    "k": "",
    "Vf": "",
    "Hf": "",
    "Mf": ""
  },
  // Outputs
  outputs = {
    "NcV": "",
    "NcH": "",
    "NcM": "",
    "Vult": "",
    "Hult": "",
    "Mult": "",
    "v": "",
    "h": "",
    "m": "",
    "hh_star": "",
    "mm_star": "",
    "D_optimized": "",
    "d_optimized": "",
    "sum_optimized": "",
    "k_optimized": "",
    "lam_mt_optimized": "",
    "f2_optimized": ""
  }
  // $("input#D").val(defaultInputs["D"]);
  // $("input#d").val(defaultInputs["d"]);
  // $("input#K").val(defaultInputs["K"]);
  // $("input#sum").val(defaultInputs["sum"]);
  // $("input#Vd").val(defaultInputs["Vd"]);
  // $("input#Hd").val(defaultInputs["Hd"]);
  // $("input#Md").val(defaultInputs["Md"]);
  // $("input#Vl").val(defaultInputs["Vl"]);
  // $("input#Hl").val(defaultInputs["Hl"]);
  // $("input#Ml").val(defaultInputs["Ml"]);
  // $("input#lam_d").val(defaultInputs["lam_d"]);
  // $("input#lam_l").val(defaultInputs["lam_l"]);
  // $("input#lam_mt").val(defaultInputs["lam_mt"]);
  for (const key in defaultInputs) {
    $("input#"+key).val(defaultInputs[key]);
  }
  // $("input#D").val(defaultInputs.D);
  // $("input#d").val(defaultInputs.d);
  // $("input#K").val(defaultInputs.K);
  // $("input#sum").val(defaultInputs.sum);
  // $("input#Vd").val(defaultInputs.Vd);
  // $("input#Hd").val(defaultInputs.Hd);
  // $("input#Md").val(defaultInputs.Md);
  // $("input#Vl").val(defaultInputs.Vl);
  // $("input#Hl").val(defaultInputs.Hl);
  // $("input#Ml").val(defaultInputs.Ml);
  // $("input#lam_d").val(defaultInputs.lam_d);
  // $("input#lam_l").val(defaultInputs.lam_l);
  // $("input#lam_mt").val(defaultInputs.lam_mt);
  for (const key in derivedInputs) {
    $("input#"+key).val(derivedInputs[key]);
  };
  for (const key in outputs) {
    $("input#"+key).val(outputs[key]);
  };
  $("input:radio[id=hhmm_opt]").attr('checked', true);
  $("input:radio[id=D-optimise]").attr('checked', true);
  // $("input:radio:first").attr('checked', true);
  $(".optimized").hide();
  $("#D-display").show();
  // $("#d-display").hide();
  // $("#k-display").hide();
  // $("#sum-display").hide();
  // $("#lam_mt-display").hide();
  
};

// $("fieldset#optimiseOpt").click(function () {
//   let id = $("input:radio:checked").attr("id").replace("optimise","display");
//   //alert(id);
//   $(".optimized").hide();
//   $("#"+ id).show();
// });

// $("input[name=optimise]").click(function (e,t) {
//   console.log($(e).id);
// });

$("input[name=optimise]").click(function () {
  let id = $(this).attr("id").replace("optimise","display");
  //alert(id);
  $(".optimized").hide();
  $("#"+ id).show();
});


//Plotly default layout
var blankLayout = {
  title: "<b>Failure envelope & factored load in terms of normalised (h/h*, m/m*)</b>",
  xaxis: {
          title: "h/h*"
  },
  yaxis: {
          title: "m/m*"
  },
  titlefont: {
      family: "Roboto, sans-serif",
      color: "#01579b",
      size: 19,
  },
};

var resetPlots = function(context) {
  Plotly.newPlot('vhm-plot', [], blankLayout);fullscreenTool();
};

function resetVhm(){
  resetVhmForm();
  resetPlots();
}
//===============================================
//===============================================
/**
 * Globals
 */
var pi = 3.14159;
var inf = 9007199254740991; //'positive infinity': MAX_SAFE_INTEGER
//Plotly layout defaults
var xvals = [-2, 2]; //values for passing to plotly
var yvals = [0, 2];


/** 
  * Public Functions 
**/
var calculate_vhm;


//Plotly default layout
var blankLayout = {
        title: "<b>Failure envelope & factored load in terms of normalised (h/h*, m/m*)</b>",
        xaxis: {
                title: "h/h*"
        },
        yaxis: {
                title: "m/m*"
        },
        titlefont: {
            family: "Roboto, sans-serif",
            color: "#01579b",
            size: 19,
        },
};

/**
	* Data object for calculation
**/
var vhm_data = (function () {
    "use strict";
    var data = [[0, 0, 1.6285, -0.0463, 6.05, 1, 0.67],
                [0, 6, 1.9992, 0.0571, 9.85, 1, 1.19],
                [0, 20, 2.463, -0.0105, 15.48, 1, 1.92],
                [0, 60, 2.8896, 0.1342, 27.69, 1, 3.49],
                [0, 100, 3.1223, 0.1339, 37.88, 1, 4.77],
                [0.1, 0, 1.9301, -0.1583, 7.28, 1.72, 0.81],
                [0.1, 6, 1.8459, -0.1007, 10.11, 1.58, 1.17],
                [0.1, 20, 2.0858, -0.0206, 11.46, 1.42, 1.35],
                [0.1, 60, 2.1243, 0.0178, 12.3, 1.32, 1.49],
                [0.1, 100, 2.0532, 0.0049, 12.25, 1.3, 1.5],
                [0.25, 0, 2.1611, -0.4417, 8.75, 2.82, 1.01],
                [0.25, 6, 1.9442, -0.269, 10.48, 2.36, 1.19],
                [0.25, 20, 1.8992, -0.2142, 10.81, 2.07, 1.22],
                [0.25, 60, 1.9879, -0.2404, 10.97, 1.91, 1.26],
                [0.25, 100, 2.001, -0.2174, 10.78, 1.89, 1.25],
                [0.5, 0, 1.609, -0.5989, 11.29, 4.15, 1.47],
                [0.5, 6, 1.7584, -0.55, 11.29, 3.31, 1.34],
                [0.5, 20, 1.9931, -0.4797, 11.31, 2.94, 1.26],
                [0.5, 60, 2.0222, -0.4564, 12.07, 2.78, 1.28],
                [0.5, 100, 1.6482, -0.4841, 11.31, 2.76, 1.27]];
    
    return {
        // The raw data array
        data: data,

        // Input tuples, dDs and ks
        ins: data.map(function (row) {
            return row.slice(0, 2);
        }),

        // alphas array
        alphas: data.map(function (row) {
            return row.slice(2, 3);
        }),
        
        //betas array
        betas: data.map(function (row) {
            return row.slice(3, 4);
        }),
        
        //ncvs array
        NcVs: data.map(function (row) {
            return row.slice(4, 5);
        }),      
        
        //nchs array
        NcHs: data.map(function (row) {
            return row.slice(5, 6);
        }),
        
        //ncms array
        NcMs: data.map(function (row) {
            return row.slice(6, 7);
        })        
    };
}());


var inputCheck = function(results, name, value, lower = Number.NEGATIVE_INFINITY, upper = Number.POSITIVE_INFINITY, decimalPlaces = 2) {
  if (lower == ">=0" && (isNaN(value) || value < 0)) {
      results.errors.push(name + " must be ≥ 0.");
  }
  else if (lower == ">0" && (isNaN(value) || value <= 0)) {
      results.errors.push(name + " must be > 0.");
  }
  else if (lower == Number.NEGATIVE_INFINITY && upper == Number.POSITIVE_INFINITY && isNaN(value)) {
      results.errors.push(name + " must be a number.");
  }
  else if (isNaN(value) || value < lower || value > upper) {
      results.errors.push(name + " must be between " + Number(lower).toFixed(decimalPlaces) + " and " + Number(upper).toFixed(decimalPlaces) + ".");
  }
};
var alertInputErrors = function(results) {
  if (results.errors.length > 0) {
      var str = "";

      for (var i = 0; i < results.errors.length; i++) {
          str += results.errors[i] + "\n";
      }

      alert(str);
      return true;
  }

  return false;
}
/** 
 * 
 * Produces derived inputs, output values, and plot-able data for the VHM calculation or it's optimisation function
 * @param {object} options, An object populated with properties corresponding to interface values D, d, sum, K, Vd, Hd, Md, Vl, Hl, Ml, lam_d, lam_l, lam_mt, normalised (a string, "true"  
 * or "false"), optional, and optimise, a number representing optimisation variable (0:nil, 1:d, 2:D, 3:K, 4:sum, 5:lam_mt)
 * @returns {object} An object containing results stored as object properties. 
**/
calculate_vhm = function (options, plotoutput, plotwidth) {
    "use strict"; 
    //convenience variables
   	try {
		  var D = options.D, 
		  		d = options.d,
		  		sum = options.sum,
		  		K = options.K,
		  		Vd = options.Vd,
		  		Hd = options.Hd,
		  		Md = options.Md,
		  		Vl = options.Vl,
		  		Hl = options.Hl,
		  		Ml = options.Ml,
		  		lam_d = options.lam_d,
		  		lam_l = options.lam_l,
		  		lam_mt = options.lam_mt,
		  		normalised = options.normalised,
		  		optimise = options.optimise,
		  		optional = options.optional;
		 if (optional && ("t_cap" in options) && ("t_skirt" in options) && ("shell_density" in options)) {
			  var t_cap = options.t_cap;
			  var t_skirt = options.t_skirt;
			  var shell_density = options.shell_density;
		 }
		} catch (e) {
			alert("Developer, you are not passing variables correctly: " +  e);
		}
            
    var q = 4.69;
    var p = 2.12;
    
    //Private Functions
    /*
      Returns an array from begin to end, in increments of 'step'
      The difference between begin and end must be divisible by step, or unpredictable
      behaviour will arise.  This is unchecked by design.
    */
    var vectorise = function(begin, end, step) {
      "use strict";
      var vec = [];
      var nsteps = (end - begin)/step; //begin must be less than end
      for (var i = 0; i <= nsteps; i++) {
        vec.push((i*step) + begin);

      }
      
      return vec;
    };

    /*
      Pass meshgrid two 1d arrays (vectors)
      It will return the grid vectors arrayx and arrayy to produce a full 2d grid
    */
    var meshgrid2d = function(arrayx, arrayy) {
      "use strict";
      var gridx = []; //a 2d array, to hold rows for returning the x grid
      var gridy = []; //a 2d array, to hold rows for returning the y grid

      
      for(var y = 0; y < arrayy.length; y++) {
        gridx.push(arrayx); //adds a new line to the array;
      }

      var row = []; //a temporary array
     
      for(var y = 0; y < arrayy.length; y++) { 
        for(var x = 0; x < arrayx.length; x++) {
          row.push(arrayy[y]);      
        }
        gridy.push(row);
        row = [];
      }
      
      return {x:gridx, y:gridy};
    };
    
    var interpolation = function(d, su0, dD, k, A) {
        "use strict";

        // Creating a point tuple
        var point = [dD, k];
        // Extracting data from the vhm_data object for transparency - technically unnecessary
        var ins = vhm_data.ins; //these are the input ranges for interpolation, dDs and ks
        var alphas = vhm_data.alphas;
        var betas = vhm_data.betas;
        var ncvs = vhm_data.NcVs;
        var nchs = vhm_data.NcHs;
        var ncms = vhm_data.NcMs; 

				//running the actual interpolation, calls math.custom's Terp.
        var alpha = Terp.intern(ins, alphas, point);
        var beta = Terp.intern(ins, betas, point);
        var NcV = Terp.intern(ins, ncvs, point);
        var NcH = Terp.intern(ins, nchs, point);
        var NcM = Terp.intern(ins, ncms, point);
        
        var Vult = NcV * A * su0;
        var Hult = NcH * A * su0;
        var Mult = NcM * A * su0 * D;

              
        var v = Vf/Vult;
        var h = Hf/Hult;
        var m = Mf/Mult;  

        var h_star = 1-(Math.pow(v,q));
        var m_star = 1-(Math.pow(v,p));
        var hh_star = h/h_star;
        var mm_star = m/m_star;
    
        return {
          alpha: alpha,
          beta: beta,
          NcV: NcV,
          NcH: NcH,
          NcM: NcM,
          v: v,
          h: h,
          m: m,
          Vult: Vult,
          Hult: Hult,
          Mult: Mult,
          h_star: h_star,
          m_star: m_star,
          hh_star: hh_star,
          mm_star: mm_star,
          f1: f1

        };    
    };
    
    //Returns plotly layout object
    var plotlylayout = function (D, d, sum, K, lam_mt, normalised, width) {
      "use strict";
			if (normalised === "true") {
				var xleg = "h/h*";
				var yleg = "m/m*";
				var title = "<b>Failure envelope & factored load in terms of normalised (h/h*, m/m*)</b>";
			} else {
				var xleg = "H<sub>f</sub> (kN)";
				var yleg = "M<sub>f</sub> (kNm)";
				var title = "<b>Failure envelope & factored load in terms of factored (H<sub>f</sub>, M<sub>f</sub>)</b>";
			}
			//weighted
			if (options.f2) { 
				title = "D: " + D + "m, d: " + d + "m, Sum: " + sum + "kPa, K: " + K + "kPa/m, " + String.fromCharCode(955) + "mt: " + lam_mt + ", function: " + options.f2;
			} 
    	return {
            width: width,
						title: title,
						xaxis: {
              title: xleg,
              exponentformat: "none"
						},
						yaxis: {
              title: yleg,
              exponentformat: "none"
						},
            titlefont: {
              family: "Roboto, sans-serif",
              color: "#01579b",
              size: 19,
            },
				};
    }

    var plot = function(options) {
      var envelope = {
            x: options.normalised == "true" ? vectorise(-2, 2, 0.05) : math.multiply(math.dotMultiply(vectorise(-2, 2, 0.05), 1 - Math.pow(options.v,q)), options.Hult), //hh
            y: options.normalised == "true" ? vectorise(0, 2, 0.05) : math.multiply(math.dotMultiply(vectorise(0, 2, 0.05), 1 - Math.pow(options.v,p)), options.Mult), //mm
            z: options.f1,
            name: "Failure Envelope",
            type: "contour",
			colorscale: [['0.0', 'rgb(224, 224, 224)'], ['1.0', 'rgb(255, 255, 255)']],
            autocontour: false,
            showscale: false,
            contours: {
            	start: 1,
            	end: 1,
            	size: 1
            }
        };
        var facload = {
        	x: options.normalised == "true" ? [options.hh_star] : [options.Hf],
        	y: options.normalised == "true" ? [options.mm_star] : [options.Mf],
        	name: "Factored Load",
        	type: "scatter",
            marker: {
                symbol: "diamond",
                size: 12,
                color: "#01579b"
            }
        };
        return [envelope, facload];
    };
    
    
    
    //START
 
    if (lam_mt >= 1) {
        sum = sum/lam_mt;
        K = K/lam_mt;
    } else {
        sum = sum*lam_mt;
        K = K*lam_mt;
    }
    
    var Vf = lam_d*Vd + lam_l*Vl;
    var Hf = lam_d*Hd + lam_l*Hl;
    var Mf = lam_d*Md + lam_l*Ml;
    
    //Derived Input
    var A = pi*(Math.pow(D,2)/4); 
    var dD = d/D; 
    var su0 = sum + K*d;
    var k = K*D/sum; 

    var shell_volume = optional ? pi*Math.pow(D,2)/4*t_cap+pi*D*d*t_skirt : "undefined";  //TODO
    var shell_weight = optional ? shell_volume * shell_density : "undefined";

    var data; //declaring here for scope to draw after calculation
    var grid = meshgrid2d(vectorise(-2, 2, 0.05), vectorise(0, 2, 0.05));
    var hhs = grid.x; 
    var mms = grid.y;
   
    //No optimisation
    if (optimise === 0) {

      data = interpolation(d, su0, dD, k, A);
        
      //consider f1 to be = real( (abs(hhs)).^alpha + mms.^alpha + 2*beta * hhs.*mms); 			 
      var f1 = math.re(math.add(math.add(math.dotPow(math.abs(hhs), data.alpha), math.dotPow(mms, data.alpha)), math.dotMultiply(math.multiply(2*data.beta, hhs), mms)));
           
      var plotlayout = plotlylayout(D, d, sum, K, lam_mt, normalised, plotwidth);
      
			var plotdata = plot({f1: f1, normalised: normalised, v: data.v, Hult: data.Hult, Mult: data.Mult, Hf: Hf, Mf: Mf, hh_star: data.hh_star, mm_star: data.mm_star});
      Plotly.newPlot(plotoutput, plotdata, plotlayout);fullscreenTool();
      
    	return {
    	  "dD": dD,
    	  "A": A,
    	  "su0": su0,
    	  "k": k,
    	  "Vf": Vf,
    	  "Hf": Hf,
    	  "Mf": Mf,
    	  "NcV": data.NcV,
    	  "NcH": data.NcH,
    	  "NcM": data.NcM,
    	  "Vult": data.Vult,
    	  "Hult": data.Hult,
    	  "Mult": data.Mult,
    	  "v": data.v,
    	  "h": data.h,
    	  "m": data.m,
    	  "hh_star": data.hh_star,
    	  "mm_star": data.mm_star,
    	  "shell_volume": shell_volume,
        "shell_weight": shell_weight
    	};
    //end of standard calc  
    } else if (optimise === 1) {
    //optimise by only changing skirt length (d)
      dD = 0.5;
      var min_diff = 0.5;
      var count = 0;
      var min_weight = inf;
      var data; 
      var f2_displayed = 0;
      
      for (dD = 0.5; dD >= 0; dD = dD - 0.01) {
        d = D * dD;
        su0 = sum + K*d;
        data = interpolation(d, su0, dD, k, A);
        //f2=real((abs(hh_star)).^alpha+mm_star.^alpha+2*beta*hh_star.*mm_star);
        var f2 = math.re(math.add(math.add(math.dotPow((math.abs(data.hh_star)),data.alpha), math.dotPow(data.mm_star,data.alpha)), math.dotMultiply(math.multiply(2*data.beta, data.hh_star),data.mm_star)));  

        if (optional) {
        	shell_volume = pi * Math.pow(D,2)/4 * options.t_cap + pi*D*d*options.t_skirt;
        	shell_weight = shell_volume * options.shell_density;
        	for (var diff = -0.05; diff >=-0.5; diff = diff - 0.05) {
        		if ( ((math.subtract(f2, 1)) > diff) && ((math.subtract(f2, 1)) <  0) && (d >= 0) && (D >= 0) && (K >= 0) && (sum >=0) && (data.mm_star >= 0) && (shell_weight <= min_weight) ) {
        			f2_displayed = math.add(f2, 0);
                    count++;

        			min_weight = shell_weight;
        			break;
        		}
        	}
        } else if (math.abs(math.subtract(f2, 1)) < min_diff && (math.subtract(f2, 1) < 0) && sum > 0 && d > 0 && D > 0 && data.mm_star > 0) {
            f2_displayed = math.add(f2, 0);
            count++;
            min_diff = math.abs(math.subtract(f2, 1));
            var mini = {D: D, sum: sum, lam_mt: lam_mt, d: d, K: K, dD: dD, A: A, su0: su0, k: k, Vf: Vf, Mf: Mf, Hf: Hf, data: data, shell_volume: "undefined", shell_weight: "undefined"};
        }
      }
      
      if(count != 0) {  
              //plot
              var f1 = math.re(math.add(math.add(math.dotPow(math.abs(hhs), mini.data.alpha), math.dotPow(mms, mini.data.alpha)), math.dotMultiply(math.multiply(2*mini.data.beta, hhs), mms)));
              var plotlayout = plotlylayout(mini.D, mini.d, mini.sum, mini.K, mini.lam_mt, normalised);
              var plotdata = plot({f1: f1, normalised: normalised, v: mini.data.v, Hult: mini.data.Hult, Mult: mini.data.Mult, Hf: mini.Hf, Mf: mini.Mf, hh_star: mini.data.hh_star, mm_star: mini.data.mm_star});
              Plotly.newPlot(plotoutput, plotdata, plotlayout);fullscreenTool();
              
            	return {
            	  "dD": mini.dD,
            	  "A": mini.A,
            	  "su0": mini.su0,
            	  "k": mini.k,
            	  "Vf": mini.Vf,
            	  "Hf": mini.Hf,
            	  "Mf": mini.Mf,
            	  "NcV": mini.data.NcV,
            	  "NcH": mini.data.NcH,
            	  "NcM": mini.data.NcM,
            	  "Vult": mini.data.Vult,
            	  "Hult": mini.data.Hult,
            	  "Mult": mini.data.Mult,
            	  "v": mini.data.v,
            	  "h": mini.data.h,
            	  "m": mini.data.m,
            	  "hh_star": mini.data.hh_star,
            	  "mm_star": mini.data.mm_star, 
            	  "shell_volume": mini.shell_volume,
            	  "shell_weight": mini.shell_weight,
                  "D_optimized": mini.D,
                  "d_optimized": mini.d,
                  "sum_optimized": mini.sum,
                  "k_optimized": mini.K,
                  "lam_mt_optimized": mini.lam_mt,
                  "f2_optimized": f2_displayed
             	};
      }
      return { "error": "No solution found for these parameters." };
      
    } else if (optimise === 2) {
      //optimise by only changing foundation diameter (D)
      dD = 0.5;
      var min_diff = 0.5;
      var count = 0;
      var min_weight = inf;
      var data;
      var f2_displayed = 0;
      
      for (dD = 0.5; dD > 0.01; dD = (dD - 0.01)) {
        D = d/dD;
        k = ((K * D) / sum);
        A = pi*(Math.pow(D,2)/4); 
        data = interpolation(d, su0, dD, k, A);
        //f2=real((abs(hh_star)).^alpha+mm_star.^alpha+2*beta*hh_star.*mm_star);
        var f2 = math.re(math.add(math.add(math.dotPow((math.abs(data.hh_star)),data.alpha), math.dotPow(data.mm_star,data.alpha)), math.dotMultiply(math.multiply(2*data.beta, data.hh_star),data.mm_star)));  

        if (optional) {
        	shell_volume = pi * Math.pow(D,2)/4 * options.t_cap + pi*D*d*options.t_skirt;
        	shell_weight = shell_volume * options.shell_density;
        	for (var diff = -0.05; diff >=-0.5; diff = diff - 0.05) {
        		if ( ((math.subtract(f2, 1)) > diff) && ((math.subtract(f2, 1)) <  0) && (d >= 0) && (D >= 0) && (K >= 0) && (sum >=0) && (data.mm_star >= 0) && (shell_weight <= min_weight) ) {
                    f2_displayed = math.add(f2, 0);
        			count++;
        			min_weight = shell_weight;
        			break;
        		}
        	}
        } else if (math.abs(math.subtract(f2, 1)) < min_diff && (math.subtract(f2, 1) < 0) && sum > 0 && d > 0 && D > 0 && data.mm_star > 0) {
            f2_displayed = math.add(f2, 0);
            count++;
            min_diff = math.abs(math.subtract(f2, 1));
            var mini = {D: D, sum: sum, lam_mt: lam_mt, d: d, K: K, dD: dD, A: A, su0: su0, k: k, Vf: Vf, Mf: Mf, Hf: Hf, data: data, shell_volume: "undefined", shell_weight: "undefined"};
        }
      }
      
      if(count != 0) {
              //plot
              var f1 = math.re(math.add(math.add(math.dotPow(math.abs(hhs), mini.data.alpha), math.dotPow(mms, mini.data.alpha)), math.dotMultiply(math.multiply(2*mini.data.beta, hhs), mms)));
              var plotlayout = plotlylayout(mini.D, mini.d, mini.sum, mini.K, mini.lam_mt, normalised);
              var plotdata = plot({f1: f1, normalised: normalised, v: mini.data.v, Hult: mini.data.Hult, Mult: mini.data.Mult, Hf: mini.Hf, Mf: mini.Mf, hh_star: mini.data.hh_star, mm_star: mini.data.mm_star});
              Plotly.newPlot(plotoutput, plotdata, plotlayout);fullscreenTool();

            	return {
            	  "dD": mini.dD,
            	  "A": mini.A,
            	  "su0": mini.su0,
            	  "k": mini.k,
            	  "Vf": mini.Vf,
            	  "Hf": mini.Hf,
            	  "Mf": mini.Mf,
            	  "NcV": mini.data.NcV,
            	  "NcH": mini.data.NcH,
            	  "NcM": mini.data.NcM,
            	  "Vult": mini.data.Vult,
            	  "Hult": mini.data.Hult,
            	  "Mult": mini.data.Mult,
            	  "v": mini.data.v,
            	  "h": mini.data.h,
            	  "m": mini.data.m,
            	  "hh_star": mini.data.hh_star,
            	  "mm_star": mini.data.mm_star, 
            	  "shell_volume": mini.shell_volume,
            	  "shell_weight": mini.shell_weight,
                  "D_optimized": mini.D,
                  "d_optimized": mini.d,
                  "sum_optimized": mini.sum,
                  "k_optimized": mini.K,
                  "lam_mt_optimized": mini.lam_mt,
                  "f2_optimized": f2_displayed
             	};
      }
      return { "error": "No solution found for these parameters." };
    } else if (optimise === 3) {
      //optimise by only changing shear strngth gradient (K)
      var min_diff = 0.5;
      var count = 0;
      var min_weight = inf;
      var data; 
      var f2_displayed = 0;
      
      for (k = 100; k >= 0; k--) {
        K = k*sum/D
        su0 = sum+K*d;

        data = interpolation(d, su0, dD, k, A);
        
        //f2=real((abs(hh_star)).^alpha+mm_star.^alpha+2*beta*hh_star.*mm_star);
        var f2 = math.re(math.add(math.add(math.dotPow((math.abs(data.hh_star)),data.alpha), math.dotPow(data.mm_star,data.alpha)), math.dotMultiply(math.multiply(2*data.beta, data.hh_star),data.mm_star)));  

        if (optional) {
        	shell_volume = pi * Math.pow(D,2)/4 * options.t_cap + pi*D*d*options.t_skirt;
        	shell_weight = shell_volume * options.shell_density;
        	for (var diff = -0.05; diff >=-0.5; diff = diff - 0.05) {
        		if ( ((math.subtract(f2, 1)) > diff) && ((math.subtract(f2, 1)) <  0) && (d >= 0) && (D >= 0) && (K >= 0) && (sum >=0) && (data.mm_star >= 0) && (shell_weight <= min_weight) ) {
                    f2_displayed = math.add(f2, 0);
        			count++;
        			min_weight = shell_weight;
        			break;
        		}
        	}
        } else if (math.abs(math.subtract(f2, 1)) < min_diff && (math.subtract(f2, 1) < 0) && sum > 0 && d > 0 && D > 0 && data.mm_star > 0) {
            f2_displayed = math.add(f2, 0);
            count++;
            min_diff = math.abs(math.subtract(f2, 1));
            var mini = {D: D, sum: sum, lam_mt: lam_mt, d: d, K: K, dD: dD, A: A, su0: su0, k: k, Vf: Vf, Mf: Mf, Hf: Hf, data: data, shell_volume: "undefined", shell_weight: "undefined"};
        }
      }
      
      if(count != 0) {  
              //plot
              var f1 = math.re(math.add(math.add(math.dotPow(math.abs(hhs), mini.data.alpha), math.dotPow(mms, mini.data.alpha)), math.dotMultiply(math.multiply(2*mini.data.beta, hhs), mms)));
              var plotlayout = plotlylayout(mini.D, mini.d, mini.sum, mini.K, mini.lam_mt, normalised);
              var plotdata = plot({f1: f1, normalised: normalised, v: mini.data.v, Hult: mini.data.Hult, Mult: mini.data.Mult, Hf: mini.Hf, Mf: mini.Mf, hh_star: mini.data.hh_star, mm_star: mini.data.mm_star});
              Plotly.newPlot(plotoutput, plotdata, plotlayout);fullscreenTool();
              
            	return {
            	  "dD": mini.dD,
            	  "A": mini.A,
            	  "su0": mini.su0,
            	  "k": mini.k,
            	  "Vf": mini.Vf,
            	  "Hf": mini.Hf,
            	  "Mf": mini.Mf,
            	  "NcV": mini.data.NcV,
            	  "NcH": mini.data.NcH,
            	  "NcM": mini.data.NcM,
            	  "Vult": mini.data.Vult,
            	  "Hult": mini.data.Hult,
            	  "Mult": mini.data.Mult,
            	  "v": mini.data.v,
            	  "h": mini.data.h,
            	  "m": mini.data.m,
            	  "hh_star": mini.data.hh_star,
            	  "mm_star": mini.data.mm_star, 
            	  "shell_volume": mini.shell_volume,
            	  "shell_weight": mini.shell_weight,
                  "D_optimized": mini.D,
                  "d_optimized": mini.d,
                  "sum_optimized": mini.sum,
                  "k_optimized": mini.K,
                  "lam_mt_optimized": mini.lam_mt,
                  "f2_optimized": f2_displayed
             	};
      }
      return { "error": "No solution found for these parameters." };
    } else if (optimise === 4) {
      //optimise by only changing sum
      var min_diff = 0.5;
      var count = 0;
      var min_weight = inf;
      var data; 
      var f2_displayed = 0;
      
      for (sum = 0.01; sum < 20; sum = sum + 0.01) {
        K = k*sum/D
        su0 = sum+K*d;

        data = interpolation(d, su0, dD, k, A);
        //f2=real((abs(hh_star)).^alpha+mm_star.^alpha+2*beta*hh_star.*mm_star);
        var f2 = math.re(math.add(math.add(math.dotPow((math.abs(data.hh_star)),data.alpha), math.dotPow(data.mm_star,data.alpha)), math.dotMultiply(math.multiply(2*data.beta, data.hh_star),data.mm_star)));  

        if (optional) {
        	shell_volume = pi * Math.pow(D,2)/4 * options.t_cap + pi*D*d*options.t_skirt;
        	shell_weight = shell_volume * options.shell_density;
        	for (var diff = -0.05; diff >=-0.5; diff = diff - 0.05) {
        		if ( ((math.subtract(f2, 1)) > diff) && ((math.subtract(f2, 1)) <  0) && (d >= 0) && (D >= 0) && (K >= 0) && (sum >=0) && (data.mm_star >= 0) && (shell_weight <= min_weight) ) {
                    f2_displayed = math.add(f2, 0);
        			count++;
        			min_weight = shell_weight;
        			break;
        		}
        	}
        } else if (math.abs(math.subtract(f2, 1)) < min_diff && (math.subtract(f2, 1) < 0) && sum > 0 && d > 0 && D > 0 && data.mm_star > 0) {
            f2_displayed = math.add(f2, 0);
            count++;
            min_diff = math.abs(math.subtract(f2, 1));
            var mini = {D: D, sum: sum, lam_mt: lam_mt, d: d, K: K, dD: dD, A: A, su0: su0, k: k, Vf: Vf, Mf: Mf, Hf: Hf, data: data, shell_volume: "undefined", shell_weight: "undefined"};
        }
      }
      
      if(count != 0) {  
              //plot
              var f1 = math.re(math.add(math.add(math.dotPow(math.abs(hhs), mini.data.alpha), math.dotPow(mms, mini.data.alpha)), math.dotMultiply(math.multiply(2*mini.data.beta, hhs), mms)));
              var plotlayout = plotlylayout(mini.D, mini.d, mini.sum, mini.K, mini.lam_mt, normalised);
              var plotdata = plot({f1: f1, normalised: normalised, v: mini.data.v, Hult: mini.data.Hult, Mult: mini.data.Mult, Hf: mini.Hf, Mf: mini.Mf, hh_star: mini.data.hh_star, mm_star: mini.data.mm_star});
              Plotly.newPlot(plotoutput, plotdata, plotlayout);fullscreenTool();
              
            	return {
            	  "dD": mini.dD,
            	  "A": mini.A,
            	  "su0": mini.su0,
            	  "k": mini.k,
            	  "Vf": mini.Vf,
            	  "Hf": mini.Hf,
            	  "Mf": mini.Mf,
            	  "NcV": mini.data.NcV,
            	  "NcH": mini.data.NcH,
            	  "NcM": mini.data.NcM,
            	  "Vult": mini.data.Vult,
            	  "Hult": mini.data.Hult,
            	  "Mult": mini.data.Mult,
            	  "v": mini.data.v,
            	  "h": mini.data.h,
            	  "m": mini.data.m,
            	  "hh_star": mini.data.hh_star,
            	  "mm_star": mini.data.mm_star, 
            	  "shell_volume": mini.shell_volume,
            	  "shell_weight": mini.shell_weight,
                  "D_optimized": mini.D,
                  "d_optimized": mini.d,
                  "sum_optimized": mini.sum,
                  "k_optimized": mini.K,
                  "lam_mt_optimized": mini.lam_mt,
                  "f2_optimized": f2_displayed
             	};
      }
      return { "error": "No solution found for these parameters." };
    } else if (optimise === 5) {
      //optimise by only changing lambda mat
      var min_diff = 0.5;
      var count = 0;
      var min_weight = inf;
      var data; 
      var sumprime = sum;
      var Kprime = K;
      var f2_displayed = 0;
      
      for (lam_mt = 0.05; lam_mt < 5; lam_mt = lam_mt + 0.05) {
        if(lam_mt >= 1) {
          sum = sumprime/lam_mt;
          K = Kprime/lam_mt;
        } else {
          sum = sumprime*lam_mt;
          K = Kprime*lam_mt;
        }
        k = K*D/sum;
        su0 = sum + K*d;

        data = interpolation(d, su0, dD, k, A);
        //f2=real((abs(hh_star)).^alpha+mm_star.^alpha+2*beta*hh_star.*mm_star);
        var f2 = math.re(math.add(math.add(math.dotPow((math.abs(data.hh_star)),data.alpha), math.dotPow(data.mm_star,data.alpha)), math.dotMultiply(math.multiply(2*data.beta, data.hh_star),data.mm_star)));  

        if (optional) {
        	shell_volume = pi * Math.pow(D,2)/4 * options.t_cap + pi*D*d*options.t_skirt;
        	shell_weight = shell_volume * options.shell_density;
        	for (var diff = -0.05; diff >=-0.5; diff = diff - 0.05) {
        		if ( ((math.subtract(f2, 1)) > diff) && ((math.subtract(f2, 1)) <  0) && (d >= 0) && (D >= 0) && (K >= 0) && (sum >=0) && (data.mm_star >= 0) && (shell_weight <= min_weight) ) {
                    f2_displayed = math.add(f2, 0);
        			count++;
        			min_weight = shell_weight;
        			break;
        		}
        	}
        } else if (math.abs(math.subtract(f2, 1)) < min_diff && (math.subtract(f2, 1) < 0) && sum > 0 && d > 0 && D > 0 && data.mm_star > 0) {
            f2_displayed = math.add(f2, 0);
            count++;
            min_diff = math.abs(math.subtract(f2, 1));
            var mini = {D: D, sum: sum, lam_mt: lam_mt, d: d, K: K, dD: dD, A: A, su0: su0, k: k, Vf: Vf, Mf: Mf, Hf: Hf, data: data, shell_volume: "undefined", shell_weight: "undefined"};
        }
      }
      
      if(count != 0) {  
              //plot
              var f1 = math.re(math.add(math.add(math.dotPow(math.abs(hhs), mini.data.alpha), math.dotPow(mms, mini.data.alpha)), math.dotMultiply(math.multiply(2*mini.data.beta, hhs), mms)));
              var plotlayout = plotlylayout(mini.D, mini.d, mini.sum, mini.K, mini.lam_mt, normalised);
              var plotdata = plot({f1: f1, normalised: normalised, v: mini.data.v, Hult: mini.data.Hult, Mult: mini.data.Mult, Hf: mini.Hf, Mf: mini.Mf, hh_star: mini.data.hh_star, mm_star: mini.data.mm_star});
              Plotly.newPlot(plotoutput, plotdata, plotlayout);fullscreenTool();
              
            	return {
            	  "dD": mini.dD,
            	  "A": mini.A,
            	  "su0": mini.su0,
            	  "k": mini.k,
            	  "Vf": mini.Vf,
            	  "Hf": mini.Hf,
            	  "Mf": mini.Mf,
            	  "NcV": mini.data.NcV,
            	  "NcH": mini.data.NcH,
            	  "NcM": mini.data.NcM,
            	  "Vult": mini.data.Vult,
            	  "Hult": mini.data.Hult,
            	  "Mult": mini.data.Mult,
            	  "v": mini.data.v,
            	  "h": mini.data.h,
            	  "m": mini.data.m,
            	  "hh_star": mini.data.hh_star,
            	  "mm_star": mini.data.mm_star, 
            	  "shell_volume": mini.shell_volume,
            	  "shell_weight": mini.shell_weight,
                  "D_optimized": mini.D,
                  "d_optimized": mini.d,
                  "sum_optimized": mini.sum,
                  "k_optimized": mini.K,
                  "lam_mt_optimized": mini.lam_mt,
                  "f2_optimized": f2_displayed
             	};
      }
      return { "error": "No solution found for these parameters." };
    }
    
};
// 计算函数
function calculateVhm(){
  // get input data
  let inputList = $("div.card-input input[type=number]");
  let formData=[];
  inputList.each((index,item)=>{
    formData[$(item).attr("id")]=Number($(item).val());;
  });
  inputList = $("div.card-input input[type=radio]:checked");
  inputList.each((index,item)=>{
    formData[$(item).val()]="on";
  });
  //get plot container
  var vhmplot = "vhm-plot",
  vhmwidth = $("#"+vhmplot)[0].clientWidth,
  normalised = "normalised" in formData ? "true" : "false",
  // Derived
  options = {D: formData["D"],
            d: formData["d"],
            sum: formData["sum"],
            K: formData["K"],
            Vd: formData["Vd"],
            Hd: formData["Hd"],
            Md: formData["Md"],
            Vl: formData["Vl"],
            Hl: formData["Hl"],
            Ml: formData["Ml"],
            lam_d: formData["lam_d"],
            lam_l: formData["lam_l"],
            lam_mt: formData["lam_mt"],
            optional: formData["optional"],
            optimise: 0,
            normalised: normalised
          },
  //options = {t_cap: formData["t_cap"], t_skirt: formData["t_skirt"], shell_density: formData["shell_density"]},
  result;
  
  // check derived values are within valid range
  var results = {
      errors: [],
  };

  inputCheck(results, "d/D", formData["d"] / formData["D"], 0, 0.5);
  inputCheck(results, "k_su", formData["K"], 0, 50);
  inputCheck(results, "ϰ_su", (formData["K"] * formData["D"]) / formData["sum"], 0, 100);
  if (alertInputErrors(results)) {
    return;
  }
  // Make sure to throw meaningful exceptions as these will be reported to the user.
  try {
    // The calcs proper.
    result = calculate_vhm(options, vhmplot, vhmwidth);
    
    // // Set the state of the polymer element.
    // //derived eles
    // this.dD = result.dD.toFixed(2);
    // this.k = result.k.toFixed(2);
    // this.su0 = result.su0.toFixed(0);
    // this.su0f = Number(result.su0 * formData["lam_mt"]).toFixed(2);
    // this.A = result.A.toFixed(2);
    // this.Vf = result.Vf.toFixed(0);
    // this.Hf = result.Hf.toFixed(0);
    // this.Mf = result.Mf.toFixed(0);
    // //output
    // this.NcV = result.NcV.toFixed(2);
    // this.NcH = result.NcH.toFixed(2);
    // this.NcM = result.NcM.toFixed(2);
    // this.v = result.v.toFixed(2);
    // this.h = result.h.toFixed(2);
    // this.m = result.m.toFixed(2);
    // this.hh_star = result.hh_star.toFixed(2);
    // this.mm_star = result.mm_star.toFixed(2);
    // this.Vult = result.Vult.toFixed(2);
    // this.Hult = result.Hult.toFixed(2);
    // this.Mult = result.Mult.toFixed(2);
    derivedInputs = {
      "dD": result.dD.toFixed(2),
      "A": result.A.toFixed(2),
      "su0": result.su0.toFixed(0),
      "su0f": Number(result.su0 * formData["lam_mt"]).toFixed(2),
      "k": result.k.toFixed(2),
      "Vf": result.Vf.toFixed(0),
      "Hf": result.Hf.toFixed(0),
      "Mf": result.Mf.toFixed(0)
    },
    // Outputs
    outputs = {
      "NcV": result.NcV.toFixed(2),
      "NcH": result.NcH.toFixed(2),
      "NcM": result.NcM.toFixed(2),
      "Vult": result.Vult.toFixed(2),
      "Hult": result.Hult.toFixed(2),
      "Mult": result.Mult.toFixed(2),
      "v": result.v.toFixed(2),
      "h": result.h.toFixed(2),
      "m": result.m.toFixed(2),
      "hh_star": result.hh_star.toFixed(2),
      "mm_star": result.mm_star.toFixed(2),
      "D_optimized": "N/A",
      "d_optimized": "N/A",
      "sum_optimized": "N/A",
      "k_optimized": "N/A",
      "lam_mt_optimized": "N/A",
      "f2_optimized": "N/A"
    }
    setvalue(derivedInputs);
    setvalue(outputs);
  } catch (e) {
    //document.getElementById("error-card").style.display = 'block';
    //this.error = E;
    //document.getElementById("error").focus();
  
      alert("Error: " + e);
  }

  return result;
}
//优化函数
function optimiseVhm() {
  // get input data
  let inputList = $("div.card-input input[type=number]");
  let formData=[];
  inputList.each((index,item)=>{
    formData[$(item).attr("id")]=Number($(item).val());
  });
  inputList = $("div.card-input input[type=radio]:checked");
  inputList.each((index,item)=>{
    formData[$(item).val()]="on";
  });
  //get plot container
  var vhmplot = "vhm-plot",
  vhmwidth = $("#"+vhmplot)[0].clientWidth,
  normalised = "normalised" in formData ? "true" : "false",

  optimise = $('input[name="optimise"]:checked').attr("value");
  optimise = Number(optimise);
  console.log(optimise);

  // check derived values are within valid range
  if (formData["d"] / formData["D"] > 0.5 || formData["d"] / formData["D"] < 0) {
    alert("d/D must be between 0 and 0.5.");
    return;
  }
  else if (formData["K"] < 0 || formData["K"] > 50) {
    alert("k_su must be between 0 and 50.");
    return;
  }
  else if (formData["k"] < 0 || formData["k"] > 100) {
    alert("ϰ_su must be between 0 and 100.");
    return;
  }

  // Input
  var options = {D: formData["D"],
  d: formData["d"],
  sum: formData["sum"],
  K: formData["K"],
  Vd: formData["Vd"],
  Hd: formData["Hd"],
  Md: formData["Md"],
  Vl: formData["Vl"],
  Hl: formData["Hl"],
  Ml: formData["Ml"],
  lam_d: formData["lam_d"],
  lam_l: formData["lam_l"],
  lam_mt: formData["lam_mt"],
  optimise: optimise,
  normalised: normalised
  },
  //options = {t_cap: formData["t_cap"], t_skirt: formData["t_skirt"], shell_density: formData["shell_density"]},

  result;
 // Make sure to throw meaningful exceptions as these will be reported to the user.
try {
  // The calcs proper.
  result = calculate_vhm(options, vhmplot, vhmwidth);
  if ( "error" in result) {
    //this.reset();
    //document.getElementById("error-card").style.display = 'block';
    //this.error = result.error;
    //document.getElementById("error").focus();
  
      alert(result.error);
  
    return;
  }
  // Set the state of the polymer element.
  //derived eles
  var derivedInputs = {
    "dD": result.dD.toFixed(2),
    "A": result.A.toFixed(2),
    "su0": result.su0.toFixed(2),
    "su0f": Number(result.su0 * formData["lam_mt"]).toFixed(2),
    "k": result.k.toFixed(2),
    "Vf": result.Vf.toFixed(0),
    "Hf": result.Hf.toFixed(0),
    "Mf": result.Mf.toFixed(0)
  },
  // Outputs
  outputs = {
    "NcV": result.NcV.toFixed(2),
    "NcH": result.NcH.toFixed(2),
    "NcM": result.NcM.toFixed(2),
    "Vult": result.Vult.toFixed(2),
    "Hult": result.Hult.toFixed(2),
    "Mult": result.Mult.toFixed(2),
    "v": result.v.toFixed(2),
    "h": result.h.toFixed(2),
    "m": result.m.toFixed(2),
    "hh_star": result.hh_star.toFixed(2),
    "mm_star": result.mm_star.toFixed(2),
    "D_optimized": result.D_optimized.toFixed(2),
    "d_optimized": result.d_optimized.toFixed(2),
    "sum_optimized": result.sum_optimized.toFixed(2),
    "k_optimized": result.k_optimized.toFixed(2),
    "lam_mt_optimized": result.lam_mt_optimized.toFixed(2),
    "f2_optimized": result.f2_optimized.toFixed(2)
  }
  //optimized
  setvalue(derivedInputs);
  setvalue(outputs);
  
  } catch (e) {
      alert("There was a calculation error, try again with different input terms.");
      console.log(e);
  }
} 


function plotZoom(el){
  // console.log(el);
  if(document.fullscreen) {
    document.exitFullscreen()
  } else {
    fullPlotlyId=$(el).closest('.js-plotly-plot')[0].id;
    // console.log(fullPlotlyId);
    $(el).closest('.js-plotly-plot')[0].requestFullscreen();
    //Plotly.newPlot("plotly", data, layout);
  }
}

function fullscreenTool() {
  $(".modebar-btn.plotlyjsicon.modebar-btn--logo").replaceWith(
  `
  <a rel="tooltip" onclick=plotZoom(this) class="modebar-btn fullscreen-btn" data-title="Full Screen" data-attr="zoom" data-val="auto" data-toggle="false" data-gravity="n" >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon" height="1em" width="1em">
      <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
      <path d="M128 32H32C14.31 32 0 46.31 0 64v96c0 17.69 14.31 32 32 32s32-14.31 32-32V96h64c17.69 0 32-14.31 32-32S145.7 32 128 32zM416 32h-96c-17.69 0-32 14.31-32 32s14.31 32 32 32h64v64c0 17.69 14.31 32 32 32s32-14.31 32-32V64C448 46.31 433.7 32 416 32zM128 416H64v-64c0-17.69-14.31-32-32-32s-32 14.31-32 32v96c0 17.69 14.31 32 32 32h96c17.69 0 32-14.31 32-32S145.7 416 128 416zM416 320c-17.69 0-32 14.31-32 32v64h-64c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c17.69 0 32-14.31 32-32v-96C448 334.3 433.7 320 416 320z"/>
    </svg>
  </a>
  `);
  }

$(document).ready(()=>{fullscreenTool()});
$(window).resize((event)=>{

  if(fullPlotlyId){Plotly.Plots.resize(fullPlotlyId);}
  fullscreenTool();

});