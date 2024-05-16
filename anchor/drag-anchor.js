var firstPlotlyId="drag-anchor-plot1";
var secondPlotlyId="drag-anchor-plot2";
/*
 * Produces derived inputs, output values, and plot data for drag anchor calculations from input data.
 * @param {object} inputs An object populated with properties corresponding to interface values 'Sum', 'k', 'Zt', etc.
 * @returns {object} An object containing results stored as object properties.
 */
var DragAnchorCalculate = function (inputs) {
    "use strict";

    var results = {
        errors: [],
    };

    // these variables are retrieved from the user interface
    var Sum_initial = inputs.Sum;
    var Sum = Sum_initial;
    var k = inputs.k;
    var Zt = inputs.Zt;
    var d = inputs.d;
    var bd = inputs.bd;
    var b = bd * d;
    var Nc1 = inputs.Nc1;
    var Miu = inputs.Miu;
    var mass = inputs.mass;
    var weight = mass * 9.81;
    var Ap = inputs.Ap;
    var Nc2 = inputs.Nc2;
    var f = inputs.f;
    var qm = inputs.qm;
    qm = qm * (Math.PI / 180);
    var qw = inputs.qw;
    qw = (qw / 180) * Math.PI;
    var offset = inputs.offset;

    // check for erroneous input values
    inputCheck(results, "S_um", Sum, ">=0");
    inputCheck(results, "k_su", k, ">=0");
    inputCheck(results, "z'", Zt, ">=0");
    inputCheck(results, "d", d, ">0");
    inputCheck(results, "b/d", bd, ">0");
    inputCheck(results, "N_c,chain", Nc1, ">0");
    inputCheck(results, "μ", Miu, ">0");
    inputCheck(results, "M", mass, ">0");
    inputCheck(results, "A_p", Ap, ">0");
    inputCheck(results, "N_c,anchor", Nc2, ">0");
    inputCheck(results, "f", f, ">0");
    inputCheck(results, "θ_w", qw, ">0");
    inputCheck(results, "θ_m", qm, ">=0");
    inputCheck(results, "offset", offset, ">=0");

    if (results.errors.length > 0) {
        return results;
    }

    // declare loop variables
    var zf = 1e-4;
    var diff = Number.POSITIVE_INFINITY;

    var su_at_zf = 0;
    var Tp = 0;
    var q_p_w = 0;
    var Ta1 = 0;
    var za = 0;
    var su_dz = 0;
    var zaQav = 0;
    var Ta2 = 0;
    var Tm = 0;
    var zf_st = 0;
    var su_at_zf_st = 0;
    var Tp_st = 0;
    var q_p_w_st = 0;
    var Ta1_st = 0;
    var su_dz_st = 0;
    var zaQav_st = 0;
    var Ta2_st = 0;
    var Tm_st = 0;

    // first loop
    while (zf < 100) {
        // From Anchor Criterion
        su_at_zf = (zf - Zt) * k + Sum;
        Tp = Ap * Nc2 * f * su_at_zf;
        q_p_w = Math.atan((Tp * Math.tan(qw) + weight) / Tp);
        Ta1 = Tp / Math.cos(q_p_w);

        // From Chain Criterion
        za = zf - offset;
        su_dz = (za > Zt);
        su_dz = su_dz * 0.5 * k * Math.pow(za - Zt, 2) + Sum * za;
        zaQav = b * Nc1 * su_dz;
        Ta2 = 2 * zaQav / Math.pow(q_p_w - qm, 2);
        Tm = Ta2 * Math.exp(Miu * (q_p_w - qm));

        if (Math.abs(Ta1 - Ta2) <= diff) {
            diff = Math.abs(Ta1 - Ta2);
            zf_st = zf;
            su_at_zf_st = su_at_zf;
            Tp_st = Tp;
            q_p_w_st = q_p_w;
            Ta1_st = Ta1;
            su_dz_st = su_dz;
            zaQav_st = zaQav;
            Ta2_st = Ta2;
            Tm_st = Tm;
        }

        zf += 1e-4;
    }

    var h = Tm_st / weight;

    // add derived values and output to results
    results.h = h;

    results.Tp = Tp_st.toFixed(0);
    results.su_at_zf = su_at_zf_st.toFixed(2);
    results.q_p_w = q_p_w_st.toFixed(2);
    results.Ta1 = Ta1_st.toFixed(2);

    results.zaQav = zaQav_st.toFixed(2);
    results.su_dz = su_dz_st.toFixed(2);
    results.Ta2 = Ta2_st.toFixed(2);

    results.za = zf_st - offset;
    results.za = results.za.toFixed(2);
    results.zf = zf_st.toFixed(2);
    results.Tm = Tm_st.toFixed(2);

    // second loop
    var i = 1;
    var zfs = zerosVector(101);
    var Sums = zerosVector(101);

    Sum = 0;

    while (Sum <= 100) {
        zf = 1e-2;
        diff = Number.POSITIVE_INFINITY;

        while (zf < 100) {
            su_at_zf = (zf - Zt) * k + Sum;
            Tp = Ap * Nc2 * f * su_at_zf;
            q_p_w = Math.atan((Tp * Math.tan(qw) + weight) / Tp);
            Ta1 = Tp / Math.cos(q_p_w);
            za = zf - offset;
            su_dz = (za > Zt);
            su_dz = su_dz * 0.5 * k * Math.pow(za - Zt, 2) + Sum * za;
            zaQav = b * Nc1 * su_dz;
            Ta2 = (2 * zaQav) / Math.pow(q_p_w - qm, 2);

            if (Math.abs(Ta1 - Ta2) <= diff) {
                diff = Math.abs(Ta1 - Ta2);
                zf_st = zf;
            }

            zf += 1e-2;
        }

        zfs[i - 1] = zf_st;
        Sums[i - 1] = Sum;
        i += 1;
        Sum += 1;
    }

    // add to results
    results.first_zfs = zfs;
    results.first_Sums = Sums;

    // third loop
    Sum = Sum_initial;
    i = 1;
    zfs = zerosVector(101);
    var ks = zerosVector(101);

    k = 0;

    while (k <= 100) {
        zf = 1e-2;
        diff = Number.POSITIVE_INFINITY;

        while (zf < 100) {
            su_at_zf = (zf - Zt) * k + Sum;
            Tp = Ap * Nc2 * f * su_at_zf;
            q_p_w = Math.atan((Tp * Math.tan(qw) + weight) / Tp);
            Ta1 = Tp / Math.cos(q_p_w);
            za = zf - offset;
            su_dz = (za > Zt);
            su_dz = su_dz * 0.5 * k * Math.pow(za - Zt, 2) + Sum * za;
            zaQav = b * Nc1 * su_dz;
            Ta2 = (2 * zaQav) / Math.pow(q_p_w - qm, 2);

            if (Math.abs(Ta1 - Ta2) <= diff) {
                diff = Math.abs(Ta1 - Ta2);
                zf_st = zf;
            }

            zf += 1e-2;
        }

        zfs[i - 1] = zf_st;
        ks[i - 1] = k;
        i += 1;
        k += 1;
    }

    // add to results
    results.second_zfs = zfs;
    results.second_ks = ks;

    // return results to interface
    return results;
};

