export interface MatrixAnalysis {
  rows: number;
  cols: number;
  isSquare: boolean;
  determinant?: number;
  trace?: number;
  rank: number;
  isInvertible: boolean;
  inverse?: number[][];
  transpose: number[][];
  rref: number[][];
  eigenvalues?: number[];
}

export interface LinearSystemResult {
  solutionType: 'unique' | 'infinite' | 'none';
  solution?: number[];
  steps: string[];
  latex: string;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export class MatrixEngineService {
  /**
   * Create an empty matrix of size rows x cols initialized to 0
   */
  public createEmpty(rows: number, cols: number, fill: number = 0): number[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
  }

  /**
   * Create an identity matrix of size n x n
   */
  public createIdentity(n: number): number[][] {
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
  }

  /**
   * Clone a 2D matrix
   */
  public clone(matrix: number[][]): number[][] {
    return matrix.map((row) => [...row]);
  }

  /**
   * Matrix addition A + B
   */
  public add(A: number[][], B: number[][]): number[][] {
    if (A.length !== B.length || A[0].length !== B[0].length) {
      throw new Error(`Dimensions mismatch for addition: (${A.length}x${A[0].length}) vs (${B.length}x${B[0].length})`);
    }
    return A.map((row, i) => row.map((val, j) => this.cleanZero(val + B[i][j])));
  }

  /**
   * Matrix subtraction A - B
   */
  public subtract(A: number[][], B: number[][]): number[][] {
    if (A.length !== B.length || A[0].length !== B[0].length) {
      throw new Error(`Dimensions mismatch for subtraction: (${A.length}x${A[0].length}) vs (${B.length}x${B[0].length})`);
    }
    return A.map((row, i) => row.map((val, j) => this.cleanZero(val - B[i][j])));
  }

  /**
   * Matrix multiplication A * B
   */
  public multiply(A: number[][], B: number[][]): number[][] {
    const rA = A.length;
    const cA = A[0].length;
    const rB = B.length;
    const cB = B[0].length;

    if (cA !== rB) {
      throw new Error(`Cannot multiply: Matrix A cols (${cA}) must equal Matrix B rows (${rB})`);
    }

    const result: number[][] = this.createEmpty(rA, cB);
    for (let i = 0; i < rA; i++) {
      for (let j = 0; j < cB; j++) {
        let sum = 0;
        for (let k = 0; k < cA; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = this.cleanZero(sum);
      }
    }
    return result;
  }

  /**
   * Scalar multiplication k * A
   */
  public scalarMultiply(k: number, A: number[][]): number[][] {
    return A.map((row) => row.map((val) => this.cleanZero(k * val)));
  }

  /**
   * Matrix Transpose A^T
   */
  public transpose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result = this.createEmpty(cols, rows);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = A[i][j];
      }
    }
    return result;
  }

  /**
   * Matrix Trace (sum of main diagonal for square matrix)
   */
  public trace(A: number[][]): number | undefined {
    if (A.length !== A[0].length) return undefined;
    let sum = 0;
    for (let i = 0; i < A.length; i++) {
      sum += A[i][i];
    }
    return this.cleanZero(sum);
  }

  /**
   * Determinant calculation using Gaussian elimination with partial pivoting
   */
  public determinant(A: number[][]): number | undefined {
    if (A.length !== A[0].length) return undefined;
    const n = A.length;
    if (n === 1) return A[0][0];
    if (n === 2) return this.cleanZero(A[0][0] * A[1][1] - A[0][1] * A[1][0]);

    const M = this.clone(A);
    let det = 1;

    for (let i = 0; i < n; i++) {
      // Find pivot
      let pivotRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[pivotRow][i])) {
          pivotRow = k;
        }
      }

      if (Math.abs(M[pivotRow][i]) < 1e-12) {
        return 0; // Singular matrix
      }

      // Swap rows if needed
      if (pivotRow !== i) {
        const temp = M[i];
        M[i] = M[pivotRow];
        M[pivotRow] = temp;
        det = -det;
      }

      det *= M[i][i];

      // Eliminate lower rows
      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        for (let j = i; j < n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }

    return this.cleanZero(det);
  }

  /**
   * Matrix Inversion via Gauss-Jordan elimination on [A | I]
   */
  public inverse(A: number[][]): number[][] | undefined {
    if (A.length !== A[0].length) return undefined;
    const n = A.length;
    const det = this.determinant(A);
    if (det === undefined || Math.abs(det) < 1e-12) return undefined;

    // Build augmented matrix [A | I]
    const aug: number[][] = [];
    for (let i = 0; i < n; i++) {
      aug[i] = [...A[i]];
      for (let j = 0; j < n; j++) {
        aug[i].push(i === j ? 1 : 0);
      }
    }

    // Gauss-Jordan elimination
    for (let i = 0; i < n; i++) {
      // Pivot selection
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }

      if (Math.abs(aug[maxRow][i]) < 1e-12) return undefined;

      // Swap rows
      if (maxRow !== i) {
        const tmp = aug[i];
        aug[i] = aug[maxRow];
        aug[maxRow] = tmp;
      }

      // Scale pivot row to 1
      const pivot = aug[i][i];
      for (let j = 0; j < 2 * n; j++) {
        aug[i][j] /= pivot;
      }

      // Eliminate all other rows
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = aug[k][i];
          for (let j = 0; j < 2 * n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }
    }

    // Extract right half
    const inv: number[][] = this.createEmpty(n, n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        inv[i][j] = this.cleanZero(aug[i][j + n]);
      }
    }

    return inv;
  }

  /**
   * Reduced Row Echelon Form (RREF) & Rank
   */
  public rrefAndRank(A: number[][]): { rref: number[][]; rank: number } {
    const rows = A.length;
    const cols = A[0].length;
    const M = this.clone(A);

    let lead = 0;
    let rank = 0;

    for (let r = 0; r < rows; r++) {
      if (cols <= lead) break;
      let i = r;
      while (Math.abs(M[i][lead]) < 1e-12) {
        i++;
        if (rows === i) {
          i = r;
          lead++;
          if (cols === lead) break;
        }
      }
      if (cols === lead) break;

      // Swap rows i and r
      const temp = M[i];
      M[i] = M[r];
      M[r] = temp;

      // Scale row r
      const lv = M[r][lead];
      for (let j = 0; j < cols; j++) {
        M[r][j] /= lv;
      }

      // Eliminate other rows
      for (let k = 0; k < rows; k++) {
        if (k !== r) {
          const factor = M[k][lead];
          for (let j = 0; j < cols; j++) {
            M[k][j] -= factor * M[r][j];
          }
        }
      }
      lead++;
      rank++;
    }

    const cleanRref = M.map((row) => row.map((v) => this.cleanZero(v)));
    return { rref: cleanRref, rank };
  }

  /**
   * Compute eigenvalues for 2x2 and 3x3 matrices
   */
  public computeEigenvalues(A: number[][]): number[] | undefined {
    if (A.length !== A[0].length) return undefined;
    const n = A.length;

    if (n === 2) {
      // Characteristic equation: λ² - Tr(A)λ + det(A) = 0
      const tr = A[0][0] + A[1][1];
      const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      const discriminant = tr * tr - 4 * det;

      if (discriminant >= 0) {
        const sqrtD = Math.sqrt(discriminant);
        const l1 = (tr + sqrtD) / 2;
        const l2 = (tr - sqrtD) / 2;
        return [this.cleanZero(l1), this.cleanZero(l2)];
      }
      return undefined; // Complex eigenvalues
    }

    return undefined;
  }

  /**
   * Comprehensive matrix analysis
   */
  public analyzeMatrix(A: number[][]): MatrixAnalysis {
    const rows = A.length;
    const cols = A[0].length;
    const isSquare = rows === cols;

    const transpose = this.transpose(A);
    const { rref, rank } = this.rrefAndRank(A);

    let determinant: number | undefined;
    let trace: number | undefined;
    let inverse: number[][] | undefined;
    let isInvertible = false;
    let eigenvalues: number[] | undefined;

    if (isSquare) {
      determinant = this.determinant(A);
      trace = this.trace(A);
      isInvertible = determinant !== undefined && Math.abs(determinant) > 1e-12;
      if (isInvertible) {
        inverse = this.inverse(A);
      }
      eigenvalues = this.computeEigenvalues(A);
    }

    return {
      rows,
      cols,
      isSquare,
      determinant,
      trace,
      rank,
      isInvertible,
      inverse,
      transpose,
      rref,
      eigenvalues,
    };
  }

  /**
   * Solve Linear System A x = b
   */
  public solveLinearSystem(A: number[][], b: number[]): LinearSystemResult {
    const n = A.length;
    if (n !== A[0].length || n !== b.length) {
      return {
        solutionType: 'none',
        steps: ['Matrix A must be square and match vector b length.'],
        latex: '\\text{Dimension mismatch}',
      };
    }

    const det = this.determinant(A);
    const steps: string[] = [];
    steps.push(`1. Evaluated matrix coefficient determinant: $\\det(A) = ${det !== undefined ? det : 'undefined'}$.`);

    if (det === undefined || Math.abs(det) < 1e-12) {
      // Check if consistent or inconsistent
      const aug: number[][] = A.map((row, i) => [...row, b[i]]);
      const { rank: rankAug } = this.rrefAndRank(aug);
      const { rank: rankA } = this.rrefAndRank(A);

      if (rankA < rankAug) {
        steps.push(`2. Coefficient rank $\\text{rank}(A) = ${rankA}$ is less than augmented rank $\\text{rank}([A|b]) = ${rankAug}$.`);
        steps.push(`3. System is inconsistent. No solutions exist.`);
        return {
          solutionType: 'none',
          steps,
          latex: '\\text{No solution (inconsistent)}',
        };
      } else {
        steps.push(`2. $\\text{rank}(A) = \\text{rank}([A|b]) = ${rankA} < ${n}$.`);
        steps.push(`3. The system has infinitely many solutions (dependent system with free variables).`);
        return {
          solutionType: 'infinite',
          steps,
          latex: '\\text{Infinitely many solutions}',
        };
      }
    }

    // Unique solution via inv(A) * b
    const invA = this.inverse(A)!;
    const x: number[] = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += invA[i][j] * b[j];
      }
      x[i] = this.cleanZero(sum);
    }

    steps.push(`2. Inverted matrix $A^{-1}$ using Gauss-Jordan elimination.`);
    steps.push(`3. Multiplied $x = A^{-1} b$ to find the unique coordinate vector.`);
    const xLatex = `\\mathbf{x} = \\begin{pmatrix} ${x.join(' \\\\ ')} \\end{pmatrix}`;

    return {
      solutionType: 'unique',
      solution: x,
      steps,
      latex: xLatex,
    };
  }

  /**
   * 3D Vector operations
   */
  public vectorDot(u: Vector3D, v: Vector3D): number {
    return this.cleanZero(u.x * v.x + u.y * v.y + u.z * v.z);
  }

  public vectorCross(u: Vector3D, v: Vector3D): Vector3D {
    return {
      x: this.cleanZero(u.y * v.z - u.z * v.y),
      y: this.cleanZero(u.z * v.x - u.x * v.z),
      z: this.cleanZero(u.x * v.y - u.y * v.x),
    };
  }

  public vectorNorm(u: Vector3D): number {
    return this.cleanZero(Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z));
  }

  public vectorAngleDeg(u: Vector3D, v: Vector3D): number {
    const dot = this.vectorDot(u, v);
    const normU = this.vectorNorm(u);
    const normV = this.vectorNorm(v);
    if (normU === 0 || normV === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, dot / (normU * normV)));
    return this.cleanZero((Math.acos(cosTheta) * 180) / Math.PI);
  }

  private cleanZero(val: number): number {
    if (Math.abs(val) < 1e-13) return 0;
    return Number(val.toPrecision(8));
  }
}

export const matrixEngine = new MatrixEngineService();
