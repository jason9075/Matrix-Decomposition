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
      en: "This preset starts as a clean full-rank matrix with clearly separated singular values. Use `Make Degenerate` when you want to force one direction to collapse and watch the smallest singular value move toward zero; `Randomize` gives you another well-conditioned anisotropic transform.",
      zhTW: "這個 preset 一開始是乾淨的 full-rank 矩陣，而且奇異值分離得很明顯，方便你先看主軸伸縮。想看退化情況時再按 `製造退化`，它會故意把其中一個方向壓扁，讓最小奇異值往 0 靠近；`隨機矩陣` 則會換成另一個條件良好的非等向變換。",
    },
    application: {
      en: {
        form: "UΣV^T",
        matrixType: "Any matrix",
        use: "DLT, fundamental matrix estimation, ICP / point-cloud alignment",
        intuition: "Most universal. Excellent for null-space extraction and numerically very stable, but also the most expensive.",
        summary: "SVD works on almost anything, so it is often the stable fallback when you do not want surprises. In DLT, fundamental-matrix estimation, and ICP alignment, the real target is often the direction attached to the smallest singular value, which is exactly why SVD is so useful; the tradeoff is that it is usually the most expensive option here.",
      },
      zhTW: {
        form: "UΣV^T",
        matrixType: "任意矩陣",
        use: "DLT、基本矩陣 F 計算、ICP 點雲對齊",
        intuition: "最萬能。很適合找 null space，數值穩定性高，但計算代價也最高。",
        summary: "SVD 幾乎什麼矩陣都能用，所以常被當成最後的穩定解法。做 DLT、基本矩陣估計或 ICP 對齊時，很多關鍵步驟其實都在找最小奇異值對應的方向，也就是你真正想要的 null space；代價是它通常也是這幾種分解裡最貴的一個。",
      },
    },
    preset: [
      [2.072, -0.9, -0.15],
      [1.054, 1.002, 0.179],
      [0.403, -0.167, 0.436],
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
      en: "The preset looks like a realistic calibration-style matrix: pixel-scale intrinsics multiplied by a mild camera rotation. Randomize keeps focal lengths and principal point in plausible ranges.",
      zhTW: "這個 preset 比較像真實標定矩陣：像素尺度的內參乘上輕微相機旋轉。隨機按鈕也會把焦距與主點限制在合理範圍內。",
    },
    application: {
      en: {
        form: "RQ",
        matrixType: "Square matrices",
        use: "Camera calibration, splitting projection matrices into K and R",
        intuition: "Vision-specific. Upper-triangular factor on the left behaves like intrinsics, orthogonal factor on the right behaves like rotation.",
        summary: "RQ is almost tailor-made for camera models. When you have a projection matrix or a 3x3 camera block, what you usually care about is not the raw matrix itself but the intrinsics K and the rotation R hidden inside it; RQ separates those two meanings directly, so it reads much closer to how vision engineers think.",
      },
      zhTW: {
        form: "RQ",
        matrixType: "任意方陣",
        use: "相機標定，從投影矩陣拆出 K 與 R",
        intuition: "視覺專用。左邊上三角像內參，右邊正交矩陣像旋轉。",
        summary: "RQ 幾乎就是為相機模型而生的。當你手上有投影矩陣或 3x3 相機子矩陣，最想知道的通常不是它本身，而是裡面的內參 K 和旋轉 R；這時 RQ 能直接把這兩層意思拆開，讀起來比一般分解更貼近視覺工程。",
      },
    },
    preset: [
      [841.391, -114.601, 232.103],
      [169.147, 793.985, 150.59],
      [0.12, 0.089, 0.989],
    ],
  },
  qr: {
    label: { en: "QR", zhTW: "QR" },
    short: { en: "orthogonal times upper triangular", zhTW: "正交乘以上三角" },
    note: {
      en: "Orthogonalization and least-squares: the left factor is an orthonormal basis and the right factor carries coefficients in that basis.",
      zhTW: "正交化與最小平方法：左側因子是正交基底，右側因子是在該基底下的係數。",
    },
    matrixNote: {
      en: "The preset comes from an orthonormal basis multiplied by a moderate upper-triangular coefficient matrix. Randomize preserves that least-squares friendly scale.",
      zhTW: "這個 preset 來自正交基底乘上中等尺度的上三角係數矩陣。隨機按鈕也會維持這種適合最小平方法的量級。",
    },
    application: {
      en: {
        form: "QR",
        matrixType: "Any matrix",
        use: "Orthogonalization, least-squares solvers",
        intuition: "Standard workhorse. Stable version of Gram-Schmidt, with Q on the left.",
        summary: "QR is the everyday tool of numerical linear algebra. If you need orthogonalization, a least-squares solve, or just a cleaner basis for a messy set of vectors, QR is usually the first thing to reach for; it is lighter than SVD, but in practice already stable enough for a lot of real work.",
      },
      zhTW: {
        form: "QR",
        matrixType: "任意矩陣",
        use: "正交化過程、解線性最小平方法",
        intuition: "標準工具。Q 在左，常見於較穩定的 Gram-Schmidt 實作。",
        summary: "QR 很像數值線代裡的日常工具。要做正交化、解 least squares，或把一組彼此糾纏的向量整理成穩定基底時，通常先想到它；它不像 SVD 那麼重，但在實務上已經足夠穩，而且速度更好。",
      },
    },
    preset: [
      [1.529, 0.081, -0.374],
      [0.423, 1.312, 0.155],
      [0.207, 0.194, 0.899],
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
      en: "The preset behaves like a small covariance matrix: symmetric, positive definite, and safely away from singularity. Randomize always regenerates an SPD matrix instead of risking invalid input.",
      zhTW: "這個 preset 很像小型共變異數矩陣：對稱、正定，而且離奇異情況有安全距離。隨機按鈕也會保證重新產生 SPD 矩陣，不會亂跳成無效輸入。",
    },
    application: {
      en: {
        form: "LL^T",
        matrixType: "Symmetric positive definite",
        use: "Bundle adjustment, Kalman filtering",
        intuition: "Speed king. Much faster than generic LU in the right setting. If you see covariance matrices or A^TA, think Cholesky first.",
        summary: "As soon as the matrix is symmetric positive definite, Cholesky is usually the right answer. That happens all the time in bundle adjustment, Kalman filtering, and covariance updates, so there is rarely a reason to pay for a more general factorization when this one is faster and matches the structure exactly.",
      },
      zhTW: {
        form: "LL^T",
        matrixType: "對稱正定矩陣",
        use: "Bundle Adjustment、卡爾曼濾波",
        intuition: "速度之王。看到共變異數矩陣或 A^TA，通常先想到它。",
        summary: "只要矩陣是對稱正定，Cholesky 幾乎就是第一選擇。Bundle adjustment、Kalman filter 和各種 covariance 更新裡常常會遇到這種矩陣；這時不需要繞去做更通用但更重的分解，直接用 Cholesky 通常最快，也最符合工程直覺。",
      },
    },
    preset: [
      [5.76, 1.68, 0.72],
      [1.68, 3.73, 1.11],
      [0.72, 1.11, 2.03],
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
      en: "The preset is a symmetric operator with separated principal responses, similar to a PCA or structure-tensor example. Randomize keeps the matrix symmetric so the eigenbasis stays orthogonal.",
      zhTW: "這個 preset 是主反應方向分離明顯的對稱算子，接近 PCA 或 structure tensor 常見的例子。隨機按鈕也會維持對稱性，讓特徵基底保持正交。",
    },
    application: {
      en: {
        form: "VΛV^-1",
        matrixType: "Square matrices",
        use: "PCA, structure tensor analysis",
        intuition: "Finds principal directions. For symmetric matrices, eigen-decomposition lines up closely with SVD.",
        summary: "If the real question is which directions matter most, eigen-decomposition is usually the cleanest lens. PCA, structure tensors, and principal-axis problems are all basically asking for eigenvectors and eigenvalues; when the matrix is symmetric, the result becomes especially easy to read because each direction has a clean meaning.",
      },
      zhTW: {
        form: "VΛV^-1",
        matrixType: "方陣",
        use: "PCA、Structure Tensor",
        intuition: "找矩陣的主方向。若矩陣對稱，會和 SVD 的解讀非常接近。",
        summary: "如果你想知道資料或算子最主要往哪個方向變化，Eigen 通常最直接。PCA、structure tensor、慣性主軸這類問題，本質上都在問特徵向量和特徵值；對稱矩陣時它尤其好讀，因為每個方向的意義會非常乾淨。",
      },
    },
    preset: [
      [4.052, 0.834, 0.486],
      [0.834, 2.444, 0.337],
      [0.486, 0.337, 0.904],
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
      en: "This preset begins close to a real pose matrix: mostly rotation, with only a small symmetric stretch. Use `Perturb Rotation` to deliberately spoil orthogonality and then see how polar decomposition pulls the clean rotation back out; `Randomize` keeps samples near rigid motion so the repair intuition stays clear.",
      zhTW: "這個 preset 一開始就接近真實姿態矩陣：大部分是旋轉，只帶一點對稱伸縮。想看 Polar 怎麼修復旋轉時，先按 `擾動旋轉`，它會故意把正交性弄髒，接著你就能觀察分解怎麼把乾淨旋轉重新抽出來；`隨機矩陣` 也會維持接近剛體運動的範圍。",
    },
    application: {
      en: {
        form: "QS",
        matrixType: "Square matrices",
        use: "Rotation repair, deformation analysis",
        intuition: "Separates a transform into pure rotation and pure stretch. Useful when numerical drift corrupts a rotation matrix.",
        summary: "Polar decomposition is great for the situation where a matrix should behave like a rotation, but numerical drift has made it slightly dirty. After pose updates, deformation steps, or many small rotation accumulations, it gives you a very direct way to pull the clean rotation apart from the leftover stretch.",
      },
      zhTW: {
        form: "QS",
        matrixType: "方陣",
        use: "矩陣正交化修復、形變分析",
        intuition: "把任意轉換拆成純旋轉與純縮放，常用來修復走樣的旋轉矩陣。",
        summary: "Polar 很適合處理「這個矩陣本來應該像旋轉，但被數值誤差弄髒了」的情況。做姿態更新、模擬形變或累積很多小步旋轉之後，常需要把旋轉成分和殘留伸縮重新拆開；這時它比直接看原矩陣直觀得多。",
      },
    },
    preset: [
      [1.032, -0.193, -0.075],
      [0.293, 0.941, -0.122],
      [0.131, 0.041, 1.01],
    ],
  },
};

