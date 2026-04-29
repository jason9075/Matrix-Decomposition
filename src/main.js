const LANGUAGE_STORAGE_KEY = "matrix-lab-language";

const MODES = {
  svd: {
    label: { en: "SVD", zhTW: "SVD" },
    short: { en: "stretch along principal axes", zhTW: "沿主軸方向拉伸" },
    note: {
      en: "Projection and deformation: the sphere becomes an ellipsoid aligned to singular vectors.",
      zhTW: "投影與形變：球體會沿著奇異向量方向被拉成橢球。",
    },
    matrixNote: {
      en: "Use the sample matrix to see non-uniform scaling. The third singular value will collapse in the degenerate scenario.",
      zhTW: "用這個範例觀察非等向縮放。退化情境下第三個奇異值會塌成接近 0。",
    },
    preset: [
      [2.1, 0.4, 0.1],
      [0.5, 1.8, -0.2],
      [0.2, -0.1, 0.5],
    ],
  },
  rq: {
    label: { en: "RQ", zhTW: "RQ" },
    short: { en: "camera intrinsics times rotation", zhTW: "相機內參乘上旋轉" },
    note: {
      en: "Camera disassembly: the upper triangular factor models intrinsics, while the orthogonal factor carries orientation.",
      zhTW: "相機拆解：上三角因子對應內參，正交因子對應姿態方向。",
    },
    matrixNote: {
      en: "Adjust the top-right values to shift the principal point. The frustum intuition comes from the triangular intrinsic matrix.",
      zhTW: "調整右上角數值可觀察主點偏移。視錐體直覺來自三角形內參矩陣。",
    },
    preset: [
      [471.731, 89.891, 249.612],
      [-125.289, 467.507, 223.458],
      [-0.259, 0.0, 0.966],
    ],
  },
  cholesky: {
    label: { en: "Cholesky", zhTW: "Cholesky" },
    short: { en: "covariance square root", zhTW: "共變異數平方根" },
    note: {
      en: "Covariance decomposition: a symmetric positive definite matrix is factored into a lower triangular basis builder.",
      zhTW: "共變異數分解：對稱正定矩陣可拆成建立基底的下三角因子。",
    },
    matrixNote: {
      en: "This preset is symmetric positive definite. Cholesky is only valid when all leading pivots stay positive.",
      zhTW: "這個 preset 是對稱正定矩陣。Cholesky 只在所有主子式維持正值時有效。",
    },
    preset: [
      [4, 6, 10],
      [6, 25, 19],
      [10, 19, 62],
    ],
  },
  eigen: {
    label: { en: "Eigen", zhTW: "Eigen" },
    short: { en: "principal directions of a symmetric form", zhTW: "對稱形式的主方向" },
    note: {
      en: "Principal component style readout: orthogonal eigenvectors define stable directions and eigenvalues measure response on each axis.",
      zhTW: "主成分風格讀法：正交特徵向量定義穩定方向，特徵值表示各軸反應強度。",
    },
    matrixNote: {
      en: "The preset is symmetric, so the eigenbasis is orthogonal and the Jacobi iteration converges cleanly.",
      zhTW: "這個 preset 是對稱矩陣，所以特徵基底正交，Jacobi 迭代也較穩定。",
    },
    preset: [
      [2, 1, 0],
      [1, 2, 1],
      [0, 1, 2],
    ],
  },
  polar: {
    label: { en: "Polar", zhTW: "Polar" },
    short: { en: "nearest rotation times symmetric stretch", zhTW: "最接近的旋轉乘上對稱伸縮" },
    note: {
      en: "Pose repair: extract the closest orthogonal rotation from a nearly rotational matrix and isolate the residual stretch.",
      zhTW: "姿態修復：從接近旋轉的矩陣中抽出最接近的正交旋轉，分離殘餘伸縮。",
    },
    matrixNote: {
      en: "Use perturb rotation to spoil orthogonality, then recover the clean rotation with polar decomposition.",
      zhTW: "先用 perturb rotation 破壞正交性，再用 polar decomposition 恢復乾淨旋轉。",
    },
    preset: [
      [0.95, 0.31, 0.05],
      [-0.29, 0.94, -0.12],
      [0.08, 0.11, 0.98],
    ],
  },
};

const modeKeys = Object.keys(MODES);

const state = {
  mode: "svd",
  matrix: cloneMatrix(MODES.svd.preset),
  slidersEnabled: true,
  isAnimating: true,
  language: getStoredLanguage(),
  factors: [],
  pipelineAnimated: false,
  lastError: "",
};

const elements = {
  modeGrid: document.getElementById("mode-grid"),
  matrixGrid: document.getElementById("matrix-grid"),
  sliderGrid: document.getElementById("slider-grid"),
  modeSummary: document.getElementById("mode-summary"),
  matrixNote: document.getElementById("matrix-note"),
  statusCopy: document.getElementById("status-copy"),
  factorStrip: document.getElementById("factor-strip"),
  geometryCopy: document.getElementById("geometry-copy"),
  numericalCopy: document.getElementById("numerical-copy"),
  factorizationFocusCopy: document.getElementById("factorization-focus-copy"),
  knowledgeFocusCopy: document.getElementById("knowledge-focus-copy"),
  heroEquation: document.getElementById("hero-equation"),
  heroEquationNote: document.getElementById("hero-equation-note"),
  heroFormulaLabel: document.getElementById("hero-formula-label"),
  heroMatricesLabel: document.getElementById("hero-matrices-label"),
  heroMatrixGrid: document.getElementById("hero-matrix-grid"),
  metricMode: document.getElementById("metric-mode"),
  metricDet: document.getElementById("metric-det"),
  metricRank: document.getElementById("metric-rank"),
  openMathButton: document.getElementById("open-math"),
  closeMathButton: document.getElementById("close-math"),
  languageToggle: document.getElementById("language-toggle"),
  mathModal: document.getElementById("math-modal"),
  mathContent: document.getElementById("math-content"),
  fillPresetButton: document.getElementById("fill-preset"),
  decomposeButton: document.getElementById("decompose"),
  animateSplitButton: document.getElementById("animate-split"),
  makeDegenerateButton: document.getElementById("make-degenerate"),
  perturbRotationButton: document.getElementById("perturb-rotation"),
  randomizeButton: document.getElementById("randomize"),
  toggleSlidersButton: document.getElementById("toggle-sliders"),
};

