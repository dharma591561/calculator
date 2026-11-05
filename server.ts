import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API endpoint for Gemini-powered mathematical explanations & step-by-step reasoning
  app.post('/api/ai-explain', async (req, res) => {
    try {
      const { expression, result, mode = 'explain', customQuestion } = req.body;

      if (!expression && !customQuestion) {
        return res.status(400).json({ error: 'Expression or question required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // High-quality deterministic math response if no API key is provided
        return res.json(generateLocalExplanation(expression, result, mode, customQuestion));
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a mathematician and pedagogy expert for Axiom Math Studio.
Analyze the following mathematical problem or expression:
Expression / Calculation: ${expression || 'N/A'}
Computed Result: ${result || 'N/A'}
User Mode / Request: ${customQuestion || mode}

Provide a concise, precise, step-by-step mathematical breakdown.
Respond in valid JSON format with the following keys:
{
  "title": "A short descriptive title",
  "summary": "1-2 sentence core insight or summary",
  "steps": ["Step 1 description", "Step 2 description", "..."],
  "intuition": "Brief explanation of geometric/physical meaning or why this result holds",
  "keyIdentities": ["Relevant mathematical theorem, identity, or formula used"],
  "latex": "Clean LaTeX code for the core transformation or equation"
}
Ensure all mathematical formulas inside strings use clean LaTeX notation (e.g., \\\\det(A), \\\\frac{a}{b}, e^{i\\\\pi} + 1 = 0). Output ONLY pure JSON without markdown code fences.`;

      // Timeout after 4 seconds to guarantee instantaneous snappy UI
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 4000)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        timeoutPromise,
      ]);

      let responseText = response.text || '';
      // Clean possible markdown codeblocks
      responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch {
        return res.json({
          title: `Analysis for ${expression || 'Problem'}`,
          summary: responseText.slice(0, 200),
          steps: [responseText],
          intuition: "Rigorous analytical derivation computed via Axiom Math Intelligence.",
          keyIdentities: [],
          latex: expression || ""
        });
      }
    } catch (err: any) {
      console.error('AI explanation error:', err);
      // Fallback seamlessly to local explanation
      const fallback = generateLocalExplanation(
        req.body.expression || '',
        req.body.result || '',
        req.body.mode || 'explain',
        req.body.customQuestion
      );
      return res.json(fallback);
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite development mode middleware or static file serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

function generateLocalExplanation(expression: string, result: string, _mode: string, customQuestion?: string) {
  const expr = expression.trim();

  // Pattern detection for standard calculations
  if (expr.includes('det(') || expr.toLowerCase().includes('matrix')) {
    return {
      title: "Determinant & Matrix Analysis",
      summary: `The determinant of this matrix evaluates to ${result}.`,
      steps: [
        "1. Identify the square matrix components $A_{i,j}$.",
        "2. Apply Laplace cofactor expansion along the first row or column.",
        `3. For $2\\times 2$, compute $ad - bc$. For higher dimensions, sum $(-1)^{i+j} a_{ij} \\det(M_{ij})$.`,
        `4. Final evaluated determinant: ${result}. ${result === '0' ? 'Since $\\det = 0$, the matrix is singular and non-invertible.' : 'Since $\\det \\neq 0$, the matrix is invertible.'}`
      ],
      intuition: "The determinant represents the oriented scaling factor of the linear transformation on n-dimensional volume.",
      keyIdentities: ["\\det(AB) = \\det(A)\\det(B)", "A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)"],
      latex: `\\det(A) = ${result}`
    };
  }

  if (expr.includes('i') || expr.includes('sqrt(-') || expr.includes('arg(') || expr.includes('conj(')) {
    return {
      title: "Complex Analysis & Argand Plane",
      summary: `Complex evaluation of expression yields ${result}.`,
      steps: [
        "1. Separate terms into real components $a = \\text{Re}(z)$ and imaginary components $b = \\text{Im}(z)$.",
        "2. Apply imaginary unit definition $i^2 = -1$.",
        "3. Compute modulus $|z| = \\sqrt{a^2 + b^2}$ and argument $\\theta = \\text{atan2}(b, a)$.",
        `4. Polar form: $z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}$.`
      ],
      intuition: "Multiplication by complex numbers represents simultaneous scaling by $r$ and rotation by $\\theta$ in the complex plane.",
      keyIdentities: ["e^{i\\theta} = \\cos(\\theta) + i\\sin(\\theta)", "|z|^2 = z \\cdot \\bar{z}"],
      latex: `z = ${result}`
    };
  }

  if (expr.includes('sin') || expr.includes('cos') || expr.includes('tan')) {
    return {
      title: "Trigonometric Function Evaluation",
      summary: `The trigonometric evaluation for ${expr} produces ${result}.`,
      steps: [
        "1. Map angle argument to domain respecting configured angular units (Radians/Degrees).",
        "2. Identify standard reference angles and quadrant symmetries.",
        "3. Evaluate circular projection coordinate on the unit circle $(x = \\cos\\theta, y = \\sin\\theta)$.",
        `4. Resulting value: ${result}.`
      ],
      intuition: "Trigonometric functions map angles to unit-circle geometric projections and model periodic oscillatory phenomena.",
      keyIdentities: ["\\sin^2(\\theta) + \\cos^2(\\theta) = 1", "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"],
      latex: `${expr} = ${result}`
    };
  }

  if (expr.includes('^') || expr.includes('log') || expr.includes('ln') || expr.includes('exp')) {
    return {
      title: "Exponential & Logarithmic Transformation",
      summary: `Calculation of exponential/logarithmic relation ${expr} yields ${result}.`,
      steps: [
        "1. Check domain constraints (positive argument for logarithms).",
        "2. Apply base change theorem or exponential exponent laws.",
        "3. Compute natural logarithm inverse or power mapping.",
        `4. Evaluated value: ${result}.`
      ],
      intuition: "Logarithms compress multiplicative processes into additive scales, serving as continuous inverses of exponential growth.",
      keyIdentities: ["\\log_b(xy) = \\log_b(x) + \\log_b(y)", "\\log_b(x) = \\frac{\\ln(x)}{\\ln(b)}"],
      latex: `${expr} = ${result}`
    };
  }

  return {
    title: customQuestion ? `Analysis: ${customQuestion}` : `Evaluation of ${expr || 'Expression'}`,
    summary: `Exact analytical resolution produces ${result || 'calculated output'}.`,
    steps: [
      `1. Parse mathematical syntax and tokenize operands and operators.`,
      `2. Apply operator precedence: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction (PEMDAS).`,
      `3. Preserve exact precision across intermediate floating-point transformations.`,
      `4. Evaluated output: ${result || 'Complete'}.`
    ],
    intuition: "Deterministic evaluation adhering to axiomatic arithmetic principles.",
    keyIdentities: ["a(b + c) = ab + ac", "a^m \\cdot a^n = a^{m+n}"],
    latex: `${expr || 'f(x)'} = ${result || ''}`
  };
}

startServer();
