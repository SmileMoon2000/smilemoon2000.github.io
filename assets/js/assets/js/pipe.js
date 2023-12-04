// $("input[name=Task]").click(function () {
//     var taskState = $(this).val();
//     //alert(val);
//     if (taskState == "weightOption") {
//         $("input#submergedweight").attr("disabled", true);
//     } else {
//         $("input#submergedweight").attr("disabled", false);
//     }
// });
var taskState = "weight";
var stabilityState = "absolute";
function reset() {
    var defaultInputs = {
        water_depth: 80,
        significant_wave_height: 14,
        peak_time_period: 12,
        steady_current_velocity: 0.3,
        pipeline_outer_diameter: 0.5,
        pipeline_submerged_weight: 3.0,
        friction_coefficient: "",
        safety_factor: "",
        lateral_displacement: "",
        task: "weightOption",
        stability: "absoluteOption",
        lateralDisplacementLessThan: "halfOption",
    };

    $("input#waterdepth").val(80);
    $("input#waveheight").val(14);
    $("input#timeperiod").val(12);
    $("input#velocity").val(0.3);
    $("input#outerdiameter").val(0.5);
    $("input#submergedweight").val(3);

    $("input#weightOption").click(); //prop('checked', true);
    $("input#absoluteOption").click(); //prop('checked', true);
    // $("input#weightOption").prop('checked', true);
    // $("input#absoluteOption").prop('checked', true);
    // toggleElements();
}
// body.onload=>(){
//     reset();
// }

// (function() {
//   var taskState = "weight";
//   var stabilityState = "absolute";

//   // resets form fields and labels
//   function resetForm(context) {
//       var defaultInputs = {
//           "water_depth": 80,
//           "significant_wave_height": 14,
//           "peak_time_period": 12,
//           "steady_current_velocity": 0.3,
//           "pipeline_outer_diameter": 0.5,
//           "pipeline_submerged_weight": 3.0,
//           "friction_coefficient": "",
//           "safety_factor": "",
//           "lateral_displacement": "",
//           "task": "weightOption",
//           "stability": "absoluteOption",
//           "lateralDisplacementLessThan": "halfOption",
//       };

//       var outputs = {
//           "所需单位长度管道重力": "N/A",
//           "管道位移": "N/A",
//       };

//     //   _.extend(context, defaultInputs);
//     //   _.extend(context, outputs);

//       taskState = "weight";
//       stabilityState = "absolute";

//       toggleElements();
//   };

// show relevant elements and hide irrelevant ones
function toggleElements() {
    // stability related elements
    if (stabilityState == "absolute") {
        $(".absolute_specific").show();
        $(".generalised_specific").hide();
        $(".dynamic_specific").hide();
    } else if (stabilityState == "generalised") {
        $(".absolute_specific").hide();
        $(".generalised_specific").show();
        $(".dynamic_specific").hide();
    } else if (stabilityState == "dynamic") {
        $(".absolute_specific").hide();
        $(".generalised_specific").hide();
        $(".dynamic_specific").show();
    }

    // task related elements
    //   console.log(taskState)
    if (taskState == "weight") {
        $(".weight_specific").show();
        $(".stability_specific").hide();
    } else {
        $(".weight_specific").hide();
        $(".stability_specific").show();

        $(".generalised_specific").hide();
        $(".dynamic_specific").hide();
    }
}

//     //   function ready() {
//     //     var context = this;
//     //     resetForm(context);
//     //   }

//     //   function reset() {
//     //     var context = this;
//     //     resetForm(context);
//     //   }
$("input#weightOption").click(function () {
    taskState = "weight";
    toggleElements();
});
$("input#stabilityOption").click(function () {
    taskState = "stability";
    toggleElements();
});
$("input#absoluteOption").click(function () {
    stabilityState = "absolute";
    toggleElements();
});
$("input#generalisedOption").click(function () {
    stabilityState = "generalised";
    toggleElements();
});
$("input#dynamicOption").click(function () {
    stabilityState = "dynamic";
    toggleElements();
});
//   function weightTapped() {
//       taskState = "weight";
//       toggleElements();
//   };

//   function stabilityTapped() {
//       taskState = "stability";
//       toggleElements();
//   };

//   function absoluteTapped() {
//       stabilityState = "absolute";
//       toggleElements();
//   };

//   function generalisedTapped() {
//       stabilityState = "generalised";
//       toggleElements();
//   };

//    function dynamicTapped() {
//       stabilityState = "dynamic";
//       toggleElements();
//   };