const modalCopy = {
  en: () => {
    const mode = getModeText(state.mode, "label");
    return `
      <p>This playground treats a 3x3 matrix as a linear map acting on vectors in $\\mathbb{R}^3$, but the page now focuses on factor interpretation rather than 3D rendering.</p>
      <p>In the active <strong>${mode}</strong> mode, the interface emphasizes a factorization whose pieces have geometric or engineering meaning. Orthogonal matrices rotate or reflect, diagonal matrices scale along axes, and triangular matrices encode ordered shear or calibration structure.</p>
      <p>The matrix columns still tell you how the standard basis is transformed:
      $$A = \\begin{bmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{bmatrix}, \\quad
      A e_i = \\text{column}_i(A).$$</p>
      <p>For example, singular-value decomposition writes
      $$A = U \\Sigma V^T,$$
      where $U$ and $V$ are orthogonal and $\\Sigma$ stores non-negative stretches. In polar decomposition,
      $$A = Q S,$$
      where $Q$ is the nearest orthogonal transform and $S$ is symmetric positive definite.</p>
      <pre><code class="language-js">const { U, S, VT } = svdDecomposition(A);
const rank = singularValues.filter((v) => v > 1e-5).length;
const nullSpaceLivesInV = VT[2];</code></pre>
      <p>Rank is estimated by counting singular values above a small tolerance, so the "Make Degenerate" control visibly crushes one dimension when the smallest singular value falls toward zero.</p>
      <h3>Knowledge</h3>
      <table>
        <thead>
          <tr>
            <th>Decomposition</th>
            <th>Form</th>
            <th>Matrix Type</th>
            <th>Vision / Robotics Use</th>
            <th>Engineering Intuition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SVD</td>
            <td>$U\\Sigma V^\\top$</td>
            <td>Any matrix</td>
            <td>DLT, fundamental matrix estimation, ICP / point-cloud alignment</td>
            <td>The most universal tool. Excellent for null-space extraction and numerically very stable, but also the most expensive.</td>
          </tr>
          <tr>
            <td>RQ</td>
            <td>$RQ$</td>
            <td>Square matrices</td>
            <td>Camera calibration, splitting projection matrices into $K$ and $R$</td>
            <td>Vision-specific. Upper-triangular factor on the left acts like intrinsics, orthogonal factor on the right acts like rotation.</td>
          </tr>
          <tr>
            <td>QR</td>
            <td>$QR$</td>
            <td>Any matrix</td>
            <td>Orthogonalization, least-squares solvers</td>
            <td>Standard numerical workhorse. Stable version of Gram-Schmidt, with $Q$ on the left.</td>
          </tr>
          <tr>
            <td>Cholesky</td>
            <td>$LL^\\top$</td>
            <td>Symmetric positive definite</td>
            <td>Bundle adjustment, Kalman filtering</td>
            <td>Speed king. Roughly twice as fast as generic LU in the right setting. If you see covariance matrices or $A^\\top A$, think Cholesky first.</td>
          </tr>
          <tr>
            <td>LU / PLU</td>
            <td>$LU$ or $PLU$</td>
            <td>Square matrices</td>
            <td>General linear systems $Ax=b$</td>
            <td>Matrix form of Gaussian elimination. In practice, pivoted $PLU$ is preferred for stability.</td>
          </tr>
          <tr>
            <td>Eigen</td>
            <td>$V\\Lambda V^{-1}$</td>
            <td>Square matrices</td>
            <td>PCA, structure tensor analysis</td>
            <td>Finds the matrix's main directions. For symmetric matrices, eigen-decomposition lines up closely with SVD.</td>
          </tr>
          <tr>
            <td>Polar</td>
            <td>$QS$</td>
            <td>Square matrices</td>
            <td>Rotation repair, deformation analysis</td>
            <td>Separates a transform into pure rotation and pure stretch. Useful when numerical drift corrupts a rotation matrix.</td>
          </tr>
        </tbody>
      </table>
      <p>The active ${mode} demo shows one slice of this landscape. The table above tells you when a decomposition is a modeling tool, when it is a solver, and when it is mostly a numerical stabilization device.</p>
    `;
  },
  zhTW: () => `
    <p>這個 playground 把一個 3x3 矩陣視為作用在 $\\mathbb{R}^3$ 向量上的線性映射，但頁面現在聚焦在分解的解讀，而不是 3D 視覺化。</p>
    <p>目前模式會強調某種具有幾何或工程意義的分解。正交矩陣代表旋轉或鏡射，對角矩陣代表沿座標軸縮放，三角矩陣則常用來表達有順序的剪切或相機內參。</p>
    <p>矩陣的三個 column 仍然對應標準基底被變換後的結果：
    $$A = \\begin{bmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{bmatrix}, \\quad
    A e_i = \\text{column}_i(A)。$$</p>
    <p>以 SVD 為例，
    $$A = U \\Sigma V^T,$$
    其中 $U, V$ 是正交矩陣，$\\Sigma$ 則記錄主軸方向上的伸縮量。Polar 分解則寫成
    $$A = Q S,$$
    其中 $Q$ 是最接近原矩陣的正交變換，$S$ 是對稱正定矩陣。</p>
    <pre><code class="language-js">const { U, S, VT } = svdDecomposition(A);
const rank = singularValues.filter((v) => v > 1e-5).length;
const nullSpaceLivesInV = VT[2];</code></pre>
    <p>Rank 的估計方式是計算奇異值中大於容差的個數，所以按下「Make Degenerate」之後，你會看到最小奇異值趨近 0，物體也會明顯被壓扁。</p>
    <h3>Knowledge</h3>
    <table>
      <thead>
        <tr>
          <th>分解名稱</th>
          <th>數學形式</th>
          <th>適用矩陣</th>
          <th>電腦視覺 / 機器人學應用</th>
          <th>特點與工程直覺</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>SVD</td>
          <td>$U\\Sigma V^\\top$</td>
          <td>任意矩陣</td>
          <td>DLT、基本矩陣 $F$ 計算、ICP 點雲對齊</td>
          <td>最萬能。找 null space 的神器，數值穩定性最好，但計算代價也最高。</td>
        </tr>
        <tr>
          <td>RQ</td>
          <td>$RQ$</td>
          <td>任意方陣</td>
          <td>相機標定，從投影矩陣拆出 $K$ 與 $R$</td>
          <td>視覺專用。左邊上三角因子像內參，右邊正交因子像旋轉。</td>
        </tr>
        <tr>
          <td>QR</td>
          <td>$QR$</td>
          <td>任意矩陣</td>
          <td>正交化過程、最小平方法</td>
          <td>標準工具。可把它看成 Gram-Schmidt 的數值穩定版本，$Q$ 在左。</td>
        </tr>
        <tr>
          <td>Cholesky</td>
          <td>$LL^\\top$</td>
          <td>對稱正定矩陣</td>
          <td>Bundle Adjustment、卡爾曼濾波</td>
          <td>速度之王。比一般 LU 更快；看到共變異數矩陣或 $A^\\top A$ 時通常優先想到它。</td>
        </tr>
        <tr>
          <td>LU / PLU</td>
          <td>$LU$ 或 $PLU$</td>
          <td>方陣</td>
          <td>求解一般線性方程組 $Ax=b$</td>
          <td>高斯消去法的矩陣版本。實務上通常加入 pivoting，使用較穩定的 $PLU$。</td>
        </tr>
        <tr>
          <td>Eigen</td>
          <td>$V\\Lambda V^{-1}$</td>
          <td>方陣</td>
          <td>PCA、Structure Tensor</td>
          <td>找矩陣的主方向。若矩陣對稱，特徵分解和 SVD 的幾何意義會非常接近。</td>
        </tr>
        <tr>
          <td>Polar</td>
          <td>$QS$</td>
          <td>方陣</td>
          <td>矩陣正交化修復、形變分析</td>
          <td>把任意轉換拆成純旋轉與純縮放。常用來修復數值誤差導致走樣的旋轉矩陣。</td>
        </tr>
      </tbody>
    </table>
    <p>目前頁面只把其中幾種分解做成互動視覺化，但這張表可以幫使用者快速判斷某個分解到底是拿來建模、拿來求解，還是拿來做數值穩定化。</p>
  `,
};