//******************************************************
function setvalue(dict) {
  for (const key in dict) {
    $("input#"+key).val(dict[key]);
  };
}

function resetAnchorForm() {
  var
  // Set inputs
  defaultInputs = {
    "Sum": 50,
    "k": 0,
    "Zt": 0,
    "d": 0.1,
    "bd": 2.5,
    "Nc1": 7.6,
    "Miu": 0.4,
    "mass": 32,
    "Ap": 12,
    "f": 1.4,
    "qw": 28,
    "Nc2": 9,
    "qm": 0,
    "offset": 6.2,
    "plotType": "normalised",
    "optimisation": "Dopt",
  },
  labels = {
    "Vd_label": "V".concat(String.prototype.sub("d"))
  },
  // Derived inputs
  derivedInputs = {
    "Tp": "",
    "su_at_zf": "",
    "q_p_w": "",
    "Ta1": "",
    "zaQav": "",
    "su_dz": "",
    "Ta2": "",
  },
  // Outputs
  outputs = {
    "za": "",
    "zf": "",
    "Tm": "",
    "h": "",
  }
  
 setvalue(defaultInputs)
 setvalue(derivedInputs)
 setvalue(outputs)
 
  $("input:radio[id=hhmm_opt]").attr('checked', true);
  $("input:radio[id=D-optimise]").attr('checked', true);
 
  
};