var calculatePipe = function () {
    var wd = 0,
        Hs = 0,
        Tp = 0,
        Uc = 0,
        D = 0,
        mu = 0,
        rsc = 0,
        ucri = 0,
        pipew = 0;
    var CYstar = 0,
        CZstar = 0;
    var CY = new Array(11);
    var CZ = new Array(11);
    CY[0] = new Array(13, 6.8, 4.55, 3.33, 2.72, 2.4, 2.15, 1.95, 1.8, 1.52, 1.3);
    CY[1] = new Array(10.7, 5.76, 3.72, 2.72, 2.2, 1.9, 1.71, 1.58, 1.49, 1.33, 1.22);
    CY[2] = new Array(9.02, 5, 3.15, 2.3, 1.85, 1.58, 1.42, 1.33, 1.27, 1.18, 1.14);
    CY[3] = new Array(7.64, 4.32, 2.79, 2.01, 1.63, 1.44, 1.33, 1.26, 1.21, 1.14, 1.09);
    CY[4] = new Array(6.63, 3.8, 2.51, 1.78, 1.46, 1.32, 1.25, 1.19, 1.16, 1.1, 1.05);
    CY[5] = new Array(5.07, 3.3, 2.27, 1.71, 1.43, 1.34, 1.29, 1.24, 1.18, 1.08, 1);
    CY[6] = new Array(4.01, 2.7, 2.01, 1.57, 1.44, 1.37, 1.31, 1.24, 1.17, 1.05, 1);
    CY[7] = new Array(3.25, 2.3, 1.75, 1.49, 1.4, 1.34, 1.27, 1.2, 1.13, 1.01, 1);
    CY[8] = new Array(1.52, 1.5, 1.45, 1.39, 1.34, 1.2, 1.08, 1.03, 1, 1, 1);
    CY[9] = new Array(1.11, 1.1, 1.07, 1.06, 1.04, 1.01, 1, 1, 1, 1, 1);
    CY[10] = new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    CZ[0] = new Array(5, 5, 4.85, 3.21, 2.55, 2.26, 2.01, 1.81, 1.63, 1.26, 1.05);
    CZ[1] = new Array(3.87, 4.08, 4.23, 2.87, 2.15, 1.77, 1.55, 1.41, 1.31, 1.11, 0.97);
    CZ[2] = new Array(3.16, 3.45, 3.74, 2.6, 1.86, 1.45, 1.26, 1.16, 1.09, 1, 0.9);
    CZ[3] = new Array(3.01, 3.25, 3.53, 2.14, 1.52, 1.26, 1.1, 1.01, 0.99, 0.95, 0.9);
    CZ[4] = new Array(2.87, 3.08, 3.35, 1.82, 1.29, 1.11, 0.98, 0.9, 0.9, 0.9, 0.9);
    CZ[5] = new Array(2.21, 2.36, 2.59, 1.59, 1.2, 1.03, 0.92, 0.9, 0.9, 0.9, 0.9);
    CZ[6] = new Array(1.53, 1.61, 1.8, 1.18, 1.05, 0.97, 0.92, 0.9, 0.9, 0.9, 0.9);
    CZ[7] = new Array(1.05, 1.13, 1.28, 1.12, 0.99, 0.91, 0.9, 0.9, 0.9, 0.9, 0.9);
    CZ[8] = new Array(0.96, 1.03, 1.05, 1, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9);
    CZ[9] = new Array(0.91, 0.92, 0.93, 0.91, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9);
    CZ[10] = new Array(0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9);

    // check required inputs are present and valid
    var results = {
        errors: [],
    };

    // if (stabilityState == "absolute") {
    //     Helper.inputCheck(results, "Friction coefficient", parseFloat(this.friction_coefficient));
    //     Helper.inputCheck(results, "Safety factor", parseFloat(this.safety_factor));
    // } else if (stabilityState == "dynamic" && taskState == "weight") {
    //     Helper.inputCheck(results, "Lateral displacement", parseFloat(this.lateral_displacement));
    // }

    // if (Helper.alertInputErrors(results)) {
    //     return;
    // }

    // retrieve input values from interface
    // var formData = this.$$("#pipe-input-form").serialize();

    wd = parseFloat($("input#waterdepth").val());
    Hs = parseFloat($("input#waveheight").val());
    Tp = parseFloat($("input#timeperiod").val());

    Uc = parseFloat($("input#velocity").val());
    D = parseFloat($("input#outerdiameter").val());
    pipew = parseFloat($("input#submergedweight").val());

    mu = parseFloat($("input#friction_coefficient").val());
    rsc = parseFloat($("input#safety_factor").val());

    var lateralDisplacementLessThan = "";

    if ($("input[name=halfOrten]").val() == "halfOption") {
        lateralDisplacementLessThan = "half";
    } else {
        lateralDisplacementLessThan = "ten";
    }

    ucri = parseFloat($("input#lateral_displacement").val());

    // define calculation functions
    var readCYCZ = function (Kstar, Mstar) {
        var KK = new Array(2.5, 5, 10, 20, 30, 40, 50, 60, 70, 100, 140);
        var MM = new Array(0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1, 2, 5, 10);
        var i = 0,
            j = 0;
        var temp1 = 0,
            temp2 = 0,
            temp3 = 0,
            temp4 = 0;

        while (i < 11) {
            if (Mstar <= MM[i]) break;
            i++;
        }
        while (j < 11) {
            if (Kstar <= KK[j]) break;
            j++;
        }

        if (i == 0) {
            //M=0
            if (j == 0) {
                CYstar = CY[0][0];
                CZstar = CZ[0][0];
            } else if (j == 11) {
                CYstar = CY[0][10];
                CZstar = CZ[0][10];
            } else {
                CYstar = CY[0][j - 1] + ((CY[0][j] - CY[0][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
                CZstar = CZ[0][j - 1] + ((CZ[0][j] - CZ[0][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
            }
        } else if (i == 11) {
            //M>140
            if (j == 0) {
                CYstar = CY[10][0];
                CZstar = CZ[10][0];
            } else if (j == 11) {
                CYstar = CY[10][10];
                CZstar = CZ[10][10];
            } else {
                CYstar = CY[10][j - 1] + ((CY[10][j] - CY[10][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
                CZstar = CZ[10][j - 1] + ((CZ[10][j] - CZ[10][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
            }
        } else {
            temp1 = CY[i - 1][j - 1] + ((CY[i][j] - CY[i - 1][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
            temp2 = CZ[i - 1][j - 1] + ((CZ[i][j] - CZ[i - 1][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
            temp3 = CY[i][j - 1] + ((CY[i][j] - CY[i][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
            temp4 = CZ[i][j - 1] + ((CZ[i][j] - CZ[i][j - 1]) / (KK[j] - KK[j - 1])) * (Kstar - KK[j - 1]);
            CYstar = temp1 + ((temp3 - temp1) / (MM[i] - MM[i - 1])) * (Mstar - MM[i - 1]);
            CZstar = temp2 + ((temp4 - temp2) / (MM[i] - MM[i - 1])) * (Mstar - MM[i - 1]);
        }
    };

    var calUs = function () {
        var Tn = 0,
            phi = 0,
            gamma = 0,
            Us = 0,
            x = 0,
            y = 0,
            temp = 0,
            L = 0;
        var i = 0,
            Nl = 0;
        var Usgamma1 = new Array(2);
        var Usgamma33 = new Array(2);
        var Usgamma5 = new Array(2);
        Usgamma1[0] = new Array(
            0.0,
            5.66e-3,
            1.04e-2,
            1.7e-2,
            2.17e-2,
            2.83e-2,
            3.58e-2,
            4.15e-2,
            4.81e-2,
            5.28e-2,
            5.85e-2,
            6.32e-2,
            6.7e-2,
            7.17e-2,
            7.55e-2,
            7.92e-2,
            8.3e-2,
            8.77e-2,
            9.34e-2,
            9.81e-2,
            1.02e-1,
            1.07e-1,
            1.12e-1,
            1.17e-1,
            1.24e-1,
            1.28e-1,
            1.32e-1,
            1.36e-1,
            1.41e-1,
            1.45e-1,
            1.51e-1,
            1.58e-1,
            1.62e-1,
            1.66e-1,
            1.71e-1,
            1.75e-1,
            1.78e-1,
            1.86e-1,
            1.93e-1,
            2.04e-1,
            2.11e-1,
            2.18e-1,
            2.25e-1,
            2.3e-1,
            2.38e-1,
            2.44e-1,
            2.51e-1,
            2.57e-1,
            2.64e-1,
            2.74e-1,
            2.8e-1,
            2.87e-1,
            2.93e-1,
            3.0e-1,
            3.1e-1,
            3.23e-1,
            3.36e-1,
            3.49e-1,
            3.59e-1,
            3.72e-1,
            3.81e-1,
            3.92e-1,
            4.03e-1,
            4.24e-1,
            4.34e-1,
            4.47e-1,
            4.6e-1,
            4.75e-1,
            4.91e-1,
            5.0e-1
        );
        Usgamma1[1] = new Array(
            5.0e-1,
            4.99e-1,
            4.97e-1,
            4.94e-1,
            4.93e-1,
            4.9e-1,
            4.84e-1,
            4.79e-1,
            4.71e-1,
            4.64e-1,
            4.57e-1,
            4.52e-1,
            4.46e-1,
            4.4e-1,
            4.34e-1,
            4.28e-1,
            4.23e-1,
            4.15e-1,
            4.05e-1,
            3.95e-1,
            3.87e-1,
            3.79e-1,
            3.67e-1,
            3.58e-1,
            3.45e-1,
            3.35e-1,
            3.27e-1,
            3.2e-1,
            3.11e-1,
            3.01e-1,
            2.89e-1,
            2.77e-1,
            2.67e-1,
            2.6e-1,
            2.5e-1,
            2.42e-1,
            2.35e-1,
            2.21e-1,
            2.06e-1,
            1.89e-1,
            1.74e-1,
            1.64e-1,
            1.52e-1,
            1.44e-1,
            1.32e-1,
            1.23e-1,
            1.15e-1,
            1.08e-1,
            1.0e-1,
            8.98e-2,
            8.17e-2,
            7.47e-2,
            6.67e-2,
            5.97e-2,
            5.16e-2,
            4.59e-2,
            4.01e-2,
            3.55e-2,
            3.21e-2,
            2.86e-2,
            2.63e-2,
            2.41e-2,
            2.18e-2,
            1.95e-2,
            1.72e-2,
            1.61e-2,
            1.38e-2,
            1.15e-2,
            9.24e-3,
            6.94e-3
        );
        Usgamma33[0] = new Array(
            0.0,
            5.66e-3,
            1.32e-2,
            1.98e-2,
            2.74e-2,
            3.49e-2,
            4.53e-2,
            5.19e-2,
            5.75e-2,
            6.23e-2,
            6.79e-2,
            7.26e-2,
            7.64e-2,
            8.21e-2,
            8.87e-2,
            9.34e-2,
            9.72e-2,
            1.01e-1,
            1.05e-1,
            1.1e-1,
            1.15e-1,
            1.2e-1,
            1.24e-1,
            1.27e-1,
            1.32e-1,
            1.37e-1,
            1.41e-1,
            1.45e-1,
            1.51e-1,
            1.56e-1,
            1.59e-1,
            1.63e-1,
            1.68e-1,
            1.72e-1,
            1.75e-1,
            1.8e-1,
            1.84e-1,
            1.88e-1,
            1.97e-1,
            2.02e-1,
            2.06e-1,
            2.1e-1,
            2.15e-1,
            2.21e-1,
            2.25e-1,
            2.29e-1,
            2.35e-1,
            2.4e-1,
            2.45e-1,
            2.52e-1,
            2.58e-1,
            2.64e-1,
            2.72e-1,
            2.77e-1,
            2.86e-1,
            2.93e-1,
            3.02e-1,
            3.11e-1,
            3.22e-1,
            3.31e-1,
            3.36e-1,
            3.42e-1,
            3.47e-1,
            3.54e-1,
            3.61e-1,
            3.75e-1,
            3.8e-1,
            3.91e-1,
            4.01e-1,
            4.1e-1,
            4.2e-1,
            4.3e-1,
            4.42e-1,
            4.52e-1,
            4.64e-1,
            4.75e-1,
            4.85e-1,
            4.95e-1,
            5.0e-1
        );
        Usgamma33[1] = new Array(
            5.0e-1,
            4.99e-1,
            4.98e-1,
            4.95e-1,
            4.93e-1,
            4.9e-1,
            4.8e-1,
            4.73e-1,
            4.68e-1,
            4.61e-1,
            4.54e-1,
            4.48e-1,
            4.42e-1,
            4.34e-1,
            4.24e-1,
            4.17e-1,
            4.11e-1,
            4.04e-1,
            3.96e-1,
            3.86e-1,
            3.78e-1,
            3.68e-1,
            3.61e-1,
            3.53e-1,
            3.44e-1,
            3.36e-1,
            3.28e-1,
            3.2e-1,
            3.11e-1,
            3.01e-1,
            2.93e-1,
            2.85e-1,
            2.76e-1,
            2.68e-1,
            2.6e-1,
            2.5e-1,
            2.42e-1,
            2.34e-1,
            2.16e-1,
            2.08e-1,
            2.0e-1,
            1.89e-1,
            1.81e-1,
            1.71e-1,
            1.64e-1,
            1.56e-1,
            1.45e-1,
            1.37e-1,
            1.28e-1,
            1.19e-1,
            1.09e-1,
            1.0e-1,
            9.09e-2,
            8.28e-2,
            7.36e-2,
            6.43e-2,
            5.63e-2,
            4.93e-2,
            4.36e-2,
            3.9e-2,
            3.67e-2,
            3.44e-2,
            3.21e-2,
            2.98e-2,
            2.75e-2,
            2.52e-2,
            2.4e-2,
            2.17e-2,
            1.94e-2,
            1.72e-2,
            1.49e-2,
            1.26e-2,
            1.14e-2,
            1.03e-2,
            9.18e-3,
            8.04e-3,
            5.75e-3,
            4.62e-3,
            4.63e-3
        );
        Usgamma5[0] = new Array(
            0.0,
            1.04e-2,
            1.98e-2,
            3.02e-2,
            3.58e-2,
            4.15e-2,
            4.72e-2,
            5.19e-2,
            5.85e-2,
            6.42e-2,
            6.89e-2,
            7.45e-2,
            8.02e-2,
            8.58e-2,
            9.06e-2,
            9.62e-2,
            1.01e-1,
            1.06e-1,
            1.1e-1,
            1.16e-1,
            1.2e-1,
            1.24e-1,
            1.27e-1,
            1.32e-1,
            1.38e-1,
            1.42e-1,
            1.47e-1,
            1.52e-1,
            1.58e-1,
            1.63e-1,
            1.68e-1,
            1.73e-1,
            1.77e-1,
            1.82e-1,
            1.89e-1,
            1.92e-1,
            1.96e-1,
            2.02e-1,
            2.08e-1,
            2.14e-1,
            2.18e-1,
            2.23e-1,
            2.26e-1,
            2.31e-1,
            2.36e-1,
            2.41e-1,
            2.46e-1,
            2.53e-1,
            2.58e-1,
            2.62e-1,
            2.68e-1,
            2.75e-1,
            2.79e-1,
            2.87e-1,
            2.93e-1,
            2.99e-1,
            3.08e-1,
            3.19e-1,
            3.3e-1,
            3.4e-1,
            3.5e-1,
            3.57e-1,
            3.64e-1,
            3.74e-1,
            3.88e-1,
            3.97e-1,
            4.07e-1,
            4.16e-1,
            4.25e-1,
            4.35e-1,
            4.44e-1,
            4.57e-1,
            4.67e-1,
            4.78e-1,
            4.92e-1,
            5.0e-1
        );
        Usgamma5[1] = new Array(
            5.0e-1,
            4.98e-1,
            4.95e-1,
            4.92e-1,
            4.89e-1,
            4.84e-1,
            4.79e-1,
            4.73e-1,
            4.67e-1,
            4.6e-1,
            4.53e-1,
            4.46e-1,
            4.39e-1,
            4.32e-1,
            4.26e-1,
            4.18e-1,
            4.09e-1,
            4.01e-1,
            3.91e-1,
            3.82e-1,
            3.75e-1,
            3.68e-1,
            3.6e-1,
            3.51e-1,
            3.41e-1,
            3.31e-1,
            3.23e-1,
            3.13e-1,
            3.01e-1,
            2.91e-1,
            2.8e-1,
            2.71e-1,
            2.61e-1,
            2.52e-1,
            2.38e-1,
            2.3e-1,
            2.22e-1,
            2.1e-1,
            1.97e-1,
            1.85e-1,
            1.78e-1,
            1.69e-1,
            1.61e-1,
            1.52e-1,
            1.44e-1,
            1.35e-1,
            1.27e-1,
            1.17e-1,
            1.09e-1,
            1.04e-1,
            9.67e-2,
            8.74e-2,
            8.17e-2,
            7.24e-2,
            6.43e-2,
            5.74e-2,
            4.93e-2,
            4.24e-2,
            3.66e-2,
            3.32e-2,
            2.86e-2,
            2.63e-2,
            2.51e-2,
            2.29e-2,
            2.06e-2,
            1.83e-2,
            1.6e-2,
            1.6e-2,
            1.49e-2,
            1.37e-2,
            1.26e-2,
            1.15e-2,
            1.03e-2,
            9.21e-3,
            6.92e-3,
            5.79e-3
        );

        Tn = Math.sqrt(wd / 9.81);
        phi = Tp / Math.sqrt(Hs);
        x = Tn / Tp;
        if (phi <= 3.6) gamma = 5;
        else if (phi >= 5) gamma = 1;
        else gamma = Math.exp(5.75 - 1.15 * phi);

        if (gamma == 1) {
            Nl = Usgamma1[1].length;
            if (x <= 0) y = Usgamma1[1][0];
            else if (x > 0.5) y = Usgamma1[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma1[0][i]) {
                    i++;
                }
                y = Usgamma1[1][i - 1] + ((Usgamma1[1][i] - Usgamma1[1][i - 1]) / (Usgamma1[0][i] - Usgamma1[0][i - 1])) * (x - Usgamma1[0][i - 1]);
            }
        } else if (gamma == 5) {
            Nl = Usgamma5[1].length;
            if (x <= 0) y = Usgamma5[1][0];
            else if (x > 0.5) y = Usgamma5[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma5[0][i]) {
                    i++;
                }

                y = Usgamma5[1][i - 1] + ((Usgamma5[1][i] - Usgamma5[1][i - 1]) / (Usgamma5[0][i] - Usgamma5[0][i - 1])) * (x - Usgamma5[0][i - 1]);
            }
        } else if (gamma == 3.3) {
            Nl = Usgamma33[1].length;
            if (x <= 0) y = Usgamma33[1][0];
            else if (x > 0.5) y = Usgamma33[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma33[0][i]) {
                    i++;
                }

                y = Usgamma33[1][i - 1] + ((Usgamma33[1][i] - Usgamma33[1][i - 1]) / (Usgamma33[0][i] - Usgamma3[0][i - 1])) * (x - Usgamma33[0][i - 1]);
            }
        } else if (gamma < 3.3) {
            Nl = Usgamma1[1].length;
            if (x <= 0) y = Usgamma1[1][0];
            else if (x > 0.5) y = Usgamma1[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma1[0][i]) {
                    i++;
                }
                y = Usgamma1[1][i - 1] + ((Usgamma1[1][i] - Usgamma1[1][i - 1]) / (Usgamma1[0][i] - Usgamma1[0][i - 1])) * (x - Usgamma1[0][i - 1]);
            }

            Nl = Usgamma33[1].length;
            if (x <= 0) temp = Usgamma33[1][0];
            else if (x > 0.5) temp = Usgamma33[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma33[0][i]) {
                    i++;
                }

                temp = Usgamma33[1][i - 1] + ((Usgamma33[1][i] - Usgamma33[1][i - 1]) / (Usgamma33[0][i] - Usgamma3[0][i - 1])) * (x - Usgamma33[0][i - 1]);
            }

            y = y + (temp - y) * (3.3 - 1) * (gamma - 1);
        } else if (gamma > 3.3) {
            Nl = Usgamma33[1].length;
            if (x <= 0) y = Usgamma33[1][0];
            else if (x > 0.5) y = Usgamma33[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma33[0][i]) {
                    i++;
                }

                y = Usgamma33[1][i - 1] + ((Usgamma33[1][i] - Usgamma33[1][i - 1]) / (Usgamma33[0][i] - Usgamma3[0][i - 1])) * (x - Usgamma33[0][i - 1]);
            }
            Nl = Usgamma5[1].length;
            if (x <= 0) temp = Usgamma5[1][0];
            else if (x > 0.5) temp = Usgamma5[1][Nl - 1];
            else {
                i = 0;
                while (x > Usgamma5[0][i]) {
                    i++;
                }

                temp = Usgamma5[1][i - 1] + ((Usgamma5[1][i] - Usgamma5[1][i - 1]) / (Usgamma5[0][i] - Usgamma5[0][i - 1])) * (x - Usgamma5[0][i - 1]);
            }
            y = y + (temp - y) * (5 - 3.3) * (gamma - 3.3);
        } else {
            alert("Error in calculating gamma, terminated.");
            return;
        }

        Us = (y * Hs) / Tn;
        return Us;
    };

    var findL = function () {
        var i = 0;
        var LL = 0;
        var DNVL = new Array(2);
        DNVL[0] = new Array(
            2.73326,
            2.7638,
            2.80415,
            2.88106,
            2.8451,
            2.89782,
            2.94582,
            2.9845,
            3.01785,
            3.02077,
            3.04127,
            3.09314,
            3.06487,
            3.12922,
            3.1262,
            3.2275,
            3.1872,
            3.26199,
            3.29366,
            3.33691,
            3.384,
            3.39055,
            3.43175,
            3.4701,
            3.50549,
            3.55496,
            3.73274,
            3.77446,
            3.81664,
            3.85929,
            3.91564,
            3.99398,
            4.00171,
            4.03082,
            4.10749,
            4.1917,
            4.26525,
            4.33799,
            4.41838,
            4.49808,
            4.58364,
            4.66632,
            4.7482,
            4.83152,
            4.92105,
            5.01708,
            5.11005,
            5.19971,
            5.29351,
            5.38899,
            5.48355,
            5.73558,
            5.95011,
            6.02825,
            6.10445,
            6.18163,
            6.25977,
            6.33585,
            6.41904,
            6.53483,
            6.69787,
            6.88822,
            7.09427,
            7.31354,
            7.55782,
            7.62384,
            7.85189,
            8.09458,
            8.82584,
            9.10743,
            9.37532,
            9.42073,
            9.74481,
            10.03146,
            10.28669,
            10.59951,
            10.81159,
            10.91657,
            11.25398,
            11.59622,
            11.87978,
            12.40179
        );
        DNVL[1] = new Array(
            94.95711,
            87.82258,
            81.59888,
            70.28139,
            75.81623,
            64.7764,
            60.25536,
            55.72837,
            51.60051,
            47.88724,
            49.45366,
            42.10704,
            45.63267,
            38.98817,
            39.43864,
            34.12548,
            36.85528,
            31.52521,
            29.08957,
            26.93499,
            24.74027,
            25.02628,
            22.96058,
            21.23546,
            19.59483,
            18.16439,
            13.64637,
            12.62106,
            11.67278,
            10.78336,
            9.9847,
            9.48199,
            9.35219,
            8.76953,
            8.19508,
            7.6583,
            7.13199,
            6.63423,
            6.18542,
            5.75373,
            5.37066,
            5.00158,
            4.66321,
            4.34274,
            4.04895,
            3.77939,
            3.52371,
            3.28155,
            3.05603,
            2.84929,
            2.65043,
            2.1629,
            1.71701,
            1.58984,
            1.47208,
            1.36305,
            1.26209,
            1.16593,
            1.08081,
            1.01233,
            0.95917,
            0.91509,
            0.87404,
            0.83484,
            0.80661,
            0.79193,
            0.75902,
            0.72915,
            0.63463,
            0.61317,
            0.58634,
            0.57237,
            0.5607,
            0.53493,
            0.50509,
            0.48466,
            0.46826,
            0.46345,
            0.4447,
            0.42573,
            0.40199,
            0.38177
        );
        i = 0;
        while (ucri < DNVL[1][i]) {
            i++;
        }

        LL = DNVL[0][i - 1] + ((DNVL[0][i] - DNVL[0][i - 1]) / (DNVL[1][i] - DNVL[1][i - 1])) * (ucri - DNVL[1][i - 1]);
        return LL;
    };

    var findU = function () {
        var i = 0;
        var UU = 0,
            LL = 0,
            Us = 0;
        var DNVL = new Array(2);
        DNVL[0] = new Array(
            2.73326,
            2.7638,
            2.80415,
            2.88106,
            2.8451,
            2.89782,
            2.94582,
            2.9845,
            3.01785,
            3.02077,
            3.04127,
            3.09314,
            3.06487,
            3.12922,
            3.1262,
            3.2275,
            3.1872,
            3.26199,
            3.29366,
            3.33691,
            3.384,
            3.39055,
            3.43175,
            3.4701,
            3.50549,
            3.55496,
            3.73274,
            3.77446,
            3.81664,
            3.85929,
            3.91564,
            3.99398,
            4.00171,
            4.03082,
            4.10749,
            4.1917,
            4.26525,
            4.33799,
            4.41838,
            4.49808,
            4.58364,
            4.66632,
            4.7482,
            4.83152,
            4.92105,
            5.01708,
            5.11005,
            5.19971,
            5.29351,
            5.38899,
            5.48355,
            5.73558,
            5.95011,
            6.02825,
            6.10445,
            6.18163,
            6.25977,
            6.33585,
            6.41904,
            6.53483,
            6.69787,
            6.88822,
            7.09427,
            7.31354,
            7.55782,
            7.62384,
            7.85189,
            8.09458,
            8.82584,
            9.10743,
            9.37532,
            9.42073,
            9.74481,
            10.03146,
            10.28669,
            10.59951,
            10.81159,
            10.91657,
            11.25398,
            11.59622,
            11.87978,
            12.40179
        );
        DNVL[1] = new Array(
            94.95711,
            87.82258,
            81.59888,
            70.28139,
            75.81623,
            64.7764,
            60.25536,
            55.72837,
            51.60051,
            47.88724,
            49.45366,
            42.10704,
            45.63267,
            38.98817,
            39.43864,
            34.12548,
            36.85528,
            31.52521,
            29.08957,
            26.93499,
            24.74027,
            25.02628,
            22.96058,
            21.23546,
            19.59483,
            18.16439,
            13.64637,
            12.62106,
            11.67278,
            10.78336,
            9.9847,
            9.48199,
            9.35219,
            8.76953,
            8.19508,
            7.6583,
            7.13199,
            6.63423,
            6.18542,
            5.75373,
            5.37066,
            5.00158,
            4.66321,
            4.34274,
            4.04895,
            3.77939,
            3.52371,
            3.28155,
            3.05603,
            2.84929,
            2.65043,
            2.1629,
            1.71701,
            1.58984,
            1.47208,
            1.36305,
            1.26209,
            1.16593,
            1.08081,
            1.01233,
            0.95917,
            0.91509,
            0.87404,
            0.83484,
            0.80661,
            0.79193,
            0.75902,
            0.72915,
            0.63463,
            0.61317,
            0.58634,
            0.57237,
            0.5607,
            0.53493,
            0.50509,
            0.48466,
            0.46826,
            0.46345,
            0.4447,
            0.42573,
            0.40199,
            0.38177
        );

        Us = calUs();
        LL = pipew / (0.5 * 1.025 * D * (Us + Uc) * (Us + Uc));

        i = 0;
        while (DNVL[0][i] < LL) {
            i++;
        }

        UU = DNVL[1][i - 1] + ((DNVL[1][i] - DNVL[1][i - 1]) / (DNVL[0][i] - DNVL[0][i - 1])) * (LL - DNVL[0][i - 1]);
        return UU;
    };

    var weightALSCal = function () {
        var Hstar = 0,
            k = 0,
            Uwstar = 0,
            Mstar = 0,
            Kstar = 0;
        var FYstar = 0,
            FZstar = 0,
            Ws = 0;
        Hstar = 1.77 * Hs;
        k = (4 * Math.PI * Math.PI) / (Tp * Tp * 9.81);
        Uwstar = (Math.PI * Hstar) / Tp / Math.sinh(k * wd);
        Mstar = Uc / Uwstar;
        Kstar = (Uwstar * Tp) / D;

        readCYCZ(Kstar, Mstar);

        FYstar = 0.5 * CYstar * 1.025 * D * (Uwstar + Uc) * (Uwstar + Uc);
        FZstar = 0.5 * CZstar * 1.025 * D * (Uwstar + Uc) * (Uwstar + Uc);
        Ws = (rsc * FYstar) / mu + FZstar;
        return Ws;
    };

    var weightGLSCal = function () {
        var Us = 0,
            M = 0,
            K = 0,
            temp1 = 0,
            temp2 = 0,
            temp3 = 0,
            temp4 = 0;
        var Lstable = new Array(10);
        var L10 = new Array(10);
        var MM = new Array(0.2, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 4, 10);
        var KK = new Array(5, 10, 15, 20, 30, 40, 60);
        var i = 0,
            j = 0,
            k = 0,
            l = 0;

        Lstable[0] = new Array(1.5, 1.42, 1.35, 1.25, 1.22, 1.22);
        Lstable[1] = new Array(1.82, 1.7, 1.61, 1.53, 1.5, 1.5);
        Lstable[2] = new Array(2.19, 1.97, 1.83, 1.69, 1.61, 1.61);
        Lstable[3] = new Array(2.65, 2.35, 2.18, 1.99, 1.85, 1.72);
        Lstable[4] = new Array(3.05, 2.55, 2.32, 2.13, 2.01, 1.9);
        Lstable[5] = new Array(3.05, 2.55, 2.4, 2.2, 2.06, 1.95);
        Lstable[6] = new Array(2.65, 2.45, 2.36, 2.24, 2.11, 2.09);
        Lstable[7] = new Array(2.5, 2.4, 2.35, 2.27, 2.22, 2.19);
        Lstable[8] = new Array(2.45, 2.4, 2.39, 2.37, 2.37, 2.37);
        Lstable[9] = new Array(2.5, 2.5, 2.5, 2.5, 2.5, 2.5);

        L10[0] = new Array(0.12, 0.25, 0.37, 0.49, 0.69, 0.69, 0.69);
        L10[1] = new Array(0.27, 0.56, 0.84, 0.78, 0.7, 0.7, 0.7);
        L10[2] = new Array(0.39, 0.64, 0.94, 0.8, 0.72, 0.72, 0.72);
        L10[3] = new Array(0.8, 1, 1.05, 0.87, 0.83, 0.83, 0.83);
        L10[4] = new Array(1, 1.12, 1.16, 1.03, 1.1, 1.24, 1.24);
        L10[5] = new Array(1, 1.14, 1.2, 1.22, 1.39, 1.36, 1.33);
        L10[6] = new Array(1.6, 1.55, 1.5, 1.49, 1.49, 1.49, 1.49);
        L10[7] = new Array(1.77, 1.66, 1.6, 1.58, 1.58, 1.58, 1.58);
        L10[8] = new Array(2, 1.9, 1.84, 1.8, 1.75, 1.75, 1.75);
        L10[9] = new Array(2.2, 2.1, 2, 1.95, 1.95, 1.95, 1.95);

        Us = calUs();
        M = Uc / Us;
        K = (Us * Tp) / D;

        if (lateralDisplacementLessThan == "half") {
            i = 0;
            while (M > MM[i] && i <= 9) i++;
            if (i == 0) j = 0;
            else if (i == 10) {
                i = 9;
                j = 9;
            } else j = i - 1;

            k = 0;
            while (K > KK[k] && k <= 6) k++;
            if (k == 0) l = 0;
            else if (k == 7) {
                k = 6;
                l = 6;
            } else l = k - 1;

            temp1 = Lstable[j][l] + ((Lstable[j][k] - Lstable[j][l]) / (KK[k] - KK[l])) * (K - KK[l]);
            temp2 = Lstable[i][l] + ((Lstable[i][k] - Lstable[i][l]) / (KK[k] - KK[l])) * (K - KK[l]);
            temp3 = temp1 + ((temp2 - temp1) / (MM[i] - MM[j])) * (M - MM[j]);
        } else if (lateralDisplacementLessThan == "ten") {
            i = 0;
            while (M > MM[i] && i <= 9) i++;
            if (i == 0) j = 0;
            else if (i == 10) {
                i = 9;
                j = 9;
            } else j = i - 1;

            k = 0;
            while (K > KK[k] && k <= 6) k++;
            if (k == 0) l = 0;
            else if (k == 7) {
                k = 6;
                l = 6;
            } else l = k - 1;

            temp1 = L10[j][l] + ((L10[j][k] - Lstable[j][l]) / (KK[k] - KK[l])) * (K - KK[l]);
            temp2 = L10[i][l] + ((L10[i][k] - Lstable[i][l]) / (KK[k] - KK[l])) * (K - KK[l]);
            temp3 = temp1 + ((temp2 - temp1) / (MM[i] - MM[j])) * (M - MM[j]);
        } else {
            alert("您的选择不合适的GLS标准！");
            return;
        }

        temp4 = temp3 * (2 + M) * (2 + M);
        return temp4 * 0.5 * 1.025 * D * (Us + Uc) * (Us + Uc);
    };

    var weightDLSCal = function () {
        var Us = 0,
            Ws = 0,
            L = 0;
        Us = calUs();

        L = findL();
        Ws = L * 0.5 * 1.025 * D * (Us + Uc) * (Us + Uc);
        return Ws;
    };

    var stabilityALSCal = function () {
        var Hstar = 0,
            k = 0,
            Uwstar = 0,
            Mstar = 0,
            Kstar = 0;
        var FYstar = 0,
            FZstar = 0,
            stb = 0;

        Hstar = 1.77 * Hs;
        k = (4 * Math.PI * Math.PI) / (Tp * Tp * 9.81);
        Uwstar = (Math.PI * Hstar) / Tp / Math.sinh(k * wd);
        Mstar = Uc / Uwstar;
        Kstar = (Uwstar * Tp) / D;

        readCYCZ(Kstar, Mstar);

        FYstar = 0.5 * CYstar * 1.025 * D * (Uwstar + Uc) * (Uwstar + Uc);
        FZstar = 0.5 * CZstar * 1.025 * D * (Uwstar + Uc) * (Uwstar + Uc);
        if (mu * (pipew - FZstar) > rsc * FYstar) stb = "管道稳定。";
        else stb = "管道不稳定。";

        return stb;
    };

    var stabilityGLSCal = function () {
        var Us = 0,
            M = 0,
            K = 0,
            temp1 = 0,
            temp2 = 0,
            temp3 = 0,
            L10 = 0,
            Lst = 0;
        var Lstable = new Array(10);
        var L10 = new Array(10);
        var MM = new Array(0.2, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 4, 10);
        var KK = new Array(5, 10, 15, 20, 30, 40, 60);
        var i = 0,
            j = 0,
            k = 0,
            l = 0;

        Lstable[0] = new Array(1.5, 1.42, 1.35, 1.25, 1.22, 1.22);
        Lstable[1] = new Array(1.82, 1.7, 1.61, 1.53, 1.5, 1.5);
        Lstable[2] = new Array(2.19, 1.97, 1.83, 1.69, 1.61, 1.61);
        Lstable[3] = new Array(2.65, 2.35, 2.18, 1.99, 1.85, 1.72);
        Lstable[4] = new Array(3.05, 2.55, 2.32, 2.13, 2.01, 1.9);
        Lstable[5] = new Array(3.05, 2.55, 2.4, 2.2, 2.06, 1.95);
        Lstable[6] = new Array(2.65, 2.45, 2.36, 2.24, 2.11, 2.09);
        Lstable[7] = new Array(2.5, 2.4, 2.35, 2.27, 2.22, 2.19);
        Lstable[8] = new Array(2.45, 2.4, 2.39, 2.37, 2.37, 2.37);
        Lstable[9] = new Array(2.5, 2.5, 2.5, 2.5, 2.5, 2.5);

        L10[0] = new Array(0.12, 0.25, 0.37, 0.49, 0.69, 0.69, 0.69);
        L10[1] = new Array(0.27, 0.56, 0.84, 0.78, 0.7, 0.7, 0.7);
        L10[2] = new Array(0.39, 0.64, 0.94, 0.8, 0.72, 0.72, 0.72);
        L10[3] = new Array(0.8, 1, 1.05, 0.87, 0.83, 0.83, 0.83);
        L10[4] = new Array(1, 1.12, 1.16, 1.03, 1.1, 1.24, 1.24);
        L10[5] = new Array(1, 1.14, 1.2, 1.22, 1.39, 1.36, 1.33);
        L10[6] = new Array(1.6, 1.55, 1.5, 1.49, 1.49, 1.49, 1.49);
        L10[7] = new Array(1.77, 1.66, 1.6, 1.58, 1.58, 1.58, 1.58);
        L10[8] = new Array(2, 1.9, 1.84, 1.8, 1.75, 1.75, 1.75);
        L10[9] = new Array(2.2, 2.1, 2, 1.95, 1.95, 1.95, 1.95);

        Us = calUs();
        M = Uc / Us;
        K = (Us * Tp) / D;

        i = 0;
        while (M > MM[i] && i <= 9) i++;
        if (i == 0) j = 0;
        else if (i == 10) {
            i = 9;
            j = 9;
        } else j = i - 1;

        k = 0;
        while (K > KK[k] && k <= 6) k++;
        if (k == 0) l = 0;
        else if (k == 7) {
            k = 6;
            l = 6;
        } else l = k - 1;

        temp1 = Lstable[j][l] + ((Lstable[j][k] - Lstable[j][l]) / (KK[k] - KK[l])) * (K - KK[l]);
        temp2 = Lstable[i][l] + ((Lstable[i][k] - Lstable[i][l]) / (KK[k] - KK[l])) * (K - KK[l]);
        temp3 = temp1 + ((temp2 - temp1) / (MM[i] - MM[j])) * (M - MM[j]);
        Lst = temp3 * (2 + M) * (2 + M);

        i = 0;
        while (M > MM[i] && i <= 9) i++;
        if (i == 0) j = 0;
        else if (i == 10) {
            i = 9;
            j = 9;
        } else j = i - 1;

        k = 0;
        while (K > KK[k] && k <= 6) k++;
        if (k == 0) l = 0;
        else if (k == 7) {
            k = 6;
            l = 6;
        } else l = k - 1;

        temp1 = L10[j][l] + ((L10[j][k] - Lstable[j][l]) / (KK[k] - KK[l])) * (K - KK[l]);
        temp2 = L10[i][l] + ((L10[i][k] - Lstable[i][l]) / (KK[k] - KK[l])) * (K - KK[l]);
        temp3 = temp1 + ((temp2 - temp1) / (MM[i] - MM[j])) * (M - MM[j]);
        L10 = temp3 * (2 + M) * (2 + M);

        if (pipew / (0.5 * 1.025 * D * (Us + Uc) * (Us + Uc)) > Lst) {
            disp = "管道位移小于直径的一半。";
        } else if (pipew / (0.5 * 1.025 * D * (Us + Uc) * (Us + Uc)) > Lst) {
            disp = "管道位移介于半直径和10倍直径之间。";
        } else {
            disp = "管道位移大于10倍直径。";
        }
        return disp;
    };

    var stabilityDLSCal = function () {
        var U = 0;

        U = findU();
        return "管道位移为" + U.toFixed(2) + "倍管道直径";
    };

    // run calculation and store results
    var result = "";

    if (taskState == "weight") {
        if (stabilityState == "absolute") {
            result = weightALSCal();
        } else if (stabilityState == "generalised") {
            result = weightGLSCal();
        } else if (stabilityState == "dynamic") {
            result = weightDLSCal();
        }
    } else {
        if (stabilityState == "absolute") {
            result = stabilityALSCal();
        } else if (stabilityState == "generalised") {
            result = stabilityGLSCal();
        } else if (stabilityState == "dynamic") {
            result = stabilityDLSCal();
        }
    }

    // update output values
    if (taskState == "weight") {
        var text = "管道稳定所需的管道浮重为：" + result.toFixed(2) + " kN/m";
        $("p.weight_specific").text(text) ;
    } else {

        $("p.stability_specific").text(result) ;
    }
}
