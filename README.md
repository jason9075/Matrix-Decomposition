# Matrix Decomposition Lab

An interactive static web app for exploring six common matrix decompositions through direct matrix editing, numerical readouts, and decomposition-specific explanations.

Live demo: https://jason9075.github.io/Matrix-Decomposition/

## Overview

Matrix Decomposition Lab is a browser-based teaching tool for 3x3 matrices. It focuses on how different decompositions expose different structure in the same matrix:

- `SVD`
- `QR`
- `RQ`
- `Cholesky`
- `Eigen`
- `Polar`

The page is designed for linear algebra intuition, computer vision context, and practical numerical interpretation rather than symbolic algebra alone.

## Features

- Interactive `3x3` matrix editor
- Mode-specific presets and randomized examples
- Immediate decomposition updates as values change
- Hero section showing the current factorization formula and factor matrices
- Mode summary and application context for each decomposition
- Bilingual UI: English and Traditional Chinese
- Knowledge modal with:
  - mathematical form
  - derivation notes with LaTeX
  - implementation notes tied to the actual JavaScript functions in this repo
- Orthogonality inspection on relevant matrix tags

## Decompositions Included

### SVD

Explains how a matrix can be understood as rotation, axis scaling, and rotation again.

### QR

Focuses on orthogonalization and least-squares intuition, with a Gram-Schmidt style implementation in this project.

### RQ

Framed in a camera-calibration setting, where the left upper-triangular factor behaves like `K` and the right orthogonal factor behaves like a rotation matrix. The explanation also shows how the RQ decomposition here is derived from QR.

### Cholesky

Covers the symmetric positive definite case and why `A = LL^T` is the natural fast path for covariance-style matrices.

### Eigen

Highlights principal directions and eigenvalue response for symmetric operators.

### Polar

Shows how a nearly rotational matrix can be split into a clean orthogonal factor and a symmetric stretch factor.

## Project Structure

```text
.
├── index.html
├── src/
│   └── main.js
├── flake.nix
├── flake.lock
└── Justfile
```

## Local Development

This project is a static site with a small Nix-based workflow.

### Using Nix

```bash
nix develop
just dev
```

### Manual Preview

Any simple static server works. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Implementation Notes

- The app is implemented in plain HTML, CSS, and JavaScript.
- Math rendering uses `KaTeX`.
- Code snippets in the knowledge modal use `Prism`.
- Decomposition logic is implemented directly in [`src/main.js`](./src/main.js), including:
  - `svdDecomposition(matrix)`
  - `qrDecomposition(matrix)`
  - `rqDecomposition(matrix)`
  - `choleskyDecomposition(matrix)`
  - `jacobiEigenDecomposition(matrix)`
  - `polarDecomposition(matrix)`

## Use Cases

This project is intended for:

- learning and teaching matrix factorization
- computer vision intuition
- robotics and pose-related interpretation
- quick experimentation with small matrices
- comparing decomposition behavior side by side

## License

No license file is currently included in this repository.
