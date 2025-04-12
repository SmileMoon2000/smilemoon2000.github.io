var ECharts=[],
EchartOptionList=[],
myChart = echarts.init(document.getElementById('echart_walking'));
function setvalue(dict) {
    for (const key in dict) {
      $("input#"+key).val(dict[key]);
    };
}

function resetWalking() {
    var defaultInputs = {
        "A": 0.02,
        "L": 5000,
        "w": 1200,
        "E": 207,//e9 GPa
        "Alpha": 1.165e-5,
        "pois": 0.3,
        "t": 0.0206,
        "r": 0.162,
        "mu": 0.5,
        "Theta": 2,//*math.pi/180 degree
        "F_L": 100,//e3 kN
        "F_R": 300,//e3 kN
        "T_Inital": 20,
        "T_End": 100,
        "Internal_pressure": 30//e6 MPa
    }
    setvalue(defaultInputs);
    myChart.clear();
}

function linspace(x1,x2,n) {
    if(typeof(x1)!="number"){
        alert("linspace第1个参数必须为数字");
        return;
    }
    if(typeof(x2)!="number"){
        alert("linspace第2个参数必须为数字");
        return;
    }
    
    if(!n){
        n=100;
    }else if(!Number.isInteger(n)|| n < 1){
        alert("linspace第3个参数必须为正整数");
        return;
    }
    let delta = (x2-x1)/(n-1);
    let array = new Array(n);
    for (let i = 0; i < array.length; i++) {
        array[i]=x1 + delta*i;
    }
    return array;
}
function zeros(rows,cols) {
    if(typeof(rows)!="number" || rows<1){
        alert("zeros第1个参数必须为正整数");
        return;
    }
    if(typeof(cols)!="number" || cols<1){
        alert("zeros第2个参数必须为正整数");
        return;
    }
    // let array = new Array(r,c);
    // for (let i = 0; i < array.length; i++) {
    //     array[i]=;
        
    // }
    // let arr = new Array(rows).fill(new Array(cols).fill(0));
    let arr = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    return arr;
}
function range(s,e) {
    if (!Number.isInteger(s)||!Number.isInteger(e)||s<0||e<0) {
        alert("range参数必须为正整数");
        return;
    } else if(s>=e){
        alert("range第1参数必须小于第2参数");
        return;
    }
    var arr = Array(e-s+1).fill(0).map((_,index)=>s+index);
    return arr;
}
//=====================================
function cool_LessThan_XC(mu,Theta,WW,E,A,L,Alfa,Delta_T,F_L,Eta,x,heat_cool_C){
    let temp1=(mu*Math.cos(Theta)-Math.sin(Theta))*WW/2/E/A*(x/L)**2;
    let temp2=(Alfa*Delta_T+F_L/E/A)*x/L;
    let temp3=(mu*Math.cos(Theta)-Math.sin(Theta))/8*WW/E/A*(1+Eta)+0.5*(Alfa*Delta_T+F_L/E/A);
    temp3=-(1+Eta)*temp3;
    let y=(temp1+temp2+temp3)*L+heat_cool_C;
    return y;
}
function cool_MoreThan_XC(mu,Theta,WW,E,A,L,Alfa,Delta_T,F_R,Eta,x,heat_cool_C){
    let temp1=-(mu*Math.cos(Theta)+Math.sin(Theta))*WW/2/E/A*((L-x)/L)**2;
    let temp2=-(Alfa*Delta_T+F_R/E/A)*(L-x)/L;
    let temp3=(mu*Math.cos(Theta)+Math.sin(Theta))/8*WW/E/A*(1-Eta)+0.5*(Alfa*Delta_T+F_R/E/A);
    temp3=temp3*(1-Eta);
    y=(temp1+temp2+temp3)*L+heat_cool_C;
    return y;
}

function heat_LessThan_XH(mu,Theta,WW,E,A,L,Alfa,Delta_T,F_L,Eta,x,heat_cool_H){
    let temp1=-(mu*Math.cos(Theta)+Math.sin(Theta))*WW/2/E/A*(x/L)**2;
    let temp2=(Alfa*Delta_T+F_L/E/A)*x/L;
    let temp3=(mu*Math.cos(Theta)+Math.sin(Theta))/8*WW/E/A*(1-Eta)-0.5*(Alfa*Delta_T+F_L/E/A);
    temp3=(1-Eta)*temp3;
    y=(temp1+temp2+temp3)*L+heat_cool_H;
    return y;
}

function heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alfa,Delta_T,F_R,Eta,x,heat_cool_H){
    let y=((mu*Math.cos(Theta)-Math.sin(Theta))*WW/2/E/A*((L-x)/L)**2-(Alfa*Delta_T+F_R/E/A)*(L-x)/L-(1+Eta)*((mu*Math.cos(Theta)-Math.sin(Theta))/8*WW/E/A*(1+Eta)-0.5*(Alfa*Delta_T+F_R/E/A)))*L+heat_cool_H;
    return y;
}

function linspace2(x0,x1,x2,nSegments) {
    var xx1=linspace(x0,x1,nSegments),
    xx2=linspace(x1,x2,nSegments),
    xx=xx1.concat(xx2);
    return xx;
}
function N_LessThan_XH(mu,Theta,w,x,L,F_L,F_R) {
  return -(mu*Math.cos(Theta)+Math.sin(Theta))*w*x+F_L;
}
function N_MoreThan_XH(mu,Theta,w,x,L,F_L,F_R) {
  return (mu*Math.cos(Theta)-Math.sin(Theta))*w*(x-L)+F_R;
}
function N_LessThan_XC(mu,Theta,w,x,L,F_L,F_R) {
  return (mu*Math.cos(Theta)-Math.sin(Theta))*w*x+F_L;
}
function N_MoreThan_XC(mu,Theta,w,x,L,F_L,F_R) {
  return (mu*Math.cos(Theta)+Math.sin(Theta))*w*(L-x)+F_R;
}

function strain_LessThan_XH(Alpha,Delta_T,F_L,F_R,E,A,mu,Theta,WW,L,x) {
  return Alpha*Delta_T+F_L/E/A-(mu*Math.cos(Theta)+Math.sin(Theta))*WW*x/E/A/L;
}
function strain_MoreThan_XH(Alpha,Delta_T,F_L,F_R,E,A,mu,Theta,WW,L,x) {
  return Alpha*Delta_T+F_R/E/A-(mu*Math.cos(Theta)-Math.sin(Theta))*WW*(L-x)/E/A/L;
}
function strain_LessThan_XC(Alpha,Delta_T,F_L,F_R,E,A,mu,Theta,WW,L,x) {
  return Alpha*Delta_T+F_L/E/A+(mu*Math.cos(Theta)-Math.sin(Theta))*WW*x/E/A/L;
}
function strain_MoreThan_XC(Alpha,Delta_T,F_L,F_R,E,A,mu,Theta,WW,L,x) {
  return Alpha*Delta_T+F_R/E/A+(mu*Math.cos(Theta)+Math.sin(Theta))*WW*(L-x)/E/A/L;
}

function keypoints_series(Cycle,keypoints,Name) {
  var Cycles = linspace(0,Cycle,Cycle*2+1);
  var n_M =  Cycles.map((key,value)=>[key,keypoints.M[value]]);
  var n_Heat =  Cycles.map((key,value)=>[key,keypoints.Heat[value]]);
  var n_Cool =  Cycles.map((key,value)=>[key,keypoints.Cool[value]]);
  var n_Left =  Cycles.map((key,value)=>[key,keypoints.Left[value]]);
  var n_Right =  Cycles.map((key,value)=>[key,keypoints.Right[value]]);
  var series = [
      {name:"左端"+Name,type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_Left},
      {name:"H点"+Name,type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_Heat},
      {name:"中点"+Name,type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_M},
      {name:"C点"+Name,type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_Cool},
      {name:"右端"+Name,type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_Right}
  ];
  return series;
}

