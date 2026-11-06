// ==========================================
// Mathematical Distribution Utilities
// Box-Muller Gaussian & Pareto Power-Law
// ==========================================

import { PRNG } from './prng';

export class DistributionEngine {
  private spareGaussian: number | null = null;

  constructor(private prng: PRNG) {}

  /**
   * Samples from a Standard Normal Distribution N(0, 1) using Box-Muller Transform
   */
  public nextStandardNormal(): number {
    if (this.spareGaussian !== null) {
      const val = this.spareGaussian;
      this.spareGaussian = null;
      return val;
    }

    let u1 = 0;
    let u2 = 0;
    // Ensure u1 is non-zero to avoid ln(0)
    while (u1 <= 1e-15) {
      u1 = this.prng.next();
    }
    u2 = this.prng.next();

    const radius = Math.sqrt(-2.0 * Math.log(u1));
    const theta = 2.0 * Math.PI * u2;

    this.spareGaussian = radius * Math.sin(theta);
    return radius * Math.cos(theta);
  }

  /**
   * Samples a Gaussian random variable N(mean, stdDev^2) optionally clipped to [min, max]
   */
  public sampleGaussian(
    mean: number,
    stdDev: number,
    min?: number,
    max?: number
  ): number {
    const raw = mean + this.nextStandardNormal() * stdDev;
    let result = raw;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  }

  /**
   * Samples an integer Gaussian random variable rounded and clamped
   */
  public sampleGaussianInt(
    mean: number,
    stdDev: number,
    min: number,
    max: number
  ): number {
    const val = Math.round(this.sampleGaussian(mean, stdDev, min, max));
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Samples from a Pareto (Power-Law) distribution:
   * P(X > x) = (scale / x)^alpha
   * Used for economic disparity in club budgets and transfer values.
   */
  public samplePareto(
    alpha: number,
    scale: number,
    max?: number
  ): number {
    let u = this.prng.next();
    // Clamp u to avoid division by zero
    if (u >= 0.999999) u = 0.999999;
    const value = scale / Math.pow(1.0 - u, 1.0 / alpha);
    if (max !== undefined) {
      return Math.min(max, value);
    }
    return value;
  }
}
