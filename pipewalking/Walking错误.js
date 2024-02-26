
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
function ResistanceSoil(nSegments,mu,w,Theta){
    var arr1 = new Array(nSegments).fill(-mu*w*Math.cos(Theta)),
    arr2 = new Array(nSegments).fill(mu*w*Math.cos(Theta)),
    ResistanceSoil= arr1.concat(arr2);
    return ResistanceSoil;
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
    Theta = InputData["Theta"]*math.pi/180,
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
    NNN=5,
    //定义几个点的位移
    heat_cool_Left=0,//coordnate 0
    heat_cool_H=0,// x_H
    heat_M=new Array(NNN).fill(0),//zeros(1,NNN),// L/2
    cool_M=new Array(NNN).fill(0),//zeros(1,NNN),
    heat_cool_C=0,// x_C
    heat_cool_Right=0;// L
    var series_ResistanceSoil=series_N=series_strain=series_disp=[];
    var nSegments=100;
    for (let iii = 0; iii <NNN; iii++) {
        //############### Heat ################
        var
        Delta_T=Delta_T_from_pressure+(T_End-T_Inital),
        xx=linspace2(0,X_H,L,nSegments),
        //土阻力 ResistanceSoil=zeros(1,xx1.length+xx2.length),
        resistanceSoil=ResistanceSoil(nSegments,mu,w,Theta),
        // var ResistanceSoil=[...arr1,...arr2];
        // ResistanceSoil.push(...arr1,...arr2);
        x_ResistanceSoil = xx.map((key,value)=>[key,resistanceSoil[value]]);
        series_ResistanceSoil.push({name:(iii+1).toString()+"次升温土阻力",type:"line",data:x_ResistanceSoil});
        // var bb=linspace(1,5,200);
        // console.log(ResistanceSoil);
        //轴力 N=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>-(mu*Math.cos(Theta)+Math.sin(Theta))*w*x+F_L);
        arr2 = xx2.map((x)=>(mu*Math.cos(Theta)-Math.sin(Theta))*w*(x-L)+F_R);
        var N = arr1.concat(arr2),
        x_N = xx.map((key,value)=>[key,N[value]]);
        series_N.push({name:(iii+1).toString()+"次升温轴力",type:"line",data:x_N});
        // console.log(N);
        //应变 strain=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>Alpha*Delta_T+F_L/E/A-(mu*Math.cos(Theta)+Math.sin(Theta))*WW*x/E/A/L);
        arr2 = xx2.map((x)=>Alpha*Delta_T+F_R/E/A-(mu*Math.cos(Theta)-Math.sin(Theta))*WW*(L-x)/E/A/L);
        var strain = arr1.concat(arr2),
        x_strain = xx.map((key,value)=>[key,strain[value]]);
        series_strain.push({name:(iii+1).toString()+"次升温应变",type:"line",data:x_strain});
        // console.log(strain);
        //位移 disp=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>heat_LessThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,x,heat_cool_H));
        arr2 = xx2.map((x)=>heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,x,heat_cool_H));
        var disp = arr1.concat(arr2),
        x_disp = xx.map((key,value)=>[key,disp[value]]);
        series_disp.push({name:(iii+1).toString()+"次升温位移",type:"line",data:x_disp});

        heat_M[iii]=heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,L/2,heat_cool_H);
        heat_cool_C=heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,X_C,heat_cool_H);
        heat_cool_H=heat_MoreThan_XH(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,X_H,heat_cool_H);
        ///################ Cool ######################
        Delta_T=0;
        xx1=linspace(0,X_C,100);
        xx2=linspace(X_C,L,100);
        xx=xx1.concat(xx2);
        //摩阻力 ResistanceSoil=zeros(1,xx1.length+xx2.length),
        arr1 = new Array(xx1.length).fill(-mu*w*Math.cos(Theta));
        arr2 = new Array(xx2.length).fill(mu*w*Math.cos(Theta));
        ResistanceSoil= arr1.concat(arr2);
        //轴力 N=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>(mu*Math.cos(Theta)+Math.sin(Theta))*w*x+F_L);
        arr2 = xx2.map((x)=>(mu*Math.cos(Theta)-Math.sin(Theta))*w*(L-x)+F_R);
        var N = arr1.concat(arr2);
        // console.log(N);
        //应变 strain=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>Alpha*Delta_T+F_L/E/A-(mu*Math.cos(Theta)-Math.sin(Theta))*WW*x/E/A/L);
        arr2 = xx2.map((x)=>Alpha*Delta_T+F_R/E/A-(mu*Math.cos(Theta)+Math.sin(Theta))*WW*(L-x)/E/A/L);
        var strain = arr1.concat(arr2);
        // console.log(strain);
        //位移 disp=zeros(1,xx1.length+xx2.length)
        arr1 = xx1.map((x)=>cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,x,heat_cool_C));
        arr2 = xx2.map((x)=>cool_MoreThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,x,heat_cool_C));
        var disp = arr1.concat(arr2);
        //
        cool_M[iii]=cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,L/2,heat_cool_C);
        heat_cool_C=cool_MoreThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_R,Eta,X_C,heat_cool_C);
        heat_cool_H=cool_LessThan_XC(mu,Theta,WW,E,A,L,Alpha,Delta_T,F_L,Eta,X_H,heat_cool_C);
        console.log(11111111111111);
    }
}