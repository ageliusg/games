// ==========================================
// Vector & Spatial Pitch Geometry Utilities
// ==========================================

import { PitchZone } from '../../types';

export interface Point2D {
  x: number;
  y: number;
}

export class PitchGeometry {
  // Goal specifications in 0-100 normalized coordinate system
  // Goal sits at x = 100, centered at y = 50.
  // Standard pitch: 105m length x 68m width.
  // Standard goal: 7.32m width. 7.32 / 68 = ~10.76% of pitch width.
  public static readonly GOAL_X = 100;
  public static readonly GOAL_CENTER_Y = 50;
  public static readonly GOAL_POST_LEFT_Y = 44.62;
  public static readonly GOAL_POST_RIGHT_Y = 55.38;

  public static readonly PITCH_LENGTH_METERS = 105;
  public static readonly PITCH_WIDTH_METERS = 68;

  /**
   * Euclidean distance between two points on the 0-100 pitch
   */
  public static distance(p1: Point2D, p2: Point2D): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Converts pitch coordinate distance to real-world meters
   */
  public static distanceInMeters(p1: Point2D, p2: Point2D): number {
    const dxMeters = ((p1.x - p2.x) / 100) * this.PITCH_LENGTH_METERS;
    const dyMeters = ((p1.y - p2.y) / 100) * this.PITCH_WIDTH_METERS;
    return Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters);
  }

  /**
   * Computes the angle subtended by the goal posts in radians
   * Formula: theta = |atan2(y2 - y, x2 - x) - atan2(y1 - y, x1 - x)|
   */
  public static goalAngle(shotPoint: Point2D): number {
    const pLeft = { x: this.GOAL_X, y: this.GOAL_POST_LEFT_Y };
    const pRight = { x: this.GOAL_X, y: this.GOAL_POST_RIGHT_Y };

    // Real world coordinates in meters from bottom-left corner
    const px = (shotPoint.x / 100) * this.PITCH_LENGTH_METERS;
    const py = (shotPoint.y / 100) * this.PITCH_WIDTH_METERS;

    const leftX = (pLeft.x / 100) * this.PITCH_LENGTH_METERS;
    const leftY = (pLeft.y / 100) * this.PITCH_WIDTH_METERS;

    const rightX = (pRight.x / 100) * this.PITCH_LENGTH_METERS;
    const rightY = (pRight.y / 100) * this.PITCH_WIDTH_METERS;

    const angle1 = Math.atan2(leftY - py, leftX - px);
    const angle2 = Math.atan2(rightY - py, rightX - px);

    let angle = Math.abs(angle1 - angle2);
    if (angle > Math.PI) {
      angle = 2 * Math.PI - angle;
    }
    return angle;
  }

  /**
   * Maps a pitch zone to representative centroid and spread on 0-100 pitch
   */
  public static getZoneCenter(zone: PitchZone, isAttackingRight: boolean = true): Point2D {
    let center: Point2D;
    switch (zone) {
      case 'defensive_third':
        center = { x: 18, y: 50 };
        break;
      case 'defensive_halfspace':
        center = { x: 26, y: 28 };
        break;
      case 'midfield':
        center = { x: 50, y: 50 };
        break;
      case 'wide_flanks':
        center = { x: 62, y: 12 };
        break;
      case 'attacking_halfspace':
        center = { x: 75, y: 32 };
        break;
      case 'penalty_box':
        center = { x: 91, y: 50 };
        break;
      default:
        center = { x: 50, y: 50 };
    }

    if (!isAttackingRight) {
      center = { x: 100 - center.x, y: center.y };
    }
    return center;
  }

  /**
   * Determines zone for a given pitch coordinate (attacking right)
   */
  public static coordinateToZone(point: Point2D): PitchZone {
    const x = Math.max(0, Math.min(100, point.x));
    const y = Math.max(0, Math.min(100, point.y));

    if (y < 16 || y > 84) {
      return 'wide_flanks';
    }
    if (x >= 83 && y >= 22 && y <= 78) {
      return 'penalty_box';
    }
    if (x >= 65) {
      return (y <= 36 || y >= 64) ? 'attacking_halfspace' : 'penalty_box';
    }
    if (x >= 35 && x < 65) {
      return 'midfield';
    }
    if (x < 35) {
      return (y <= 36 || y >= 64) ? 'defensive_halfspace' : 'defensive_third';
    }
    return 'midfield';
  }
}
