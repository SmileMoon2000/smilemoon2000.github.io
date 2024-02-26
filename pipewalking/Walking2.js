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
function N_MoreThan_XC(mu,Theta,w,x,L,F_L,F_R) {
  return (mu*Math.cos(Theta)+Math.sin(Theta))*w*x+F_L;
}
function N_LessThan_XC(mu,Theta,w,x,L,F_L,F_R) {
  return (mu*Math.cos(Theta)-Math.sin(Theta))*w*(L-x)+F_R;
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
          valueFormatter: (value) => value.toFixed(3),
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

function calculateWalking(){
    // get input data
    let inputList = $("div.card-input input[type=number]");
    let InputData=[];
    inputList.each((index,item)=>{
        InputData[$(item).attr("id")]=Number($(item).val());
        // eval( "var "+ item.id +"= " + item.value +";" );
    });
    var 
    A = InputData["A"],
    L = InputData["L"],
    w = InputData["w"],
    E = InputData["E"]*1e9,
    Alpha = InputData["Alpha"],
    pois = InputData["pois"],
    t = InputData["t"],
    r = InputData["r"],
    mu = InputData["mu"],
    Theta = InputData["Theta"]*Math.PI/180,
    F_L = InputData["F_L"]*1e3,
    F_R = InputData["F_R"]*1e3,
    T_Inital = InputData["T_Inital"],
    T_End = InputData["T_End"],
    Internal_pressure = InputData["Internal_pressure"]*1e6,
    //===============================================
    WW=w*L,//管道重量
    D=2*r,
    Delta_T_from_pressure=Internal_pressure*(0.5-pois)/Alpha/2/E/t*D,
    Delta_T=Delta_T_from_pressure+(T_End-T_Inital),//温度变化幅度
    f=w*Math.sin(Theta),//土阻力
    // before temperature change
    X_L=L*F_L/WW/(mu*Math.cos(Theta)+Math.sin(Theta)),
    X_R=L*F_R/WW/(mu*Math.cos(Theta)+Math.sin(Theta)),
    //================================================
    //  First 激发 加热
    Q=WW*Math.sin(Theta)+F_R-F_L,
    Eta=Q/mu/WW/Math.cos(Theta),
    X_H=0.5*(1-Eta)*L,
    X_C=0.5*(1+Eta)*L,
    //这时土阻力
    // xx1=linspace(0,X_H,100);
    // xx2=linspace(X_H,L,100);
    Cycle=5,
    //定义几个点的位移
    heat_cool_H=0,// x_H
    heat_M=0,//new Array(Cycle).fill(0),//zeros(1,Cycle),// L/2
    cool_M=0,//new Array(Cycle).fill(0),//zeros(1,Cycle),
    disp_Mid=[0],disp_Left=[0],disp_Right=[0],disp_H=[0],disp_C=[0],
    heat_cool_C=0,// x_C
    heat_cool_Left=0,//coordnate 0
    heat_cool_Right=0;// L
    var series_ResistanceSoil_H=[],
        series_N_H=[],
        series_strain_H=[],
        series_disp_H=[];
    var series_ResistanceSoil_C=[],
        series_N_C=[],
        series_strain_C=[],
        series_disp_C=[];
    var nSegments = 20;// L/2长度管道的切分片段数量
    var keypointNs={M:[],Heat:[],Cool:[],Left:[], Right:[]};
    for (let iii = 0; iii <Cycle; iii++) {
        //############### Heat ################
        var
        Delta_T=Delta_T_from_pressure+(T_End-T_Inital),
        xx1=linspace(0,X_H,nSegments),
        xx2=linspace(X_H,L,nSegments),
        xx=xx1.concat(xx2),
        
        //土阻力 ResistanceSoil=zeros(1,xx1.length+xx2.length),
        arr1 = new Array(xx1.length).fill(-mu*w*Math.cos(Theta)),
        arr2 = new Array(xx2.length).fill(mu*w*Math.cos(Theta)),
        ResistanceSoil= arr1.concat(arr2),
        // var ResistanceSoil=[...arr1,...arr2];
        // ResistanceSoil.push(...arr1,...arr2);
        x_ResistanceSoil = xx.map((key,value)=>[key,ResistanceSoil[value]]);
        series_ResistanceSoil_H.push({name:(iii+1).toString()+"次升温土阻力",type:"line",showSymbol:false,data:x_ResistanceSoil});
        // 
        
        
        //轴力 N=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>N_LessThan_XH(mu,Theta,w,x,L,F_L,F_R));
        arr2 = xx2.map((x)=>N_MoreThan_XH(mu,Theta,w,x,L,F_L,F_R));
        var N = arr1.concat(arr2).map((e)=>e/1000),
        x_N = xx.map((key,value)=>[key,N[value]]);
        series_N_H.push({name:(iii+1).toString()+"次升温轴力",type:"line",showSymbol:false,data:x_N});
        // console.log(N);
        keypointNs.M.push(N_LessThan_XH(mu,Theta,w,L/2,L,F_L,F_R));
        keypointNs.Heat.push(N_LessThan_XH(mu,Theta,w,X_H,L,F_L,F_R));
        keypointNs.Cool.push(N_MoreThan_XH(mu,Theta,w,X_C,L,F_L,F_R));
        keypointNs.Left.push(N_LessThan_XH(mu,Theta,w,0,L,F_L,F_R));
        keypointNs.Right.push(N_MoreThan_XH(mu,Theta,w,L,L,F_L,F_R));

        //应变 strain=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>Alpha*Delta_T+F_L/E/A-(mu*Math.cos(Theta)+Math.sin(Theta))*WW*x/E/A/L);
        arr2 = xx2.map((x)=>Alpha*Delta_T+F_R/E/A-(mu*Math.cos(Theta)-Math.sin(Theta))*WW*(L-x)/E/A/L);
        var strain = arr1.concat(arr2),
        x_strain = xx.map((key,value)=>[key,strain[value]]);
        series_strain_H.push({name:(iii+1).toString()+"次升温应变",type:"line",showSymbol:false,data:x_strain});
        // console.log(strain);
        
        //位移 disp=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>heat_LessThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,x,heat_cool_H));
        arr2 = xx2.map((x)=>heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,x,heat_cool_H));
        var disp = arr1.concat(arr2),
        x_disp = xx.map((key,value)=>[key,disp[value]]);
        series_disp_H.push({name:(iii+1).toString()+"次升温位移",type:"line",showSymbol:false,data:x_disp});
        //
        heat_M=heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,L/2,heat_cool_H);
        heat_cool_C=heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,X_C,heat_cool_H);
        heat_cool_H=heat_LessThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,X_H,heat_cool_H);
        heat_cool_Left =heat_LessThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,0,heat_cool_H);
        heat_cool_Right=heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,L,heat_cool_H);
        disp_C.push(heat_cool_C);
        disp_H.push(heat_cool_H);
        disp_Left.push(heat_cool_Left);
        disp_Right.push(heat_cool_Right);
        ///################ Cool ######################
        Delta_T=0;
        xx1=linspace(0,X_C,nSegments);
        xx2=linspace(X_C,L,nSegments);
        xx=xx1.concat(xx2);
        
        //摩阻力 ResistanceSoil=zeros(1,xx1.length+xx2.length),
        arr1 = new Array(xx1.length).fill(-mu*w*Math.cos(Theta));
        arr2 = new Array(xx2.length).fill(mu*w*Math.cos(Theta));
        ResistanceSoil= arr1.concat(arr2);
        x_ResistanceSoil = xx.map((key,value)=>[key,ResistanceSoil[value]]);
        series_ResistanceSoil_C.push({name:(iii+1).toString()+"次降温土阻力",type:"line",showSymbol:false,data:x_ResistanceSoil});
        
        //轴力 N=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>(mu*Math.cos(Theta)+Math.sin(Theta))*w*x+F_L);
        arr2 = xx2.map((x)=>(mu*Math.cos(Theta)-Math.sin(Theta))*w*(L-x)+F_R);
        var N = arr1.concat(arr2).map((e)=>e/1000),
        x_N = xx.map((key,value)=>[key,N[value]]);
        series_N_C.push({name:(iii+1).toString()+"次降温轴力",type:"line",showSymbol:false,data:x_N});
        // console.log(N);

        //应变 strain=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>Alpha*Delta_T+F_L/E/A-(mu*Math.cos(Theta)-Math.sin(Theta))*WW*x/E/A/L);
        arr2 = xx2.map((x)=>Alpha*Delta_T+F_R/E/A-(mu*Math.cos(Theta)+Math.sin(Theta))*WW*(L-x)/E/A/L);
        var strain = arr1.concat(arr2),
        x_strain = xx.map((key,value)=>[key,strain[value]]);
        series_strain_C.push({name:(iii+1).toString()+"次降温应变",type:"line",showSymbol:false,data:x_strain});
        // console.log(strain);

        //位移 disp=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,x,heat_cool_C));
        arr2 = xx2.map((x)=>cool_MoreThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,x,heat_cool_C));
        var disp = arr1.concat(arr2),
        x_disp = xx.map((key,value)=>[key,disp[value]]);
        series_disp_C.push({name:(iii+1).toString()+"次降温位移",type:"line",showSymbol:false,data:x_disp});

        //
        cool_M=cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,L/2,heat_cool_C);
        heat_cool_C=cool_MoreThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,X_C,heat_cool_C);
        heat_cool_H=cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,X_H,heat_cool_C);
        heat_cool_Left =cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,0,heat_cool_C);
        heat_cool_Right=cool_MoreThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,L,heat_cool_C);
        disp_C.push(heat_cool_C);
        disp_H.push(heat_cool_H);
        disp_Left.push(heat_cool_Left);
        disp_Right.push(heat_cool_Right);
        disp_Mid.push(heat_M,cool_M);
    }
    // var myChart = echarts.init(document.getElementById('echart_disp'));
    EchartOptionList['resistancesoil']= Echart_Option("echart_disp","管道土阻力","x(m)","土阻力(N/m)",series_ResistanceSoil_H.concat(series_ResistanceSoil_C));
    EchartOptionList['N']=Echart_Option("echart_disp","管道轴力","x(m)","轴力(kN)",series_N_H.concat(series_N_C));
    EchartOptionList['strain']= Echart_Option("echart_disp","管道应变","x(m)","应变",series_strain_H.concat(series_strain_C));
    EchartOptionList['disp']= Echart_Option("echart_disp","管道位移","x(m)","位移(m)",series_disp_H.concat(series_disp_C));
    // myChart.setOption(echartoption);ECharts.push(myChart);

    // var n_heat_M = range(1,Cycle).map((key,value)=>[key,heat_M[value]]);
    // var n_cool_M = range(Cycle+1,Cycle*2).map((key,value)=>[key,cool_M[value]]);
    // echartoption = Echart_Option("Echart_walking","中点位移","x(m)","位移(m)",{name:"中点位移",type:"line",showSymbol:false,data:n_heat_M.concat(n_cool_M)});
    var Cycles = linspace(0,Cycle,Cycle*2+1);
    var n_disp_Left =  Cycles.map((key,value)=>[key,disp_Left[value]]);
    var n_disp_Right =  Cycles.map((key,value)=>[key,disp_Right[value]]);
    var n_disp_Mid =  Cycles.map((key,value)=>[key,disp_Mid[value]]);
    var n_disp_H =  Cycles.map((key,value)=>[key,disp_H[value]]);
    var n_disp_C =  Cycles.map((key,value)=>[key,disp_C[value]]);
    var series_disp = [
        {name:"左端位移",type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_disp_Left},
        {name:"H点位移",type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_disp_H},
        {name:"中点位移",type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_disp_Mid},
        {name:"C点位移",type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_disp_C},
        {name:"右端位移",type:"line",showSymbol:true,emphasis:{focus:'series'},data:n_disp_Right}
    ]
    echartoption = Echart_Option("echart_walking","各点位移","循环数","位移(m)",series_disp);
    // myChart.setOption(echartoption);ECharts.push(myChart);
    EchartOptionList['keypointdisp']=echartoption;
    $("select#echart").change();
    console.log(11111111111111);
};

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
