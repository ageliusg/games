// ==========================================
// Text Commentary Generator
// Context-sensitive match commentary
// ==========================================

import { ShotOutcome } from '../../types';

export class CommentaryEngine {
  public static formatEventCommentary(
    template: string,
    attName: string,
    defName?: string
  ): string {
    return template
      .replace(/{att}/g, attName)
      .replace(/{def}/g, defName ?? 'the defender');
  }

  public static formatShotCommentary(
    shooterName: string,
    gkName: string,
    outcome: ShotOutcome,
    distanceMeters: number,
    xG: number
  ): string {
    const xgFormatted = xG.toFixed(2);
    switch (outcome) {
      case 'goal':
        return `GOAL! Spectacular finish by ${shooterName} from ${distanceMeters}m! Absolute pandemonium in the stands! [xG: ${xgFormatted}]`;
      case 'saved':
        return `WHAT A SAVE! ${gkName} pulls off an unbelievable fingertip stop to deny ${shooterName}'s effort! [xG: ${xgFormatted}]`;
      case 'blocked':
        return `Heroic block! The defender throws their body on the line to charge down ${shooterName}'s strike! [xG: ${xgFormatted}]`;
      case 'off_target':
        return `Missed opportunity! ${shooterName} unleashes a shot from ${distanceMeters}m but blazes it agonizingly wide of the target. [xG: ${xgFormatted}]`;
    }
  }
}