function Echart_Option(echartid,title,Xname,Yname,SeriesList) {
    if (SeriesList.length && SeriesList.length>1) {
        var half = SeriesList.length/2;
        var LineColors = Array(half*2).fill("").map((_,index)=>index<half?"red":"blue");
        var Legend = [];
        SeriesList.forEach(element => {
            Legend.push(element.name);
        });
    }
    var option = {
        title: {
          text: title
        },
        backgroundColor:'#fff',
        // legend: {orient: 'vertical',align: 'left',data: Legend},
        // color:LineColors,
        // color:['red','red','red','red','red','blue','blue','blue','blue','blue'],
        // color:{
        //     type: 'linear',
        //     x: 0,
        //     y: 0,
        //     x2: 0,
        //     y2: 1,
        //     colorStops: [{
        //         offset: 0, color: 'red' // 0% 处的颜色
        //     }, {
        //         offset: 1, color: 'blue' // 100% 处的颜色
        //     }],
        //     global: false // 缺省为 false
        //   },
        tooltip: {
          trigger: 'axis',
          textStyle:{fontSize:10},
          valueFormatter: (value) => value.toFixed(5),
          backgroundColor:'rgba(250,250,250,0.3)'
        },
        grid: {
          left: 20,
          right: 50,
          bottom: 20,
          containLabel: true
        },
        toolbox: {
          feature: {
            mark : {show: true},
            dataView : {show: true},
            restore : {show: true},
            dataZoom: {show: true},
            saveAsImage : {show: true},
            myFull: {
                show: true,
                title: '全屏',
                icon: 'path://M128 32H32C14.31 32 0 46.31 0 64v96c0 17.69 14.31 32 32 32s32-14.31 32-32V96h64c17.69 0 32-14.31 32-32S145.7 32 128 32zM416 32h-96c-17.69 0-32 14.31-32 32s14.31 32 32 32h64v64c0 17.69 14.31 32 32 32s32-14.31 32-32V64C448 46.31 433.7 32 416 32zM128 416H64v-64c0-17.69-14.31-32-32-32s-32 14.31-32 32v96c0 17.69 14.31 32 32 32h96c17.69 0 32-14.31 32-32S145.7 416 128 416zM416 320c-17.69 0-32 14.31-32 32v64h-64c-17.69 0-32 14.31-32 32s14.31 32 32 32h96c17.69 0 32-14.31 32-32v-96C448 334.3 433.7 320 416 320z',//`image://${screenUrl}`,
                onclick: (e,t) => {
                  // 注：yourEchartsId: 你的图表id
                  var tt = e.target;
                  var echartid=this.event.target.closest('.echart').id;
                  const element = document.getElementById(echartid);
                  if (element.requestFullScreen) { // HTML W3C 提议
                    element.requestFullScreen();
                  } else if (element.msRequestFullscreen) { // IE11
                    element.msRequestFullScreen();
                  } else if (element.webkitRequestFullScreen) { // Webkit (works in Safari5.1 and Chrome 15)
                    element.webkitRequestFullScreen();
                  } else if (element.mozRequestFullScreen) { // Firefox (works in nightly)
                    element.mozRequestFullScreen();
                  }
                //   
                  // 退出全屏
                  if (element.requestFullScreen) {
                    document.exitFullscreen();
                  } else if (element.msRequestFullScreen) {
                    document.msExitFullscreen();
                  } else if (element.webkitRequestFullScreen) {
                    document.webkitCancelFullScreen();
                  } else if (element.mozRequestFullScreen) {
                    document.mozCancelFullScreen();
                  }
                  
                },
            }
          }
        },
        xAxis: {
          type: 'value',
          name: Xname,
          splitLine: {
            show: true
          },
        //   axisLabel: {
        //     margin: 30,
        //     fontSize: 16
        //   },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
        //   inverse: true,
          lineStyle: {width:1},
          name:Yname,
        //   axisLabel: {
        //     margin: 30,
        //     fontSize: 16,
        //     formatter: '#{value}'
        //   },
        //   inverse: true,
        //   interval: 1,
        //   min: 1,
        //   max: names.length
        },
        series: SeriesList
      };
      return option;
}