const I18N = {
  en: {
    htmlLang: "en",
    heroEyebrow: "gfx-lab / 3x3 factorization workbench",
    heroTitle: "Matrix Decomposition Playground",
    heroCopy: "Switch decomposition modes, edit the matrix by cell or slider, trigger factorization, and compare each split through its matrix form, use case, and engineering intuition.",
    metricModeLabel: "Active Mode",
    metricDetLabel: "Determinant",
    metricRankLabel: "Estimated Rank",
    heroFormulaLabel: "Current Decomposition",
    heroMatricesLabel: "Observed Matrix And Factors",
    modesTitle: "Modes",
    modesSubtitle: "Preset-driven 3x3 examples",
    matrixControllerTitle: "Matrix Controller",
    matrixControllerSubtitle: "Type or slide values",
    loadPreset: "Load Preset",
    decompose: "Decompose",
    animateSplit: "Animate Split",
    makeDegenerate: "Make Degenerate",
    perturbRotation: "Perturb Rotation",
    randomize: "Randomize",
    sliderModeTitle: "Slider Mode",
    enabled: "Enabled",
    hidden: "Hidden",
    modeSummaryTitle: "Mode Summary",
    pipelineStatusTitle: "Pipeline Status",
    stageCopy: "",
    geometricReadoutTitle: "Engineering Readout",
    numericalReadoutTitle: "Numerical Readout",
    factorizationFocusTitle: "Factorization Focus",
    knowledgeFocusTitle: "Knowledge Focus",
    mathTitle: "Math Behind the Scene",
    close: "Close",
    invalidInput: "Invalid Input",
    statusTag: "Status",
    mathButtonAria: "Explain the math",
  },
  zhTW: {
    htmlLang: "zh-Hant",
    heroEyebrow: "gfx-lab / 3x3 分解工作台",
    heroTitle: "矩陣分解互動實驗室",
    heroCopy: "切換分解模式、用輸入框或 slider 編輯矩陣、觸發分解，並從矩陣形式、使用場合與工程直覺比較每一種拆解。",
    metricModeLabel: "目前模式",
    metricDetLabel: "行列式",
    metricRankLabel: "估計秩",
    heroFormulaLabel: "目前分解公式",
    heroMatricesLabel: "觀測矩陣與因子",
    modesTitle: "模式",
    modesSubtitle: "以 preset 驅動的 3x3 範例",
    matrixControllerTitle: "矩陣控制區",
    matrixControllerSubtitle: "可直接輸入或滑動調整",
    loadPreset: "載入範例",
    decompose: "進行分解",
    animateSplit: "播放拆解動畫",
    makeDegenerate: "製造退化",
    perturbRotation: "擾動旋轉",
    randomize: "隨機矩陣",
    sliderModeTitle: "滑桿模式",
    enabled: "已啟用",
    hidden: "已隱藏",
    modeSummaryTitle: "模式摘要",
    pipelineStatusTitle: "分解狀態",
    stageCopy: "",
    geometricReadoutTitle: "工程讀取",
    numericalReadoutTitle: "數值讀取",
    factorizationFocusTitle: "分解重點",
    knowledgeFocusTitle: "知識重點",
    mathTitle: "畫面背後的數學",
    close: "關閉",
    invalidInput: "輸入不合法",
    statusTag: "狀態",
    mathButtonAria: "說明數學原理",
  },
};

function getStoredLanguage() {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "zhTW" ? "zhTW" : "en";
}