const modeKeys = Object.keys(MODES);

const state = {
  mode: "svd",
  matrix: cloneMatrix(MODES.svd.preset),
  language: getStoredLanguage(),
  factors: [],
  lastError: "",
};

const elements = {
  modeGrid: document.getElementById("mode-grid"),
  matrixGrid: document.getElementById("matrix-grid"),
  modeSummary: document.getElementById("mode-summary"),
  matrixNote: document.getElementById("matrix-note"),
  statusCopy: document.getElementById("status-copy"),
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
  makeDegenerateButton: document.getElementById("make-degenerate"),
  perturbRotationButton: document.getElementById("perturb-rotation"),
  randomizeButton: document.getElementById("randomize"),
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
      <p>The active ${mode} demo is one slice of a larger toolbox. The main point is to read each factor as structure: which part is geometry, which part is scale, and which part is there for numerical stability or modeling convenience.</p>
    `;
  },
  zhTW: () => {
    const mode = getModeText(state.mode, "label");
    return `
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
    <p>目前的 ${mode} 模式只是整個工具箱中的一個切面。重點不是背表格，而是讀懂每個因子各自代表什麼結構：哪一部分是幾何方向、哪一部分是縮放，哪一部分是為了數值穩定或工程建模而存在。</p>
  `;
  },
};

const I18N = {
  en: {
    htmlLang: "en",
    heroTitle: "Matrix Decomposition Playground",
    heroCopy: "Switch decomposition modes, edit the matrix directly, and compare each split through its matrix form, use case, and engineering intuition.",
    metricModeLabel: "Active Mode",
    metricDetLabel: "Determinant",
    metricRankLabel: "Estimated Rank",
    heroFormulaLabel: "Current Decomposition",
    heroMatricesLabel: "Observed Matrix And Factors",
    modesTitle: "Modes",
    modesSubtitle: "Preset-driven 3x3 examples",
    matrixControllerTitle: "Matrix Controller",
    matrixControllerSubtitle: "Type matrix values",
    loadPreset: "Reset",
    makeDegenerate: "Make Degenerate",
    perturbRotation: "Perturb Rotation",
    randomize: "Randomize",
    modeSummaryTitle: "Mode Summary",
    pipelineStatusTitle: "Application Context",
    mathTitle: "Math Behind the Scene",
    close: "Close",
    mathButtonAria: "Explain the math",
  },
  zhTW: {
    htmlLang: "zh-Hant",
    heroTitle: "矩陣分解互動實驗室",
    heroCopy: "切換分解模式、直接編輯矩陣，並從矩陣形式、使用場合與工程直覺比較每一種拆解。",
    metricModeLabel: "目前模式",
    metricDetLabel: "行列式",
    metricRankLabel: "Estimated Rank",
    heroFormulaLabel: "目前分解公式",
    heroMatricesLabel: "觀測矩陣與因子",
    modesTitle: "模式",
    modesSubtitle: "以 preset 驅動的 3x3 範例",
    matrixControllerTitle: "矩陣控制區",
    matrixControllerSubtitle: "可直接輸入矩陣數值",
    loadPreset: "重置",
    makeDegenerate: "製造退化",
    perturbRotation: "擾動旋轉",
    randomize: "隨機矩陣",
    modeSummaryTitle: "模式摘要",
    pipelineStatusTitle: "應用場域",
    mathTitle: "畫面背後的數學",
    close: "關閉",
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
  if (state.mode === "svd") return "A = U\\Sigma V^{\\top}";
  if (state.mode === "rq") return "A = RQ";
  if (state.mode === "qr") return "A = QR";
  if (state.mode === "cholesky") return "A = LL^{\\top}";
  if (state.mode === "eigen") return "A = Q\\Lambda Q^{\\top}";
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
  if (state.mode === "qr") {
    return state.language === "zhTW"
      ? "A 會拆成左側正交矩陣 Q，以及右側上三角矩陣 R。"
      : "A is split into a left orthogonal matrix Q and a right upper-triangular matrix R.";
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

function roundValue(value) {
  return Number(value.toFixed(3));
}

function roundMatrix(matrix) {
  return matrix.map((row) => row.map((value) => roundValue(value)));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function makeRotationMatrix(rx, ry, rz) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);

  const Rx = [
    [1, 0, 0],
    [0, cx, -sx],
    [0, sx, cx],
  ];
  const Ry = [
    [cy, 0, sy],
    [0, 1, 0],
    [-sy, 0, cy],
  ];
  const Rz = [
    [cz, -sz, 0],
    [sz, cz, 0],
    [0, 0, 1],
  ];

  return multiplyMatrices(Rz, multiplyMatrices(Ry, Rx));
}

function randomOrthogonalMatrix(angleScale = 0.45) {
  return makeRotationMatrix(
    randomBetween(-angleScale, angleScale),
    randomBetween(-angleScale, angleScale),
    randomBetween(-angleScale, angleScale)
  );
}

function randomDiagonal(values) {
  return [
    [values[0], 0, 0],
    [0, values[1], 0],
    [0, 0, values[2]],
  ];
}

function randomLowerTriangular(diagRange, offDiagRange) {
  return [
    [randomBetween(diagRange[0], diagRange[1]), 0, 0],
    [randomBetween(offDiagRange[0], offDiagRange[1]), randomBetween(diagRange[0], diagRange[1]), 0],
    [randomBetween(offDiagRange[0], offDiagRange[1]), randomBetween(offDiagRange[0], offDiagRange[1]), randomBetween(diagRange[0], diagRange[1])],
  ];
}

function randomUpperTriangular(diagRange, offDiagRange) {
  return [
    [randomBetween(diagRange[0], diagRange[1]), randomBetween(offDiagRange[0], offDiagRange[1]), randomBetween(offDiagRange[0], offDiagRange[1])],
    [0, randomBetween(diagRange[0], diagRange[1]), randomBetween(offDiagRange[0], offDiagRange[1])],
    [0, 0, randomBetween(diagRange[0], diagRange[1])],
  ];
}

function generateRandomMatrixForMode(mode) {
  if (mode === "svd") {
    const U = randomOrthogonalMatrix(0.55);
    const V = randomOrthogonalMatrix(0.55);
    const singularValues = [
      randomBetween(1.8, 3.2),
      randomBetween(0.8, 1.7),
      randomBetween(0.2, 0.7),
    ];
    return roundMatrix(multiplyMatrices(U, multiplyMatrices(randomDiagonal(singularValues), transpose(V))));
  }

  if (mode === "rq") {
    const K = [
      [randomBetween(650, 1200), randomBetween(-35, 35), randomBetween(220, 420)],
      [0, randomBetween(620, 1100), randomBetween(140, 320)],
      [0, 0, 1],
    ];
    const R = randomOrthogonalMatrix(0.3);
    return roundMatrix(multiplyMatrices(K, R));
  }

  if (mode === "qr") {
    const Q = randomOrthogonalMatrix(0.45);
    const R = randomUpperTriangular([0.7, 2.4], [-0.9, 0.9]);
    return roundMatrix(multiplyMatrices(Q, R));
  }

  if (mode === "cholesky") {
    const L = randomLowerTriangular([1.0, 2.8], [-0.8, 0.8]);
    return roundMatrix(multiplyMatrices(L, transpose(L)));
  }

  if (mode === "eigen") {
    const Q = randomOrthogonalMatrix(0.5);
    const eigenvalues = [
      randomBetween(2.8, 5.2),
      randomBetween(1.2, 2.6),
      randomBetween(0.3, 1.1),
    ];
    return roundMatrix(multiplyMatrices(Q, multiplyMatrices(randomDiagonal(eigenvalues), transpose(Q))));
  }

  const Q = randomOrthogonalMatrix(0.28);
  const S = [
    [randomBetween(0.9, 1.12), randomBetween(-0.08, 0.08), randomBetween(-0.05, 0.05)],
    [0, randomBetween(0.9, 1.12), randomBetween(-0.08, 0.08)],
    [0, 0, randomBetween(0.92, 1.08)],
  ];
  const symmetricStretch = [
    [S[0][0], S[0][1], S[0][2]],
    [S[0][1], S[1][1], S[1][2]],
    [S[0][2], S[1][2], S[2][2]],
  ];
  return roundMatrix(multiplyMatrices(Q, symmetricStretch));
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

function orthogonalityDiagnostics(matrix) {
  const gram = multiplyMatrices(transpose(matrix), matrix);
  const identity = identityMatrix();
  let maxAbsDiff = 0;

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      maxAbsDiff = Math.max(maxAbsDiff, Math.abs(gram[row][col] - identity[row][col]));
    }
  }

  const det = determinant(matrix);
  const looksOrthogonal = maxAbsDiff < 1e-3;
  const status = state.language === "zhTW"
    ? (looksOrthogonal ? "看起來接近正交" : "偏離正交")
    : (looksOrthogonal ? "Looks orthogonal" : "Drifts from orthogonal");

  return {
    status,
    error: formatNumber(maxAbsDiff),
    det: formatNumber(det),
  };
}

function buildOrthogonalityHover(matrix) {
  const diagnostics = orthogonalityDiagnostics(matrix);
  const errorLabel = state.language === "zhTW" ? "max |Q^TQ - I|" : "max |Q^TQ - I|";
  const detLabel = "det";

  return `
    <div class="orthogonality-hover">
      <div class="orthogonality-status">${diagnostics.status}</div>
      <div class="orthogonality-metric">${errorLabel} = ${diagnostics.error}</div>
      <div class="orthogonality-metric">${detLabel} = ${diagnostics.det}</div>
    </div>
  `;
}

function buildHeroMatrixCard(title, tag, matrix, kind = "symmetric") {
  const orthogonalityHover = kind === "orthogonal" ? buildOrthogonalityHover(matrix) : "";
  const tagLabel = kind === "orthogonal" ? `${tag} 🔍` : tag;
  return `
    <article class="hero-matrix-card ${kind === "orthogonal" ? "has-orthogonality-hover" : ""}">
      <div class="factor-tag ${kind}">${tagLabel}</div>
      ${orthogonalityHover}
      <h3>${title}</h3>
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
    };
  }
  if (state.mode === "qr") {
    const { Q, R } = qrDecomposition(matrix);
    return {
      factors: [
        { title: "Q", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: Q, desc: state.language === "zhTW" ? "Q 提供一組穩定的正交基底。" : "Q provides a stable orthonormal basis." },
        { title: "R", tag: state.language === "zhTW" ? "上三角" : "Upper Tri", kind: "triangular", matrix: R, desc: state.language === "zhTW" ? "R 記錄原矩陣在正交基底下的係數。" : "R stores the coefficients of the original matrix in that orthogonal basis." },
        { title: "A", tag: state.language === "zhTW" ? "觀測值" : "Observed", kind: "symmetric", matrix, desc: state.language === "zhTW" ? "原始矩陣可被視為正交化前的輸入。" : "The original matrix is the pre-orthogonalized input." },
      ],
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
    };
  }
  const { Q, S } = polarDecomposition(matrix);
  return {
    factors: [
      { title: "Q", tag: state.language === "zhTW" ? "正交" : "Orthogonal", kind: "orthogonal", matrix: Q, desc: state.language === "zhTW" ? "最接近的正交變換會修復已經歪掉的旋轉。" : "The nearest orthogonal transform repairs the broken rotation." },
      { title: "S", tag: state.language === "zhTW" ? "對稱" : "Symmetric", kind: "symmetric", matrix: S, desc: state.language === "zhTW" ? "殘餘的對稱伸縮記錄輸入矩陣偏離完美旋轉的程度。" : "Residual symmetric stretch records how far the input departs from a perfect rotation." },
      { title: "A", tag: state.language === "zhTW" ? "觀測值" : "Observed", kind: "triangular", matrix, desc: state.language === "zhTW" ? "原始矩陣同時包含旋轉與扭曲。" : "The original matrix contains both rotation and distortion." },
    ],
  };
}