function calculateFirstPhase(){
    // get input data
    let inputList = $("div.card-input input[type=number]");
    let InputData=[];
    inputList.each((index,item)=>{
        InputData[$(item).attr("id")]=Number($(item).val());
        // eval( "var "+ item.id +"= " + item.value +";" );
    });

    const theta = InputData['theta'] * (Math.PI / 180),
    mu = InputData['mu'],
    delta_e = InputData['delta_e'],
    alpha = InputData['alpha']*1e-5,
    T = InputData['T'],
    T_c = InputData['T_c'],
    w = InputData['w'],
    L = InputData['L'],
    E = InputData['E']*1e9,
    A = InputData['A'],
    Ft = InputData['Ft'],
    Fb = InputData['Fb'],
    
    c1 = InputData['c1'],
    c2 = InputData['c2'],
    x_Ho = InputData['x_Ho'],
    x_Hi = InputData['x_Hi'],
    
    x1 = InputData['x1'],
    x2 = InputData['x2'],
    x3 = InputData['x3'];
    
    let r = [c1, c2, x_Ho, x_Hi]; 
        
    const k = (mu * w * Math.cos(theta)) / delta_e;
    const lambda = Math.sqrt(E * A / k);
    const ft = Ft / (E * A);
    const fb = Fb / (E * A);
    const omega_plus = ((mu * w * Math.cos(theta) + w * Math.sin(theta)) * L) / (E * A);
    const omega_minus = ((mu * w * Math.cos(theta) - w * Math.sin(theta)) * L) / (E * A);

    const tolerance = 1e-6;
    const max_iter = 1000;

    let converged = false; 
    let final_iter = 0;    

    for (let iter = 1; iter <= max_iter; iter++) {
        const [c1, c2, x_Ho, x_Hi] = r;

        const F1 = c1 * Math.exp(x_Ho / lambda) + c2 * Math.exp(-x_Ho / lambda) + (w * Math.sin(theta)) / k + delta_e;
        const F2 = c1 * Math.exp(x_Hi / lambda) + c2 * Math.exp(-x_Hi / lambda) + (w * Math.sin(theta)) / k - delta_e;
        const F3 = (c1 / lambda) * Math.exp(x_Ho / lambda) - (c2 / lambda) * Math.exp(-x_Ho / lambda) - alpha * T + omega_plus * (x_Ho / L + 0.5) - ft;
        const F4 = (c1 / lambda) * Math.exp(x_Hi / lambda) - (c2 / lambda) * Math.exp(-x_Hi / lambda) - alpha * T - omega_minus * (x_Hi / L - 0.5) - fb;

        const F = [F1, F2, F3, F4];

        if (Math.sqrt(F.reduce((sum, val) => sum + val * val, 0)) < tolerance) {
            console.log(`收敛于第 ${iter} 次迭代`);
            converged = true;
            final_iter = iter;  
            break;
        }
        
        const J = [
            [Math.exp(x_Ho / lambda), Math.exp(-x_Ho / lambda), (c1 / lambda) * Math.exp(x_Ho / lambda) - (c2 / lambda) * Math.exp(-x_Ho / lambda), 0],
            [Math.exp(x_Hi / lambda), Math.exp(-x_Hi / lambda), 0, (c1 / lambda) * Math.exp(x_Hi / lambda) - (c2 / lambda) * Math.exp(-x_Hi / lambda)],
            [(1 / lambda) * Math.exp(x_Ho / lambda), -(1 / lambda) * Math.exp(-x_Ho / lambda), (c1 / lambda ** 2) * Math.exp(x_Ho / lambda) + (c2 / lambda ** 2) * Math.exp(-x_Ho / lambda) + omega_plus / L, 0],
            [(1 / lambda) * Math.exp(x_Hi / lambda), -(1 / lambda) * Math.exp(-x_Hi / lambda), 0, (c1 / lambda ** 2) * Math.exp(x_Hi / lambda) + (c2 / lambda ** 2) * Math.exp(-x_Hi / lambda) - omega_minus / L]
        ];
        
        const delta_r = solveLinearSystem(J, F.map(val => -val));
        r = r.map((val, i) => val + delta_r[i]);

        console.log(`第 ${iter} 次迭代: c1 = ${r[0]}, c2 = ${r[1]}, x_Ho = ${r[2]}, x_Hi = ${r[3]}`);
    }

    if (!converged) {
        const resultDiv = document.getElementById('first-phase-result');
        resultDiv.innerHTML = `
            <h2 style="color: red">计算未收敛</h2>
            <pre>经过 ${max_iter} 次迭代仍未达到收敛条件\n请尝试:
            1. 增加最大迭代次数
            2. 调整初始猜测值
            3. 检查输入参数合理性
            </pre> `;
            firstPhaseConverged = false;
            const secondPhaseResultDiv = document.getElementById('second-phase-result');
            secondPhaseResultDiv.innerHTML = `
                <h2 style="color: red">警告</h2>
                <pre>第一阶段计算结果未收敛，无法进行第二阶段计算！</pre>`;
        return;
    }

    firstPhaseConverged = true; 

    console.log('最终解:');
    console.log(`c1 = ${r[0]}`);
    console.log(`c2 = ${r[1]}`);
    console.log(`x_Ho = ${r[2]}`);
    console.log(`x_Hi = ${r[3]}`);
   
    const u_H1 = -omega_plus * (x1 ** 2 - r[2] ** 2) / (2 * L) + (alpha * T - omega_plus / 2 + ft) * (x1 - r[2]) - delta_e;
    const u_H2 = omega_minus * (x2 ** 2 - r[3] ** 2) / (2 * L) + (alpha * T - omega_minus / 2 + fb) * (x2 - r[3]) + delta_e;
    const u_H3 = omega_minus * (x3 ** 2 - r[3] ** 2) / (2 * L) + (alpha * T - omega_minus / 2 + fb) * (x3 - r[3]) + delta_e;

    console.log(`u_H1 = ${u_H1}`);
    console.log(`u_H2 = ${u_H2}`);
    console.log(`u_H3 = ${u_H3}`);

  
    const resultDiv = document.getElementById('first-phase-result');
    resultDiv.innerHTML = `
        <h2>第一阶段计算结果(单位: m)</h2>
        <pre>
        收敛于第 ${final_iter} 次迭代

        第一次循环加热最终解:
        c1 = ${r[0]}
        c2 = ${r[1]}
        x_Ho = ${r[2]}
        x_Hi = ${r[3]}

        第一次循环加热位移结果:
        u_H1 = ${u_H1.toFixed(8)}
        u_H2 = ${u_H2.toFixed(8)}
        u_H3 = ${u_H3.toFixed(8)}
        </pre> `;


    firstPhaseResults = {
        c1: r[0],
        c2: r[1],
        x_Ho: r[2],
        x_Hi: r[3],
        u_H1: u_H1,
        u_H2: u_H2,
        u_H3: u_H3,
        theta,
        mu,
        delta_e,
        alpha,
        T,
        T_c,
        w,
        L,
        E,
        A,
        Ft,
        Fb,
        x1,
        x2,
        x3
    };
  
    calculateSecondPhase(firstPhaseResults);
}


