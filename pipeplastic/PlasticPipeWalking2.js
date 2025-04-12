function calculateAllPhases() {
    for (let cycle = 1; cycle <= 5; cycle++) {
        console.log(`开始第 ${cycle} 次循环`);
        calculateFirstPhase(cycle);
    }
}

function calculateFirstPhase(cycle) {
    // get input data
    let inputList = $("div.card-input input[type=number]");
    let InputData = [];
    inputList.each((index, item) => {
        InputData[$(item).attr("id")] = Number($(item).val());
        // eval( "var "+ item.id +"= " + item.value +";" );
    });

    const theta = InputData['theta'] * (Math.PI / 180),
        mu = InputData['mu'],
        delta_e = InputData['delta_e'],
        alpha = InputData['alpha'] * 1e-5,
        T = InputData['T'],
        T_c = InputData['T_c'],
        w = InputData['w'],
        L = InputData['L'],
        E = InputData['E'] * 1e9,
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
            console.log(`第 ${cycle} 次循环收敛于第 ${iter} 次迭代`);
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

        console.log(`第 ${cycle} 次循环第 ${iter} 次迭代: c1 = ${r[0]}, c2 = ${r[1]}, x_Ho = ${r[2]}, x_Hi = ${r[3]}`);
    }

    if (!converged) {
        const resultDiv = document.getElementById('first-phase-result');
        resultDiv.innerHTML = `
            <h2 style="color: red">第 ${cycle} 次循环计算未收敛</h2>
            <pre>经过 ${max_iter} 次迭代仍未达到收敛条件\n请尝试:
            1. 增加最大迭代次数
            2. 调整初始猜测值
            3. 检查输入参数合理性
            </pre> `;
        firstPhaseConverged = false;
        const secondPhaseResultDiv = document.getElementById('second-phase-result');
        secondPhaseResultDiv.innerHTML = `
                <h2 style="color: red">第 ${cycle} 次循环警告</h2>
                <pre>第一阶段计算结果未收敛，无法进行第二阶段计算！</pre>`;
        return;
    }

    firstPhaseConverged = true;

    console.log(`第 ${cycle} 次循环最终解:`);
    console.log(`c1 = ${r[0]}`);
    console.log(`c2 = ${r[1]}`);
    console.log(`x_Ho = ${r[2]}`);
    console.log(`x_Hi = ${r[3]}`);

    const u_H1 = -omega_plus * (x1 ** 2 - r[2] ** 2) / (2 * L) + (alpha * T - omega_plus / 2 + ft) * (x1 - r[2]) - delta_e;
    const u_H2 = omega_minus * (x2 ** 2 - r[3] ** 2) / (2 * L) + (alpha * T - omega_minus / 2 + fb) * (x2 - r[3]) + delta_e;
    const u_H3 = omega_minus * (x3 ** 2 - r[3] ** 2) / (2 * L) + (alpha * T - omega_minus / 2 + fb) * (x3 - r[3]) + delta_e;

    console.log(`第 ${cycle} 次循环 u_H1 = ${u_H1}`);
    console.log(`第 ${cycle} 次循环 u_H2 = ${u_H2}`);
    console.log(`第 ${cycle} 次循环 u_H3 = ${u_H3}`);

    const resultDiv = document.getElementById('first-phase-result');
    resultDiv.innerHTML += `
        <h2>第 ${cycle} 次循环第一阶段计算结果(单位: m)</h2>
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


    const firstPhaseResults = {
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

    calculateSecondPhase(cycle, firstPhaseResults);
}


function calculateSecondPhase(cycle, inputs) {
    if (!inputs || !firstPhaseConverged) {
        const secondPhaseResultDiv = document.getElementById('second-phase-result');
        secondPhaseResultDiv.innerHTML += `
            <h2 style="color: red">第 ${cycle} 次循环警告</h2>
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

    console.log(`第 ${cycle} 次循环冷却和解的计算结果:`);
    console.log(`x_Co = ${x_Co}`);
    console.log(`x_Ci = ${x_Ci}`);
    console.log(`c3 = ${c3}`);
    console.log(`c4 = ${c4}`);
    console.log(`u_C1 = ${u_C1}`);
    console.log(`u_C2 = ${u_C2}`);
    console.log(`u_C3 = ${u_C3}`);
    console.log(`x_HHo = ${x_HHo}`);
    console.log(`x_HHi = ${x_HHi}`);

    const secondPhaseResultDiv = document.getElementById('second-phase-result');
    secondPhaseResultDiv.innerHTML += `
        <h2>第 ${cycle} 次循环第二阶段计算结果(单位: m)</h2>
        <pre>
        冷却和解的计算结果:
        x_Co = ${x_Co.toFixed(8)}
        x_Ci = ${x_Ci.toFixed(8)}
        c3 = ${c3.toFixed(8)}
        c4 = ${c4.toFixed(8)}
        u_C1 = ${u_C1.toFixed(8)}
        u_C2 = ${u_C2.toFixed(8)}
        u_C3 = ${u_C3.toFixed(8)}
        x_HHo = ${x_HHo.toFixed(8)}
        x_HHi = ${x_HHi.toFixed(8)}
        </pre> `;
}

// 调用函数开始计算
calculateAllPhases();