var layout1, layout2, originalTrace1, originalTrace2, traceCount=0;

var resetPlots = function(context) {
  //Add Custom Buttons to ModeBar
  var icon1 = {
    'width': 500,
    'height': 600,
    'path': 'M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z'
  };
  var colors = ['green', 'red', 'blue'];
  var config = {
    modeBarButtonsToAdd: [
      // {
      //   name: 'color toggler',
      //   icon: icon1,
      //   click: function(gd) {
      //     var newColor = colors[Math.floor(3 * Math.random())]
      //     Plotly.restyle(gd, 'line.color', newColor)
      //   }},
      {
        name: 'fullscreen',
        icon: Plotly.Icons.fullsreen,
        direction: 'up',
        click: function(gd,ev) {
          // Custom fullscreen function for fullscreen button
          var button = ev.currentTarget;
           // console.log(el);
          if(document.fullscreen) {
            document.exitFullscreen()
          } else {
            firstPlotlyId=$(button).closest('.js-plotly-plot')[0].id;
            // console.log(firstPlotlyId);
            $(button).closest('.js-plotly-plot')[0].requestFullscreen();
            //Plotly.newPlot("plotly", data, layout);
          }
        }
    }],
    // modeBarButtonsToRemove: ['pan2d','select2d','lasso2d','resetScale2d','zoomOut2d','zoomIn2d']
    // modeBarButtonsToRemove: ['resetScale2d'],
    // showEditInChartStudio: true,
    showLink: true,
    // locale: 'zh-cn',
    plotlyServerURL: "https://chart-studio.plotly.com",
    // linkText: 'Edit Chart data',
    // showSendToCloud: true,
    scrollZoom: true,
    editable: true,
    
    displaylogo: false
  };
  //Plotly default layout1
  layout1 = {
    title: "<b>k<sub>su</sub> = 0 kPa/m</b>",
    xaxis: {
        title: "s<sub>um</sub> (kPa)",
    },
    yaxis: {
        title: "z<sub>f</sub> (m)",
        autorange: "reversed"
    },
    titlefont: {
        family: "Roboto, sans-serif",
        color: "#01579b",
        size: 19,
    },
    showlegend: false, // 关键设置：隐藏图例
    hovermode: 'compare', // 关键设置，启用比较悬停模式
    // hovertemplate: '系列1: %{y:.2f}<extra></extra>',
  };
  //Plotly default layout2
  layout2 = {
    title: "<b>s<sub>um</sub> = 0 kPa</b>",
    xaxis: {
        title: "k (kPa/m)",
    },
    yaxis: {
        title: "z<sub>f</sub> (m)",
        autorange: "reversed"
    },
    titlefont: {
        family: "Roboto, sans-serif",
        color: "#01579b",
        size: 19,
    },
    showlegend: false, // 关键设置：隐藏图例
    hovermode: 'compare', // 关键设置，启用比较悬停模式
    // hovertemplate: '系列2: %{y:.2f}<extra></extra>',
  };
  originalTrace1 = [];
  originalTrace2 = [];
  Plotly.newPlot(firstPlotlyId, originalTrace1, layout1, config);
  Plotly.newPlot(secondPlotlyId, originalTrace2, layout2, config);
  // fullscreenTool();
};

function resetAnchor(){
  resetAnchorForm();
  resetPlots();
}
//===============================================
//===============================================