function calculateSecondPhase(inputs) {
    if (!inputs || !firstPhaseConverged) {
        const secondPhaseResultDiv = document.getElementById('second-phase-result');
        secondPhaseResultDiv.innerHTML = `
            <h2 style="color: red">警告</h2>
            <pre>第一阶段计算结果未收敛，请检查输入参数或调整初始值！</pre>`;
        return;
    }
    
    const { c1, c2, x_Ho, x_Hi, u_H1, u_H2, u_H3, theta, mu, delta_e, alpha, T, T_c, w, L, E, A, Ft, Fb, x1, x2, x3 } = inputs;
   
    const k = (mu * w * Math.cos(theta)) / delta_e;
    const lambda = Math.sqrt(E * A / k);
    const ft = Ft / (E * A);
    const fb = Fb / (E * A);
    const omega_plus = ((mu * w * Math.cos(theta) + w * Math.sin(theta)) * L) / (E * A);
    const omega_minus = ((mu * w * Math.cos(theta) - w * Math.sin(theta)) * L) / (E * A);

    const Q = w * L * Math.sin(theta) + Fb - Ft;
    const omega = (mu * w * L * Math.cos(theta)) / (E * A);
    const R = (mu * w * L * Math.cos(theta) - Q) / (E * A);

    //===================================================================第一次循环冷却计算=====================================================================//
    //解的计算//
    const x_Co = L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_Ci = x_Co - lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    const c3 = -lambda / 2 * (alpha * T - R) * Math.exp(-x_Ci / lambda);
    const c4 = lambda / 2 * (alpha * T - R) * Math.exp(x_Ci / lambda);
    //叠加位移计算//
    const u_Hci = omega_minus * (Math.pow(x_Ci, 2) - Math.pow(x_Hi, 2)) / (2 * L) + (alpha * T - omega_minus / 2 + fb) * (x_Ci - x_Hi) + delta_e;
    const u_Hco = omega_minus * (Math.pow(x_Co, 2) - Math.pow(x_Hi, 2)) / (2 * L) + (alpha * T - omega_minus / 2 + fb) * (x_Co - x_Hi) + delta_e;
    //位移计算//
    const u_C1 = omega_minus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_Ci, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x1 - x_Ci) + u_Hci;
    const u_C2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_Ci, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x2 - x_Ci) + u_Hci;
    const u_C3 = -omega_plus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_Co, 2)) + (alpha * T_c + omega_plus / 2 + fb) * (x3 - x_Co) + u_Hco - 2 * delta_e;
    //================================================================== 第二次循环加热计算 ====================================================================//
    //解的计算//
    const x_HHo = -L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_HHi = x_HHo + lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    const c5 = lambda / 2 * (alpha * T - R) * Math.exp(-x_HHi / lambda);
    const c6 = -lambda / 2 * (alpha * T - R) * Math.exp(x_HHi / lambda);
    // 叠加位移计算//
    const u_Chho = omega_minus / (2 * L) * (Math.pow(x_HHo, 2) - Math.pow(x_Ci, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHo - x_Ci) + u_Hci;
    const u_Chhi = omega_minus / (2 * L) * (Math.pow(x_HHi, 2) - Math.pow(x_Ci, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHi - x_Ci) + u_Hci;
    //位移计算//
    const u_HH1 = -omega_plus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_HHo, 2)) + (alpha * T - omega_plus / 2 + ft) * (x1 - x_HHo) + u_Chho - 2 * delta_e;
    const u_HH2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_HHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x2 - x_HHi) + u_Chhi;
    const u_HH3 = omega_minus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_HHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x3 - x_HHi) + u_Chhi;
    //================================================================== 第二次循环冷却计算 =================================================================//
    //解的计算//
    const x_CCo = L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_CCi = x_CCo - lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    const c7 = -lambda / 2 * (alpha * T - R) * Math.exp(-x_CCi / lambda);
    const c8 = lambda / 2 * (alpha * T - R) * Math.exp(x_CCi / lambda);
    //叠加位移计算//
    const u_HHcci = omega_minus / (2 * L) * (Math.pow(x_CCi, 2) - Math.pow(x_HHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCi - x_HHi) + u_Chhi;
    const u_HHcco = omega_minus / (2 * L) * (Math.pow(x_CCo, 2) - Math.pow(x_HHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCo - x_HHi) + u_Chhi;
    //位移计算//
    const u_CC1 = omega_minus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_CCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x1 - x_CCi) + u_HHcci;
    const u_CC2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_CCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x2 - x_CCi) + u_HHcci;
    const u_CC3 = -omega_plus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_CCo, 2)) + (alpha * T_c + omega_plus / 2 + fb) * (x3 - x_CCo) + u_HHcco - 2 * delta_e;
    //==================================================================== 第三次循环加热计算 ================================================================//
    //解的计算//
    const x_HHHo = -L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_HHHi = x_HHo + lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    //叠加位移的计算//
    const u_CChhho = omega_minus / (2 * L) * (Math.pow(x_HHHo, 2) - Math.pow(x_CCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHHo - x_CCi) + u_HHcci;
    const u_CChhhi = omega_minus / (2 * L) * (Math.pow(x_HHHi, 2) - Math.pow(x_CCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHHi - x_CCi) + u_HHcci;
    //位移计算//
    const u_HHH1 = -omega_plus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_HHHo, 2)) + (alpha * T - omega_plus / 2 + ft) * (x1 - x_HHHo) + u_CChhho - 2 * delta_e;
    const u_HHH2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_HHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x2 - x_HHHi) + u_CChhhi;
    const u_HHH3 = omega_minus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_HHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x3 - x_HHHi) + u_CChhhi;
    //==================================================================== 第三次循环冷却计算 ==============================================================//
    //解的计算//
    const x_CCCo = L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_CCCi = x_CCo - lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    //叠加位移的计算//
    const u_HHHccci = omega_minus / (2 * L) * (Math.pow(x_CCCi, 2) - Math.pow(x_HHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCCi - x_HHHi) + u_CChhhi;
    const u_HHHccco = omega_minus / (2 * L) * (Math.pow(x_CCCo, 2) - Math.pow(x_HHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCCo - x_HHHi) + u_CChhhi;
    //位移计算//
    const u_CCC1 = omega_minus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_CCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x1 - x_CCCi) + u_HHHccci;
    const u_CCC2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_CCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x2 - x_CCCi) + u_HHHccci;
    const u_CCC3 = -omega_plus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_CCCo, 2)) + (alpha * T_c + omega_plus / 2 + fb) * (x3 - x_CCCo) + u_HHHccco - 2 * delta_e;
    //===================================================================== 第四次循环加热计算 =============================================================//
    //解的计算//
    const x_HHHHo = -L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_HHHHi = x_HHo + lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    //叠加位移的计算//
    const u_CCChhhho = omega_minus / (2 * L) * (Math.pow(x_HHHHo, 2) - Math.pow(x_CCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHHHo - x_CCCi) + u_HHHccci;
    const u_CCChhhhi = omega_minus / (2 * L) * (Math.pow(x_HHHHi, 2) - Math.pow(x_CCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHHHi - x_CCCi) + u_HHHccci;
    //位移计算//
    const u_HHHH1 = -omega_plus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_HHHHo, 2)) + (alpha * T - omega_plus / 2 + ft) * (x1 - x_HHHHo) + u_CCChhhho - 2 * delta_e;
    const u_HHHH2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_HHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x2 - x_HHHHi) + u_CCChhhhi;
    const u_HHHH3 = omega_minus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_HHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x3 - x_HHHHi) + u_CCChhhhi;
    //===================================================================== 第四次循环冷却计算 =============================================================//
    //解的计算//
    const x_CCCCo = L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_CCCCi = x_CCo - lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    //叠加位移的计算//
    const u_HHHHcccci = omega_minus / (2 * L) * (Math.pow(x_CCCCi, 2) - Math.pow(x_HHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCCCi - x_HHHHi) + u_CCChhhhi;
    const u_HHHHcccco = omega_minus / (2 * L) * (Math.pow(x_CCCCo, 2) - Math.pow(x_HHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCCCo - x_HHHHi) + u_CCChhhhi;
    //位移计算//
    const u_CCCC1 = omega_minus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_CCCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x1 - x_CCCCi) + u_HHHHcccci;
    const u_CCCC2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_CCCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x2 - x_CCCCi) + u_HHHHcccci;
    const u_CCCC3 = -omega_plus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_CCCCo, 2)) + (alpha * T_c + omega_plus / 2 + fb) * (x3 - x_CCCCo) + u_HHHHcccco - 2 * delta_e;
    //===================================================================== 第五次循环加热计算 =============================================================//
    //解的计算//
    const x_HHHHHo = -L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_HHHHHi = x_HHo + lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    //叠加位移的计算//
    const u_CCCChhhhho = omega_minus / (2 * L) * (Math.pow(x_HHHHHo, 2) - Math.pow(x_CCCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHHHHo - x_CCCCi) + u_HHHHcccci;
    const u_CCCChhhhhi = omega_minus / (2 * L) * (Math.pow(x_HHHHHi, 2) - Math.pow(x_CCCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x_HHHHHi - x_CCCCi) + u_HHHHcccci;
    //位移的计算//
    const u_HHHHH1 = -omega_plus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_HHHHHo, 2)) + (alpha * T - omega_plus / 2 + ft) * (x1 - x_HHHHHo) + u_CCCChhhhho - 2 * delta_e;
    const u_HHHHH2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_HHHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x2 - x_HHHHHi) + u_CCCChhhhhi;
    const u_HHHHH3 = omega_minus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_HHHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x3 - x_HHHHHi) + u_CCCChhhhhi;
    //===================================================================== 第五次循环冷却计算 ============================================================//
    //解的计算//
    const x_CCCCCo = L * 0.5 * (1 - alpha * T / omega + 1 / omega * Math.sqrt(Math.pow(2 * delta_e / lambda, 2) + Math.pow(alpha * T - R, 2)));
    const x_CCCCCi = x_CCo - lambda * Math.log(Math.sqrt(Math.pow(2 * delta_e / (lambda * (alpha * T - R)), 2) + 1) + (2 * delta_e / (lambda * (alpha * T - R))));
    //叠加位移的计算//
    const u_HHHHHccccci = omega_minus / (2 * L) * (Math.pow(x_CCCCCi, 2) - Math.pow(x_HHHHHi, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCCCCi - x_HHHHHi) + u_CCCChhhhhi;
    const u_HHHHHccccco = omega_minus / (2 * L) * (Math.pow(x_CCCCCo, 2) - Math.pow(x_HHHHHo, 2)) + (alpha * T - omega_minus / 2 + fb) * (x_CCCCCo - x_HHHHHi) + u_CCCChhhhhi;
    //位移的计算//
    const u_CCCCC1 = omega_minus / (2 * L) * (Math.pow(x1, 2) - Math.pow(x_CCCCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x1 - x_CCCCCi) + u_HHHHHccccci;
    const u_CCCCC2 = omega_minus / (2 * L) * (Math.pow(x2, 2) - Math.pow(x_CCCCCi, 2)) + (alpha * T_c + omega_minus / 2 + ft) * (x2 - x_CCCCCi) + u_HHHHHccccci;
    const u_CCCCC3 = -omega_plus / (2 * L) * (Math.pow(x3, 2) - Math.pow(x_CCCCCo, 2)) + (alpha * T_c + omega_plus / 2 + fb) * (x3 - x_CCCCCo) + u_HHHHHccccco - 2 * delta_e;
   
    const secondPhaseResultDiv = document.getElementById('second-phase-result');
    secondPhaseResultDiv.innerHTML = `
        <h2>第二阶段计算结果(单位: m)</h2>
        <pre>
        第一次循环冷却位移结果:
        u_C1 = ${u_C1.toFixed(8)}
        u_C2 = ${u_C2.toFixed(8)}
        u_C3 = ${u_C3.toFixed(8)}

        第二次循环加热位移结果：
        u_HH1 = ${u_HH1.toFixed(8)}
        u_HH2 = ${u_HH2.toFixed(8)}
        u_HH3 = ${u_HH3.toFixed(8)}

        第二次循环冷却位移结果：
        u_CC1 = ${u_CC1.toFixed(8)}
        u_CC2 = ${u_CC2.toFixed(8)}
        u_CC3 = ${u_CC3.toFixed(8)}

        第三次循环加热位移结果：
        u_HHH1 = ${u_HHH1.toFixed(8)}
        u_HHH2 = ${u_HHH2.toFixed(8)}
        u_HHH3 = ${u_HHH3.toFixed(8)}

        第三次循环冷却位移结果：
        u_CCC1 = ${u_CCC1.toFixed(8)}
        u_CCC2 = ${u_CCC2.toFixed(8)}
        u_CCC3 = ${u_CCC3.toFixed(8)}

        第四次循环加热位移结果：
        u_HHHH1 = ${u_HHHH1.toFixed(8)}
        u_HHHH2 = ${u_HHHH2.toFixed(8)}
        u_HHHH3 = ${u_HHHH3.toFixed(8)}

        第四次循环冷却位移结果：
        u_CCCC1 = ${u_CCCC1.toFixed(8)}
        u_CCCC2 = ${u_CCCC2.toFixed(8)}
        u_CCCC3 = ${u_CCCC3.toFixed(8)}

        第五次循环加热位移结果：
        u_HHHHH1 = ${u_HHHHH1.toFixed(8)}
        u_HHHHH2 = ${u_HHHHH2.toFixed(8)}
        u_HHHHH3 = ${u_HHHHH3.toFixed(8)}

        第五次循环冷却位移结果：
        u_CCCCC1 = ${u_CCCCC1.toFixed(8)}
        u_CCCCC2 = ${u_CCCCC2.toFixed(8)}
        u_CCCCC3 = ${u_CCCCC3.toFixed(8)}
        </pre>`;
}

function solveLinearSystem(A, b) {
    const n = A.length;
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
                maxRow = j;
            }
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];

        for (let j = i + 1; j < n; j++) {
            const factor = A[j][i] / A[i][i];
            b[j] -= factor * b[i];
            for (let k = i; k < n; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = b[i] / A[i][i];
        for (let j = i - 1; j >= 0; j--) {
            b[j] -= A[j][i] * x[i];
        }
    }
    return x;
}

$("select#echart").on("change",function(event) {
    
    switch (event.target.value) {
        case "resistancesoil":
            if(EchartOptionList['resistancesoil']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['resistancesoil']);
            }
            break;
        case "N":
            if(EchartOptionList['N']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['N']);
            }
            break;
        case "strain":
            if(EchartOptionList['strain']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['strain']);
            }
            break;
        case "disp":
            if(EchartOptionList['disp']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['disp']);
            }
            break;
        case "keypointdisp":
            if(EchartOptionList['keypointdisp']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['keypointdisp']);
            }
            break;
        case "keypointN":
            if(EchartOptionList['keypointN']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['keypointN']);
            }
            break;
        case "keypointstrain":
            if(EchartOptionList['keypointstrain']) {
                myChart.clear();
                myChart.setOption(EchartOptionList['keypointstrain']);
            }
            break;
    
        default:
            break;
    }
});

$(window).resize((event)=>{
    // ECharts.forEach(e => {
    //     e.resize();
    // });
    myChart.resize();
});