function updateFactorCards() {
  try {
    const result = makeFactorsForMode();
    state.lastError = "";
    state.factors = result.factors;
  } catch (error) {
    state.lastError = error instanceof Error ? error.message : "Decomposition failed.";
    state.factors = [
      {
        title: "Invalid Input",
        tag: "Status",
        kind: "symmetric",
        matrix: state.matrix,
        desc: state.lastError,
      },
    ];
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

function updateModeActions() {
  elements.makeDegenerateButton.classList.toggle("is-hidden", state.mode !== "svd");
  elements.perturbRotationButton.classList.toggle("is-hidden", state.mode !== "polar");
}

function syncMatrixGrid() {
  const inputs = Array.from(elements.matrixGrid.querySelectorAll("input"));
  inputs.forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    input.value = String(Number(state.matrix[row][col].toFixed(3)));
  });
}

function updateStatusCopy() {
  const application = MODES[state.mode].application[state.language];
  const warning = state.lastError
    ? `<div class="status-warning">${state.language === "zhTW" ? `目前輸入警告：${state.lastError}` : `Current input warning: ${state.lastError}`}</div>`
    : "";

  elements.statusCopy.innerHTML = `
    <p class="status-body">${application.summary}</p>
    ${warning}
  `;
}

function updateHeroBreakdown() {
  const equation = getEquationText();
  if (window.katex) {
    window.katex.render(equation, elements.heroEquation, {
      throwOnError: false,
      displayMode: true,
    });
  } else {
    elements.heroEquation.textContent = equation;
  }
  elements.heroEquationNote.textContent = getHeroEquationNote();

  const observedTag = state.language === "zhTW" ? "觀測值" : "Observed";
  const cards = [buildHeroMatrixCard("A", observedTag, state.matrix, "symmetric")];
  if (state.factors.length > 0) {
    state.factors
      .filter((factor) => factor.title !== "A")
      .slice(0, 3)
      .forEach((factor) => {
      cards.push(buildHeroMatrixCard(factor.title, factor.tag, factor.matrix, factor.kind.toLowerCase()));
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
  updateModeCopy();
  updateModeActions();
  updateAll(false);
}

function applyStaticTranslations() {
  document.documentElement.lang = I18N[state.language].htmlLang;
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
  document.getElementById("make-degenerate").textContent = t("makeDegenerate");
  document.getElementById("perturb-rotation").textContent = t("perturbRotation");
  document.getElementById("randomize").textContent = t("randomize");
  document.getElementById("randomize").setAttribute("aria-label", t("randomize"));
  document.getElementById("mode-summary-title").textContent = t("modeSummaryTitle");
  document.getElementById("pipeline-status-title").textContent = t("pipelineStatusTitle");
  document.getElementById("math-title").textContent = t("mathTitle");
  document.getElementById("close-math").textContent = t("close");
  elements.openMathButton.setAttribute("aria-label", t("mathButtonAria"));
  elements.languageToggle.textContent = state.language === "en" ? "中" : "Eng";
}

function updateAll() {
  updateFactorCards();
  updateMetrics();
  updateStatusCopy();
  updateModeCopy();
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
    updateAll();
  });
}

function randomizeCurrentMatrix() {
  state.matrix = generateRandomMatrixForMode(state.mode);
  syncMatrixGrid();
  updateAll();
}

function makeDegenerate() {
  state.matrix[2] = state.matrix[1].map((value) => Number((value * 0.5).toFixed(3)));
  syncMatrixGrid();
  updateAll();
}

function perturbRotation() {
  state.matrix = cloneMatrix(MODES.polar.preset);
  state.matrix[0][2] += 0.12;
  state.matrix[2][0] -= 0.09;
  state.matrix[1][1] -= 0.07;
  syncMatrixGrid();
  updateAll();
}

function bindUI() {
  elements.fillPresetButton.addEventListener("click", () => {
    state.matrix = cloneMatrix(MODES[state.mode].preset);
    syncMatrixGrid();
    updateAll();
  });

  elements.makeDegenerateButton.addEventListener("click", makeDegenerate);
  elements.perturbRotationButton.addEventListener("click", perturbRotation);
  elements.randomizeButton.addEventListener("click", randomizeCurrentMatrix);

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
    updateAll();
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
  bindUI();
  applyStaticTranslations();
  syncMatrixGrid();
  updateModeCopy();
  updateModeActions();
  updateAll();
}

init();