function t(key) {
  return I18N[state.language][key];
}

function getModeText(modeKey, field) {
  return MODES[modeKey][field][state.language];
}

function getEquationText() {
  if (state.mode === "svd") return "A = UΣV^T";
  if (state.mode === "rq") return "A = RQ";
  if (state.mode === "cholesky") return "A = LL^T";
  if (state.mode === "eigen") return "A = QΛQ^T";
  return "A = QS";
}

function getHeroEquationNote() {
  if (state.mode === "svd") {
    return state.language === "zhTW"
      ? "觀測矩陣 A 會被拆成左正交基底、對角伸縮，以及右正交基底。"
      : "The observed matrix A is split into a left orthogonal basis, diagonal scaling, and a right orthogonal basis.";
  }
  if (state.mode === "rq") {
    return state.language === "zhTW"
      ? "A 會拆成左側上三角內參樣式矩陣 R，以及右側正交旋轉 Q。"
      : "A is split into a left upper-triangular intrinsic-style matrix R and a right orthogonal rotation Q.";
  }
  if (state.mode === "cholesky") {
    return state.language === "zhTW"
      ? "A 是對稱正定矩陣時，可表示成下三角矩陣 L 與其轉置的乘積。"
      : "When A is symmetric positive definite, it can be written as a lower-triangular matrix L times its transpose.";
  }
  if (state.mode === "eigen") {
    return state.language === "zhTW"
      ? "對稱矩陣時，A 可在正交特徵基底下被對角化。"
      : "For symmetric matrices, A can be diagonalized in an orthogonal eigenbasis.";
  }
  return state.language === "zhTW"
    ? "Polar 分解把 A 拆成最接近的正交旋轉 Q，以及對稱伸縮 S。"
    : "Polar decomposition splits A into the nearest orthogonal rotation Q and a symmetric stretch S.";
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function identityMatrix() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

function transpose(matrix) {
  return matrix[0].map((_, j) => matrix.map((row) => row[j]));
}

function multiplyMatrices(a, b) {
  const result = Array.from({ length: 3 }, () => [0, 0, 0]);
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      let sum = 0;
      for (let k = 0; k < 3; k += 1) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map((row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
}

function determinant(matrix) {
  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function inverse(matrix) {
  const det = determinant(matrix);
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];
  const inv = [
    [(e * i - f * h), -(b * i - c * h), (b * f - c * e)],
    [-(d * i - f * g), (a * i - c * g), -(a * f - c * d)],
    [(d * h - e * g), -(a * h - b * g), (a * e - b * d)],
  ];
  return scaleMatrix(inv, 1 / det);
}

function scaleMatrix(matrix, scalar) {
  return matrix.map((row) => row.map((value) => value * scalar));
}

function addMatrices(a, b) {
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

function subtractMatrices(a, b) {
  return a.map((row, i) => row.map((value, j) => value - b[i][j]));
}

function vectorNorm(vector) {
  return Math.hypot(...vector);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(vector) {
  const len = vectorNorm(vector);
  if (len < 1e-10) {
    return [0, 0, 0];
  }
  return vector.map((value) => value / len);
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function matrixFromColumns(cols) {
  return [
    [cols[0][0], cols[1][0], cols[2][0]],
    [cols[0][1], cols[1][1], cols[2][1]],
    [cols[0][2], cols[1][2], cols[2][2]],
  ];
}

function column(matrix, index) {
  return [matrix[0][index], matrix[1][index], matrix[2][index]];
}

function qrDecomposition(matrix) {
  const a1 = column(matrix, 0);
  const a2 = column(matrix, 1);
  const a3 = column(matrix, 2);

  const q1 = normalize(a1);
  const proj21 = scaleVector(q1, dot(a2, q1));
  const u2 = subtractVectors(a2, proj21);
  const q2 = normalize(u2);
  const proj31 = scaleVector(q1, dot(a3, q1));
  const proj32 = scaleVector(q2, dot(a3, q2));
  const u3 = subtractVectors(subtractVectors(a3, proj31), proj32);
  const q3 = normalize(u3);

  let cols = [q1, q2, q3];
  if (vectorNorm(q3) < 1e-8) {
    cols = orthonormalizeColumns(matrix);
  }
  const Q = matrixFromColumns(cols);
  const R = multiplyMatrices(transpose(Q), matrix);
  return { Q, R };
}

function subtractVectors(a, b) {
  return a.map((value, index) => value - b[index]);
}

function scaleVector(vector, scalar) {
  return vector.map((value) => value * scalar);
}

function orthonormalizeColumns(matrix) {
  const c1 = normalize(column(matrix, 0));
  const tmp2 = subtractVectors(column(matrix, 1), scaleVector(c1, dot(column(matrix, 1), c1)));
  const c2 = normalize(vectorNorm(tmp2) < 1e-8 ? [0, 1, 0] : tmp2);
  let c3 = cross(c1, c2);
  if (vectorNorm(c3) < 1e-8) {
    c3 = [0, 0, 1];
  }
  c3 = normalize(c3);
  return [c1, c2, c3];
}

function reverseRows(matrix) {
  return [...matrix].reverse().map((row) => [...row]);
}

function reverseCols(matrix) {
  return matrix.map((row) => [...row].reverse());
}

function rqDecomposition(matrix) {
  const flipped = transpose(reverseRows(reverseCols(matrix)));
  const { Q: qTemp, R: rTemp } = qrDecomposition(flipped);
  let R = reverseRows(reverseCols(transpose(rTemp)));
  let Q = reverseRows(reverseCols(transpose(qTemp)));

  for (let i = 0; i < 3; i += 1) {
    if (R[i][i] < 0) {
      for (let j = 0; j < 3; j += 1) {
        R[i][j] *= -1;
        Q[j][i] *= -1;
      }
    }
  }

  return { R, Q };
}

function choleskyDecomposition(matrix) {
  const L = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j <= i; j += 1) {
      let sum = matrix[i][j];
      for (let k = 0; k < j; k += 1) {
        sum -= L[i][k] * L[j][k];
      }
      if (i === j) {
        if (sum <= 1e-10) {
          throw new Error("Matrix is not positive definite.");
        }
        L[i][j] = Math.sqrt(sum);
      } else {
        L[i][j] = sum / L[j][j];
      }
    }
  }
  return L;
}

function jacobiEigenDecomposition(matrix) {
  let A = cloneMatrix(matrix);
  let V = identityMatrix();

  for (let iter = 0; iter < 18; iter += 1) {
    let p = 0;
    let q = 1;
    let maxValue = Math.abs(A[0][1]);
    const pairs = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    pairs.forEach(([i, j]) => {
      const value = Math.abs(A[i][j]);
      if (value > maxValue) {
        maxValue = value;
        p = i;
        q = j;
      }
    });

    if (maxValue < 1e-10) {
      break;
    }

    const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
    const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;

    const J = identityMatrix();
    J[p][p] = c;
    J[q][q] = c;
    J[p][q] = s;
    J[q][p] = -s;

    A = multiplyMatrices(transpose(J), multiplyMatrices(A, J));
    V = multiplyMatrices(V, J);
  }

  const eigenpairs = [0, 1, 2].map((index) => ({
    value: A[index][index],
    vector: normalize(column(V, index)),
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const Q = matrixFromColumns(eigenpairs.map((pair) => pair.vector));
  const D = [
    [eigenpairs[0].value, 0, 0],
    [0, eigenpairs[1].value, 0],
    [0, 0, eigenpairs[2].value],
  ];
  return { Q, D, eigenvalues: eigenpairs.map((pair) => pair.value) };
}

function svdDecomposition(matrix) {
  const ata = multiplyMatrices(transpose(matrix), matrix);
  const { Q: V, D } = jacobiEigenDecomposition(ata);
  const singularValues = [0, 1, 2].map((i) => Math.sqrt(Math.max(D[i][i], 0)));

  const uColumns = [0, 1, 2].map((i) => {
    const v = column(V, i);
    const Av = multiplyMatrixVector(matrix, v);
    if (singularValues[i] < 1e-8) {
      return null;
    }
    return normalize(scaleVector(Av, 1 / singularValues[i]));
  });

  if (!uColumns[0]) {
    uColumns[0] = [1, 0, 0];
  }
  if (!uColumns[1]) {
    const candidate = subtractVectors([0, 1, 0], scaleVector(uColumns[0], dot([0, 1, 0], uColumns[0])));
    uColumns[1] = normalize(vectorNorm(candidate) < 1e-8 ? [0, 0, 1] : candidate);
  }
  uColumns[2] = normalize(cross(uColumns[0], uColumns[1]));

  const U = matrixFromColumns(uColumns);
  const S = [
    [singularValues[0], 0, 0],
    [0, singularValues[1], 0],
    [0, 0, singularValues[2]],
  ];
  return { U, S, VT: transpose(V), singularValues };
}

function polarDecomposition(matrix) {
  let Q = cloneMatrix(matrix);
  for (let iter = 0; iter < 10; iter += 1) {
    const invT = inverse(transpose(Q));
    if (!invT) {
      break;
    }
    Q = scaleMatrix(addMatrices(Q, invT), 0.5);
  }
  const S = multiplyMatrices(transpose(Q), matrix);
  return { Q, S };
}

function estimateRank(matrix) {
  const { singularValues } = svdDecomposition(matrix);
  return singularValues.filter((value) => value > 1e-5).length;
}

function formatNumber(value) {
  const rounded = Math.abs(value) < 1e-8 ? 0 : value;
  return Number(rounded).toFixed(Math.abs(rounded) >= 100 ? 2 : 3);
}

function buildMatrixMarkup(matrix) {
  return `
    <div class="matrix-view">
      ${matrix.map((row) => `
        <div class="matrix-row">
          ${row.map((value) => `<div class="matrix-cell">${formatNumber(value)}</div>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function buildHeroMatrixCard(title, matrix, kind = "symmetric") {
  return `
    <article class="hero-matrix-card">
      <div class="factor-tag ${kind}">${title}</div>
      ${buildMatrixMarkup(matrix)}
    </article>
  `;
}

function makeFactorsForMode() {
  const matrix = state.matrix;
  if (state.mode === "svd") {
    const { U, S, VT, singularValues } = svdDecomposition(matrix);
    return {
      factors: [
        { title: "U", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: U, desc: state.language === "zhTW" ? "左奇異向量定義輸出空間中的主方向。" : "Left singular vectors define output principal directions." },
        { title: "Sigma", tag: state.language === "zhTW" ? "對角" : "Diagonal", kind: "diagonal", matrix: S, desc: state.language === "zhTW" ? `奇異值 ${singularValues.map((value) => formatNumber(value)).join("、")} 描述各主軸的伸縮量。` : `Singular values ${singularValues.map((value) => formatNumber(value)).join(", ")} measure stretch.` },
        { title: "V^T", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: VT, desc: state.language === "zhTW" ? "右奇異向量會先把輸入基底旋到適合縮放的方向。" : "Right singular vectors rotate the input basis before scaling." },
      ],
      geometry: state.language === "zhTW"
        ? "立方體會先旋轉到右奇異基底，再沿正交主軸縮放，最後旋轉回輸出空間。"
        : "The transformed cube is first rotated into the right-singular basis, stretched along orthogonal axes, then rotated into output space.",
    };
  }
  if (state.mode === "rq") {
    const { R, Q } = rqDecomposition(matrix);
    return {
      factors: [
        { title: "R", tag: state.language === "zhTW" ? "上三角" : "Upper Tri", kind: "triangular", matrix: R, desc: state.language === "zhTW" ? "上三角因子可視為相機內參校正區塊。" : "The upper triangular factor behaves like a camera intrinsic calibration block." },
        { title: "Q", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: Q, desc: state.language === "zhTW" ? "正交因子承載相機姿態方向。" : "The orthogonal factor carries camera orientation." },
        { title: "A", tag: state.language === "zhTW" ? "觀測值" : "Observed", kind: "symmetric", matrix, desc: state.language === "zhTW" ? "原始矩陣同時混合了校正與姿態資訊。" : "The original matrix mixes calibration and orientation." },
      ],
      geometry: state.language === "zhTW"
        ? "先把暖色三角因子讀成校正尺度與偏移，再把藍色正交因子讀成純粹的座標重定向。"
        : "Read the warm triangular factor as calibration scales and offsets, then the blue orthogonal factor as a pure reorientation of the frame.",
    };
  }
  if (state.mode === "cholesky") {
    const L = choleskyDecomposition(matrix);
    return {
      factors: [
        { title: "L", tag: state.language === "zhTW" ? "下三角" : "Lower Tri", kind: "triangular", matrix: L, desc: state.language === "zhTW" ? "這個下三角映射建立了共變異數的平方根。" : "This lower triangular map builds the covariance square root." },
        { title: "L^T", tag: state.language === "zhTW" ? "上三角" : "Upper Tri", kind: "triangular", matrix: transpose(L), desc: state.language === "zhTW" ? "轉置項補完對稱重建。" : "The transpose completes the symmetric reconstruction." },
        { title: "A", tag: "SPD", kind: "symmetric", matrix, desc: state.language === "zhTW" ? "這是一個對稱正定的共變異數形式。" : "A symmetric positive definite covariance form." },
      ],
      geometry: state.language === "zhTW"
        ? "把單位球套用 L 之後，就能得到對應的共變異橢球與其方向。"
        : "The covariance ellipsoid can be generated by applying L to a unit sphere and then reading the resulting oriented shape.",
    };
  }
  if (state.mode === "eigen") {
    const { Q, D, eigenvalues } = jacobiEigenDecomposition(matrix);
    return {
      factors: [
        { title: "Q", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: Q, desc: state.language === "zhTW" ? "特徵向量形成這個對稱算子的主座標框架。" : "Eigenvectors form the principal frame for this symmetric operator." },
        { title: "Lambda", tag: state.language === "zhTW" ? "對角" : "Diagonal", kind: "diagonal", matrix: D, desc: state.language === "zhTW" ? `特徵值 ${eigenvalues.map((value) => formatNumber(value)).join("、")} 描述各特徵向量上的反應強度。` : `Eigenvalues ${eigenvalues.map((value) => formatNumber(value)).join(", ")} measure response on each eigenvector.` },
        { title: "Q^T", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: transpose(Q), desc: state.language === "zhTW" ? "轉置矩陣把標準基底映回特徵基底。" : "Transpose maps the standard basis back into the eigenbasis." },
      ],
      geometry: state.language === "zhTW"
        ? "在特徵基底裡，矩陣作用會沿座標軸對齊；各座標可先獨立縮放，再旋回原座標。"
        : "In the eigenbasis, the action is axis-aligned. Each coordinate scales independently before rotating back.",
    };
  }
  const { Q, S } = polarDecomposition(matrix);
  return {
    factors: [
      { title: "Q", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: Q, desc: state.language === "zhTW" ? "最接近的正交變換會修復已經歪掉的旋轉。" : "The nearest orthogonal transform repairs the broken rotation." },
      { title: "S", tag: state.language === "zhTW" ? "對稱" : "Symmetric", kind: "symmetric", matrix: S, desc: state.language === "zhTW" ? "殘餘的對稱伸縮記錄輸入矩陣偏離完美旋轉的程度。" : "Residual symmetric stretch records how far the input departs from a perfect rotation." },
      { title: "A", tag: state.language === "zhTW" ? "觀測值" : "Observed", kind: "triangular", matrix, desc: state.language === "zhTW" ? "原始矩陣同時包含旋轉與扭曲。" : "The original matrix contains both rotation and distortion." },
    ],
    geometry: state.language === "zhTW"
      ? "Polar 分解會把乾淨的藍色正交框架，從原本污染運動的暖色對稱扭曲中分離出來。"
      : "The polar split isolates a clean blue frame from the warm symmetric distortion that was contaminating the motion.",
  };
}

function updateFactorCards(animated = false) {
  try {
    const result = makeFactorsForMode();
    state.lastError = "";
    state.factors = result.factors;
    elements.factorStrip.innerHTML = result.factors.map((factor) => `
    <article class="factor-card ${animated ? "" : "visible"}">
      <div class="factor-tag ${factor.kind.toLowerCase()}">${factor.tag}</div>
      <h3>${factor.title}</h3>
      ${buildMatrixMarkup(factor.matrix)}
      <div class="factor-desc">${factor.desc}</div>
    </article>
  `).join("");

    if (animated) {
      requestAnimationFrame(() => {
        document.querySelectorAll(".factor-card").forEach((card, index) => {
          window.setTimeout(() => card.classList.add("visible"), 90 * index);
        });
      });
    }

    elements.geometryCopy.textContent = result.geometry;
  } catch (error) {
    state.lastError = error instanceof Error ? error.message : "Decomposition failed.";
    state.factors = [
      {
        title: t("invalidInput"),
        tag: t("statusTag"),
        kind: "symmetric",
        matrix: state.matrix,
        desc: state.lastError,
      },
    ];
    elements.factorStrip.innerHTML = `
      <article class="factor-card visible">
        <div class="factor-tag symmetric">${t("statusTag")}</div>
        <h3>${t("invalidInput")}</h3>
        ${buildMatrixMarkup(state.matrix)}
        <div class="factor-desc">${state.lastError}</div>
      </article>
    `;
    elements.geometryCopy.textContent = state.language === "zhTW"
      ? "這個模式需要更強的矩陣結構。請調整輸入，或重新載入 preset 以恢復合法分解。"
      : "This mode requires a matrix with stronger structure. Adjust the input or reload the preset to recover a valid factorization.";
  }
}

function updateMetrics() {
  elements.metricMode.textContent = getModeText(state.mode, "label");
  elements.metricDet.textContent = formatNumber(determinant(state.matrix));
  elements.metricRank.textContent = String(estimateRank(state.matrix));
}

function updateModeCopy() {
  const mode = MODES[state.mode];
  elements.modeSummary.textContent = mode.note[state.language];
  elements.matrixNote.textContent = mode.matrixNote[state.language];
}

function syncMatrixGrid() {
  const inputs = Array.from(elements.matrixGrid.querySelectorAll("input"));
  inputs.forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    input.value = String(Number(state.matrix[row][col].toFixed(3)));
  });
}

function syncSliders() {
  const sliders = Array.from(elements.sliderGrid.querySelectorAll("input[type='range']"));
  sliders.forEach((slider) => {
    const row = Number(slider.dataset.row);
    const col = Number(slider.dataset.col);
    slider.value = String(state.matrix[row][col]);
    const readout = slider.parentElement.querySelector("span:last-child");
    readout.textContent = formatNumber(state.matrix[row][col]);
  });
}

function syncSliderBounds() {
  const sliders = Array.from(elements.sliderGrid.querySelectorAll("input[type='range']"));
  const maxAbs = Math.max(
    3,
    ...state.matrix.flat().map((value) => Math.abs(value))
  );
  const bound = Math.ceil(maxAbs * 1.15);
  sliders.forEach((slider) => {
    slider.min = String(-bound);
    slider.max = String(bound);
    slider.step = bound > 20 ? "1" : "0.05";
  });
}

function updateStatusCopy() {
  const det = determinant(state.matrix);
  const rank = estimateRank(state.matrix);
  const invertibility = Math.abs(det) < 1e-5
    ? (state.language === "zhTW" ? "接近奇異" : "nearly singular")
    : (state.language === "zhTW" ? "可逆" : "invertible");
  const suffix = state.lastError
    ? (state.language === "zhTW" ? ` 目前模式警告：${state.lastError}` : ` Current mode warning: ${state.lastError}`)
    : (state.language === "zhTW" ? " 按下進行分解以重新整理因子卡片與說明區。" : " Press Decompose to refresh the factor cards and explanation panels.");
  elements.statusCopy.textContent = state.language === "zhTW"
    ? `目前矩陣${invertibility}；行列式 ${formatNumber(det)}，估計秩 ${rank}。${suffix}`
    : `The current matrix is ${invertibility}; determinant ${formatNumber(det)} and estimated rank ${rank}.${suffix}`;
}

function updateReadouts() {
  const singularValues = svdDecomposition(state.matrix).singularValues.map(formatNumber).join(", ");
  elements.numericalCopy.textContent = state.language === "zhTW"
    ? `這個矩陣的奇異值為 ${singularValues}。它們可以快速反映各主方向上的伸縮強度，也可用來估計 rank 與條件性。`
    : `The singular values are ${singularValues}. They give a fast read on directional scaling, rank, and numerical conditioning.`;
  elements.factorizationFocusCopy.textContent = state.language === "zhTW"
    ? `目前模式 ${getModeText(state.mode, "label")} 著重的是 ${MODES[state.mode].note[state.language]}`
    : `The active ${getModeText(state.mode, "label")} mode emphasizes this split: ${MODES[state.mode].note[state.language]}`;
  elements.knowledgeFocusCopy.textContent = state.language === "zhTW"
    ? "若你想知道某種分解何時該用，重點通常看三件事：矩陣型態是否符合、你是要解方程還是解釋幾何，以及數值穩定性是否比速度更重要。"
    : "When choosing a decomposition, the main questions are: does the matrix structure qualify, are you solving a system or explaining geometry, and is numerical stability more important than raw speed?";
}

function updateHeroBreakdown() {
  elements.heroEquation.textContent = getEquationText();
  elements.heroEquationNote.textContent = getHeroEquationNote();

  const cards = [buildHeroMatrixCard("A", state.matrix, "symmetric")];
  if (state.factors.length > 0) {
    state.factors.slice(0, 3).forEach((factor) => {
      cards.push(buildHeroMatrixCard(factor.title, factor.matrix, factor.kind.toLowerCase()));
    });
  }
  elements.heroMatrixGrid.innerHTML = cards.join("");
}

function renderModalContent() {
  elements.mathContent.innerHTML = modalCopy[state.language]();
  if (window.renderMathInElement) {
    window.renderMathInElement(elements.mathContent, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
    });
  }
  if (window.Prism) {
    window.Prism.highlightAllUnder(elements.mathContent);
  }
}

function setMode(modeKey) {
  state.mode = modeKey;
  state.matrix = cloneMatrix(MODES[modeKey].preset);
  renderModeButtons();
  syncMatrixGrid();
  syncSliderBounds();
  syncSliders();
  updateModeCopy();
  updateAll(false);
}

function applyStaticTranslations() {
  document.documentElement.lang = I18N[state.language].htmlLang;
  document.getElementById("hero-eyebrow").textContent = t("heroEyebrow");
  document.getElementById("hero-title").textContent = t("heroTitle");
  document.getElementById("hero-copy").textContent = t("heroCopy");
  document.getElementById("metric-mode-label").textContent = t("metricModeLabel");
  document.getElementById("metric-det-label").textContent = t("metricDetLabel");
  document.getElementById("metric-rank-label").textContent = t("metricRankLabel");
  elements.heroFormulaLabel.textContent = t("heroFormulaLabel");
  elements.heroMatricesLabel.textContent = t("heroMatricesLabel");
  document.getElementById("modes-title").textContent = t("modesTitle");
  document.getElementById("modes-subtitle").textContent = t("modesSubtitle");
  document.getElementById("matrix-controller-title").textContent = t("matrixControllerTitle");
  document.getElementById("matrix-controller-subtitle").textContent = t("matrixControllerSubtitle");
  document.getElementById("fill-preset").textContent = t("loadPreset");
  document.getElementById("decompose").textContent = t("decompose");
  document.getElementById("animate-split").textContent = t("animateSplit");
  document.getElementById("make-degenerate").textContent = t("makeDegenerate");
  document.getElementById("perturb-rotation").textContent = t("perturbRotation");
  document.getElementById("randomize").textContent = t("randomize");
  document.getElementById("slider-mode-title").textContent = t("sliderModeTitle");
  document.getElementById("mode-summary-title").textContent = t("modeSummaryTitle");
  document.getElementById("pipeline-status-title").textContent = t("pipelineStatusTitle");
  document.getElementById("stage-copy").textContent = t("stageCopy");
  document.getElementById("geometric-readout-title").textContent = t("geometricReadoutTitle");
  document.getElementById("numerical-readout-title").textContent = t("numericalReadoutTitle");
  document.getElementById("factorization-focus-title").textContent = t("factorizationFocusTitle");
  document.getElementById("knowledge-focus-title").textContent = t("knowledgeFocusTitle");
  document.getElementById("math-title").textContent = t("mathTitle");
  document.getElementById("close-math").textContent = t("close");
  elements.openMathButton.setAttribute("aria-label", t("mathButtonAria"));
  elements.toggleSlidersButton.textContent = state.slidersEnabled ? t("enabled") : t("hidden");
}

function updateAll(animated = false) {
  updateFactorCards(animated);
  updateMetrics();
  updateStatusCopy();
  updateReadouts();
  updateHeroBreakdown();
}

function renderModeButtons() {
  const buttons = Array.from(elements.modeGrid.querySelectorAll("button"));
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
    const strong = button.querySelector("strong");
    const span = button.querySelector("span");
    strong.textContent = getModeText(button.dataset.mode, "label");
    span.textContent = getModeText(button.dataset.mode, "short");
  });
}

function buildModeButtons() {
  elements.modeGrid.innerHTML = modeKeys.map((key) => `
    <button class="mode-chip ${key === state.mode ? "active" : ""}" type="button" data-mode="${key}">
      <strong>${getModeText(key, "label")}</strong>
      <span>${getModeText(key, "short")}</span>
    </button>
  `).join("");
  elements.modeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) {
      return;
    }
    setMode(button.dataset.mode);
  });
}

function buildMatrixInputs() {
  elements.matrixGrid.innerHTML = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) =>
      `<input type="number" step="0.1" data-row="${row}" data-col="${col}" aria-label="matrix ${row + 1} ${col + 1}" />`
    ).join("")
  ).join("");

  elements.matrixGrid.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const row = Number(event.target.dataset.row);
    const col = Number(event.target.dataset.col);
    const value = Number(event.target.value);
    state.matrix[row][col] = Number.isFinite(value) ? value : 0;
    syncSliderBounds();
    syncSliders();
    updateAll(false);
  });
}

function buildSliders() {
  elements.sliderGrid.innerHTML = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => `
      <label class="slider-row">
        <span>a${row + 1}${col + 1}</span>
        <input type="range" min="-3" max="3" step="0.05" data-row="${row}" data-col="${col}" />
        <span>0.000</span>
      </label>
    `).join("")
  ).join("");

  elements.sliderGrid.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const row = Number(event.target.dataset.row);
    const col = Number(event.target.dataset.col);
    const value = Number(event.target.value);
    state.matrix[row][col] = value;
    syncMatrixGrid();
    syncSliderBounds();
    syncSliders();
    updateAll(false);
  });
}

function randomizeCurrentMatrix() {
  state.matrix = state.matrix.map((row) =>
    row.map(() => Number((Math.random() * 2.4 - 1.2).toFixed(3)))
  );
  syncMatrixGrid();
  syncSliderBounds();
  syncSliders();
  updateAll(false);
}

function makeDegenerate() {
  state.matrix[2] = state.matrix[1].map((value) => Number((value * 0.5).toFixed(3)));
  syncMatrixGrid();
  syncSliderBounds();
  syncSliders();
  updateAll(true);
}

function perturbRotation() {
  state.matrix = cloneMatrix(MODES.polar.preset);
  state.matrix[0][2] += 0.12;
  state.matrix[2][0] -= 0.09;
  state.matrix[1][1] -= 0.07;
  syncMatrixGrid();
  syncSliderBounds();
  syncSliders();
  updateAll(true);
}

function bindUI() {
  elements.fillPresetButton.addEventListener("click", () => {
    state.matrix = cloneMatrix(MODES[state.mode].preset);
    syncMatrixGrid();
    syncSliderBounds();
    syncSliders();
    updateAll(false);
  });

  elements.decomposeButton.addEventListener("click", () => updateAll(true));
  elements.animateSplitButton.addEventListener("click", () => updateFactorCards(true));
  elements.makeDegenerateButton.addEventListener("click", makeDegenerate);
  elements.perturbRotationButton.addEventListener("click", perturbRotation);
  elements.randomizeButton.addEventListener("click", randomizeCurrentMatrix);

  elements.toggleSlidersButton.addEventListener("click", () => {
    state.slidersEnabled = !state.slidersEnabled;
    elements.toggleSlidersButton.classList.toggle("active", state.slidersEnabled);
    elements.toggleSlidersButton.textContent = state.slidersEnabled ? t("enabled") : t("hidden");
    elements.sliderGrid.classList.toggle("hidden", !state.slidersEnabled);
  });

  elements.openMathButton.addEventListener("click", () => {
    renderModalContent();
    elements.mathModal.hidden = false;
  });

  elements.closeMathButton.addEventListener("click", () => {
    elements.mathModal.hidden = true;
  });

  elements.languageToggle.addEventListener("click", () => {
    state.language = state.language === "en" ? "zhTW" : "en";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
    applyStaticTranslations();
    renderModeButtons();
    updateModeCopy();
    updateAll(false);
    renderModalContent();
  });

  elements.mathModal.addEventListener("click", (event) => {
    if (event.target === elements.mathModal) {
      elements.mathModal.hidden = true;
    }
  });
}

function init() {
  buildModeButtons();
  buildMatrixInputs();
  buildSliders();
  bindUI();
  applyStaticTranslations();
  syncMatrixGrid();
  syncSliderBounds();
  syncSliders();
  updateModeCopy();
  updateAll(true);
}

init();