/** 
  * Public Functions 
**/
var calculate_Anchor;

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
zerosVector = function(count) {
  var array = [];

  var i = 0;

  while (i < count) {
      array.push(0);
      i += 1;
  }

  return array;
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


// 计算函数
function calculateAnchor(){
  // get input data
  let inputList = $("div.card-input input[type=number]");
  let inputs=[];
  inputList.each((index,item)=>{
    inputs[$(item).attr("id")]=Number($(item).val());;
  });
 
  //get plot container
  // var vhmwidth = $("#"+firstPlotlyId)[0].clientWidth,

  //options = {t_cap: inputs["t_cap"], t_skirt: inputs["t_skirt"], shell_density: inputs["shell_density"]},
  var result;
  
  // check derived values are within valid range
  var results = {
      errors: [],
  };


  // Make sure to throw meaningful exceptions as these will be reported to the user.
  try {
    // The calcs proper.
    results = DragAnchorCalculate(inputs);

    derivedInputs = {
      "Tp": results.Tp,
      "su_at_zf": results.su_at_zf,
      "q_p_w": results.q_p_w,
      "Ta1": results.Ta1,
      "zaQav": results.zaQav,
      "su_dz": results.su_dz,
      "Ta2": results.Ta2
    },
    // Outputs
    outputs = {
      "za": results.za,
      "zf": results.zf,
      "Tm": results.Tm,
      "h": results.h.toFixed(2),
    }
    setvalue(derivedInputs);
    setvalue(outputs);
  } catch (e) {
    //document.getElementById("error-card").style.display = 'block';
    //this.error = E;
    //document.getElementById("error").focus();
  
      alert("Error: " + e);
  }
   // draw plots
  traceCount += 1;

   var trace1 = {
       x: results.first_Sums,
       y: results.first_zfs,
       name: "[" + traceCount + "] k<sub>su</sub> = " + inputs.k + " kPa/m",
       type: "scatter"
   };

   var trace2 = {
       x: results.second_ks,
       y: results.second_zfs,
       name: "[" + traceCount + "] s<sub>um</sub> = " + inputs.Sum + " kPa",
       type: "scatter"
   };

   layout1.title = "<b>k<sub>su</sub> = " + inputs.k + " kPa/m</b>";
   layout2.title = "<b>s<sub>um</sub> = " + inputs.Sum + " kPa</b>";
   var plotFirst = $();
  //  var plotSecond = $("#plot-second");

  originalTrace1= originalTrace1.concat(trace1);
  originalTrace2= originalTrace2.concat(trace2);
  Plotly.react(firstPlotlyId, originalTrace1, layout1);
  Plotly.react(secondPlotlyId, originalTrace2, layout2);
  // Plotly.newPlot(firstPlotlyId, [trace1], layout1);fullscreenTool();
  //  Plotly.newplot(plotSecond, [trace2], layout2);
  

  return results;
}

//最大化函数
// function plotZoom(el){
//   // console.log(el);
//   if(document.fullscreen) {
//     document.exitFullscreen()
//   } else {
//     firstPlotlyId=$(el).closest('.js-plotly-plot')[0].id;
//     // console.log(firstPlotlyId);
//     $(el).closest('.js-plotly-plot')[0].requestFullscreen();
//     //Plotly.newPlot("plotly", data, layout);
//   }
// }

// function fullscreenTool() {
//   $(".modebar-btn.plotlyjsicon.modebar-btn--logo").replaceWith(
//   `
//   <a rel="tooltip" onclick=plotZoom(this) class="modebar-btn fullscreen-btn" data-title="Full Screen" data-attr="zoom" data-val="auto" data-toggle="false" data-gravity="n" >
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon" height="1em" width="1em">
//       <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
//       <path d="M128 32H32C14.31 32 0 46.31 0 64v96c0 17.69 14.31 32 32 32s32-14.31 32-32V96h64c17.69 0 32-14.31 32-32S145.7 32 128 32zM416 32h-96c-17.69 0-32 14.31-32 32s14.31 32 32 32h64v64c0 17.69 14.31 32 32 32s32-14.31 32-32V64C448 46.31 433.7 32 416 32zM128 416H64v-64c0-17.69-14.31-32-32-32s-32 14.31-32 32v96c0 17.69 14.31 32 32 32h96c17.69 0 32-14.31 32-32S145.7 416 128 416zM416 320c-17.69 0-32 14.31-32 32v64h-64c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c17.69 0 32-14.31 32-32v-96C448 334.3 433.7 320 416 320z"/>
//     </svg>
//   </a>
//   `);
//   }

// $(document).ready(()=>{
//   // fullscreenTool()
// });
$(window).resize((event)=>{

  if(firstPlotlyId){Plotly.Plots.resize(firstPlotlyId);}
  if(secondPlotlyId){Plotly.Plots.resize(secondPlotlyId);}
  // fullscreenTool();

});